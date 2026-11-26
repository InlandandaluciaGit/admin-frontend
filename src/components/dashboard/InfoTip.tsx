"use client";

import { useCallback, useId, useRef, useState } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { cn } from "@/lib/cn";
import type { MetricDefinition } from "@/types/analytics";

interface InfoTipProps {
  label: string;
  definition?: MetricDefinition;
  extraNote?: string;
  tone?: "light" | "dark";
  align?: "left" | "right";
}

/**
 * Compact `(i)` trigger that opens a lightweight popover with metric provenance
 * and limitations, keeping dashboard cards visually clean while preserving definitions.
 */
export function InfoTip({ label, definition, extraNote, tone = "dark", align = "left" }: InfoTipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const close = useCallback(() => setOpen(false), []);

  useClickOutside(ref, close, open);
  useEscapeKey(close, open);

  if (!definition && !extraNote) return null;

  return (
    <div ref={ref} className="relative inline-flex shrink-0">
      <button
        type="button"
        aria-label={`About ${label}`}
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex size-5 items-center justify-center rounded-full transition-colors",
          tone === "light"
            ? "text-white/75 hover:bg-white/15 hover:text-white"
            : "text-fg-subtle hover:bg-surface-muted hover:text-fg",
        )}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
      </button>

      {open ? (
        <div
          id={id}
          role="dialog"
          aria-label={`${label} details`}
          className={cn(
            "absolute top-full z-50 mt-2 w-64 max-w-[calc(100vw-2.5rem)] rounded-xl border border-border bg-surface p-3.5 text-left text-xs text-fg-muted shadow-popover sm:w-72",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          <p className="font-semibold text-fg">{definition?.label ?? label}</p>
          {definition ? (
            <dl className="mt-2 space-y-1.5 leading-relaxed">
              <div>
                <dt className="inline font-medium text-fg">Source: </dt>
                <dd className="inline">{definition.source}</dd>
              </div>
              <div>
                <dt className="inline font-medium text-fg">Calculation: </dt>
                <dd className="inline">{definition.calculation}</dd>
              </div>
              {definition.limitations ? (
                <div>
                  <dt className="inline font-medium text-fg">Note: </dt>
                  <dd className="inline">{definition.limitations}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}
          {extraNote ? <p className={cn("leading-relaxed", definition && "mt-2 border-t border-border pt-2")}>{extraNote}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
