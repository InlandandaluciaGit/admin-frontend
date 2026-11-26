import type { CategoryValue } from "@/types/dashboard";
import { formatNumber, formatPercent } from "@/utils/format";
import { ChartDataTable } from "./ChartDataTable";

/** Categorical slots in validated order, with the text ink that reads on each fill. */
const SLOTS = [
  { fill: "bg-chart-1", ink: "text-white" },
  { fill: "bg-chart-2", ink: "text-fg" },
  { fill: "bg-chart-3", ink: "text-fg" },
] as const;

// Share below which a block is too narrow for its label.
const MIN_LABEL_SHARE = 0.09;

interface SegmentedBarProps {
  parts: CategoryValue[];
  label: string;
  /** Header names for the screen-reader table. */
  columns?: [string, string];
}

/**
 * Tall segmented bar: one whole split into ≤ 3 parts. Shares print inside
 * blocks that fit; the legend carries names and counts.
 */
export function SegmentedBar({ parts, label, columns = ["Category", "Count"] }: SegmentedBarProps) {
  const total = parts.reduce((sum, part) => sum + part.value, 0) || 1;
  const visible = parts.filter((part) => part.value > 0).slice(0, SLOTS.length);

  return (
    <figure>
      <div className="flex h-7 gap-0.5" role="img" aria-label={`${label}: ${visible.map((p) => `${p.label} ${formatNumber(p.value)} (${formatPercent(p.value / total)})`).join(", ")}`}>
        {visible.map((part, index) => {
          const share = part.value / total;
          const slot = SLOTS[index];
          return (
            <div
              key={part.id}
              title={`${part.label}: ${formatNumber(part.value)} (${formatPercent(share)})`}
              className={`flex items-center rounded-[4px] px-2 text-xs font-semibold transition-opacity hover:opacity-90 ${slot.fill} ${slot.ink}`}
              style={{ flexGrow: part.value, flexBasis: 0 }}
            >
              {share >= MIN_LABEL_SHARE ? formatPercent(share) : null}
            </div>
          );
        })}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
        {visible.map((part, index) => (
          <li key={part.id} className="flex items-center gap-2">
            <span aria-hidden="true" className={`size-2.5 rounded-[3px] ${SLOTS[index].fill}`} />
            <span className="text-fg-muted">{part.label}</span>
            <span className="font-semibold text-fg tabular-nums">{formatNumber(part.value)}</span>
          </li>
        ))}
      </ul>
      <ChartDataTable caption={label} columns={columns} rows={visible} />
    </figure>
  );
}
