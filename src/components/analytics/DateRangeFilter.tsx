"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { GlobalLoader } from "@/components/ui/GlobalLoader";
import { cn } from "@/lib/cn";
import type { RangeKey, RangeSelection, ResolvedRange } from "@/types/analytics";

const PRESETS: { key: Exclude<RangeKey, "custom">; label: string }[] = [
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
  { key: "this_year", label: "This year" },
  { key: "last_year", label: "Last year" },
];

interface DateRangeFilterProps {
  selection: RangeSelection;
  onChange: (next: RangeSelection) => void;
  resolved?: ResolvedRange;
  busy?: boolean;
}

function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

/**
 * The one filter row for a page: presets first, then a custom range. It
 * scopes every dated figure on the page; current and all-time figures are
 * labelled as unaffected.
 */
export function DateRangeFilter({ selection, onChange, resolved, busy }: DateRangeFilterProps) {
  const [customOpen, setCustomOpen] = useState(selection.range === "custom");
  const [from, setFrom] = useState(selection.from ?? "");
  const [to, setTo] = useState(selection.to ?? "");
  const [error, setError] = useState<string | null>(null);

  const applyCustom = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!from || !to) return setError("Choose both dates.");
    if (from > to) return setError("The start date must be on or before the end date.");
    if (to > todayIso()) return setError("The end date cannot be in the future.");
    setError(null);
    onChange({ range: "custom", from, to });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Date range" className="flex flex-wrap gap-1 rounded-lg border border-border bg-surface p-1">
          {PRESETS.map((preset) => {
            const selected = selection.range === preset.key;
            return (
              <button
                key={preset.key}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  setCustomOpen(false);
                  onChange({ range: preset.key });
                }}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  selected ? "bg-brand-600 text-white" : "text-fg-muted hover:bg-surface-muted hover:text-fg",
                )}
              >
                {preset.label}
              </button>
            );
          })}
          <button
            type="button"
            aria-pressed={selection.range === "custom"}
            aria-expanded={customOpen}
            aria-controls="custom-range"
            onClick={() => setCustomOpen((open) => !open)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              selection.range === "custom" ? "bg-brand-600 text-white" : "text-fg-muted hover:bg-surface-muted hover:text-fg",
            )}
          >
            Custom
          </button>
        </div>
        {resolved ? (
          <p className="text-sm text-fg-muted" aria-live="polite">
            <span className="font-medium text-fg">{resolved.label}</span>
            <span className="hidden sm:inline"> · compared with {resolved.previous.label}</span>
            {busy ? <GlobalLoader variant="inline" label="Updating" className="ml-2 align-[-3px]" /> : null}
          </p>
        ) : null}
      </div>

      {customOpen ? (
        <form id="custom-range" onSubmit={applyCustom} className="flex flex-wrap items-end gap-3" noValidate>
          <label className="flex flex-col gap-1 text-xs font-medium text-fg-muted">
            From
            <input
              type="date"
              value={from}
              max={todayIso()}
              min="2000-01-01"
              onChange={(e) => setFrom(e.target.value)}
              className="h-9 rounded-md border border-border-strong bg-surface px-2 text-sm text-fg"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-fg-muted">
            To
            <input
              type="date"
              value={to}
              max={todayIso()}
              min="2000-01-01"
              onChange={(e) => setTo(e.target.value)}
              className="h-9 rounded-md border border-border-strong bg-surface px-2 text-sm text-fg"
            />
          </label>
          <Button type="submit" size="sm">
            Apply
          </Button>
          {error ? (
            <p role="alert" className="text-sm text-danger-700">
              {error}
            </p>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}
