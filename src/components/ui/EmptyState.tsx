import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: IconName;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon = "inbox", action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-10 text-center", className)}>
      <span className="flex size-11 items-center justify-center rounded-full bg-surface-muted text-fg-subtle">
        <Icon name={icon} size={22} />
      </span>
      <h3 className="mt-4 text-sm font-semibold text-fg">{title}</h3>
      {description ? <p className="mt-1 max-w-sm text-sm text-fg-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
