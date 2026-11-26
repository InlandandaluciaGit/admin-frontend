import { Table, type TableColumn } from "@/components/ui/Table";
import type { Attribution } from "@/types/analytics";
import { formatPercent } from "@/utils/format";

const full = new Intl.NumberFormat("en-GB");

interface Row {
  id: string;
  label: string;
  first: number;
  last: number;
  stored: number;
}

/**
 * First touch, last touch and (for comparison only) the buyer's stored source,
 * side by side. Each model's column sums to the number of sales: a sale is
 * never counted twice within a model.
 */
export function AttributionTable({ attribution }: { attribution: Attribution }) {
  const rows = new Map<string, Row>();
  const add = (items: Attribution["firstTouch"], key: "first" | "last" | "stored") => {
    for (const item of items) {
      const row = rows.get(item.label) ?? { id: item.label, label: item.label, first: 0, last: 0, stored: 0 };
      row[key] += item.value;
      rows.set(item.label, row);
    }
  };
  add(attribution.firstTouch, "first");
  add(attribution.lastTouch, "last");
  add(attribution.storedSource, "stored");
  const list = [...rows.values()].sort((a, b) => b.first - a.first || b.last - a.last);
  const total = attribution.sales || 1;
  const cell = (value: number) => (
    <span className="tabular-nums">
      {value ? full.format(value) : "–"}
      {value ? <span className="ml-1 text-xs text-fg-subtle">{formatPercent(value / total)}</span> : null}
    </span>
  );

  const columns: TableColumn<Row>[] = [
    { id: "source", header: "Source", cell: (row) => <span className="font-medium">{row.label}</span> },
    { id: "first", header: "First touch", align: "right", cell: (row) => cell(row.first) },
    { id: "last", header: "Last touch", align: "right", cell: (row) => cell(row.last) },
    { id: "stored", header: "Stored source (comparison)", align: "right", hideBelow: "md", cell: (row) => cell(row.stored) },
  ];

  return (
    <div>
      <Table columns={columns} rows={list} rowKey={(row) => row.id} caption="Sales by lead source: first touch, last touch, stored source" />
      <div className="border-t border-border bg-surface-muted/40 px-5 py-3 text-xs text-fg-muted">
        <span className="font-medium text-fg">{full.format(attribution.sales)}</span> buyer-linked sales in this period ·{" "}
        {full.format(attribution.attributable)} have a routed enquiry before the sale · first and last touch agree for{" "}
        {full.format(attribution.firstEqualsLast)}.
      </div>
    </div>
  );
}
