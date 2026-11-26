"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { SeriesPoint } from "@/types/analytics";
import { formatNumber, niceTicks } from "@/utils/format";
import { ChartDataTable } from "./ChartDataTable";

interface TimeColumnChartProps {
  points: SeriesPoint[];
  /** Accessible name and table caption. */
  label: string;
  valueLabel: string;
  height?: number;
  className?: string;
}

/** Axis labels to print: about eight, always including the last. */
export function labelStride(count: number, target = 8): number {
  return Math.max(1, Math.ceil(count / target));
}

/**
 * Counts per period as columns from a zero baseline: one series, slot-1 colour,
 * ≤ 24px columns with a 4px rounded cap. Every column has its own hover/focus
 * tooltip; the peak and the latest period are labelled directly, and every
 * value is in the screen-reader table.
 */
export function TimeColumnChart({ points, label, valueLabel, height = 200, className }: TimeColumnChartProps) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(0, ...points.map((p) => p.value));
  // Counts are whole numbers: keep integer ticks only (niceTicks can step by 0.5 for small maxima).
  const ticks = niceTicks(Math.max(max, 1)).filter((tick) => Number.isInteger(tick));
  const top = ticks[ticks.length - 1] || 1;
  const stride = labelStride(points.length);
  const last = points.length - 1;
  const peak = points.reduce((best, p, i) => (p.value > points[best].value ? i : best), 0);

  return (
    <figure className={cn("relative", className)}>
      {/* Top padding leaves room for the value label above the tallest column. */}
      <div className="flex gap-3 pt-5">
        <div className="relative w-9 shrink-0 text-right text-[11px] text-fg-subtle tabular-nums" style={{ height }} aria-hidden="true">
          {ticks.map((tick) => (
            <span key={tick} className="absolute right-0 translate-y-1/2" style={{ bottom: `${(tick / top) * 100}%` }}>
              {formatNumber(tick)}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="relative" style={{ height }} onPointerLeave={() => setActive(null)}>
            {ticks.map((tick) => (
              <span key={tick} aria-hidden="true" className="absolute inset-x-0 h-px bg-chart-grid" style={{ bottom: `${(tick / top) * 100}%` }} />
            ))}
            <div className="absolute inset-0 flex items-end gap-[2px]">
              {points.map((point, i) => {
                const pct = (point.value / top) * 100;
                const labelled = point.value > 0 && (i === last || i === peak);
                return (
                  <button
                    key={point.key}
                    type="button"
                    aria-label={`${point.label}: ${formatNumber(point.value)} ${valueLabel}`}
                    onPointerEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                    className="group relative flex h-full min-w-0 flex-1 cursor-default items-end justify-center rounded-sm focus-visible:outline-offset-2"
                  >
                    {labelled ? (
                      <span
                        aria-hidden="true"
                        className="absolute text-[11px] font-semibold text-fg tabular-nums"
                        style={{ bottom: `calc(${pct}% + 4px)` }}
                      >
                        {formatNumber(point.value)}
                      </span>
                    ) : null}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "w-full max-w-6 rounded-t-[4px] bg-chart-1 transition-opacity",
                        active !== null && active !== i ? "opacity-60" : "opacity-100",
                      )}
                      style={{ height: point.value > 0 ? `max(${pct}%, 2px)` : 0 }}
                    />
                  </button>
                );
              })}
            </div>
            {active !== null ? (
              <div
                role="status"
                className="pointer-events-none absolute top-0 z-10 rounded-lg border border-border bg-surface px-2.5 py-1.5 whitespace-nowrap shadow-popover"
                style={{
                  left: `${((active + 0.5) / points.length) * 100}%`,
                  transform: `translateX(${active > last * 0.6 ? "calc(-100% - 8px)" : "8px"})`,
                }}
              >
                <p className="text-sm font-semibold text-fg">{formatNumber(points[active].value)}</p>
                <p className="flex items-center gap-1.5 text-[11px] text-fg-subtle">
                  <span aria-hidden="true" className="size-2 rounded-[2px] bg-chart-1" />
                  {valueLabel} · {points[active].label}
                </p>
              </div>
            ) : null}
          </div>
          <div className="mt-2 flex gap-[2px] text-[11px] text-fg-subtle" aria-hidden="true">
            {points.map((point, i) => (
              <span
                key={point.key}
                className={cn(
                  "min-w-0 flex-1 overflow-visible text-center whitespace-nowrap",
                  // Alternate labels drop on small screens; the latest period always stays.
                  (i / stride) % 2 === 1 && i !== last && "invisible sm:visible",
                )}
              >
                {i === last || (i % stride === 0 && last - i >= stride / 2) ? point.label : ""}
              </span>
            ))}
          </div>
        </div>
      </div>
      <ChartDataTable caption={label} columns={["Period", valueLabel]} rows={points} />
    </figure>
  );
}
