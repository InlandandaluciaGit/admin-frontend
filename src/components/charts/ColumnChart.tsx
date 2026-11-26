import type { CategoryValue } from "@/types/dashboard";
import { formatNumber } from "@/utils/format";
import { ChartDataTable } from "./ChartDataTable";

interface ColumnChartProps {
  items: CategoryValue[];
  label: string;
  valueLabel: string;
  height?: number;
}

/** Vertical columns in their natural (ordinal) order; single series; value on each cap. */
export function ColumnChart({ items, label, valueLabel, height = 132 }: ColumnChartProps) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <figure>
      <div className="flex items-end justify-between gap-2 border-b border-chart-grid" style={{ height }} aria-hidden="true">
        {items.map((item) => (
          <div key={item.id} className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <span className="text-xs font-semibold text-fg tabular-nums">{formatNumber(item.value)}</span>
            <span
              className="w-full max-w-6 rounded-t-[4px] bg-chart-1 transition-opacity group-hover:opacity-80"
              style={{ height: `${(item.value / max) * 78}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between gap-2 text-[11px] text-fg-subtle" aria-hidden="true">
        {items.map((item) => (
          <span key={item.id} className="flex-1 text-center whitespace-nowrap">
            {item.label}
          </span>
        ))}
      </div>
      <ChartDataTable caption={label} columns={["Band", valueLabel]} rows={items} />
    </figure>
  );
}
