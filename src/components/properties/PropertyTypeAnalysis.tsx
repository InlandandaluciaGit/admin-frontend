import type { Breakdown } from "@/types/analytics";

const fullFmt = new Intl.NumberFormat("en-GB");
const MAX_ROWS = 8;

interface TypeRow {
  id: string;
  label: string;
  listings: number;
  /** null when the views breakdown is not loaded. */
  views: number | null;
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="hidden h-2 flex-1 overflow-hidden rounded-full bg-surface-muted sm:block" aria-hidden="true">
      <div className="h-full rounded-full" style={{ width: `${max > 0 ? (value / max) * 100 : 0}%`, backgroundColor: color, minWidth: value > 0 ? 4 : 0 }} />
    </div>
  );
}

interface PropertyTypeAnalysisProps {
  /** Live properties per type (Properties API). */
  listings: Breakdown[];
  /** All-time views of live properties per type (Website API); null while loading or unavailable. */
  views: Breakdown[] | null;
}

/**
 * Live portfolio by property type: listings, all-time views and views per
 * listing. Both breakdowns come from the same live-property filter and the
 * same type labels, so they are joined by label.
 */
export function PropertyTypeAnalysis({ listings, views }: PropertyTypeAnalysisProps) {
  const viewsByLabel = new Map((views ?? []).map((item) => [item.label, item.value]));
  const all: TypeRow[] = listings.map((item) => ({
    id: item.id,
    label: item.label,
    listings: item.value,
    views: views ? (viewsByLabel.get(item.label) ?? 0) : null,
  }));

  const rows =
    all.length > MAX_ROWS
      ? [
          ...all.slice(0, MAX_ROWS - 1),
          {
            id: "__other",
            label: `Other types (${all.length - (MAX_ROWS - 1)})`,
            listings: all.slice(MAX_ROWS - 1).reduce((sum, r) => sum + r.listings, 0),
            views: views ? all.slice(MAX_ROWS - 1).reduce((sum, r) => sum + (r.views ?? 0), 0) : null,
          },
        ]
      : all;

  const totalListings = all.reduce((sum, r) => sum + r.listings, 0);
  const maxListings = Math.max(0, ...rows.map((r) => r.listings));
  const maxViews = Math.max(0, ...rows.map((r) => r.views ?? 0));

  if (!rows.length) return <p className="px-5 pb-6 text-sm text-fg-muted sm:px-6">No live properties.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[540px] text-sm">
        <caption className="sr-only">Live properties by type: listings, all-time views and views per listing</caption>
        <thead>
          <tr className="border-y border-border bg-surface-muted/40 text-[11px] font-semibold tracking-wide text-fg-subtle uppercase">
            <th scope="col" className="px-5 py-2.5 text-left sm:px-6">
              Type
            </th>
            <th scope="col" className="w-[32%] px-3 py-2.5 text-right">
              Live listings
            </th>
            <th scope="col" className="w-[32%] px-3 py-2.5 text-right">
              All-time views
            </th>
            <th scope="col" className="w-28 px-5 py-2.5 text-right sm:px-6">
              Views / listing
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.id}>
              <th scope="row" className="px-5 py-2.5 text-left text-[13px] font-medium text-fg sm:px-6">
                {row.label}
              </th>
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <Bar value={row.listings} max={maxListings} color="#6c4de6" />
                  <span className="w-[4.75rem] shrink-0 text-right tabular-nums">
                    <span className="text-[13px] font-semibold text-fg">{fullFmt.format(row.listings)}</span>
                    <span className="ml-1.5 text-[11px] text-fg-muted">{totalListings ? `${((row.listings / totalListings) * 100).toFixed(0)}%` : ""}</span>
                  </span>
                </div>
              </td>
              <td className="px-3 py-2.5">
                {row.views === null ? (
                  <span className="block text-right text-xs text-fg-subtle">—</span>
                ) : (
                  <div className="flex items-center gap-3">
                    <Bar value={row.views} max={maxViews} color="#2b92f0" />
                    <span className="w-[4.75rem] shrink-0 text-right text-[13px] font-semibold text-fg tabular-nums">{fullFmt.format(row.views)}</span>
                  </div>
                )}
              </td>
              <td className="px-5 py-2.5 text-right text-[13px] text-fg-muted tabular-nums sm:px-6">
                {row.views === null || row.listings === 0 ? "—" : fullFmt.format(Math.round(row.views / row.listings))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
