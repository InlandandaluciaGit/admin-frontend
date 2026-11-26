"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { cn } from "@/lib/cn";
import type { Definitions, ResolvedRange, SeriesPoint } from "@/types/analytics";
import { formatNumber, niceTicks } from "@/utils/format";
import { InfoTip } from "./InfoTip";

interface BusinessPerformanceChartProps {
  enquiryTrend: SeriesPoint[];
  toursTrend: SeriesPoint[];
  salesTrend: SeriesPoint[];
  range: ResolvedRange;
  definitions: Definitions;
}

interface SeriesConfig {
  id: "enquiries" | "tours" | "sales";
  label: string;
  color: string;
  fillTop: string;
  fillBottom: string;
  points: SeriesPoint[];
}

function buildSmoothCurve(coords: { x: number; y: number }[]): { line: string; area: string } {
  if (coords.length === 0) return { line: "", area: "" };
  if (coords.length === 1) {
    return {
      line: `M0,${coords[0].y.toFixed(2)} L100,${coords[0].y.toFixed(2)}`,
      area: `M0,${coords[0].y.toFixed(2)} L100,${coords[0].y.toFixed(2)} L100,100 L0,100 Z`,
    };
  }

  let line = `M${coords[0].x.toFixed(2)},${coords[0].y.toFixed(2)}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i === 0 ? i : i - 1];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[i + 2 < coords.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = Math.min(100, Math.max(0, p1.y + (p2.y - p0.y) / 6));
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = Math.min(100, Math.max(0, p2.y - (p3.y - p1.y) / 6));

    line += ` C${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }

  const last = coords[coords.length - 1];
  const area = `${line} L${last.x.toFixed(2)},100 L${coords[0].x.toFixed(2)},100 Z`;
  return { line, area };
}

/** Tooltip width incl. the 12px gap from the crosshair, used to keep it inside the plot. */
const TOOLTIP_SPACE = 172;

/** Right of the crosshair when it fits, else left; on very narrow plots, slide proportionally so it never overflows. */
function tooltipShift(xPercent: number, width: number): string {
  const left = (xPercent / 100) * width;
  if (width === 0) return xPercent > 62 ? "translateX(calc(-100% - 12px))" : "translateX(12px)";
  if (left + TOOLTIP_SPACE <= width) return "translateX(12px)";
  if (left - TOOLTIP_SPACE >= 0) return "translateX(calc(-100% - 12px))";
  return `translateX(-${xPercent.toFixed(1)}%)`;
}

/**
 * Combined multi-series interactive trend chart for Enquiries, Viewing Tours,
 * and Sales (inferred date) using actual date-bucketed series from the overview API.
 */
