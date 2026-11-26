import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface TableColumn<T> {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
  /** Hide below a breakpoint to keep tables readable on small screens. */
  hideBelow?: "sm" | "md" | "lg";
  className?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  caption?: string;
  empty?: ReactNode;
  className?: string;
}

const ALIGN = { left: "text-left", right: "text-right", center: "text-center" } as const;
const HIDE = { sm: "hidden sm:table-cell", md: "hidden md:table-cell", lg: "hidden lg:table-cell" } as const;

/** Generic, presentational data table. Scrolls horizontally when needed. */
export function Table<T>({ columns, rows, rowKey, caption, empty, className }: TableProps<T>) {
  if (rows.length === 0 && empty) return <>{empty}</>;

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr className="border-b border-border bg-surface-muted/60">
            {columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                className={cn(
                  "px-5 py-3 text-xs font-medium tracking-wide whitespace-nowrap text-fg-subtle uppercase",
                  ALIGN[column.align ?? "left"],
                  column.hideBelow && HIDE[column.hideBelow],
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={rowKey(row)} className="transition-colors hover:bg-surface-muted/50">
              {columns.map((column) => (
                <td
                  key={column.id}
                  className={cn(
                    "px-5 py-3.5 align-middle text-fg",
                    ALIGN[column.align ?? "left"],
                    column.hideBelow && HIDE[column.hideBelow],
                    column.className,
                  )}
                >
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
