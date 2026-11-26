"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { rangeQuery } from "@/services/analytics.service";
import type { Definitions, LeadsData, RangeSelection } from "@/types/analytics";
import { InfoTip } from "./InfoTip";

const fullFmt = new Intl.NumberFormat("en-GB");
const SLICE_COLORS = ["#5b42f3", "#2b92f0", "#10b981", "#f59e0b", "#c4c9d6"] as const;

interface DonutSlice {
  id: string;
  label: string;
  enquiries: number;
  share: number;
  color: string;
}

interface LeadSourcesDonutProps {
  data: LeadsData;
  definition?: Definitions[string];
  selection: RangeSelection;
}

function formatShare(ratio: number): string {
  return `${(ratio * 100).toFixed(1)}%`;
}

/**
 * Interactive donut chart + breakdown list bound to `LeadsData.sources`.
 */
export function LeadSourcesDonut({ data, definition, selection }: LeadSourcesDonutProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const active = data.sources.filter((s) => s.enquiries > 0);
  const total = active.reduce((sum, s) => sum + s.enquiries, 0);

  let grouped = active;
  if (active.length > 5) {
    const top = active.slice(0, 4);
    const rest = active.slice(4);
    grouped = [
      ...top,
      {
        id: "__other",
        label: "Other",
        enquiries: rest.reduce((sum, s) => sum + s.enquiries, 0),
        buyers: rest.reduce((sum, s) => sum + s.buyers, 0),
        previousEnquiries: rest.reduce((sum, s) => sum + s.previousEnquiries, 0),
      },
    ];
  }

  const slices: DonutSlice[] = grouped.map((s, idx) => ({
    id: s.id,
    label: s.label,
    enquiries: s.enquiries,
    share: total > 0 ? s.enquiries / total : 0,
    color: s.id === "__other" ? "#c4c9d6" : SLICE_COLORS[idx % SLICE_COLORS.length],
  }));

  const activeSlice = slices.find((s) => s.id === hoveredId) ?? null;

  // SVG donut geometry (circumference of r=62 is ~389.56)
  const radius = 62;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;
  const gap = slices.length > 1 ? 3 : 0;

  const segments = slices.reduce<{ slice: DonutSlice; drawLen: number; offset: number; nextStart: number }[]>(
    (acc, slice) => {
      const start = acc.length ? acc[acc.length - 1].nextStart : 0;
      const rawLen = slice.share * circumference;
      const drawLen = Math.max(0, rawLen - gap);
      acc.push({ slice, drawLen, offset: -start, nextStart: start + rawLen });
      return acc;
    },
    [],
  );

  const reportHref = `/analytics/leads?${rangeQuery(selection).toString()}`;

  return (
    <section
      aria-labelledby="lead-sources-title"
      className="flex w-full min-w-0 flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 id="lead-sources-title" className="text-[1rem] font-semibold text-fg">
            Enquiries by Lead Source
          </h2>
          <InfoTip label="Enquiries by Lead Source" definition={definition} />
        </div>
        <Link
          href={reportHref}
          aria-label="Open full Lead Sources report"
          className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-surface-muted/60 text-fg-muted transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>

      {total === 0 ? (
        <div className="flex flex-1 items-center justify-center py-12 text-sm text-fg-muted">
          No routed enquiries in this period.
        </div>
      ) : (
        <div className="mt-5 flex flex-1 flex-col items-center justify-center gap-6 sm:flex-row sm:gap-5">
          {/* Donut Chart */}
          <div className="relative flex size-40 shrink-0 items-center justify-center">
            <svg viewBox="0 0 180 180" className="size-full -rotate-90" role="img" aria-label={`Enquiries by lead source, total ${fullFmt.format(total)}`}>
              <circle cx="90" cy="90" r={radius} fill="none" stroke="var(--color-surface-muted)" strokeWidth={strokeWidth} />
              {segments.map(({ slice, drawLen, offset }) => {
                const isHovered = hoveredId === slice.id;
                const isDimmed = hoveredId !== null && !isHovered;
                return (
                  <circle
                    key={slice.id}
                    cx="90"
                    cy="90"
                    r={radius}
                    fill="none"
                    stroke={slice.color}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={`${drawLen} ${circumference}`}
                    strokeDashoffset={offset}
                    onMouseEnter={() => setHoveredId(slice.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className="cursor-pointer transition-all duration-150"
                    style={{ opacity: isDimmed ? 0.45 : 1 }}
                  />
                );
              })}
            </svg>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
              {activeSlice ? (
                <>
                  <span className="text-xl font-bold tracking-tight text-fg tabular-nums">{fullFmt.format(activeSlice.enquiries)}</span>
                  <span className="mt-0.5 max-w-[96px] truncate text-[11px] font-medium text-fg-muted">{activeSlice.label}</span>
                  <span className="text-[11px] font-semibold text-brand-600 tabular-nums">{formatShare(activeSlice.share)}</span>
                </>
              ) : (
                <>
                  <span className="text-2xl font-bold tracking-tight text-fg tabular-nums">{fullFmt.format(total)}</span>
                  <span className="text-xs font-medium text-fg-muted">Enquiries</span>
                </>
              )}
            </div>
          </div>

          {/* Legend Breakdown */}
          <ul className="w-full min-w-0 flex-1 space-y-2.5" aria-label="Lead source breakdown">
            {slices.map((slice) => {
              const isHovered = hoveredId === slice.id;
              return (
                <li
                  key={slice.id}
                  onMouseEnter={() => setHoveredId(slice.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-lg px-2 py-1 text-sm transition-colors",
                    isHovered && "bg-surface-muted/80",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} aria-hidden="true" />
                    <span className="truncate text-[13px] font-medium text-fg" title={slice.label}>
                      {slice.label}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-baseline gap-3 tabular-nums">
                    <span className="text-xs text-fg-muted">{formatShare(slice.share)}</span>
                    <span className="w-10 text-right text-[13px] font-semibold text-fg">{fullFmt.format(slice.enquiries)}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
