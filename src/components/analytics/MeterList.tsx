import { Meter } from "@/components/charts";
import { formatPercent } from "@/utils/format";

const full = new Intl.NumberFormat("en-GB");

export interface MeterRow {
  id: string;
  label: string;
  value: number;
  of: number;
  note?: string;
}

/** Several ratios, one per row, each against its own whole: a name, a figure and a bar. */
export function MeterList({ rows }: { rows: MeterRow[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {rows.map((row) => (
        <li key={row.id}>
          <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
            <span className="text-fg-muted">{row.label}</span>
            <span className="text-fg">
              <span className="font-semibold">{full.format(row.value)}</span>
              <span className="text-fg-subtle">
                {" "}
                of {full.format(row.of)}
                {row.of > 0 ? ` · ${formatPercent(row.value / row.of)}` : ""}
              </span>
            </span>
          </div>
          <Meter value={row.value} max={row.of} label={row.label} />
          {row.note ? <p className="mt-1 text-xs text-fg-subtle">{row.note}</p> : null}
        </li>
      ))}
    </ul>
  );
}
