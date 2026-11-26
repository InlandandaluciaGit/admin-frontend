import { Icon, type IconName } from "@/components/ui/Icon";
import type { Kpi, MetricDefinition } from "@/types/analytics";
import { MetricBadges } from "./MetricBadge";
import { TrendIndicator } from "./TrendIndicator";

const full = new Intl.NumberFormat("en-GB");

interface KpiCardProps {
  kpi: Kpi | undefined;
  definition: MetricDefinition | undefined;
  icon: IconName;
  /** Shown under the comparison for dated metrics, e.g. "1 Oct – 30 Oct 2026". */
  previousLabel?: string;
  /** Optional formatter (percent, etc.). Defaults to full integers. */
  format?: (value: number) => string;
  hint?: string;
  /** Overrides the definition label as the card title. */
  title?: string;
}

/**
 * One headline figure. Unavailable values are labelled as such (never shown as 0).
 * Dated figures show the change against the previous period; snapshot and
 * all-time figures do not, because they have no period.
 */
export function KpiCard({ kpi, definition, icon, previousLabel, format = (v) => full.format(v), hint, title }: KpiCardProps) {
  const unavailable = !kpi || kpi.value === null;
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-fg-muted">{title ?? definition?.label ?? kpi?.id ?? "—"}</p>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Icon name={icon} size={16} />
        </span>
      </div>
      {unavailable ? (
        <div className="mt-3">
          <p className="text-lg font-semibold text-fg-subtle">Unavailable</p>
          <p className="mt-1 text-xs text-fg-muted">{kpi?.unavailableReason ?? "This figure is not available from the current data."}</p>
        </div>
      ) : (
        <p className="mt-3 text-3xl font-semibold tracking-tight text-fg">{format(kpi.value as number)}</p>
      )}
      {!unavailable && definition?.kind === "dated" && typeof kpi.previous === "number" && previousLabel ? (
        <TrendIndicator current={kpi.value as number} previous={kpi.previous} comparisonLabel={previousLabel} className="mt-2" />
      ) : null}
      {hint ? <p className="mt-2 text-xs text-fg-muted">{hint}</p> : null}
      {unavailable ? null : <MetricBadges definition={definition} className="mt-auto block pt-3" />}
    </div>
  );
}
