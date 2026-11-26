"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { cn } from "@/lib/cn";
import type { SeriesPoint } from "@/types/dashboard";
import { formatNumber, niceRange } from "@/utils/format";
import { ChartDataTable } from "./ChartDataTable";

interface TrendChartProps {
  points: SeriesPoint[];
  /** Accessible name and table caption, e.g. "Active listings, last 12 months". */
  label: string;
  valueLabel: string;
  /** `full` has axes and gridlines; `spark` is a compact sparkline. */
  variant?: "full" | "spark";
  height?: number;
  className?: string;
}

/**
 * Single-series line chart (one y-axis). The axis is fitted to the data range
 * with clean ticks, so there is deliberately no area fill (an area implies a
 * zero baseline).
 * SVG draws the line/area; HTML draws dots, labels and the hover readout so
 * they don't distort when the chart stretches to its container.
 * Hover or keyboard (←/→) shows a crosshair snapped to the nearest point.
 */
export function TrendChart({ points, label, valueLabel, variant = "full", height, className }: TrendChartProps) {
  const isSpark = variant === "spark";
  const plotHeight = height ?? (isSpark ? 44 : 180);
  const [active, setActive] = useState<number | null>(null);
  const plotRef = useRef<HTMLDivElement>(null);
  if (points.length === 0) return null;

  const values = points.length ? points.map((p) => p.value) : [0];
  const dataMax = Math.max(...values);
  const dataMin = Math.min(...values);
  const ticks = isSpark ? [] : niceRange(dataMin, dataMax);
  const lo = isSpark ? dataMin - (dataMax - dataMin) * 0.15 : ticks[0];
  const hi = isSpark ? dataMax + (dataMax - dataMin) * 0.15 : ticks[ticks.length - 1];
  const n = points.length;
  const x = (i: number) => (n === 1 ? 50 : (i / (n - 1)) * 100);
  const y = (v: number) => 100 - ((v - lo) / (hi - lo || 1)) * 100;

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.value)}`).join(" ");
  const last = n - 1;
  const shown = active ?? null;

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = plotRef.current?.getBoundingClientRect();
    if (!rect) return;
    const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    setActive(Math.round(ratio * last));
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    setActive((current) => {
      const base = current ?? last;
      return Math.min(Math.max(base + (event.key === "ArrowRight" ? 1 : -1), 0), last);
    });
  };

  return (
    <figure className={cn("relative", className)}>
      <div className={cn("flex", !isSpark && "gap-3")}>
        {!isSpark ? (
          <div className="relative w-9 shrink-0 text-right text-[11px] text-fg-subtle tabular-nums" style={{ height: plotHeight }} aria-hidden="true">
            {ticks.map((tick) => (
              <span key={tick} className="absolute right-0 -translate-y-1/2" style={{ top: `${y(tick)}%` }}>
                {formatNumber(tick)}
              </span>
            ))}
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <div
            ref={plotRef}
            role="img"
            aria-label={`${label}. Latest ${valueLabel}: ${formatNumber(points[last].value)}. Use left and right arrow keys to read values.`}
            tabIndex={0}
            onPointerMove={onPointerMove}
            onPointerLeave={() => setActive(null)}
            onFocus={() => setActive(last)}
            onBlur={() => setActive(null)}
            onKeyDown={onKeyDown}
            className="relative cursor-crosshair rounded-sm focus-visible:outline-offset-4"
            style={{ height: plotHeight }}
          >
            {!isSpark
              ? ticks.map((tick) => (
                  <span key={tick} aria-hidden="true" className="absolute inset-x-0 h-px bg-chart-grid" style={{ top: `${y(tick)}%` }} />
                ))
              : null}

            <svg className="absolute inset-0 size-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <path
                d={line}
                fill="none"
                stroke={isSpark ? "var(--color-chart-muted)" : "var(--color-brand-600)"}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {/* Current-period marker */}
            <span
              aria-hidden="true"
              className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600 ring-2 ring-surface"
              style={{ left: `${x(last)}%`, top: `${y(points[last].value)}%` }}
            />

            {shown !== null ? (
              <>
                <span aria-hidden="true" className="absolute inset-y-0 w-px bg-fg/20" style={{ left: `${x(shown)}%` }} />
                <span
                  aria-hidden="true"
                  className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600 ring-2 ring-surface"
                  style={{ left: `${x(shown)}%`, top: `${y(points[shown].value)}%` }}
                />
                <div
                  role="status"
                  className={cn(
                    "pointer-events-none absolute z-10 rounded-lg border border-border bg-surface px-2.5 py-1.5 whitespace-nowrap shadow-popover",
                    isSpark ? "-top-9" : "top-0",
                  )}
                  style={{
                    left: `${x(shown)}%`,
                    transform: `translateX(${shown > last * 0.6 ? "calc(-100% - 10px)" : "10px"})`,
                  }}
                >
                  <p className="text-sm font-semibold text-fg">{formatNumber(points[shown].value)}</p>
                  <p className="flex items-center gap-1.5 text-[11px] text-fg-subtle">
                    <span aria-hidden="true" className="h-0.5 w-3 rounded-full bg-brand-600" />
                    {valueLabel} · {points[shown].label}
                  </p>
                </div>
              </>
            ) : null}
          </div>

          {!isSpark ? (
            <div className="relative mt-2 h-4 text-[11px] text-fg-subtle" aria-hidden="true">
              {points.map((point, i) => {
                // About eight labels, always including the latest; alternate ones drop on small screens.
                const stride = Math.max(1, Math.ceil(points.length / 8));
                const shown = i === last || (i % stride === 0 && last - i >= stride / 2);
                if (!shown) return null;
                return (
                  <span
                    key={`${point.label}-${i}`}
                    className={cn("absolute -translate-x-1/2 whitespace-nowrap", (i / stride) % 2 === 1 && i !== last && "hidden sm:block")}
                    style={{ left: `${x(i)}%` }}
                  >
                    {point.label}
                  </span>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
      <ChartDataTable caption={label} columns={["Period", valueLabel]} rows={points} />
    </figure>
  );
}
