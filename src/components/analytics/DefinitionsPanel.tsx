import { Icon } from "@/components/ui/Icon";
import type { Definitions } from "@/types/analytics";
import { MetricBadges } from "./MetricBadge";

/**
 * "Data sources & definitions": for every figure on the page, where it comes
 * from, how it is calculated, which date applies and what it leaves out.
 */
export function DefinitionsPanel({ definitions }: { definitions: Definitions }) {
  const entries = Object.entries(definitions);
  if (entries.length === 0) return null;
  return (
    <details className="group rounded-xl border border-border bg-surface shadow-card">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 sm:px-6 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2 text-[0.9375rem] font-semibold text-fg">
          <Icon name="database" size={18} className="text-brand-600" />
          Data sources & definitions
        </span>
        <Icon name="chevronDown" size={18} className="text-fg-muted transition-transform group-open:rotate-180" />
      </summary>
      <dl className="divide-y divide-border border-t border-border">
        {entries.map(([id, def]) => (
          <div key={id} className="grid gap-2 px-5 py-4 sm:px-6 lg:grid-cols-[14rem_1fr]">
            <dt>
              <p className="text-sm font-semibold text-fg">{def.label}</p>
              <MetricBadges definition={def} className="mt-1.5 block" />
            </dt>
            <dd className="space-y-1 text-sm text-fg-muted">
              <p>
                <span className="font-medium text-fg">Source:</span> {def.source}
              </p>
              <p>
                <span className="font-medium text-fg">Calculation:</span> {def.calculation}
              </p>
              <p>
                <span className="font-medium text-fg">Date field:</span> {def.dateField ?? "None: not filtered by date"}
              </p>
              {def.exclusions ? (
                <p>
                  <span className="font-medium text-fg">Excludes:</span> {def.exclusions}
                </p>
              ) : null}
              {def.limitations ? (
                <p>
                  <span className="font-medium text-fg">Limitations:</span> {def.limitations}
                </p>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
