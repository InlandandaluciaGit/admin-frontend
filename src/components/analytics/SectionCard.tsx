import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { MetricDefinition } from "@/types/analytics";
import { MetricBadges } from "./MetricBadge";

interface SectionCardProps {
  id: string;
  title: string;
  description?: ReactNode;
  definition?: MetricDefinition;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Remove body padding (for edge-to-edge tables). */
  flush?: boolean;
}

/** A titled analytics panel with the metric's period badge. */
export function SectionCard({ id, title, description, definition, actions, children, className, flush }: SectionCardProps) {
  return (
    <section aria-labelledby={id} className={cn("min-w-0 rounded-xl border border-border bg-surface shadow-card", className)}>
      <header className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5 sm:px-6">
        <div className="min-w-0">
          <h2 id={id} className="text-[0.9375rem] font-semibold text-fg">
            {title}
          </h2>
          {description ? <div className="mt-0.5 text-sm text-fg-muted">{description}</div> : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <MetricBadges definition={definition} />
          {actions}
        </div>
      </header>
      <div className={cn(flush ? "mt-4" : "px-5 pt-5 pb-5 sm:px-6 sm:pb-6")}>{children}</div>
    </section>
  );
}
