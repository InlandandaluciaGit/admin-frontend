import type { CategoryValue } from "@/types/dashboard";
import { formatNumber } from "@/utils/format";
import { ChartDataTable } from "./ChartDataTable";

interface RankedBarsProps {
  items: CategoryValue[];
  label: string;
  valueLabel: string;
}

/** Horizontal bars, single series, sorted largest first; value at each tip. */
export function RankedBars({ items, label, valueLabel }: RankedBarsProps) {
  const sorted = [...items].sort((a, b) => b.value - a.value);
  const max = sorted[0]?.value || 1;

  return (
    <figure>
      <ul className="flex flex-col gap-3" aria-label={label}>
        {sorted.map((item) => (
          <li key={item.id} className="group grid grid-cols-[minmax(7rem,9rem)_1fr] items-center gap-3 text-sm">
            <span className="truncate text-fg-muted group-hover:text-fg">{item.label}</span>
            <span className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-2.5 rounded-r-[4px] bg-chart-1 transition-opacity group-hover:opacity-80"
                style={{ width: `${(item.value / max) * 82}%` }}
              />
              <span className="text-xs font-semibold text-fg tabular-nums">{formatNumber(item.value)}</span>
            </span>
          </li>
        ))}
      </ul>
      <ChartDataTable caption={label} columns={["Category", valueLabel]} rows={sorted} />
    </figure>
  );
}
