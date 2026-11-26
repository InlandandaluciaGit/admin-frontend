"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  FILTERS,
  type AuditedFilter,
  type FilterCategory,
  type FilterStatus,
  type Recommendation,
} from "./filterAudit";

export const STATUS_META: Record<FilterStatus, { label: string; className: string; icon: string }> = {
  working: { label: "Working", className: "bg-success-50 text-success-700", icon: "M20 6 9 17l-5-5" },
  partial: { label: "Partially supported", className: "bg-[#eaf4fe] text-[#1d6fc0]", icon: "M5 12h14" },
  unsupported: { label: "Unsupported", className: "bg-danger-50 text-danger-700", icon: "M18 6 6 18M6 6l12 12" },
  review: { label: "Requires review", className: "bg-warning-50 text-warning-700", icon: "M12 8v5M12 16.5v.01" },
};

const RECOMMENDATION_LABEL: Record<Recommendation, string> = {
  retain: "Retain",
  improve: "Improve",
  redundant: "Redundant",
  "remove-or-implement": "Remove or implement",
  review: "Review",
};

const API_LABEL: Record<AuditedFilter["api"], { text: string; tone: string }> = {
  applied: { text: "Applied", tone: "text-success-700" },
  ignored: { text: "Ignored", tone: "text-danger-700" },
  "unused-endpoint": { text: "Endpoint unused", tone: "text-warning-700" },
};

export function StatusPill({ status }: { status: FilterStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap", meta.className)}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={meta.icon} />
      </svg>
      {meta.label}
    </span>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors",
        active ? "border-brand-600 bg-brand-600 text-white" : "border-border bg-surface text-fg-muted hover:border-border-strong hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

export function FilterInventory() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FilterCategory | "all">("all");
  const [status, setStatus] = useState<FilterStatus | "all">("all");

  const q = query.trim().toLowerCase();
  const matches = FILTERS.filter(
    (f) =>
      (category === "all" || f.category === category) &&
      (status === "all" || f.status === status) &&
      (!q || [f.name, f.params, f.functionality, f.publicUi ?? ""].some((text) => text.toLowerCase().includes(q))),
  );
  const groups = CATEGORY_ORDER.map((id) => ({ id, rows: matches.filter((f) => f.category === id) })).filter((g) => g.rows.length);

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-3 px-5 sm:px-6">
        <label className="relative block max-w-sm">
          <span className="sr-only">Search filters</span>
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-fg-subtle"
          >
            <path d="m21 21-4.3-4.3M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or parameter"
            className="h-9 w-full rounded-lg border border-border-strong bg-surface pr-3 pl-9 text-sm text-fg placeholder:text-fg-subtle"
          />
        </label>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by category">
          <Chip active={category === "all"} onClick={() => setCategory("all")}>
            All categories
          </Chip>
          {CATEGORY_ORDER.map((id) => (
            <Chip key={id} active={category === id} onClick={() => setCategory(id)}>
              {CATEGORY_LABEL[id]}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
          <Chip active={status === "all"} onClick={() => setStatus("all")}>
            Any status
          </Chip>
          {(Object.keys(STATUS_META) as FilterStatus[]).map((id) => (
            <Chip key={id} active={status === id} onClick={() => setStatus(id)}>
              {STATUS_META[id].label}
            </Chip>
          ))}
        </div>
      </div>

      <p className="mt-3 px-5 text-xs text-fg-muted sm:px-6" aria-live="polite">
        {matches.length} of {FILTERS.length} filters
      </p>

      {groups.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-fg-muted sm:px-6">No filters match this search.</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[920px] text-sm">
            <caption className="sr-only">Property filter inventory</caption>
            <thead>
              <tr className="border-y border-border bg-surface-muted/40 text-left text-[11px] font-semibold tracking-wide text-fg-subtle uppercase">
                <th scope="col" className="px-5 py-2.5 sm:px-6">
                  Filter
                </th>
                <th scope="col" className="px-3 py-2.5">
                  Public website
                </th>
                <th scope="col" className="px-3 py-2.5">
                  Back office*
                </th>
                <th scope="col" className="px-3 py-2.5">
                  API
                </th>
                <th scope="col" className="px-3 py-2.5">
                  Status
                </th>
                <th scope="col" className="w-[26%] px-3 py-2.5">
                  Current functionality
                </th>
                <th scope="col" className="px-5 py-2.5 sm:px-6">
                  Recommendation
                </th>
              </tr>
            </thead>
            {groups.map((group) => (
              <tbody key={group.id} className="divide-y divide-border border-b border-border">
                <tr className="bg-surface-muted/25">
                  <th scope="rowgroup" colSpan={7} className="px-5 py-2 text-left text-xs font-semibold text-fg sm:px-6">
                    {CATEGORY_LABEL[group.id]} <span className="font-normal text-fg-subtle">· {group.rows.length}</span>
                  </th>
                </tr>
                {group.rows.map((f) => (
                  <tr key={f.id} className="align-top">
                    <th scope="row" className="px-5 py-3 text-left font-normal sm:px-6">
                      <p className="text-[13px] font-semibold text-fg">{f.name}</p>
                      <code className="mt-0.5 block text-[11px] text-fg-muted">{f.params}</code>
                    </th>
                    <td className="px-3 py-3 text-xs">
                      {f.publicUi ? <span className="text-fg">{f.publicUi}</span> : <span className="text-fg-subtle">Not offered</span>}
                    </td>
                    <td className="px-3 py-3 text-xs text-fg-muted">{f.backOffice ? "Legacy search" : "—"}</td>
                    <td className={cn("px-3 py-3 text-xs font-semibold whitespace-nowrap", API_LABEL[f.api].tone)}>{API_LABEL[f.api].text}</td>
                    <td className="px-3 py-3">
                      <StatusPill status={f.status} />
                    </td>
                    <td className="px-3 py-3 text-xs leading-relaxed text-fg-muted">{f.functionality}</td>
                    <td className="px-5 py-3 text-xs sm:px-6">
                      <p className="font-semibold text-fg">{RECOMMENDATION_LABEL[f.recommendation]}</p>
                      <p className="mt-0.5 text-fg-muted">{f.recommendationNote}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      )}

      <p className="border-t border-border px-5 py-3 text-[11px] text-fg-subtle sm:px-6">
        * The legacy back office is not part of this codebase. “Legacy search” repeats the earlier technical audit (its search procedures take the
        core filters) and was not re-verified in this review.
      </p>
    </div>
  );
}
