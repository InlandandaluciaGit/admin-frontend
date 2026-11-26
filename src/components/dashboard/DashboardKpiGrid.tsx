"use client";

import type { ReactNode } from "react";
import { GlobalLoader } from "@/components/ui/GlobalLoader";
import { cn } from "@/lib/cn";
import type { Kpi, OverviewData, ResolvedRange, SeriesPoint } from "@/types/analytics";

const intFmt = new Intl.NumberFormat("en-GB");
const pctFmt = new Intl.NumberFormat("en-GB", { style: "percent", maximumFractionDigits: 1, signDisplay: "exceptZero" });

export type CardTheme = "purple" | "blue" | "green";

interface ThemeConfig {
  card: string;
  iconBox: string;
  title: string;
  value: string;
  deltaBg: string;
  deltaPos: string;
  deltaNeg: string;
  deltaNeutral: string;
  muted: string;
  sparkStroke: string;
  sparkFillTop: string;
  sparkFillBottom: string;
}

const THEMES: Record<CardTheme, ThemeConfig> = {
  purple: {
    card: "bg-gradient-to-br from-[#634de8] via-[#7b67f1] to-[#9882f9] text-white shadow-[0_8px_24px_-6px_rgba(99,77,232,0.4)]",
    iconBox: "bg-white/18 text-white ring-1 ring-white/25",
    title: "text-white/90",
    value: "text-white",
    deltaBg: "bg-black/15 text-white",
    deltaPos: "text-[#bbf7d0]",
    deltaNeg: "text-[#fecdd3]",
    deltaNeutral: "text-white/90",
    muted: "text-white/80",
    sparkStroke: "rgba(255,255,255,0.92)",
    sparkFillTop: "rgba(255,255,255,0.34)",
    sparkFillBottom: "rgba(255,255,255,0.02)",
  },
  blue: {
    card: "bg-gradient-to-br from-[#2d91eb] via-[#46a8f5] to-[#74c6fc] text-white shadow-[0_8px_24px_-6px_rgba(45,145,235,0.38)]",
    iconBox: "bg-white/20 text-white ring-1 ring-white/25",
    title: "text-white/95",
    value: "text-white",
    deltaBg: "bg-black/14 text-white",
    deltaPos: "text-[#bbf7d0]",
    deltaNeg: "text-[#fecdd3]",
    deltaNeutral: "text-white/90",
    muted: "text-white/85",
    sparkStroke: "rgba(255,255,255,0.94)",
    sparkFillTop: "rgba(255,255,255,0.36)",
    sparkFillBottom: "rgba(255,255,255,0.02)",
  },
  green: {
    card: "bg-gradient-to-br from-[#69da92] via-[#84e4a5] to-[#a7f0be] text-[#0f291c] shadow-[0_8px_24px_-6px_rgba(47,168,102,0.28)]",
    iconBox: "bg-[#12472b]/12 text-[#114228] ring-1 ring-[#12472b]/12",
    title: "text-[#143524]/85",
    value: "text-[#0b2317]",
    deltaBg: "bg-white/55 text-[#0f291c]",
    deltaPos: "text-[#15623a]",
    deltaNeg: "text-[#a51d24]",
    deltaNeutral: "text-[#143524]/80",
    muted: "text-[#143524]/75",
    sparkStroke: "rgba(255,255,255,0.9)",
    sparkFillTop: "rgba(255,255,255,0.45)",
    sparkFillBottom: "rgba(255,255,255,0.04)",
  },
};

