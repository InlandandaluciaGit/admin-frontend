import { formatNumber } from "@/utils/format";

interface ChartDataTableProps {
  caption: string;
  columns: [string, string];
  rows: { label: string; value: number | string }[];
}

/** Screen-reader table twin for a chart, so no value is available only visually or on hover. */
export function ChartDataTable({ caption, columns, rows }: ChartDataTableProps) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">{columns[0]}</th>
          <th scope="col">{columns[1]}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <th scope="row">{row.label}</th>
            <td>{typeof row.value === "number" ? formatNumber(row.value) : row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
