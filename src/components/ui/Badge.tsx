import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const TONES = {
  neutral: "bg-surface-muted text-fg-muted",
  brand: "bg-brand-50 text-brand-700",
  accent: "bg-accent-50 text-accent-600",
  warning: "bg-warning-50 text-warning-700",
  success: "bg-success-50 text-success-700",
  danger: "bg-danger-50 text-danger-700",
} as const;

export type BadgeTone = keyof typeof TONES;

interface BadgeProps {
  tone?: BadgeTone;
  /** Show a leading status dot. */
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

export function Badge({ tone = "neutral", dot = false, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        TONES[tone],
        className,
      )}
    >
      {dot ? <span aria-hidden="true" className="size-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}