function buildSparkPath(points: SeriesPoint[]): { line: string; area: string } {
  const n = points.length;
  const values = points.map((p) => p.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min;
  const lo = span === 0 ? 0 : Math.max(0, min - span * 0.15);
  const hi = span === 0 ? (max === 0 ? 1 : max * 1.4) : max + span * 0.12;

  const coords = points.map((p, i) => ({
    x: n === 1 ? 50 : (i / (n - 1)) * 100,
    y: span === 0 && max === 0 ? 42 : 44 - ((p.value - lo) / (hi - lo || 1)) * 36,
  }));

  if (coords.length === 1) {
    return {
      line: `M0,${coords[0].y} L100,${coords[0].y}`,
      area: `M0,${coords[0].y} L100,${coords[0].y} L100,48 L0,48 Z`,
    };
  }

  let line = `M${coords[0].x.toFixed(2)},${coords[0].y.toFixed(2)}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i === 0 ? i : i - 1];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[i + 2 < coords.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = Math.min(46, Math.max(4, p1.y + (p2.y - p0.y) / 6));
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = Math.min(46, Math.max(4, p2.y - (p3.y - p1.y) / 6));

    line += ` C${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }

  const last = coords[coords.length - 1];
  const area = `${line} L${last.x.toFixed(2)},48 L${coords[0].x.toFixed(2)},48 Z`;
  return { line, area };
}

function Sparkline({ points, theme, id }: { points: SeriesPoint[]; theme: ThemeConfig; id: string }) {
  if (points.length < 2) return null;
  const { line, area } = buildSparkPath(points);
  const gradId = `spark-${id}`;

  return (
    <svg viewBox="0 0 100 48" preserveAspectRatio="none" className="h-11 w-24 shrink-0 overflow-visible sm:w-28" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.sparkFillTop} />
          <stop offset="100%" stopColor={theme.sparkFillBottom} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={line} fill="none" stroke={theme.sparkStroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function comparisonShortLabel(range: ResolvedRange): string {
  if (range.key === "7d") return "vs previous 7 days";
  if (range.key === "30d") return "vs previous 30 days";
  if (range.key === "90d") return "vs previous 90 days";
  return `vs ${range.previous.label}`;
}

export interface SingleKpiCardProps {
  id: string;
  title: string;
  kpi: Kpi | undefined;
  range: ResolvedRange;
  theme: CardTheme;
  icon: ReactNode;
  trend?: SeriesPoint[];
  extraNote?: string;
  badge?: string;
  /** Replaces the "Selected period" line when the figure has no previous-period comparison. */
  footer?: ReactNode;
  /** The figure is still being fetched: show the shared loader instead of "Unavailable". */
  loading?: boolean;
}

export function DashboardKpiCard({ id, title, kpi, range, theme: themeName, icon, trend, extraNote, badge, footer, loading = false }: SingleKpiCardProps) {
  const t = THEMES[themeName];
  const unavailable = !loading && (!kpi || kpi.value === null);
  const current = kpi?.value ?? 0;
  const previous = kpi?.previous;

  let deltaText: string | null = null;
  let direction: "up" | "down" | "flat" = "flat";

  if (!unavailable && typeof previous === "number") {
    const diff = current - previous;
    direction = diff > 0 ? "up" : diff < 0 ? "down" : "flat";
    if (previous === 0) {
      deltaText = diff === 0 ? "0% (no change)" : `${diff > 0 ? "+" : ""}${intFmt.format(diff)} (none before)`;
    } else {
      deltaText = pctFmt.format(diff / previous);
    }
  }

  return (
    <div className={cn("relative flex h-full min-h-[136px] flex-col justify-between overflow-hidden rounded-2xl p-5", t.card)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3.5">
          <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", t.iconBox)} aria-hidden="true">
            {icon}
          </span>
          <div className="min-w-0">
            <p className={cn("flex min-w-0 items-center gap-1.5 text-[13px] font-medium", t.title)}>
              <span className="truncate">{title}</span>
              {badge ? (
                <span title={extraNote} className={cn("shrink-0 rounded-full px-1.5 py-px text-[10px] font-semibold tracking-wide uppercase", t.deltaBg)}>
                  {badge}
                </span>
              ) : null}
            </p>
            {loading ? (
              <p className={cn("mt-1.5 flex h-7 items-center", t.value)}>
                <GlobalLoader variant="inline" tone="current" />
              </p>
            ) : unavailable ? (
              <p className={cn("mt-0.5 text-xl font-bold tracking-tight sm:text-2xl", t.value)}>Unavailable</p>
            ) : (
              <p className={cn("mt-0.5 text-3xl font-bold tracking-tight tabular-nums", t.value)}>{intFmt.format(current)}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between gap-2">
        <div className="min-w-0 flex-1">
          {loading ? null : unavailable ? (
            <p className={cn("line-clamp-2 text-xs leading-snug", t.muted)}>
              {kpi?.unavailableReason ?? "Not connected to this system yet."}
            </p>
          ) : deltaText !== null ? (
            <p className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className={cn("inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-semibold tabular-nums", t.deltaBg)}>
                {direction === "up" ? (
                  <span className={t.deltaPos} aria-hidden="true">
                    ↑
                  </span>
                ) : direction === "down" ? (
                  <span className={t.deltaNeg} aria-hidden="true">
                    ↓
                  </span>
                ) : null}
                <span className={direction === "up" ? t.deltaPos : direction === "down" ? t.deltaNeg : t.deltaNeutral}>{deltaText}</span>
              </span>
              <span className={cn("truncate text-[11px]", t.muted)}>{comparisonShortLabel(range)}</span>
            </p>
          ) : (
            <p className={cn("text-xs", t.muted)}>{footer ?? "Selected period"}</p>
          )}
        </div>

        {!loading && !unavailable && trend && trend.length > 1 ? <Sparkline points={trend} theme={t} id={id} /> : null}
      </div>
    </div>
  );
}

interface DashboardKpiGridProps {
  data: OverviewData;
  range: ResolvedRange;
}

export function DashboardKpiGrid({ data, range }: DashboardKpiGridProps) {
  const kpi = (id: string) => data.kpis.find((item) => item.id === id);

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Headline figures">
      <li>
        <DashboardKpiCard
          id="enquiries"
          title="Total Enquiries"
          kpi={kpi("routedEnquiries")}
          range={range}
          theme="purple"
          trend={data.enquiryTrend}
          icon={
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          }
        />
      </li>
      <li>
        <DashboardKpiCard
          id="tours"
          title="Property Viewing Tours"
          kpi={kpi("tours")}
          range={range}
          theme="blue"
          trend={data.toursTrend}
          icon={
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2" />
            </svg>
          }
        />
      </li>
      <li className="sm:col-span-2 lg:col-span-1">
        <DashboardKpiCard
          id="sales"
          title="Properties Sold"
          kpi={kpi("inferredSales")}
          range={range}
          theme="green"
          trend={data.salesTrend}
          badge="Inferred"
          extraNote="Dated from the “Sold” history entry, not a verified completion date."
          icon={
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2l-2 2m-7.6 7.6a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
            </svg>
          }
        />
      </li>
    </ul>
  );
}
