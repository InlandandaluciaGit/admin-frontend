"use client";

import { BusinessPerformanceChart } from "@/components/dashboard/BusinessPerformanceChart";
import { DashboardDateDropdown } from "@/components/dashboard/DashboardDateDropdown";
import { DashboardKpiGrid } from "@/components/dashboard/DashboardKpiGrid";
import { HomepageHighlightsCard } from "@/components/dashboard/HomepageHighlightsCard";
import { LeadSourcesDonut } from "@/components/dashboard/LeadSourcesDonut";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { GlobalLoader } from "@/components/ui/GlobalLoader";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useDateRange } from "@/hooks/useDateRange";
import { useGreeting } from "@/hooks/useGreeting";
import { cn } from "@/lib/cn";
import type { Definitions, HomepageData, LeadsData, OverviewData, RangeSelection } from "@/types/analytics";

/** Homepage pools describe what is live right now; the range is only needed by the API contract. */
const CURRENT: RangeSelection = { range: "30d" };

export function OverviewModule() {
  const user = useCurrentUser();
  const greeting = useGreeting();
  const [selection, setSelection] = useDateRange();

  const overview = useAnalytics<OverviewData>("overview", selection);
  const leads = useAnalytics<LeadsData>("leads", selection);
  const homepage = useAnalytics<HomepageData>("homepage-rotation", CURRENT);

  const definitions: Definitions = overview.response?.definitions ?? {};
  const range = overview.response?.range;

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* A. Welcome + date filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-fg sm:text-[1.65rem]">
            {greeting?.greeting ?? "Welcome back"}
            {user ? `, ${user.name}` : ""}
          </h1>
          <p className="mt-1 text-sm text-fg-muted">Business insights to understand lead sources, property performance and sales.</p>
        </div>

        <DashboardDateDropdown
          key={`${selection.range}|${selection.from ?? ""}|${selection.to ?? ""}`}
          selection={selection}
          onChange={setSelection}
          resolved={range}
          busy={overview.refreshing}
        />
      </div>

      {overview.error ? (
        <Alert
          tone="error"
          title={overview.response ? "Could not update for the selected range. Showing the last loaded figures." : "Could not load dashboard metrics"}
        >
          <p>{overview.error}</p>
          <Button variant="secondary" size="sm" className="mt-2" onClick={overview.retry}>
            Try again
          </Button>
        </Alert>
      ) : null}

      {overview.loading ? <GlobalLoader variant="content" /> : null}

      {overview.response ? (
        <div aria-busy={overview.refreshing} className={cn("flex flex-col gap-5 transition-opacity", overview.refreshing && "opacity-65")}>
          {/* B. KPI cards */}
          <DashboardKpiGrid data={overview.response.data} range={overview.response.range} />

          {/* C. Performance chart  |  D. Lead sources + E. Homepage highlights */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
            <div className="flex min-w-0 xl:col-span-8">
              <BusinessPerformanceChart
                enquiryTrend={overview.response.data.enquiryTrend}
                toursTrend={overview.response.data.toursTrend}
                salesTrend={overview.response.data.salesTrend}
                range={overview.response.range}
                definitions={definitions}
              />
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 xl:col-span-4 xl:grid-cols-1">
              {leads.error && !leads.response ? (
                <section className="flex flex-col justify-center rounded-2xl border border-border bg-surface p-6 shadow-card">
                  <Alert tone="error" title="Could not load lead sources">
                    <p>{leads.error}</p>
                    <Button variant="secondary" size="sm" className="mt-2" onClick={leads.retry}>
                      Try again
                    </Button>
                  </Alert>
                </section>
              ) : !leads.response ? (
                <section className="flex items-center justify-center rounded-2xl border border-border bg-surface p-6 shadow-card">
                  <GlobalLoader variant="content" className="py-12" />
                </section>
              ) : (
                <div className={cn("flex min-w-0 transition-opacity", leads.refreshing && "opacity-65")}>
                  <LeadSourcesDonut data={leads.response.data} definition={definitions.enquiriesBySource} selection={selection} />
                </div>
              )}

              <HomepageHighlightsCard
                data={homepage.response?.data ?? null}
                error={homepage.error}
                definition={definitions.homepageSections}
                refreshing={homepage.refreshing}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
