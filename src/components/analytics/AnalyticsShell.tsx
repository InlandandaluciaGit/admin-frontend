"use client";

import type { ReactNode } from "react";
import { PageHeading } from "@/components/common/PageHeading";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { GlobalLoader } from "@/components/ui/GlobalLoader";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useDateRange } from "@/hooks/useDateRange";
import { cn } from "@/lib/cn";
import type { AnalyticsModule } from "@/services/analytics.service";
import type { AnalyticsResponse, RangeSelection } from "@/types/analytics";
import { DateRangeFilter } from "./DateRangeFilter";
import { DefinitionsPanel } from "./DefinitionsPanel";

interface AnalyticsShellProps<T> {
  module: AnalyticsModule;
  title: string;
  description: string;
  /** Modules that describe the current state only (homepage, filters) hide the date filter. */
  usesDateRange?: boolean;
  /** Optional content above the filter (e.g. the greeting on the overview). */
  intro?: ReactNode;
  children: (response: AnalyticsResponse<T>, selection: RangeSelection) => ReactNode;
}

/**
 * Page frame for one analytics module: heading, the single date-range row,
 * loading / error / refreshing states, and the definitions panel.
 */
export function AnalyticsShell<T>({ module, title, description, usesDateRange = true, intro, children }: AnalyticsShellProps<T>) {
  const [selection, setSelection] = useDateRange();
  const effective: RangeSelection = usesDateRange ? selection : { range: "30d" };
  const { response, error, loading, refreshing, retry } = useAnalytics<T>(module, effective);

  return (
    <div className="flex flex-1 flex-col gap-6">
      {intro}
      <PageHeading title={title} description={description} />

      {usesDateRange ? (
        <DateRangeFilter
          key={`${selection.range}|${selection.from ?? ""}|${selection.to ?? ""}`}
          selection={selection}
          onChange={setSelection}
          resolved={response?.range}
          busy={refreshing}
        />
      ) : null}

      {error ? (
        <Alert tone="error" title="Could not load this data">
          <p>{error}</p>
          <Button variant="secondary" size="sm" className="mt-2" onClick={retry}>
            Try again
          </Button>
        </Alert>
      ) : null}

      {loading ? <GlobalLoader variant="content" /> : null}

      {response ? (
        <div
          aria-busy={refreshing}
          className={cn("flex flex-col gap-6 transition-opacity", refreshing && "pointer-events-none opacity-60")}
        >
          {children(response, effective)}
          <p className="text-xs text-fg-subtle">
            Calculated {new Date(response.generatedAt).toLocaleString("en-GB")} from the live Inland database (read-only; results are
            cached for up to 2 minutes). Scope: all partner offices.
          </p>
          <DefinitionsPanel definitions={response.definitions} />
        </div>
      ) : null}
    </div>
  );
}
