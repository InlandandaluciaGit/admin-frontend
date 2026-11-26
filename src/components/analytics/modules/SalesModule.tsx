"use client";

import { TimeColumnChart } from "@/components/charts";
import { DashboardDateDropdown } from "@/components/dashboard/DashboardDateDropdown";
import { DashboardKpiCard } from "@/components/dashboard/DashboardKpiGrid";
import { AttributionComparison } from "@/components/sales/AttributionComparison";
import { attributionRows } from "@/components/sales/attributionSources";
import { AnalyticsCard } from "@/components/dashboard/AnalyticsCard";
import { SalesSourceDonut } from "@/components/sales/SalesSourceDonut";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { GlobalLoader } from "@/components/ui/GlobalLoader";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useDateRange } from "@/hooks/useDateRange";
import { cn } from "@/lib/cn";
import type { AnalyticsResponse, RangeSelection, SalesData } from "@/types/analytics";
import { PropertyTable } from "../PropertyTable";

const fullFmt = new Intl.NumberFormat("en-GB");
const pctOf = (part: number, whole: number) => (whole > 0 ? `${Math.round((part / whole) * 100)}%` : "–");

const SALE_DATE_NOTE = "Dated from the latest “Sold” entry in the property history: when the sale was recorded, not a verified completion date.";

const ICON = {
  key: "M21 2l-2 2m-7.6 7.6a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4",
  user: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  link: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
};

const svg = (d: string) => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export function SalesModule() {
  const [selection, setSelection] = useDateRange();
  const sales = useAnalytics<SalesData>("sales", selection);
  const response = sales.response;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-fg sm:text-[1.65rem]">Sales Performance</h1>
          <p className="mt-1 text-sm text-fg-muted">Understand property sales, buyer conversions and the lead sources behind successful sales.</p>
        </div>
        <DashboardDateDropdown
          key={`${selection.range}|${selection.from ?? ""}|${selection.to ?? ""}`}
          selection={selection}
          onChange={setSelection}
          resolved={response?.range}
          busy={sales.refreshing}
        />
      </div>

      {sales.error ? (
        <Alert tone="error" title={response ? "Could not update for the selected range. Showing the last loaded figures." : "Could not load sales data"}>
          <p>{sales.error}</p>
          <Button variant="secondary" size="sm" className="mt-2" onClick={sales.retry}>
            Try again
          </Button>
        </Alert>
      ) : null}

      {sales.loading ? <GlobalLoader variant="content" /> : null}

      {response ? <SalesContent data={response.data} response={response} refreshing={sales.refreshing} selection={selection} /> : null}
    </div>
  );
}

function SalesContent({
  data,
  response,
  refreshing,
  selection,
}: {
  data: SalesData;
  response: AnalyticsResponse<SalesData>;
  refreshing: boolean;
  selection: RangeSelection;
}) {
  const { range, definitions } = response;
  const sold = data.kpis.find((k) => k.id === "inferredSales");
  const soldCount = sold?.value ?? 0;
  const { attribution } = data;
  const rows = attributionRows(attribution);

  return (
    <div aria-busy={refreshing} className={cn("flex flex-col gap-5 transition-opacity", refreshing && "opacity-65")}>
      {/* KPI cards */}
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Sales headline figures">
        <li>
          <DashboardKpiCard
            id="sales-sold"
            title="Properties Sold"
            kpi={sold}
            range={range}
            theme="green"
            trend={data.trend}
            badge="Inferred"
            extraNote={SALE_DATE_NOTE}
            icon={svg(ICON.key)}
          />
        </li>
        <li>
          <DashboardKpiCard
            id="sales-buyer-linked"
            title="Buyer-linked Sales"
            kpi={{ id: "buyerLinkedSales", value: attribution.sales }}
            range={range}
            theme="purple"
            icon={svg(ICON.user)}
            footer={soldCount > 0 ? `${pctOf(attribution.sales, soldCount)} of properties sold have a recorded buyer` : "Selected period"}
          />
        </li>
        <li className="sm:col-span-2 lg:col-span-1">
          <DashboardKpiCard
            id="sales-traced"
            title="Sales Traced to a Lead Source"
            kpi={{ id: "attributableSales", value: attribution.attributable }}
            range={range}
            theme="blue"
            icon={svg(ICON.link)}
            footer={
              attribution.sales > 0 ? `${pctOf(attribution.attributable, attribution.sales)} of buyer-linked sales had a prior enquiry` : "Selected period"
            }
          />
        </li>
      </ul>

      {/* Sales over time | Sales by lead source */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <AnalyticsCard
          id="sales-trend"
          title="Sales over time"
          badge="Inferred"
          subtitle={`Per ${range.granularity} · ${range.label}`}
          definition={definitions.inferredSales}
          note={SALE_DATE_NOTE}
          className="xl:col-span-7"
          actions={
            sold ? (
              <div className="text-right">
                <p className="text-xl font-bold text-fg tabular-nums">{fullFmt.format(soldCount)}</p>
                {typeof sold.previous === "number" ? (
                  <p className="text-[11px] text-fg-muted">
                    vs <span className="font-semibold text-fg tabular-nums">{fullFmt.format(sold.previous)}</span> in {range.previous.label}
                  </p>
                ) : null}
              </div>
            ) : null
          }
        >
          {data.trend.length ? (
            <TimeColumnChart points={data.trend} label={`Inferred sales per ${range.granularity}, ${range.label}`} valueLabel="Sales" height={240} />
          ) : (
            <p className="flex flex-1 items-center justify-center py-12 text-sm text-fg-muted">No sales recorded in this period.</p>
          )}
        </AnalyticsCard>

        <AnalyticsCard
          id="sales-by-source"
          title="Sales by lead source"
          subtitle="Buyer-linked sales, by the routed enquiry source"
          definition={definitions.attribution}
          className="xl:col-span-5"
        >
          <SalesSourceDonut rows={rows} sales={attribution.sales} />
        </AnalyticsCard>
      </div>

      {/* First vs last touch */}
      <AnalyticsCard
        id="attribution-compare"
        title="First touch vs last touch"
        subtitle="First touch: the buyer's earliest routed enquiry. Last touch: their latest one on or before the sale."
        definition={definitions.attribution}
        flush
      >
        {attribution.sales === 0 ? (
          <p className="px-5 pb-6 text-sm text-fg-muted sm:px-6">No buyer-linked sales in this period.</p>
        ) : (
          <AttributionComparison rows={rows} attribution={attribution} />
        )}
      </AnalyticsCard>

      {/* Sales records */}
      <AnalyticsCard
        id="sold-list"
        title="Sold properties"
        badge="Inferred"
        subtitle="Newest sale first"
        definition={definitions.inferredSales}
        note={
          data.archivedInRange > 0
            ? `${SALE_DATE_NOTE} ${fullFmt.format(data.archivedInRange)} sale(s) in this period are of properties since archived and are not listed.`
            : SALE_DATE_NOTE
        }
        flush
      >
        <PropertyTable kind="sold" selection={selection} columns={["sale", "lifetime"]} emptyText="No properties with an inferred sale date in this period." />
      </AnalyticsCard>
    </div>
  );
}
