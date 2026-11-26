const integer = new Intl.NumberFormat("en-GB");
const compact = new Intl.NumberFormat("en-GB", { notation: "compact", maximumFractionDigits: 1 });
const percent = new Intl.NumberFormat("en-GB", { style: "percent", maximumFractionDigits: 0 });

/** 1,248 — full figures below 10,000, compact above (12.9K). */
export function formatNumber(value: number): string {
  return Math.abs(value) < 10_000 ? integer.format(value) : compact.format(value);
}

export function formatPercent(ratio: number): string {
  return percent.format(ratio);
}

/** Rounds a maximum up to a clean axis value with ~`count` ticks. */
export function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0];
  const rough = max / count;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rough) ?? rough;
  const top = Math.ceil(max / step) * step;
  return Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
}

/** Clean ticks spanning [min, max] (not forced to zero) — for line charts only. */
export function niceRange(min: number, max: number, count = 4): number[] {
  const span = max - min || Math.abs(max) || 1;
  const rough = span / count;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rough) ?? rough;
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  return Array.from({ length: Math.round((end - start) / step) + 1 }, (_, i) => start + i * step);
}
