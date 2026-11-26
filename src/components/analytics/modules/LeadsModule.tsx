"use client";

import { SegmentedBar, TrendChart } from "@/components/charts";
import { Alert } from "@/components/ui/Alert";
import { Table, type TableColumn } from "@/components/ui/Table";
import type { LeadsData } from "@/types/analytics";
import { AnalyticsShell } from "../AnalyticsShell";
import { AttributionTable } from "../AttributionTable";
import { KpiCard } from "../KpiCard";
import { MeterList } from "../MeterList";
import { KPI_ICONS } from "../kpi";
import { SectionCard } from "../SectionCard";
import { SourceTable } from "../SourceTable";
import { SourceTrends } from "../SourceTrends";

const full = new Intl.NumberFormat("en-GB");

function YearlyTable({ yearly }: { yearly: LeadsData["yearly"] }) {
  type Row = LeadsData["yearly"]["rows"][number];
  const top = yearly.rows.slice(0, 12);
  const rest = yearly.rows.slice(12);
  const rows: Row[] = rest.length
    ? [
        ...top,
        {
          id: "__other",
          label: `Other sources (${rest.length})`,
          values: yearly.years.map((_, i) => rest.reduce((sum, row) => sum + row.values[i], 0)),
          total: rest.reduce((sum, row) => sum + row.total, 0),
        },
      ]
    : top;
  const columns: TableColumn<Row>[] = [
    { id: "source", header: "Source", cell: (row) => <span className="font-medium whitespace-nowrap">{row.label}</span> },
    ...yearly.years.map((year, i) => ({
      id: String(year),
      header: year === yearly.years[0] ? `${year}*` : String(year),
      align: "right" as const,
      cell: (row: Row) => <span className="tabular-nums">{row.values[i] ? full.format(row.values[i]) : "–"}</span>,
    })),
  ];
  return (
    <div>
      <Table columns={columns} rows={rows} rowKey={(row) => row.id} caption="Routed enquiries per year and source" />
      <p className="border-t border-border px-5 py-3 text-xs text-fg-muted">
        Totals: {yearly.years.map((y, i) => `${y} ${full.format(yearly.totals[i])}`).join(" · ")}. *Routed enquiries start on 5 Dec 2019. All years
        are shown regardless of the date filter.
      </p>
    </div>
  );
}

export function LeadsModule() {
  return (
    <AnalyticsShell<LeadsData>
      module="leads"
      title="Lead sources"
      description="Where enquiries come from, using the source recorded on each routed enquiry rather than the buyer's single stored source."
    >
      {({ data, definitions, range }) => (
        <>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {data.kpis.map((kpi) => (
              <li key={kpi.id}>
                <KpiCard kpi={kpi} definition={definitions[kpi.id]} icon={KPI_ICONS[kpi.id]} previousLabel={range.previous.label} />
              </li>
            ))}
          </ul>

          <Alert tone="info" title="Enquiries this data cannot see">
            Routed enquiries come from the email assistant. Enquiries sent through the new website&apos;s own form are stored separately:{" "}
            <strong>{full.format(data.websiteForm.submissions)}</strong> in this period, of which{" "}
            <strong>{full.format(data.websiteForm.matchedInRouted)}</strong> also appear as routed enquiries. Phone and walk-in contacts are only
            included when staff route them.
          </Alert>

          <SectionCard id="by-source" title="Enquiries by source" description={range.label} definition={definitions.enquiriesBySource} flush>
            <SourceTable sources={data.sources} previousLabel={range.previous.label} />
          </SectionCard>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <SectionCard
              id="source-trends"
              title={`Source trends per ${range.granularity}`}
              description="Top sources, each on its own scale; the rest combined."
              definition={definitions.enquiriesBySource}
            >
              <SourceTrends trends={data.sourceTrends} />
            </SectionCard>
            <SectionCard
              id="multi-source"
              title="Buyers with more than one source"
              description="Why a single stored source per buyer is not enough."
              definition={definitions.multiSourceBuyers}
            >
              <div className="flex flex-col gap-6">
                <div>
                  <p className="mb-2 text-sm text-fg-muted">In this period</p>
                  <SegmentedBar
                    label="Buyers by number of sources in this period"
                    columns={["Sources", "Buyers"]}
                    parts={[
                      { id: "single", label: "One source", value: data.multiSource.buyersInRange - data.multiSource.multiSourceInRange },
                      { id: "multi", label: "Two or more sources", value: data.multiSource.multiSourceInRange },
                    ]}
                  />
                </div>
                <div>
                  <p className="mb-2 text-sm text-fg-muted">All history (since Dec 2019)</p>
                  <SegmentedBar
                    label="Buyers by number of sources, all history"
                    columns={["Sources", "Buyers"]}
                    parts={[
                      { id: "single", label: "One source", value: data.multiSource.buyersAllTime - data.multiSource.multiSourceAllTime },
                      { id: "multi", label: "Two or more sources", value: data.multiSource.multiSourceAllTime },
                    ]}
                  />
                </div>
              </div>
            </SectionCard>
          </div>

          <SectionCard
            id="attribution"
            title="Sales by lead source"
            description="First and last routed enquiry before each sale in this period. Sales are dated by the inferred sale date."
            definition={definitions.attribution}
            flush
          >
            {data.attribution.sales === 0 ? (
              <p className="px-5 pb-5 text-sm text-fg-muted sm:px-6">No buyer-linked sales have an inferred sale date in this period.</p>
            ) : (
              <AttributionTable attribution={data.attribution} />
            )}
          </SectionCard>

          <SectionCard
            id="conversion"
            title="New-lead conversion"
            description="Buyers whose first-ever routed enquiry falls in this period, and what has happened since."
            definition={definitions.leadConversion}
          >
            <MeterList
              rows={[
                { id: "leads", label: "New leads (first routed enquiry in period)", value: data.conversion.newLeads, of: data.conversion.newLeads },
                { id: "toured", label: "Have toured since their first enquiry", value: data.conversion.toured, of: data.conversion.newLeads },
                {
                  id: "bought",
                  label: "Have bought (buyer of a property now Sold)",
                  value: data.conversion.bought,
                  of: data.conversion.newLeads,
                  note: "Recent periods convert less by construction: those buyers have had less time to tour or buy.",
                },
              ]}
            />
          </SectionCard>

          <SectionCard id="yearly" title="Yearly enquiries by source" description="All available history" definition={definitions.yearlySourceTrend} flush>
            <YearlyTable yearly={data.yearly} />
          </SectionCard>

          <SectionCard id="total-trend" title="All routed enquiries" description={`Per ${range.granularity}`} definition={definitions.routedEnquiries}>
            <TrendChart
              points={data.sourceTrends.reduce<LeadsData["sourceTrends"][number]["points"]>(
                (acc, trend) => trend.points.map((p, i) => ({ ...p, value: (acc[i]?.value ?? 0) + p.value })),
                [],
              )}
              label={`Routed enquiries per ${range.granularity}`}
              valueLabel="Enquiries"
              height={200}
            />
          </SectionCard>
        </>
      )}
    </AnalyticsShell>
  );
}
