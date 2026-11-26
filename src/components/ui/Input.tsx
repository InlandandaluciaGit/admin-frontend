import { useId, type InputHTMLAttributes, type ReactNode, type Ref } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  /** Content rendered inside the field on the right, e.g. a toggle button. */
  endAdornment?: ReactNode;
  /** `md` (40px) for dense admin forms, `lg` (48px) for standalone forms like login. */
  inputSize?: "md" | "lg";
  ref?: Ref<HTMLInputElement>;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  endAdornment,
  inputSize = "md",
  id,
  className,
  required,
  ref,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-fg">
        {label}
        {required ? (
          <span className="ml-0.5 text-danger-600" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      <div className="relative">
        {leftIcon ? (
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-fg-muted">{leftIcon}</span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "w-full border bg-surface px-3 text-fg placeholder:text-fg-subtle",
            inputSize === "lg" ? "h-12 rounded-[10px] text-[0.9375rem]" : "h-10 rounded-lg text-sm",
            "transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-surface-muted",
            error
              ? "border-danger-600 focus:ring-danger-200"
              : "border-border-strong focus:border-brand-500 focus:ring-brand-100",
            leftIcon != null && (inputSize === "lg" ? "pl-11" : "pl-10"),
            endAdornment != null && "pr-11",
            className,
          )}
          {...props}
        />
        {endAdornment ? <span className="absolute inset-y-0 right-1 flex items-center">{endAdornment}</span> : null}
      </div>
      {error ? (
        <p id={errorId} className="text-sm text-danger-600">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-sm text-fg-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
