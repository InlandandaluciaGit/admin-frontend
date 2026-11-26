"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

const fullFmt = new Intl.NumberFormat("en-GB");
const share = (value: number, total: number) => `${total > 0 ? ((value / total) * 100).toFixed(1) : "0.0"}%`;

export interface DonutSlice {
  id: string;
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  slices: DonutSlice[];
  /** Word under the centre total, e.g. "Sales". */
  centerLabel: string;
  /** Accessible name for the chart and its legend. */
  label: string;
  className?: string;
}

/**
 * Donut with a hover-linked legend (count and share per slice), in the main
 * dashboard's style. Slices with a zero value are skipped by the caller.
 */
export function DonutChart({ slices, centerLabel, label, className }: DonutChartProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const active = slices.find((s) => s.id === hovered) ?? null;

  const radius = 62;
  const stroke = 22;
  const circumference = 2 * Math.PI * radius;
  const gap = slices.length > 1 ? 3 : 0;
  const lengthOf = (value: number) => (total > 0 ? (value / total) * circumference : 0);
  const segments = slices.map((slice, i) => ({
    slice,
    draw: Math.max(0, lengthOf(slice.value) - gap),
    offset: -slices.slice(0, i).reduce((sum, s) => sum + lengthOf(s.value), 0),
  }));

  return (
    <div className={cn("flex flex-1 flex-col items-center gap-5 sm:flex-row xl:flex-col 2xl:flex-row", className)}>
      <div className="relative size-40 shrink-0">
        <svg viewBox="0 0 180 180" className="size-full -rotate-90" role="img" aria-label={`${label}, ${fullFmt.format(total)} ${centerLabel.toLowerCase()}`}>
          <circle cx="90" cy="90" r={radius} fill="none" stroke="var(--color-surface-muted)" strokeWidth={stroke} />
          {segments.map(({ slice, draw, offset }) => (
            <circle
              key={slice.id}
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              stroke={slice.color}
              strokeWidth={hovered === slice.id ? stroke + 4 : stroke}
              strokeDasharray={`${draw} ${circumference}`}
              strokeDashoffset={offset}
              onMouseEnter={() => setHovered(slice.id)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer transition-all duration-150"
              style={{ opacity: hovered && hovered !== slice.id ? 0.45 : 1 }}
            />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
          {active ? (
            <>
              <span className="text-xl font-bold text-fg tabular-nums">{fullFmt.format(active.value)}</span>
              <span className="max-w-[92px] truncate text-[11px] font-medium text-fg-muted">{active.label}</span>
              <span className="text-[11px] font-semibold text-brand-600 tabular-nums">{share(active.value, total)}</span>
            </>
          ) : (
            <>
              <span className="text-2xl font-bold text-fg tabular-nums">{fullFmt.format(total)}</span>
              <span className="text-xs font-medium text-fg-muted">{centerLabel}</span>
            </>
          )}
        </div>
      </div>

      <ul className="w-full min-w-0 flex-1 space-y-1.5" aria-label={`${label} breakdown`}>
        {slices.map((slice) => (
          <li
            key={slice.id}
            onMouseEnter={() => setHovered(slice.id)}
            onMouseLeave={() => setHovered(null)}
            className={cn("flex items-center justify-between gap-2 rounded-lg px-2 py-1", hovered === slice.id && "bg-surface-muted/80")}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} aria-hidden="true" />
              <span className="truncate text-[13px] font-medium text-fg" title={slice.label}>
                {slice.label}
              </span>
            </span>
            <span className="flex shrink-0 items-baseline gap-3 tabular-nums">
              <span className="text-xs text-fg-muted">{share(slice.value, total)}</span>
              <span className="min-w-8 text-right text-[13px] font-semibold text-fg">{fullFmt.format(slice.value)}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
