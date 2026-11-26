"use client";

import { useState } from "react";
import { DonutChart, type DonutSlice } from "@/components/charts/DonutChart";
import { AnalyticsCard } from "@/components/dashboard/AnalyticsCard";
import { DashboardDateDropdown } from "@/components/dashboard/DashboardDateDropdown";
import { DashboardKpiCard } from "@/components/dashboard/DashboardKpiGrid";
import { PropertyTypeAnalysis } from "@/components/properties/PropertyTypeAnalysis";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { GlobalLoader } from "@/components/ui/GlobalLoader";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useDateRange } from "@/hooks/useDateRange";
import { cn } from "@/lib/cn";
import type { AnalyticsResponse, Breakdown, OverviewData, PropertiesData, PropertyListKind, RangeSelection, WebsiteData } from "@/types/analytics";
import { PropertyTable } from "../PropertyTable";

const fullFmt = new Intl.NumberFormat("en-GB");

const SALE_DATE_NOTE = "Dated from the latest “Sold” entry in the property history: when the sale was recorded, not a verified completion date.";
const STATUS_COLORS = ["#5b42f3", "#10b981", "#2b92f0", "#f59e0b", "#ec4899", "#14b8a6"];

const icon = (d: string) => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const ICON = {
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  inbox: "M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11",
  key: "M21 2l-2 2m-7.6 7.6a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4",
};

type ColumnIds = Parameters<typeof PropertyTable>[0]["columns"];
const RANKINGS: { kind: PropertyListKind; label: string; columns: ColumnIds; empty: string; note: string }[] = [
  {
    kind: "most-enquired",
    label: "Most enquired",
    columns: ["enquiries", "views", "status"],
    empty: "No property enquiry records in this period.",
    note: "Ranked by property enquiry records in the selected period.",
  },
  {
    kind: "most-viewed",
    label: "Most viewed",
    columns: ["views", "lifetime", "status"],
    empty: "No live properties.",
    note: "Live properties ranked by the all-time view counter. Not affected by the date range.",
  },
  {
    kind: "enquired-unsold",
    label: "Enquired, not sold",
    columns: ["enquiries", "views", "status"],
    empty: "No unsold properties with enquiries in this period.",
    note: "Enquiries in the selected period; current status is neither Sold nor Sold by competitor.",
  },
];

/** Keeps the six largest statuses; the rest fold into one slice. */
function statusSlices(items: Breakdown[]): DonutSlice[] {
  const active = items.filter((item) => item.value > 0);
  const keep = active.length > 6 ? active.slice(0, 5) : active;
  const slices = keep.map((item, i) => ({ id: item.id, label: item.label, value: item.value, color: STATUS_COLORS[i] }));
  if (active.length > 6) {
    slices.push({ id: "__other", label: "Other statuses", value: active.slice(5).reduce((sum, item) => sum + item.value, 0), color: "#c4c9d6" });
  }
  return slices;
}

export function PropertiesModule() {
  const [selection, setSelection] = useDateRange();
  const properties = useAnalytics<PropertiesData>("properties", selection);
  // Dated KPIs (enquiry records, inferred sales) and all-time views by type live in these existing modules.
  const overview = useAnalytics<OverviewData>("overview", selection);
  const website = useAnalytics<WebsiteData>("website", selection);
  const response = properties.response;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-fg sm:text-[1.65rem]">Property Performance</h1>
          <p className="mt-1 text-sm text-fg-muted">Understand listing performance, buyer interest and property activity.</p>
        </div>
        <DashboardDateDropdown
          key={`${selection.range}|${selection.from ?? ""}|${selection.to ?? ""}`}
          selection={selection}
          onChange={setSelection}
          resolved={response?.range}
          busy={properties.refreshing || overview.refreshing}
        />
      </div>

      {properties.error ? (
        <Alert tone="error" title={response ? "Could not update for the selected range. Showing the last loaded figures." : "Could not load property data"}>
          <p>{properties.error}</p>
          <Button variant="secondary" size="sm" className="mt-2" onClick={properties.retry}>
            Try again
          </Button>
        </Alert>
      ) : null}

      {properties.loading ? <GlobalLoader variant="content" /> : null}

      {response ? (
        <PropertiesContent
          response={response}
          refreshing={properties.refreshing}
          overview={overview.response?.data ?? null}
          overviewPending={overview.loading}
          overviewError={overview.error}
          viewsByType={website.response?.data.viewsByType ?? null}
          viewsError={website.error}
          selection={selection}
        />
      ) : null}
    </div>
  );
}

interface PropertiesContentProps {
  response: AnalyticsResponse<PropertiesData>;
  refreshing: boolean;
  overview: OverviewData | null;
  overviewPending: boolean;
  overviewError: string | null;
  viewsByType: Breakdown[] | null;
  viewsError: string | null;
  selection: RangeSelection;
}

