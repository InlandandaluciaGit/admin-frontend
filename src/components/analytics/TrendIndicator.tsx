import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

const pct = new Intl.NumberFormat("en-GB", { style: "percent", maximumFractionDigits: 1, signDisplay: "exceptZero" });
const int = new Intl.NumberFormat("en-GB");

interface TrendIndicatorProps {
  current: number;
  previous: number;
  /** e.g. "vs 1 Oct – 30 Oct 2026". */
  comparisonLabel: string;
  className?: string;
}

/**
 * Change against the previous period. Neutral ink with an arrow: a change is
 * information, not automatically good or bad.
 */
export function TrendIndicator({ current, previous, comparisonLabel, className }: TrendIndicatorProps) {
  const diff = current - previous;
  const icon = diff > 0 ? "trendUp" : diff < 0 ? "trendDown" : null;
  const text =
    previous === 0
      ? diff === 0
        ? "No change"
        : `${diff > 0 ? "+" : ""}${int.format(diff)} (none before)`
      : `${pct.format(diff / previous)}`;

  return (
    <p className={cn("flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-fg-muted", className)}>
      {icon ? <Icon name={icon} size={14} className="text-fg-subtle" /> : null}
      <span className="font-medium text-fg">{text}</span>
      <span>
        vs {int.format(previous)} {comparisonLabel}
      </span>
    </p>
  );
}
