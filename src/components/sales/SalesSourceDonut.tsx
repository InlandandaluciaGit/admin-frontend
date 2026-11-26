"use client";

import { useState } from "react";
import { DonutChart, type DonutSlice } from "@/components/charts/DonutChart";
import { cn } from "@/lib/cn";
import type { SourceRow } from "./attributionSources";


export type TouchModel = "first" | "last";

const MODEL_LABEL: Record<TouchModel, string> = { first: "First touch", last: "Last touch" };


/** Keeps at most six slices; the rest fold into "Other sources" so the donut stays readable. */
function toSlices(rows: SourceRow[], model: TouchModel): DonutSlice[] {
  const active = rows.filter((row) => row[model] > 0);
  if (active.length <= 6) return active.map((row) => ({ id: row.id, label: row.label, value: row[model], color: row.color }));
  const keep = active.slice(0, 5);
  const rest = active.slice(5);
  return [
    ...keep.map((row) => ({ id: row.id, label: row.label, value: row[model], color: row.color })),
    { id: "__other", label: "Other sources", value: rest.reduce((sum, row) => sum + row[model], 0), color: "#94a3b8" },
  ];
}

interface SalesSourceDonutProps {
  rows: SourceRow[];
  /** Buyer-linked sales in the period; each model sums to this. */
  sales: number;
}

/** Sales by lead source as a donut, switchable between the first- and last-touch models. */
export function SalesSourceDonut({ rows, sales }: SalesSourceDonutProps) {
  const [model, setModel] = useState<TouchModel>("first");

  const slices = toSlices(rows, model);

  return (
    <div className="flex flex-1 flex-col">
      <div role="radiogroup" aria-label="Attribution model" className="inline-flex self-start rounded-lg bg-surface-muted p-0.5 text-xs font-medium">
        {(["first", "last"] as const).map((key) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={model === key}
            onClick={() => setModel(key)}
            className={cn(
              "rounded-md px-3 py-1.5 transition-colors",
              model === key ? "bg-surface text-brand-700 shadow-card" : "text-fg-muted hover:text-fg",
            )}
          >
            {MODEL_LABEL[key]}
          </button>
        ))}
      </div>

      {sales === 0 ? (
        <p className="flex flex-1 items-center justify-center py-12 text-sm text-fg-muted">No buyer-linked sales in this period.</p>
      ) : (
        <DonutChart slices={slices} centerLabel="Sales" label={`${MODEL_LABEL[model]} sales by lead source`} className="mt-5" />
      )}
    </div>
  );
}
