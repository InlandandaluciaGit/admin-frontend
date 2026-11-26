"use client";

import { AnalyticsCard } from "@/components/dashboard/AnalyticsCard";
import { CategorySection, CategorySummary } from "@/components/homepage/CategorySection";
import { FeaturedListTable } from "@/components/homepage/FeaturedListTable";
import { HistoryLimitation, RotationRules } from "@/components/homepage/RotationRules";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { GlobalLoader } from "@/components/ui/GlobalLoader";
import { useAnalytics } from "@/hooks/useAnalytics";
import type { HomepageData, RangeSelection } from "@/types/analytics";

const fullFmt = new Intl.NumberFormat("en-GB");

/** The homepage selection is current state only; the API ignores the range, so none is offered. */
const CURRENT: RangeSelection = { range: "30d" };

export function HomepageModule() {
  const homepage = useAnalytics<HomepageData>("homepage-rotation", CURRENT);
  const data = homepage.response?.data;
  const definitions = homepage.response?.definitions ?? {};

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-fg sm:text-[1.65rem]">Homepage Rotation</h1>
          <p className="mt-1 text-sm text-fg-muted">Understand how properties are selected and displayed across the homepage.</p>
        </div>
        {data ? (
          <div className="flex items-center gap-2.5 self-start rounded-xl border border-border bg-surface px-3.5 py-2.5 shadow-card sm:self-auto">
            <span className="relative flex size-2.5" aria-hidden="true">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success-600 opacity-40 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2.5 rounded-full bg-success-600" />
            </span>
            <span className="text-xs">
              <span className="block font-semibold text-fg">Current selection</span>
              <span className="block text-fg-muted">
                Computed {new Date(data.computedAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </span>
            </span>
          </div>
        ) : null}
      </div>

      {homepage.error ? (
        <Alert tone="error" title="Could not load the homepage selection">
          <p>{homepage.error}</p>
          <Button variant="secondary" size="sm" className="mt-2" onClick={homepage.retry}>
            Try again
          </Button>
        </Alert>
      ) : null}

      {homepage.loading ? <GlobalLoader variant="content" /> : null}

      {data ? (
        <div className="flex flex-col gap-5">
          {/* Eligible pools right now */}
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-3" aria-label="Currently eligible properties per section">
            <li>
              <CategorySummary
                id="newListings"
                value={data.pools.newWithin30Days}
                caption="Live, listed in the last 30 days"
                extra={
                  <span className="inline-flex rounded-full bg-success-50 px-2 py-0.5 text-[11px] font-semibold text-success-700">
                    + {fullFmt.format(data.pools.priceReduced)} price-reduced, also eligible
                  </span>
                }
              />
            </li>
            <li>
              <CategorySummary id="popular" value={data.pools.popularEligible} caption="Live, with an enquiry in the last 7 days" />
            </li>
            <li>
              <CategorySummary
                id="exclusives"
                value={data.pools.featuredLive}
                caption={`Live on the featured list (${fullFmt.format(data.pools.featuredTotal)} entries in total)`}
                extra={
                  data.pools.featuredLiveExpired > 0 ? (
                    <span className="inline-flex rounded-full bg-warning-50 px-2 py-0.5 text-[11px] font-semibold text-warning-700">
                      {fullFmt.format(data.pools.featuredLiveExpired)} past expiry, still eligible
                    </span>
                  ) : null
                }
              />
            </li>
          </ul>

          {/* What each section shows right now */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
            <CategorySection id="newListings" items={data.sections.newListings} />
            <CategorySection
              id="popular"
              items={data.sections.popular}
              notice={
                data.popularFellBack ? (
                  <Alert tone="warning">No live property had an enquiry in the last 7 days, so the website is ranking by lifetime enquiries.</Alert>
                ) : null
              }
            />
            <div className="lg:col-span-2 2xl:col-span-1">
              <CategorySection id="exclusives" items={data.sections.exclusives} featuredByRef={new Map(data.featured.map((e) => [e.ref, e]))} />
            </div>
          </div>

          {/* Featured list */}
          <AnalyticsCard
            id="featured-list"
            title="Featured list"
            subtitle="Every entry staff have added, with its expiry date and whether it is shown now"
            definition={definitions.featuredList}
            note="The website does not check the expiry date: a live property past its expiry stays eligible for Exclusive Featured."
            flush
          >
            <FeaturedListTable entries={data.featured} />
          </AnalyticsCard>

          {/* How it works */}
          <AnalyticsCard
            id="rotation-rules"
            title="How selection works"
            subtitle="The website's own selection logic, as run for this page"
            definition={definitions.homepageSections}
            note={`${data.rules.popular}\n\n${data.rules.newListings}\n\n${data.rules.exclusives}\n\n${data.rules.shared}`}
          >
            <RotationRules limit={data.limit} />
          </AnalyticsCard>

          <HistoryLimitation />
        </div>
      ) : null}
    </div>
  );
}
