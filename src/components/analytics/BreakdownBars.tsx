import { RankedBars } from "@/components/charts";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Breakdown } from "@/types/analytics";

interface BreakdownBarsProps {
  items: Breakdown[];
  label: string;
  valueLabel: string;
  /** Show the largest N; the rest fold into one "Other" bar (still counted). */
  limit?: number;
  emptyText?: string;
}

/** Part-to-whole as ranked bars on one baseline (reads more exactly than a donut). */
export function BreakdownBars({ items, label, valueLabel, limit = 10, emptyText = "Nothing recorded for this period." }: BreakdownBarsProps) {
  const visible = items.filter((item) => item.value > 0);
  if (visible.length === 0) return <EmptyState title="No data" description={emptyText} className="py-6" />;

  const sorted = [...visible].sort((a, b) => b.value - a.value);
  const head = sorted.slice(0, limit);
  const tail = sorted.slice(limit);
  const shown = tail.length
    ? [...head, { id: "__other", label: `Other (${tail.length})`, value: tail.reduce((sum, item) => sum + item.value, 0) }]
    : head;

  return <RankedBars items={shown} label={label} valueLabel={valueLabel} />;
}
