import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface PanelProps {
  children: ReactNode;
  className?: string;
  labelledBy?: string;
}

/** The dashboard's single card surface. */
export function Panel({ children, className, labelledBy }: PanelProps) {
  return (
    <section aria-labelledby={labelledBy} className={cn("rounded-xl border border-border bg-surface shadow-card", className)}>
      {children}
    </section>
  );
}

interface SectionHeaderProps {
  id: string;
  title: string;
  description?: string;
  className?: string;
}

export function SectionHeader({ id, title, description, className }: SectionHeaderProps) {
  return (
    <header className={className}>
      <h2 id={id} className="text-[0.9375rem] font-semibold text-fg">
        {title}
      </h2>
      {description ? <p className="mt-0.5 text-sm text-fg-subtle">{description}</p> : null}
    </header>
  );
}