function PropertiesContent({ response, refreshing, overview, overviewPending, overviewError, viewsByType, viewsError, selection }: PropertiesContentProps) {
  const { data, range, definitions } = response;
  const [ranking, setRanking] = useState<PropertyListKind>("most-enquired");
  const active = RANKINGS.find((r) => r.kind === ranking) ?? RANKINGS[0];

  const kpi = (id: string) => data.kpis.find((k) => k.id === id);
  const live = kpi("activeProperties");
  const total = kpi("totalProperties")?.value;
  const enquiredProperties = kpi("enquiredProperties")?.value;
  const overviewKpi = (id: string) =>
    overview
      ? overview.kpis.find((k) => k.id === id)
      : overviewError
        ? { id, value: null, unavailableReason: "Could not load this figure." }
        : undefined;
  const overviewLoading = !overview && !overviewError && overviewPending;

  return (
    <div aria-busy={refreshing} className={cn("flex flex-col gap-5 transition-opacity", refreshing && "opacity-65")}>
      {/* KPI cards */}
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Property headline figures">
        <li>
          <DashboardKpiCard
            id="prop-live"
            title="Live Properties"
            kpi={live}
            range={range}
            theme="purple"
            badge="Current"
            extraNote="Properties shown on the website right now (Display on, live status). Not filtered by the date range."
            icon={icon(ICON.home)}
            footer={typeof total === "number" && total > 0 && live?.value != null ? `${Math.round((live.value / total) * 100)}% of ${fullFmt.format(total)} properties on record` : undefined}
          />
        </li>
        <li>
          <DashboardKpiCard
            id="prop-enquiries"
            title="Property Enquiries"
            kpi={overviewKpi("propertyEnquiryRecords")}
            loading={overviewLoading}
            range={range}
            theme="blue"
            icon={icon(ICON.inbox)}
          />
        </li>
        <li className="sm:col-span-2 lg:col-span-1">
          <DashboardKpiCard
            id="prop-sold"
            title="Properties Sold"
            kpi={overviewKpi("inferredSales")}
            loading={overviewLoading}
            range={range}
            theme="green"
            trend={overview?.salesTrend}
            badge="Inferred"
            extraNote={SALE_DATE_NOTE}
            icon={icon(ICON.key)}
          />
        </li>
      </ul>

      {/* Property types | Portfolio status */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <AnalyticsCard
          id="type-analysis"
          title="Live portfolio by property type"
          badge="Current"
          badgeTone="neutral"
          subtitle="Listings and all-time views per type"
          definition={definitions.liveDistribution}
          note={
            viewsError
              ? "All-time views could not be loaded."
              : "Views come from the all-time view counter, which has no dates; they are not affected by the date range."
          }
          className="xl:col-span-8"
          flush
        >
          <PropertyTypeAnalysis listings={data.liveByType} views={viewsByType} />
        </AnalyticsCard>

        <AnalyticsCard
          id="status-mix"
          title="All properties by status"
          badge="Current"
          badgeTone="neutral"
          subtitle="Every property on record"
          definition={definitions.statusDistribution}
          className="xl:col-span-4"
        >
          <DonutChart slices={statusSlices(data.statusDistribution)} centerLabel="Properties" label="Properties by status" />
        </AnalyticsCard>
      </div>

      {/* Top performing properties */}
      <AnalyticsCard
        id="top-properties"
        title="Top performing properties"
        subtitle={active.note}
        definition={definitions[ranking === "most-viewed" ? "mostViewed" : ranking === "most-enquired" ? "mostEnquired" : "enquiredUnsold"]}
        actions={
          typeof enquiredProperties === "number" && ranking !== "most-viewed" ? (
            <p className="text-right text-xs text-fg-muted">
              <span className="text-lg font-bold text-fg tabular-nums">{fullFmt.format(enquiredProperties)}</span>
              <br />
              properties enquired about
            </p>
          ) : null
        }
        flush
      >
        <div role="tablist" aria-label="Ranking" className="inline-flex self-start rounded-lg bg-surface-muted p-0.5 text-xs font-medium mx-5 sm:mx-6">
          {RANKINGS.map((item) => (
            <button
              key={item.kind}
              type="button"
              role="tab"
              aria-selected={item.kind === ranking}
              onClick={() => setRanking(item.kind)}
              className={cn(
                "rounded-md px-3 py-1.5 transition-colors",
                item.kind === ranking ? "bg-surface text-brand-700 shadow-card" : "text-fg-muted hover:text-fg",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div role="tabpanel" className="mt-4">
          <PropertyTable key={active.kind} kind={active.kind} selection={selection} columns={active.columns} emptyText={active.empty} />
        </div>
      </AnalyticsCard>
    </div>
  );
}
