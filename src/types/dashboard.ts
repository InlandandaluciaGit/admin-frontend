export interface SeriesPoint {
  label: string;
  value: number;
}

/** Used by the reusable chart and status components. */
export type Tone = "brand" | "accent" | "success" | "warning" | "danger" | "neutral";

export interface CategoryValue {
  id: string;
  label: string;
  value: number;
}
