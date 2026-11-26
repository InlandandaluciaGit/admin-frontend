"use client";

import { useCallback, useId, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { GlobalLoader } from "@/components/ui/GlobalLoader";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { cn } from "@/lib/cn";
import type { RangeKey, RangeSelection, ResolvedRange } from "@/types/analytics";

const PRESETS: { key: Exclude<RangeKey, "custom">; label: string }[] = [
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "90d", label: "Last 90 days" },
  { key: "this_year", label: "This year" },
  { key: "last_year", label: "Last year" },
];

const LABELS: Record<RangeKey, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  this_year: "This year",
  last_year: "Last year",
  custom: "Custom date range",
};

interface DashboardDateDropdownProps {
  selection: RangeSelection;
  onChange: (next: RangeSelection) => void;
  resolved?: ResolvedRange;
  busy?: boolean;
}

function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function formatIsoDay(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

/**
 * Compact date-range selector for `/dashboard`. Preserves URL query params
 * (`useDateRange`) and previous-period comparison calculations.
 */
export function DashboardDateDropdown({ selection, onChange, resolved, busy }: DashboardDateDropdownProps) {
  const [open, setOpen] = useState(false);
  const [customExpanded, setCustomExpanded] = useState(selection.range === "custom");
  const [from, setFrom] = useState(selection.from ?? resolved?.from ?? "");
  const [to, setTo] = useState(selection.to ?? resolved?.to ?? "");
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const close = useCallback(() => setOpen(false), []);
  const closeAndRefocus = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useClickOutside(containerRef, close, open);
  useEscapeKey(closeAndRefocus, open);

  const activeTitle =
    selection.range === "custom" ? "Custom date range" : (resolved?.label ?? LABELS[selection.range]);

  const dateSpan = resolved ? `${formatIsoDay(resolved.from)} – ${formatIsoDay(resolved.to)}` : "Loading period…";

  const selectPreset = (key: Exclude<RangeKey, "custom">) => {
    setCustomExpanded(false);
    setError(null);
    setOpen(false);
    onChange({ range: key });
  };

  const applyCustom = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!from || !to) {
      setError("Choose both start and end dates.");
      return;
    }
    if (from < "2000-01-01") {
      setError("Start date cannot be before 2000-01-01.");
      return;
    }
    if (from > to) {
      setError("Start date must be on or before end date.");
      return;
    }
    if (to > todayIso()) {
      setError("End date cannot be in the future.");
      return;
    }
    setError(null);
    setOpen(false);
    onChange({ range: "custom", from, to });
  };

  return (
    <div ref={containerRef} className="relative self-start sm:self-auto">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => {
          if (!open) {
            setCustomExpanded(selection.range === "custom");
            setFrom((prev) => prev || selection.from || resolved?.from || "");
            setTo((prev) => prev || selection.to || resolved?.to || "");
            setError(null);
          }
          setOpen((v) => !v);
        }}
        className={cn(
          "flex min-w-[235px] items-center gap-3 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-left shadow-card transition-colors",
          "hover:border-border-strong focus-visible:outline-2 focus-visible:outline-brand-600",
          open && "border-brand-400 ring-2 ring-brand-100",
        )}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600" aria-hidden="true">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2" />
          </svg>
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-xs font-semibold text-fg">
            <span className="truncate">{activeTitle}</span>
            {busy ? (
              <GlobalLoader variant="inline" label="Updating" className="[&_svg]:size-3" />
            ) : null}
          </span>
          <span className="mt-0.5 block truncate text-[11px] text-fg-muted">{dateSpan}</span>
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={cn("shrink-0 text-fg-subtle transition-transform duration-150", open && "rotate-180")}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Select date range"
          className="absolute left-0 z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-surface p-2 shadow-popover sm:right-0 sm:left-auto sm:w-80"
        >
          <div className="space-y-0.5" role="listbox" aria-label="Preset date ranges">
            {PRESETS.map((preset) => {
              const selected = selection.range === preset.key && !customExpanded;
              return (
                <button
                  key={preset.key}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => selectPreset(preset.key)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                    selected ? "bg-brand-50 font-semibold text-brand-700" : "text-fg hover:bg-surface-muted",
                  )}
                >
                  <span>{preset.label}</span>
                  {selected ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  ) : null}
                </button>
              );
            })}

            <button
              type="button"
              role="option"
              aria-selected={selection.range === "custom" || customExpanded}
              onClick={() => setCustomExpanded((v) => !v)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                selection.range === "custom" || customExpanded
                  ? "bg-brand-50 font-semibold text-brand-700"
                  : "text-fg hover:bg-surface-muted",
              )}
            >
              <span>Custom date range</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className={cn("transition-transform", customExpanded && "rotate-180")}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          </div>

          {customExpanded ? (
            <form onSubmit={applyCustom} className="mt-2 space-y-2.5 border-t border-border px-2 pt-3 pb-1" noValidate>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1 text-[11px] font-medium text-fg-muted">
                  From
                  <input
                    type="date"
                    value={from}
                    min="2000-01-01"
                    max={todayIso()}
                    onChange={(e) => setFrom(e.target.value)}
                    className="h-9 w-full rounded-lg border border-border-strong bg-surface px-2 text-xs text-fg"
                  />
                </label>
                <label className="flex flex-col gap-1 text-[11px] font-medium text-fg-muted">
                  To
                  <input
                    type="date"
                    value={to}
                    min="2000-01-01"
                    max={todayIso()}
                    onChange={(e) => setTo(e.target.value)}
                    className="h-9 w-full rounded-lg border border-border-strong bg-surface px-2 text-xs text-fg"
                  />
                </label>
              </div>
              {error ? (
                <p role="alert" className="text-xs text-danger-700">
                  {error}
                </p>
              ) : null}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={close}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Apply range
                </Button>
              </div>
            </form>
          ) : null}

          {resolved ? (
            <p className="mt-2 border-t border-border px-3 pt-2 pb-1 text-[11px] text-fg-subtle">
              Compared with {resolved.previous.label}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
