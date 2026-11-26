import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

const TONES = {
  error: { box: "border-danger-200 bg-danger-50 text-danger-700", icon: "alert" },
  info: { box: "border-brand-200 bg-brand-50 text-brand-800", icon: "info" },
  warning: { box: "border-warning-200 bg-warning-50 text-warning-700", icon: "info" },
} as const;

interface AlertProps {
  tone?: keyof typeof TONES;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Alert({ tone = "info", title, children, className }: AlertProps) {
  const { box, icon } = TONES[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cn("flex gap-3 rounded-lg border px-4 py-3 text-sm", box, className)}>
      <Icon name={icon} size={18} className="mt-px shrink-0" />
      <div>
        {title ? <p className="font-medium">{title}</p> : null}
        <div className={cn(title && "mt-0.5")}>{children}</div>
      </div>
    </div>
  );
}
