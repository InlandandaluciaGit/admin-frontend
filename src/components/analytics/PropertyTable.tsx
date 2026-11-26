"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { GlobalLoader } from "@/components/ui/GlobalLoader";
import { Table, type TableColumn } from "@/components/ui/Table";
import { cn } from "@/lib/cn";
import { fetchPropertyList } from "@/services/analytics.service";
import type { PropertyListData, PropertyListKind, PropertyListRow, RangeSelection } from "@/types/analytics";

const full = new Intl.NumberFormat("en-GB");
const euro = new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const date = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "—");

type ColumnId = "views" | "enquiries" | "lifetime" | "sale" | "price" | "reduction" | "status" | "created";

const COLUMNS: Record<ColumnId, TableColumn<PropertyListRow>> = {
  views: { id: "views", header: "All-time views", align: "right", cell: (r) => <span className="tabular-nums">{full.format(r.views)}</span> },
  enquiries: {
    id: "enquiries",
    header: "Enquiries (period)",
    align: "right",
    cell: (r) => <span className="tabular-nums">{r.enquiries === null ? "—" : full.format(r.enquiries)}</span>,
  },
  lifetime: {
    id: "lifetime",
    header: "Lifetime enquiries",
    align: "right",
    hideBelow: "lg",
    cell: (r) => <span className="tabular-nums text-fg-muted">{full.format(r.lifetimeEnquiries)}</span>,
  },
  sale: { id: "sale", header: "Sale date (inferred)", cell: (r) => date(r.saleDate) },
  price: { id: "price", header: "Price", align: "right", hideBelow: "md", cell: (r) => (r.price === null ? "—" : euro.format(r.price)) },
  reduction: {
    id: "reduction",
    header: "Reduction",
    align: "right",
    cell: (r) =>
      r.originalPrice && r.price ? (
        <span className="tabular-nums">
          {(((r.originalPrice - r.price) / r.originalPrice) * 100).toFixed(1)}%
          <span className="ml-1 hidden text-xs text-fg-subtle lg:inline">from {euro.format(r.originalPrice)}</span>
        </span>
      ) : (
        "—"
      ),
  },
  status: { id: "status", header: "Status", hideBelow: "md", cell: (r) => r.status },
  created: { id: "created", header: "Listed", hideBelow: "lg", cell: (r) => date(r.createdAt) },
};

const BASE: TableColumn<PropertyListRow>[] = [
  { id: "ref", header: "Ref", cell: (r) => <span className="font-medium whitespace-nowrap">{r.ref}</span> },
  { id: "type", header: "Type", hideBelow: "sm", cell: (r) => r.type },
  { id: "area", header: "Area", hideBelow: "md", cell: (r) => `${r.area}${r.region !== "—" ? `, ${r.region}` : ""}` },
];

interface PropertyTableProps {
  kind: PropertyListKind;
  selection: RangeSelection;
  columns: ColumnId[];
  emptyText: string;
  pageSize?: number;
}

/** Paginated property ranking from /api/admin/analytics/properties/list. */
export function PropertyTable({ kind, selection, columns, emptyText, pageSize = 10 }: PropertyTableProps) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PropertyListData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(true);
  const selectionKey = `${selection.range}|${selection.from ?? ""}|${selection.to ?? ""}`;
  const [lastSelection, setLastSelection] = useState(selectionKey);

  // A new date range starts again at page 1.
  if (lastSelection !== selectionKey) {
    setLastSelection(selectionKey);
    setPage(1);
  }

  useEffect(() => {
    const controller = new AbortController();
    // Mark as pending; results are applied when the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPending(true);
    fetchPropertyList(kind, selection, page, pageSize, controller.signal)
      .then((result) => {
        setData(result.data);
        setError(null);
      })
      .catch((err: unknown) => {
        if ((err as Error)?.name !== "AbortError") setError(err instanceof Error ? err.message : "Could not load this list.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setPending(false);
      });
    return () => controller.abort();
    // selectionKey stands in for the selection object.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, selectionKey, page, pageSize]);

  if (error) return <Alert tone="error" className="mx-5 mb-5">{error}</Alert>;
  if (!data) return <GlobalLoader variant="content" className="py-10" />;
  if (data.total === 0) return <EmptyState title="No properties" description={emptyText} className="py-8" />;

  const start = (data.page - 1) * data.pageSize + 1;
  const end = start + data.items.length - 1;
  return (
    <div className={cn("transition-opacity", pending && "opacity-60")}>
      <Table columns={[...BASE, ...columns.map((id) => COLUMNS[id])]} rows={data.items} rowKey={(r) => String(r.propertyId)} caption={`Properties: ${kind.replace("-", " ")}`} />
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3 text-sm text-fg-muted">
        <span>
          {full.format(start)}–{full.format(end)} of {full.format(data.total)}
        </span>
        <span className="flex gap-2">
          <Button variant="secondary" size="sm" disabled={data.page <= 1 || pending} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </Button>
          <Button variant="secondary" size="sm" disabled={data.page >= data.totalPages || pending} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </span>
      </div>
    </div>
  );
}
