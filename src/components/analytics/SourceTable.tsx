"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Table, type TableColumn } from "@/components/ui/Table";
import type { LeadsData } from "@/types/analytics";
import { formatPercent } from "@/utils/format";

const full = new Intl.NumberFormat("en-GB");
const signed = new Intl.NumberFormat("en-GB", { signDisplay: "exceptZero" });

type Row = LeadsData["sources"][number];

/**
 * Enquiries per source: count, share (thin bar), distinct buyers and change
 * against the previous period. Shows the top 12 by default.
 */
export function SourceTable({ sources, previousLabel }: { sources: Row[]; previousLabel: string }) {
  const [expanded, setExpanded] = useState(false);
  const total = sources.reduce((sum, row) => sum + row.enquiries, 0) || 1;
  const rows = expanded ? sources : sources.slice(0, 12);

  const columns: TableColumn<Row>[] = [
    { id: "source", header: "Source", cell: (row) => <span className="font-medium">{row.label}</span> },
    {
      id: "enquiries",
      header: "Enquiries",
      align: "right",
      cell: (row) => <span className="tabular-nums">{full.format(row.enquiries)}</span>,
    },
    {
      id: "share",
      header: "Share",
      hideBelow: "sm",
      cell: (row) => (
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-24 overflow-hidden rounded-full bg-brand-100" aria-hidden="true">
            <span className="block h-full rounded-full bg-chart-1" style={{ width: `${(row.enquiries / total) * 100}%` }} />
          </span>
          <span className="text-xs text-fg-muted tabular-nums">{formatPercent(row.enquiries / total)}</span>
        </span>
      ),
    },
    { id: "buyers", header: "Buyers", align: "right", hideBelow: "md", cell: (row) => <span className="tabular-nums">{full.format(row.buyers)}</span> },
    {
      id: "change",
      header: "Change",
      align: "right",
      hideBelow: "md",
      cell: (row) => (
        <span className="text-fg-muted tabular-nums" title={`${full.format(row.previousEnquiries)} ${previousLabel}`}>
          {signed.format(row.enquiries - row.previousEnquiries)}
        </span>
      ),
    },
  ];

  return (
    <div>
      <Table columns={columns} rows={rows} rowKey={(row) => row.id} caption="Routed enquiries by source" />
      {sources.length > 12 ? (
        <div className="border-t border-border px-5 py-3">
          <Button variant="ghost" size="sm" onClick={() => setExpanded((v) => !v)}>
            {expanded ? "Show top 12" : `Show all ${sources.length} sources`}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
