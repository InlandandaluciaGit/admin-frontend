"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { FeaturedEntry } from "@/types/analytics";
import { formatDay } from "./CategorySection";

const fullFmt = new Intl.NumberFormat("en-GB");
const PAGE = 12;

type Filter = "active" | "expired" | "not-live" | "all";

const FILTERS: { id: Filter; label: string; match: (e: FeaturedEntry) => boolean }[] = [
  { id: "active", label: "Eligible, active", match: (e) => e.live && !e.expired },
  { id: "expired", label: "Eligible, past expiry", match: (e) => e.live && e.expired },
  { id: "not-live", label: "Not live", match: (e) => !e.live },
  { id: "all", label: "All entries", match: () => true },
];

function Status({ entry }: { entry: FeaturedEntry }) {
  if (!entry.live) return <span className="inline-flex rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-fg-muted">Not live</span>;
  if (entry.expired)
    return <span className="inline-flex rounded-full bg-warning-50 px-2 py-0.5 text-[11px] font-semibold text-warning-700">Expired · still eligible</span>;
  return <span className="inline-flex rounded-full bg-success-50 px-2 py-0.5 text-[11px] font-semibold text-success-700">Active</span>;
}

/**
 * Every row of the staff-maintained featured list. The website only requires a
 * featured property to be live; it does not check the expiry date, so expired
 * entries that are live remain eligible and are highlighted.
 */
export function FeaturedListTable({ entries }: { entries: FeaturedEntry[] }) {
  const [filter, setFilter] = useState<Filter>(entries.some((e) => e.live && e.expired) ? "expired" : "active");
  const [showAll, setShowAll] = useState(false);
  const counts = Object.fromEntries(FILTERS.map((f) => [f.id, entries.filter(f.match).length])) as Record<Filter, number>;
  const matching = entries.filter(FILTERS.find((f) => f.id === filter)!.match);
  const rows = showAll ? matching : matching.slice(0, PAGE);

  return (
    <div className="flex flex-col">
      <div role="tablist" aria-label="Featured entries" className="mx-5 inline-flex flex-wrap gap-0.5 self-start rounded-lg bg-surface-muted p-0.5 text-xs font-medium sm:mx-6">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => {
              setFilter(f.id);
              setShowAll(false);
            }}
            className={cn("rounded-md px-3 py-1.5 transition-colors", filter === f.id ? "bg-surface text-brand-700 shadow-card" : "text-fg-muted hover:text-fg")}
          >
            {f.label} <span className="ml-0.5 tabular-nums opacity-70">{fullFmt.format(counts[f.id])}</span>
          </button>
        ))}
      </div>

      {matching.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-fg-muted sm:px-6">No featured entries in this group.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <caption className="sr-only">Featured list entries</caption>
            <thead>
              <tr className="border-y border-border bg-surface-muted/40 text-left text-[11px] font-semibold tracking-wide text-fg-subtle uppercase">
                <th scope="col" className="px-5 py-2.5 sm:px-6">
                  Property
                </th>
                <th scope="col" className="px-3 py-2.5">
                  Status
                </th>
                <th scope="col" className="px-3 py-2.5">
                  Featured since
                </th>
                <th scope="col" className="px-3 py-2.5">
                  Expiry
                </th>
                <th scope="col" className="px-3 py-2.5 text-right">
                  Enq. (30 days)
                </th>
                <th scope="col" className="px-5 py-2.5 text-right sm:px-6">
                  Shown now
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((entry) => (
                <tr key={entry.ref} className={cn(entry.live && entry.expired && "bg-warning-50/50")}>
                  <th scope="row" className="px-5 py-2.5 text-left font-normal sm:px-6">
                    <p className="text-[13px] font-semibold text-fg">{entry.ref}</p>
                    <p className="text-xs text-fg-muted">
                      {entry.type} · {entry.area}
                    </p>
                  </th>
                  <td className="px-3 py-2.5">
                    <Status entry={entry} />
                  </td>
                  <td className="px-3 py-2.5 text-[13px] text-fg-muted">{formatDay(entry.featuredDate)}</td>
                  <td className={cn("px-3 py-2.5 text-[13px]", entry.expired ? "font-semibold text-warning-700" : "text-fg-muted")}>
                    {entry.expiryDate ? formatDay(entry.expiryDate) : "Not set"}
                  </td>
                  <td className="px-3 py-2.5 text-right text-[13px] text-fg tabular-nums">{fullFmt.format(entry.enquiries30d)}</td>
                  <td className="px-5 py-2.5 text-right text-[13px] sm:px-6">
                    {entry.shownPosition ? (
                      <span className="inline-flex rounded-md bg-[#fef7e6] px-2 py-0.5 text-xs font-bold text-[#b45309] tabular-nums">#{entry.shownPosition}</span>
                    ) : (
                      <span className="text-fg-subtle">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {matching.length > PAGE ? (
        <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3 text-sm text-fg-muted sm:px-6">
          <span>
            Showing {fullFmt.format(rows.length)} of {fullFmt.format(matching.length)}
          </span>
          <Button variant="ghost" size="sm" onClick={() => setShowAll((v) => !v)}>
            {showAll ? `Show first ${PAGE}` : `Show all ${fullFmt.format(matching.length)}`}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
