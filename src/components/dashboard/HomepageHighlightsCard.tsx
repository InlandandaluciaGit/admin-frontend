"use client";

import Link from "next/link";
import { GlobalLoader } from "@/components/ui/GlobalLoader";
import type { Definitions, HomepageData } from "@/types/analytics";
import { InfoTip } from "./InfoTip";

const fullFmt = new Intl.NumberFormat("en-GB");

interface HomepageHighlightsCardProps {
  data: HomepageData | null;
  error: string | null;
  definition?: Definitions[string];
  refreshing?: boolean;
}

/**
 * Compact card: current homepage pool sizes for New Listings,
 * Popular of the Week and Exclusive Featured, linking to Homepage Rotation.
 */
export function HomepageHighlightsCard({ data, error, definition, refreshing }: HomepageHighlightsCardProps) {
  return (
    <section
      aria-labelledby="homepage-highlights-title"
      className="flex min-w-0 flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 id="homepage-highlights-title" className="text-[1rem] font-semibold text-fg">
            Homepage Property Highlights
          </h2>
          <InfoTip
            label="Homepage Property Highlights"
            definition={definition}
            extraNote="Current homepage pools right now — not filtered by the selected date range. Historical homepage snapshots are not recorded."
          />
        </div>
        <Link
          href="/analytics/homepage"
          aria-label="Open Homepage Rotation"
          className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-surface-muted/60 text-fg-muted transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>

      <div className="mt-4 flex flex-1 items-center">
        {error ? (
          <p className="text-sm text-danger-700">{error}</p>
        ) : !data ? (
          <GlobalLoader variant="content" className="py-8" />
        ) : (
          <div className="grid w-full grid-cols-3 divide-x divide-border text-center" aria-busy={refreshing}>
            {/* New Listings */}
            <div className="flex flex-col items-center px-2 py-2">
              <span
                aria-hidden="true"
                className="flex size-9 items-center justify-center rounded-xl bg-[#f1effe] text-[#634de8]"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
                </svg>
              </span>
              <p className="mt-3 flex min-h-[30px] items-center text-xs font-medium leading-tight text-balance text-fg-muted">New Listings</p>
              <p className="mt-1.5 text-2xl font-bold tracking-tight text-fg tabular-nums">
                {fullFmt.format(data.pools.newWithin30Days)}
              </p>
            </div>

            {/* Popular This Week */}
            <div className="flex flex-col items-center px-2 py-2">
              <span
                aria-hidden="true"
                className="flex size-9 items-center justify-center rounded-xl bg-[#fff1ee] text-[#ea580c]"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                </svg>
              </span>
              <p className="mt-3 flex min-h-[30px] items-center text-xs font-medium leading-tight text-balance text-fg-muted">Popular of the Week</p>
              <p className="mt-1.5 text-2xl font-bold tracking-tight text-fg tabular-nums">
                {fullFmt.format(data.pools.popularEligible)}
              </p>
            </div>

            {/* Exclusive (Featured) */}
            <div className="flex flex-col items-center px-2 py-2">
              <span
                aria-hidden="true"
                className="flex size-9 items-center justify-center rounded-xl bg-[#fef7e6] text-[#d97706]"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </span>
              <p className="mt-3 flex min-h-[30px] items-center text-xs font-medium leading-tight text-balance text-fg-muted">Exclusive Featured</p>
              <p className="mt-1.5 text-2xl font-bold tracking-tight text-fg tabular-nums">
                {fullFmt.format(data.pools.featuredLive)}
              </p>
              {data.pools.featuredLiveExpired > 0 ? (
                <span className="mt-2 inline-flex items-center rounded-full bg-warning-50 px-2.5 py-0.5 text-[11px] font-semibold text-warning-700 ring-1 ring-warning-200 tabular-nums">
                  {fullFmt.format(data.pools.featuredLiveExpired)} past expiry
                </span>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
