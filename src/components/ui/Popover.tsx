"use client";

import { useCallback, useId, useRef, useState, type ReactNode } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { cn } from "@/lib/cn";

interface PopoverProps {
  /** Content of the trigger button. */
  trigger: ReactNode;
  triggerLabel: string;
  /** Panel content; receives `close` for actions inside the panel. */
  children: (close: () => void) => ReactNode;
  align?: "left" | "right";
  triggerClassName?: string;
  panelClassName?: string;
}

/** Non-menu floating panel (e.g. notifications). Use `Dropdown` for action menus. */
export function Popover({ trigger, triggerLabel, children, align = "right", triggerClassName, panelClassName }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const close = useCallback(() => setOpen(false), []);
  const closeAndRefocus = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useClickOutside(containerRef, close, open);
  useEscapeKey(closeAndRefocus, open);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={triggerLabel}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((value) => !value)}
        className={triggerClassName}
      >
        {trigger}
      </button>
      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label={triggerLabel}
          className={cn(
            "absolute top-full z-50 mt-2 rounded-md border border-border bg-surface shadow-popover",
            align === "right" ? "right-0" : "left-0",
            panelClassName,
          )}
        >
          {children(close)}
        </div>
      ) : null}
    </div>
  );
}
