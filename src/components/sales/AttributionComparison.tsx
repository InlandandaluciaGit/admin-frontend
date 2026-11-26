import { cn } from "@/lib/cn";
import type { Attribution } from "@/types/analytics";
import { NO_TOUCH_ID, type SourceRow } from "./attributionSources";

const fullFmt = new Intl.NumberFormat("en-GB");
const pct = (value: number, total: number) => (total > 0 ? `${((value / total) * 100).toFixed(1)}%` : "0.0%");

function ModelCell({ value, total, color }: { value: number; total: number; color: string }) {
  const width = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="hidden h-2 flex-1 overflow-hidden rounded-full bg-surface-muted sm:block" aria-hidden="true">
        <div className="h-full rounded-full" style={{ width: `${width}%`, backgroundColor: color, minWidth: value > 0 ? 4 : 0 }} />
      </div>
      <span className="w-[4.75rem] shrink-0 text-right tabular-nums">
        <span className="text-[13px] font-semibold text-fg">{value ? fullFmt.format(value) : "–"}</span>
        {value ? <span className="ml-1.5 text-[11px] text-fg-muted">{pct(value, total)}</span> : null}
      </span>
    </div>
  );
}

function Shift({ first, last }: { first: number; last: number }) {
  const diff = last - first;
  if (diff === 0) return <span className="text-xs text-fg-subtle">No change</span>;
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
        diff > 0 ? "bg-brand-50 text-brand-700" : "bg-surface-muted text-fg-muted",
      )}
    >
      {diff > 0 ? "+" : "−"}
      {fullFmt.format(Math.abs(diff))}
    </span>
  );
}

interface AttributionComparisonProps {
  rows: SourceRow[];
  attribution: Attribution;
}

/**
 * First touch vs last touch per source. Each model counts every buyer-linked
 * sale exactly once, so each column sums to `attribution.sales`. The buyer's
 * stored source is a separate measure and is listed apart, for reference only.
 */
export function AttributionComparison({ rows, attribution }: AttributionComparisonProps) {
  const total = attribution.sales;
  const noTouch = rows.find((row) => row.id === NO_TOUCH_ID)?.first ?? 0;

  return (
    <div className="flex flex-col">
      <dl className="grid grid-cols-3 divide-x divide-border border-y border-border bg-surface-muted/40 text-center">
        {[
          { label: "Buyer-linked sales", value: total },
          { label: "Same source first & last", value: attribution.firstEqualsLast },
          { label: "No enquiry before sale", value: noTouch },
        ].map((item) => (
          <div key={item.label} className="px-2 py-3">
            <dt className="text-[11px] font-medium text-fg-muted">{item.label}</dt>
            <dd className="mt-0.5 text-lg font-bold text-fg tabular-nums">{fullFmt.format(item.value)}</dd>
          </div>
        ))}
      </dl>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <caption className="sr-only">Sales by lead source: first touch compared with last touch</caption>
          <thead>
            <tr className="text-left text-[11px] font-semibold tracking-wide text-fg-subtle uppercase">
              <th scope="col" className="px-5 py-2.5 sm:px-6">
                Source
              </th>
              <th scope="col" className="w-[30%] px-3 py-2.5 text-right">
                First touch
              </th>
              <th scope="col" className="w-[30%] px-3 py-2.5 text-right">
                Last touch
              </th>
              <th scope="col" className="w-24 px-5 py-2.5 text-right sm:px-6">
                Shift
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.id}>
                <th scope="row" className="px-5 py-2.5 text-left font-medium sm:px-6">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: row.color }} aria-hidden="true" />
                    <span className={cn("truncate text-[13px]", row.id === NO_TOUCH_ID ? "text-fg-muted" : "text-fg")}>{row.label}</span>
                  </span>
                </th>
                <td className="px-3 py-2.5">
                  <ModelCell value={row.first} total={total} color={row.color} />
                </td>
                <td className="px-3 py-2.5">
                  <ModelCell value={row.last} total={total} color={row.color} />
                </td>
                <td className="px-5 py-2.5 text-right sm:px-6">
                  <Shift first={row.first} last={row.last} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {attribution.storedSource.length ? (
        <details className="group border-t border-border px-5 py-3 sm:px-6">
          <summary className="cursor-pointer list-none text-xs font-medium text-fg-muted select-none hover:text-fg">
            <span className="inline-block transition-transform group-open:rotate-90" aria-hidden="true">
              ›
            </span>{" "}
            Buyer&apos;s stored source (reference only, not attribution)
          </summary>
          <ul className="mt-2.5 flex flex-wrap gap-2">
            {attribution.storedSource.map((item) => (
              <li key={item.id} className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-fg-muted">
                {item.label} <span className="ml-1 font-semibold text-fg tabular-nums">{fullFmt.format(item.value)}</span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
