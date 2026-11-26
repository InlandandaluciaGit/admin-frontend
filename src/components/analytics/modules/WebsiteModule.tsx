"use client";

import { TimeColumnChart } from "@/components/charts";
import { AnalyticsCard } from "@/components/dashboard/AnalyticsCard";
import { DashboardDateDropdown } from "@/components/dashboard/DashboardDateDropdown";
import { DashboardKpiCard } from "@/components/dashboard/DashboardKpiGrid";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { GlobalLoader } from "@/components/ui/GlobalLoader";
import { Table, type TableColumn } from "@/components/ui/Table";
import { AnalyticsReadiness } from "@/components/website/AnalyticsReadiness";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useDateRange } from "@/hooks/useDateRange";
import { cn } from "@/lib/cn";
import type { AnalyticsResponse, LeadsData, WebsiteData } from "@/types/analytics";
import { BreakdownBars } from "../BreakdownBars";

const fullFmt = new Intl.NumberFormat("en-GB");

type TopRow = WebsiteData["topViewed"][number];

const TOP_COLUMNS: TableColumn<TopRow>[] = [
  { id: "ref", header: "Ref", cell: (r) => <span className="font-medium whitespace-nowrap">{r.ref}</span> },
  { id: "type", header: "Type", hideBelow: "sm", cell: (r) => r.type },
  { id: "area", header: "Area", hideBelow: "md", cell: (r) => r.area },
  { id: "views", header: "All-time views", align: "right", cell: (r) => <span className="tabular-nums">{fullFmt.format(r.views)}</span> },
  {
    id: "rate",
    header: "Views / day listed",
    align: "right",
    hideBelow: "md",
    cell: (r) => <span className="tabular-nums text-fg-muted">{r.viewsPerDay === null ? "—" : r.viewsPerDay.toFixed(1)}</span>,
  },
];

const icon = (d: string) => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const ICON = {
  globe: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10",
  form: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h5",
  eye: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6",
};

export function WebsiteModule() {
  const [selection, setSelection] = useDateRange();
  const website = useAnalytics<WebsiteData>("website", selection);
  // Only for the new website form's submission count; the Leads page owns the rest of this response.
  const leads = useAnalytics<LeadsData>("leads", selection);
  const response = website.response;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-fg sm:text-[1.65rem]">Website Performance</h1>
          <p className="mt-1 text-sm text-fg-muted">Understand website engagement, enquiries and customer activity.</p>
        </div>
        <DashboardDateDropdown
          key={`${selection.range}|${selection.from ?? ""}|${selection.to ?? ""}`}
          selection={selection}
          onChange={setSelection}
          resolved={response?.range}
          busy={website.refreshing}
        />
      </div>

      {website.error ? (
        <Alert tone="error" title={response ? "Could not update for the selected range. Showing the last loaded figures." : "Could not load website data"}>
          <p>{website.error}</p>
          <Button variant="secondary" size="sm" className="mt-2" onClick={website.retry}>
            Try again
          </Button>
        </Alert>
      ) : null}

      {website.loading ? <GlobalLoader variant="content" /> : null}

      {response ? (
        <WebsiteContent
          response={response}
          refreshing={website.refreshing}
          leads={leads.response?.data ?? null}
          leadsPending={leads.loading || leads.refreshing}
          leadsError={leads.error}
        />
      ) : null}
    </div>
  );
}

interface WebsiteContentProps {
  response: AnalyticsResponse<WebsiteData>;
  refreshing: boolean;
  leads: LeadsData | null;
  leadsPending: boolean;
  leadsError: string | null;
}

