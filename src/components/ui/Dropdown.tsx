"use client";

import Link from "next/link";
import { useCallback, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";

interface DropdownItemBase {
  id: string;
  label: string;
  icon?: IconName;
  tone?: "default" | "danger";
  /** Shown but not actionable (e.g. a planned feature). */
  disabled?: boolean;
  /** Small trailing label such as "Soon". */
  badge?: string;
}

export type DropdownItem =
  | (DropdownItemBase & { href: string; onSelect?: never })
  | (DropdownItemBase & { onSelect: () => void; href?: never });

interface DropdownProps {
  /** Content of the trigger button. */
  trigger: ReactNode;
  triggerLabel: string;
  items: DropdownItem[];
  /** Optional non-interactive content shown above the items. */
  header?: ReactNode;
  align?: "left" | "right";
  triggerClassName?: string;
}

const ENABLED_ITEM = '[role="menuitem"]:not([aria-disabled="true"])';

export function Dropdown({ trigger, triggerLabel, items, header, align = "right", triggerClassName }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const close = useCallback(() => setOpen(false), []);
  const closeAndRefocus = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useClickOutside(containerRef, close, open);
  useEscapeKey(closeAndRefocus, open);

  const focusItem = (index: number) => {
    const nodes = menuRef.current?.querySelectorAll<HTMLElement>(ENABLED_ITEM);
    if (!nodes?.length) return;
    nodes[(index + nodes.length) % nodes.length].focus();
  };

  const openMenu = () => {
    setOpen(true);
    requestAnimationFrame(() => focusItem(0));
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const nodes = Array.from(menuRef.current?.querySelectorAll<HTMLElement>(ENABLED_ITEM) ?? []);
    const current = nodes.indexOf(document.activeElement as HTMLElement);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusItem(current + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusItem(current - 1);
    } else if (event.key === "Tab") {
      close();
    }
  };

  const itemClass = (item: DropdownItemBase) =>
    cn(
      "flex w-full items-center gap-2.5 rounded px-2.5 py-2 text-left text-sm focus:outline-none",
      item.disabled
        ? "cursor-not-allowed text-fg-subtle"
        : item.tone === "danger"
          ? "text-danger-600 hover:bg-danger-50 focus:bg-danger-50"
          : "text-fg hover:bg-surface-muted focus:bg-surface-muted",
    );

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={triggerLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && !open) {
            event.preventDefault();
            openMenu();
          }
        }}
        className={triggerClassName}
      >
        {trigger}
      </button>

      {open ? (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={triggerLabel}
          onKeyDown={onMenuKeyDown}
          className={cn(
            "absolute top-full z-50 mt-2 min-w-56 rounded-md border border-border bg-surface p-1 shadow-popover",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {header ? <div className="border-b border-border px-2.5 pt-1.5 pb-2.5 mb-1">{header}</div> : null}
          {items.map((item) => {
            const content = (
              <>
                {item.icon ? <Icon name={item.icon} size={16} /> : null}
                <span className="flex-1">{item.label}</span>
                {item.badge ? (
                  <span className="rounded bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-fg-subtle uppercase">
                    {item.badge}
                  </span>
                ) : null}
              </>
            );
            if (item.disabled) {
              return (
                <div key={item.id} role="menuitem" aria-disabled="true" tabIndex={-1} className={itemClass(item)}>
                  {content}
                </div>
              );
            }
            return item.href ? (
              <Link key={item.id} href={item.href} role="menuitem" tabIndex={-1} onClick={close} className={itemClass(item)}>
                {content}
              </Link>
            ) : (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                tabIndex={-1}
                onClick={() => {
                  close();
                  item.onSelect?.();
                }}
                className={itemClass(item)}
              >
                {content}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
