import { useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
}

/** Native checkbox (keeps keyboard and form behaviour) with a custom visual. */
export function Checkbox({ label, id, className, ...props }: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <label htmlFor={inputId} className={cn("inline-flex cursor-pointer select-none items-center gap-2.5", className)}>
      <span className="relative flex size-[18px] shrink-0">
        <input
          id={inputId}
          type="checkbox"
          className="peer absolute inset-0 m-0 cursor-pointer appearance-none rounded-[5px] border border-border-strong bg-surface transition-colors checked:border-brand-600 checked:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
          {...props}
        />
        <Icon
          name="check"
          size={12}
          strokeWidth={3}
          className="pointer-events-none absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100"
        />
      </span>
      <span className="text-sm text-fg">{label}</span>
    </label>
  );
}