function WebsiteContent({ response, refreshing, leads, leadsPending, leadsError }: WebsiteContentProps) {
  const { data, range, definitions } = response;
  const kpi = (id: string) => data.kpis.find((k) => k.id === id);
  const enquiries = kpi("websiteSourceEnquiries");
  const liveViews = kpi("liveViews");
  const avgViews = kpi("avgLiveViews")?.value;
  const form = leads?.websiteForm;

  return (
    <div aria-busy={refreshing} className={cn("flex flex-col gap-5 transition-opacity", refreshing && "opacity-65")}>
      {/* KPI cards */}
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Website headline figures">
        <li>
          <DashboardKpiCard
            id="web-enquiries"
            title="Website Enquiries"
            kpi={enquiries}
            range={range}
            theme="purple"
            trend={data.websiteEnquiryTrend}
            icon={icon(ICON.globe)}
          />
        </li>
        <li>
          <DashboardKpiCard
            id="web-form"
            title="Enquiry Form Submissions"
            kpi={
              form
                ? { id: "websiteFormSubmissions", value: form.submissions }
                : leadsError
                  ? { id: "websiteFormSubmissions", value: null, unavailableReason: "Could not load form submissions." }
                  : undefined
            }
            loading={!form && !leadsError && leadsPending}
            range={range}
            theme="blue"
            icon={icon(ICON.form)}
            footer={form ? `${fullFmt.format(form.matchedInRouted)} also recorded as routed enquiries` : undefined}
          />
        </li>
        <li className="sm:col-span-2 lg:col-span-1">
          <DashboardKpiCard
            id="web-views"
            title="Live Property Views"
            kpi={liveViews}
            range={range}
            theme="green"
            badge="All-time"
            extraNote="All-time view counter; it has no dates, so it does not change with the selected period."
            icon={icon(ICON.eye)}
            footer={typeof avgViews === "number" ? `Avg ${fullFmt.format(avgViews)} views per live property` : "All-time counter"}
          />
        </li>
      </ul>

      {/* Enquiry trend | Google Analytics readiness */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <AnalyticsCard
          id="web-enquiry-trend"
          title="Website enquiries over time"
          subtitle={`Routed enquiries with source “Website” · per ${range.granularity} · ${range.label}`}
          definition={definitions.websiteSourceEnquiries}
          className="xl:col-span-8"
          actions={
            enquiries && enquiries.value !== null ? (
              <div className="text-right">
                <p className="text-xl font-bold text-fg tabular-nums">{fullFmt.format(enquiries.value)}</p>
                {typeof enquiries.previous === "number" ? (
                  <p className="text-[11px] text-fg-muted">
                    vs <span className="font-semibold text-fg tabular-nums">{fullFmt.format(enquiries.previous)}</span> in {range.previous.label}
                  </p>
                ) : null}
              </div>
            ) : null
          }
        >
          {!enquiries || enquiries.value === null ? (
            <p className="flex flex-1 items-center justify-center py-12 text-center text-sm text-fg-muted">
              {enquiries?.unavailableReason ?? "Website enquiries are not available."}
            </p>
          ) : (
            <TimeColumnChart
              points={data.websiteEnquiryTrend}
              label={`Website enquiries per ${range.granularity}, ${range.label}`}
              valueLabel="Enquiries"
              height={240}
            />
          )}
        </AnalyticsCard>

        <AnalyticsCard
          id="ga-readiness"
          title="Google Analytics"
          subtitle="Visitors, sessions and engagement"
          className="xl:col-span-4"
          note={data.ga4.reason}
        >
          <AnalyticsReadiness ga4={data.ga4} unavailable={data.unavailable} />
        </AnalyticsCard>
      </div>

      {/* Most viewed | Views by type */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <AnalyticsCard
          id="top-viewed"
          title="Most viewed live properties"
          badge="All-time"
          badgeTone="neutral"
          definition={definitions.mostViewed}
          note="Views per day listed divides all-time views by days since listing: a rough age adjustment, not a measured daily figure."
          className="xl:col-span-8"
          flush
        >
          <Table columns={TOP_COLUMNS} rows={data.topViewed} rowKey={(r) => r.ref} caption="Most viewed live properties" />
        </AnalyticsCard>

        <AnalyticsCard
          id="views-type"
          title="Views by property type"
          badge="All-time"
          badgeTone="neutral"
          subtitle="Live properties"
          definition={definitions.viewsByCategory}
          className="xl:col-span-4"
        >
          <BreakdownBars items={data.viewsByType} label="All-time views of live properties by type" valueLabel="Views" limit={8} />
        </AnalyticsCard>
      </div>
    </div>
  );
}
