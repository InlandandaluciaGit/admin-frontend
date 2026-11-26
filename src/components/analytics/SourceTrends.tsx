import { TrendChart } from "@/components/charts";
import type { LeadsData } from "@/types/analytics";

const full = new Intl.NumberFormat("en-GB");

/**
 * One small sparkline per source (small multiples) instead of a many-colour
 * multi-line chart: every row is one series in one colour, so no source
 * depends on telling hues apart.
 */
export function SourceTrends({ trends }: { trends: LeadsData["sourceTrends"] }) {
  return (
    <ul className="divide-y divide-border">
      {trends.map((trend) => (
        <li key={trend.id} className="grid grid-cols-[minmax(8rem,12rem)_4.5rem_1fr] items-center gap-4 py-3">
          <span className="truncate text-sm text-fg-muted" title={trend.label}>
            {trend.label}
          </span>
          <span className="text-right text-sm font-semibold text-fg tabular-nums">{full.format(trend.total)}</span>
          <TrendChart points={trend.points} label={`${trend.label}: routed enquiries per period`} valueLabel="Enquiries" variant="spark" height={36} />
        </li>
      ))}
    </ul>
  );
}
