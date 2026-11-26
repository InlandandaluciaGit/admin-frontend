import type { ReactNode } from "react";
import { InfoTip } from "@/components/dashboard/InfoTip";
import { cn } from "@/lib/cn";
import type { MetricDefinition } from "@/types/analytics";

interface AnalyticsCardProps {
  id: string;
  title: string;
  /** Short line under the title. */
  subtitle?: ReactNode;
  /** Small pill next to the title, e.g. "Inferred". */
  badge?: string;
  badgeTone?: "success" | "neutral";
  definition?: MetricDefinition;
  note?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Remove body padding for edge-to-edge tables. */
  flush?: boolean;
}

/** Card surface matching the main dashboard: rounded-2xl, title with an (i) definition tooltip. */
export function AnalyticsCard({ id, title, subtitle, badge, badgeTone = "success", definition, note, actions, children, className, flush }: AnalyticsCardProps) {
  return (
    <section aria-labelledby={id} className={cn("flex min-w-0 flex-col rounded-2xl border border-border bg-surface shadow-card", className)}>
      <header className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 id={id} className="text-[1rem] font-semibold text-fg">
              {title}
            </h2>
            {badge ? (
              <span
                className={cn(
                  "rounded-full px-1.5 py-px text-[10px] font-semibold tracking-wide uppercase ring-1",
                  badgeTone === "success" ? "bg-success-50 text-success-700 ring-success-600/20" : "bg-surface-muted text-fg-muted ring-border",
                )}
              >
                {badge}
              </span>
            ) : null}
            <InfoTip label={title} definition={definition} extraNote={note} />
          </div>
          {subtitle ? <p className="mt-0.5 text-xs text-fg-muted">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </header>
      <div className={cn("flex flex-1 flex-col", flush ? "mt-4" : "px-5 pt-5 pb-5 sm:px-6 sm:pb-6")}>{children}</div>
    </section>
  );
}
