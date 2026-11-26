import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { GlobalLoader } from "./GlobalLoader";

const VARIANTS = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-700 active:scale-[0.99] disabled:bg-brand-300 disabled:active:scale-100",
  secondary: "border border-border-strong bg-surface text-fg hover:bg-surface-muted disabled:text-fg-subtle",
  ghost: "text-fg-muted hover:bg-surface-muted hover:text-fg disabled:text-fg-subtle",
  danger: "bg-danger-600 text-white hover:bg-danger-700 disabled:opacity-60",
} as const;

const SIZES = {
  sm: "h-8 gap-1.5 rounded-lg px-3 text-sm",
  md: "h-10 gap-2 rounded-lg px-4 text-sm",
  lg: "h-11 gap-2 rounded-lg px-5 text-base",
  xl: "h-12 gap-2.5 rounded-[10px] px-6 text-base",
  icon: "size-9 rounded-lg",
} as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  /** Icon after the label; hidden while loading. */
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-medium transition-colors disabled:cursor-not-allowed",
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {isLoading ? <GlobalLoader variant="inline" tone={variant === "primary" || variant === "danger" ? "current" : "brand"} decorative /> : leftIcon}
      {isLoading && loadingText ? loadingText : children}
      {isLoading ? null : rightIcon}
    </button>
  );
}
