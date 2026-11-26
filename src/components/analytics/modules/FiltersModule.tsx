"use client";

import type { ReactNode } from "react";
import { AnalyticsCard } from "@/components/dashboard/AnalyticsCard";
import { AUDIT_DATE, FILTERS, ON_PUBLIC_WEBSITE, RECOMMENDATIONS, VERIFIED_FINDINGS } from "@/components/filters/filterAudit";
import { FilterInventory } from "@/components/filters/FilterInventory";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { GlobalLoader } from "@/components/ui/GlobalLoader";
import { useAnalytics } from "@/hooks/useAnalytics";
import { cn } from "@/lib/cn";
import type { FiltersData, RangeSelection } from "@/types/analytics";

const fullFmt = new Intl.NumberFormat("en-GB");

/** The filters module describes current state; the API ignores the range. */
const CURRENT: RangeSelection = { range: "30d" };

const icon = (d: string) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

function StatCard({ label, value, caption, tile, glyph }: { label: string; value: number; caption: string; tile: string; glyph: ReactNode }) {
  return (
    <div className="flex h-full items-start gap-3.5 rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-5">
      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", tile)}>{glyph}</span>
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-fg-muted">{label}</p>
        <p className="mt-0.5 text-2xl font-bold tracking-tight text-fg tabular-nums">{value}</p>
        <p className="mt-0.5 text-[11px] leading-snug text-fg-subtle">{caption}</p>
      </div>
    </div>
  );
}

