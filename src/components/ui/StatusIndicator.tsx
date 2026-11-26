import { cn } from "@/lib/cn";
import type { Tone } from "@/types/dashboard";

const DOT: Record<Tone, string> = {
  brand: "bg-brand-500",
  accent: "bg-accent-500",
  success: "bg-success-600",
  warning: "bg-[#d99a06]",
  danger: "bg-danger-600",
  neutral: "bg-fg-subtle",
};

interface StatusIndicatorProps {
  tone: Tone;
  label: string;
  className?: string;
}

/** Dot + text status. The label always carries the meaning; colour only reinforces it. */
export function StatusIndicator({ tone, label, className }: StatusIndicatorProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap text-fg-muted", className)}>
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", DOT[tone])} />
      {label}
    </span>
  );
}