export function BusinessPerformanceChart({
  enquiryTrend,
  toursTrend,
  salesTrend,
  range,
  definitions,
}: BusinessPerformanceChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [plotWidth, setPlotWidth] = useState(0);
  const [hidden, setHidden] = useState<Record<SeriesConfig["id"], boolean>>({
    enquiries: false,
    tours: false,
    sales: false,
  });
  const plotRef = useRef<HTMLDivElement>(null);

  const seriesList: SeriesConfig[] = [
    {
      id: "enquiries",
      label: "Enquiries",
      color: "#6c4de6",
      fillTop: "rgba(108, 77, 230, 0.22)",
      fillBottom: "rgba(108, 77, 230, 0.0)",
      points: enquiryTrend,
    },
    {
      id: "tours",
      label: "Viewing Tours",
      color: "#2b92f0",
      fillTop: "rgba(43, 146, 240, 0.16)",
      fillBottom: "rgba(43, 146, 240, 0.0)",
      points: toursTrend,
    },
    {
      id: "sales",
      label: "Sales (inferred)",
      color: "#10b981",
      fillTop: "rgba(16, 185, 129, 0.16)",
      fillBottom: "rgba(16, 185, 129, 0.0)",
      points: salesTrend,
    },
  ];

  const baseSeries = enquiryTrend.length ? enquiryTrend : toursTrend.length ? toursTrend : salesTrend;
  const n = baseSeries.length;
  const last = Math.max(0, n - 1);

  const visibleSeries = seriesList.filter((s) => !hidden[s.id] && s.points.length > 0);
  const allValues = visibleSeries.flatMap((s) => s.points.map((p) => p.value));
  const dataMax = allValues.length ? Math.max(...allValues) : 0;
  const ticks = niceTicks(Math.max(dataMax, 4), 4);
  const hi = ticks[ticks.length - 1] || 1;

  const xPos = (i: number) => (n <= 1 ? 50 : (i / (n - 1)) * 100);
  const yPos = (v: number) => 100 - (v / hi) * 100;

  const toggleSeries = (id: SeriesConfig["id"]) => {
    setHidden((prev) => {
      const visibleCount = Object.values(prev).filter((isHidden) => !isHidden).length;
      if (!prev[id] && visibleCount <= 1) return prev;
      return { ...prev, [id]: !prev[id] };
    });
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (n === 0) return;
    const rect = plotRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    setPlotWidth(rect.width);
    const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    setActiveIndex(Math.round(ratio * last));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (n === 0 || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
    event.preventDefault();
    setActiveIndex((current) => {
      const base = current ?? last;
      return Math.min(Math.max(base + (event.key === "ArrowRight" ? 1 : -1), 0), last);
    });
  };

  const extraNote = `Per ${range.granularity} (${range.label}). Sales dates are inferred from “Sold” history entries.${
    range.key === "last_year" || range.key === "custom" ? "" : ` The latest ${range.granularity} is still in progress.`
  }`;

  return (
    <section
      aria-labelledby="business-performance-title"
      className="flex w-full min-w-0 flex-col rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 id="business-performance-title" className="text-[1rem] font-semibold text-fg">
            Business Performance Trend
          </h2>
          <InfoTip label="Business Performance Trend" definition={definitions.routedEnquiries} extraNote={extraNote} />
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4" role="group" aria-label="Toggle chart series">
          {seriesList.map((s) => {
            const isHidden = hidden[s.id];
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={!isHidden}
                onClick={() => toggleSeries(s.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-1.5 py-0.5 text-xs font-medium transition-opacity",
                  isHidden ? "text-fg-subtle opacity-45" : "text-fg-muted hover:text-fg",
                )}
              >
                <span className="size-2.5 rounded-full" style={{ backgroundColor: s.color }} aria-hidden="true" />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {n === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-fg-muted xl:h-80">
          No trend data recorded for this period.
        </div>
      ) : (
        <figure className="mt-5 flex flex-1 flex-col justify-between">
          <div className="flex gap-3">
            {/* Y-axis ticks */}
            <div className="relative h-64 w-8 shrink-0 xl:h-80 text-right text-[11px] text-fg-subtle tabular-nums" aria-hidden="true">
              {ticks.map((tick) => (
                <span key={tick} className="absolute right-0 -translate-y-1/2" style={{ top: `${yPos(tick)}%` }}>
                  {formatNumber(tick)}
                </span>
              ))}
            </div>

            {/* Plot area */}
            <div className="min-w-0 flex-1">
              <div
                ref={plotRef}
                role="img"
                tabIndex={0}
                aria-label={`Business performance trend per ${range.granularity} for ${range.label}. Use left and right arrow keys to inspect data points.`}
                onPointerMove={onPointerMove}
                onPointerLeave={() => setActiveIndex(null)}
                onFocus={() => {
                  setPlotWidth(plotRef.current?.getBoundingClientRect().width ?? 0);
                  setActiveIndex(last);
                }}
                onBlur={() => setActiveIndex(null)}
                onKeyDown={onKeyDown}
                className="relative h-64 cursor-crosshair xl:h-80 rounded-sm focus-visible:outline-offset-4"
              >
                {/* Horizontal gridlines */}
                {ticks.map((tick) => (
                  <span
                    key={tick}
                    aria-hidden="true"
                    className="absolute inset-x-0 h-px bg-chart-grid"
                    style={{ top: `${yPos(tick)}%` }}
                  />
                ))}

                {/* Smooth SVG paths */}
                <svg className="absolute inset-0 size-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  <defs>
                    {seriesList.map((s) => (
                      <linearGradient key={s.id} id={`perf-grad-${s.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={s.fillTop} />
                        <stop offset="100%" stopColor={s.fillBottom} />
                      </linearGradient>
                    ))}
                  </defs>
                  {[...visibleSeries].reverse().map((s) => {
                    const coords = s.points.map((p, i) => ({ x: xPos(i), y: yPos(p.value) }));
                    if (coords.length === 1) return null;
                    const { line, area } = buildSmoothCurve(coords);
                    return (
                      <g key={s.id}>
                        <path d={area} fill={`url(#perf-grad-${s.id})`} />
                        <path
                          d={line}
                          fill="none"
                          stroke={s.color}
                          strokeWidth={s.id === "enquiries" ? 2.4 : 2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          vectorEffect="non-scaling-stroke"
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Single-bucket fallback markers when range is 1 day */}
                {n === 1
                  ? visibleSeries.map((s) => {
                      const pt = s.points[0];
                      if (!pt) return null;
                      return (
                        <span
                          key={s.id}
                          aria-hidden="true"
                          className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-surface"
                          style={{ left: "50%", top: `${yPos(pt.value)}%`, backgroundColor: s.color }}
                        />
                      );
                    })
                  : null}

                {/* Active crosshair & tooltip */}
                {activeIndex !== null && baseSeries[activeIndex] ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-0 w-px bg-fg/20"
                      style={{ left: `${xPos(activeIndex)}%` }}
                    />
                    {visibleSeries.map((s) => {
                      const pt = s.points[activeIndex];
                      if (!pt) return null;
                      return (
                        <span
                          key={s.id}
                          aria-hidden="true"
                          className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-surface"
                          style={{
                            left: `${xPos(activeIndex)}%`,
                            top: `${yPos(pt.value)}%`,
                            backgroundColor: s.color,
                          }}
                        />
                      );
                    })}
                    <div
                      role="status"
                      className="pointer-events-none absolute top-1 z-20 min-w-[148px] rounded-xl border border-border bg-surface/95 px-3 py-2 shadow-popover backdrop-blur-xs"
                      style={{
                        left: `${xPos(activeIndex)}%`,
                        transform: tooltipShift(xPos(activeIndex), plotWidth),
                      }}
                    >
                      <p className="mb-1.5 text-xs font-semibold text-fg">{baseSeries[activeIndex].label}</p>
                      <ul className="space-y-1 text-xs">
                        {visibleSeries.map((s) => {
                          const val = s.points[activeIndex]?.value ?? 0;
                          return (
                            <li key={s.id} className="flex items-center justify-between gap-4">
                              <span className="flex items-center gap-1.5 text-fg-muted">
                                <span className="size-2 rounded-full" style={{ backgroundColor: s.color }} aria-hidden="true" />
                                {s.label}
                              </span>
                              <span className="font-semibold text-fg tabular-nums">{formatNumber(val)}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </>
                ) : null}
              </div>

              {/* X-axis labels */}
              <div className="relative mt-2.5 h-4 text-[11px] text-fg-subtle" aria-hidden="true">
                {baseSeries.map((point, i) => {
                  const stride = Math.max(1, Math.ceil(n / 7));
                  const show = i === 0 || i === last || (i % stride === 0 && last - i >= Math.ceil(stride * 0.6));
                  if (!show) return null;
                  return (
                    <span
                      key={`${point.key}-${i}`}
                      className={cn(
                        "absolute whitespace-nowrap",
                        i === 0 ? "left-0" : i === last ? "right-0" : "-translate-x-1/2",
                        i !== 0 && i !== last && Math.floor(i / stride) % 2 === 1 && "hidden sm:block",
                      )}
                      style={i === 0 || i === last ? undefined : { left: `${xPos(i)}%` }}
                    >
                      {point.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          <table className="sr-only">
            <caption>Business performance trend ({range.label})</caption>
            <thead>
              <tr>
                <th scope="col">Period</th>
                <th scope="col">Enquiries</th>
                <th scope="col">Viewing Tours</th>
                <th scope="col">Sales (inferred)</th>
              </tr>
            </thead>
            <tbody>
              {baseSeries.map((pt, i) => (
                <tr key={pt.key}>
                  <th scope="row">{pt.label}</th>
                  <td>{enquiryTrend[i]?.value ?? 0}</td>
                  <td>{toursTrend[i]?.value ?? 0}</td>
                  <td>{salesTrend[i]?.value ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </figure>
      )}
    </section>
  );
}