function FieldCoverage({ data }: { data: FiltersData }) {
  const rows = data.completeness.filter((c) => c.id !== "gps");
  return (
    <ul className="space-y-3.5">
      {rows.map((row) => {
        const share = row.live > 0 ? row.count / row.live : 0;
        return (
          <li key={row.id}>
            <div className="flex items-baseline justify-between gap-3 text-[13px]">
              <span className="font-medium text-fg">{row.label}</span>
              <span className="shrink-0 tabular-nums">
                <span className="font-semibold text-fg">{Math.round(share * 100)}%</span>
                <span className="ml-1.5 text-[11px] text-fg-muted">
                  {fullFmt.format(row.count)} of {fullFmt.format(row.live)}
                </span>
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-muted" aria-hidden="true">
              <div className={cn("h-full rounded-full", share >= 0.8 ? "bg-success-600" : share >= 0.4 ? "bg-[#2b92f0]" : "bg-border-strong")} style={{ width: `${share * 100}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function TopFeatures({ data }: { data: FiltersData }) {
  const items = data.features.slice(0, 10);
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ol className="space-y-2.5">
      {items.map((item) => (
        <li key={item.id} className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3 text-[13px] sm:grid-cols-[minmax(0,11rem)_1fr_auto]">
          <span className="truncate font-medium text-fg" title={item.label}>
            {item.label}
          </span>
          <span className="h-2 overflow-hidden rounded-full bg-surface-muted" aria-hidden="true">
            <span className="block h-full rounded-full bg-[#6c4de6]" style={{ width: `${(item.value / max) * 100}%` }} />
          </span>
          <span className="w-12 text-right font-semibold text-fg tabular-nums">{fullFmt.format(item.value)}</span>
        </li>
      ))}
    </ol>
  );
}

export function FiltersModule() {
  const filters = useAnalytics<FiltersData>("filters", CURRENT);
  const data = filters.response?.data;
  const definitions = filters.response?.definitions ?? {};

  const total = FILTERS.length;
  const onWebsite = FILTERS.filter((f) => ON_PUBLIC_WEBSITE.has(f.id)).length;
  const applied = FILTERS.filter((f) => f.api === "applied").length;
  const unsupported = FILTERS.filter((f) => f.status === "unsupported" || f.status === "partial").length;
  const review = FILTERS.filter((f) => f.status === "review").length;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-fg sm:text-[1.65rem]">Property Filters</h1>
          <p className="mt-1 text-sm text-fg-muted">Review available property filters and identify opportunities to improve property discovery.</p>
        </div>
        <span className="inline-flex items-center gap-2 self-start rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs shadow-card sm:self-auto">
          <span className="flex size-6 items-center justify-center rounded-lg bg-brand-50 text-brand-600" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </span>
          <span>
            <span className="block font-semibold text-fg">Code audit</span>
            <span className="block text-fg-muted">{AUDIT_DATE}</span>
          </span>
        </span>
      </div>

      {/* Overview */}
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5" aria-label="Filter audit overview">
        <li>
          <StatCard label="Filters audited" value={total} caption="Website controls and API parameters" tile="bg-brand-50 text-brand-600" glyph={icon("M22 3H2l8 9.46V19l4 2v-8.54z")} />
        </li>
        <li>
          <StatCard label="On the public website" value={onWebsite} caption="Usable by customers today" tile="bg-[#f1effe] text-[#634de8]" glyph={icon("M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M2 12h20")} />
        </li>
        <li>
          <StatCard label="Applied by the API" value={applied} caption="Change the property query" tile="bg-success-50 text-success-700" glyph={icon("M20 6 9 17l-5-5")} />
        </li>
        <li>
          <StatCard label="Unsupported or partial" value={unsupported} caption="Accepted but not applied" tile="bg-danger-50 text-danger-700" glyph={icon("M18 6 6 18M6 6l12 12")} />
        </li>
        <li className="sm:col-span-2 lg:col-span-1">
          <StatCard label="Requires review" value={review} caption="Unused endpoints or public access concerns" tile="bg-warning-50 text-warning-700" glyph={icon("M12 8v5M12 16.5v.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0")} />
        </li>
      </ul>

      {/* Client review summary */}
      <AnalyticsCard id="filter-summary" title="Client review summary" subtitle="For deciding which filters appear on the public website">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h3 className="flex items-center gap-2 text-xs font-semibold tracking-wide text-success-700 uppercase">
              <span className="size-1.5 rounded-full bg-success-600" aria-hidden="true" />
              Verified findings
            </h3>
            <ul className="mt-3 space-y-2.5">
              {VERIFIED_FINDINGS.map((item) => (
                <li key={item} className="flex gap-2.5 text-[13px] leading-relaxed text-fg">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-fg-subtle" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-brand-50/60 p-4">
            <h3 className="flex items-center gap-2 text-xs font-semibold tracking-wide text-brand-700 uppercase">
              <span className="size-1.5 rounded-full bg-brand-600" aria-hidden="true" />
              Recommendations
            </h3>
            <ol className="mt-3 space-y-2.5">
              {RECOMMENDATIONS.map((item, i) => (
                <li key={item} className="flex gap-2.5 text-[13px] leading-relaxed text-fg">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-surface text-[11px] font-bold text-brand-700 tabular-nums">{i + 1}</span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </AnalyticsCard>

      {/* Inventory */}
      <AnalyticsCard
        id="filter-inventory"
        title="Filter inventory"
        subtitle="Every filter the website offers or the API accepts, checked from the website through to the database query"
        definition={definitions.filterInventory}
        flush
      >
        <FilterInventory />
      </AnalyticsCard>

      {/* Potential additional filters, from live data */}
      {filters.error ? (
        <Alert tone="error" title="Could not load field coverage">
          <p>{filters.error}</p>
          <Button variant="secondary" size="sm" className="mt-2" onClick={filters.retry}>
            Try again
          </Button>
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <AnalyticsCard
          id="field-coverage"
          title="Data for potential new filters"
          badge="Current"
          badgeTone="neutral"
          subtitle="Share of live properties with each field filled in. None of these is a filter today."
          definition={definitions.filterData}
        >
          {data ? <FieldCoverage data={data} /> : filters.error ? null : <GlobalLoader variant="content" className="py-10" />}
        </AnalyticsCard>
        <AnalyticsCard
          id="top-features"
          title="Most common features"
          badge="Current"
          badgeTone="neutral"
          subtitle="Live properties per feature. Only pool and garage are filters today."
          definition={definitions.filterData}
        >
          {data ? <TopFeatures data={data} /> : filters.error ? null : <GlobalLoader variant="content" className="py-10" />}
        </AnalyticsCard>
      </div>

      <p className="text-xs text-fg-subtle">
        Filter usage is not recorded, so how often customers use each filter is unknown. Statuses come from the code review, not usage data. No filter
        was changed.
      </p>
    </div>
  );
}
