import type { Attribution } from "@/types/analytics";

/** The attribution API's id for sales whose buyer had no routed enquiry before the sale. */
export const NO_TOUCH_ID = "none";

const PALETTE = ["#5b42f3", "#2b92f0", "#10b981", "#f59e0b", "#ec4899", "#14b8a6"] as const;
const NO_TOUCH_COLOR = "#c4c9d6";
const EXTRA_COLOR = "#94a3b8";

export interface SourceRow {
  id: string;
  label: string;
  first: number;
  last: number;
  color: string;
}

/**
 * Merges the first- and last-touch breakdowns into one row per source (keyed by
 * the API's source id) with a stable colour, so the donut and the comparison
 * table use the same colour for the same source. Counts are passed through
 * unchanged: each model still sums to `attribution.sales`.
 *
 * The buyer's stored source (BUYER.Buyer_Source_ID) is deliberately not merged
 * here: it is a different measure, and its "none" id means "no source recorded".
 */
export function attributionRows(attribution: Attribution): SourceRow[] {
  const rows = new Map<string, SourceRow>();
  const add = (items: Attribution["firstTouch"], key: "first" | "last") => {
    for (const item of items) {
      const row = rows.get(item.id) ?? { id: item.id, label: item.label, first: 0, last: 0, color: EXTRA_COLOR };
      row[key] += item.value;
      rows.set(item.id, row);
    }
  };
  add(attribution.firstTouch, "first");
  add(attribution.lastTouch, "last");

  const touched = [...rows.values()].sort((a, b) => {
    if (a.id === NO_TOUCH_ID) return 1;
    if (b.id === NO_TOUCH_ID) return -1;
    return b.first + b.last - (a.first + a.last) || a.label.localeCompare(b.label);
  });
  let colourIndex = 0;
  for (const row of touched) {
    row.color = row.id === NO_TOUCH_ID ? NO_TOUCH_COLOR : (PALETTE[colourIndex++] ?? EXTRA_COLOR);
  }

  return touched;
}
