"use client";

import { Dropdown, type DropdownItem } from "@/components/ui/Dropdown";
import { Icon } from "@/components/ui/Icon";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useLogout } from "@/hooks/useLogout";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function UserMenu() {
  const user = useCurrentUser();
  const handleLogout = useLogout();

  const items: DropdownItem[] = [
    { id: "logout", label: "Log out", icon: "logout", tone: "danger", onSelect: handleLogout },
  ];

  return (
    <Dropdown
      triggerLabel="Open user menu"
      items={items}
      triggerClassName="flex items-center gap-3 rounded-md px-1.5 py-1 transition-colors hover:bg-surface-muted"
      header={
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
            {user ? initials(user.name) : ""}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-fg">{user?.name ?? "—"}</p>
            <p className="truncate text-xs text-fg-subtle">{user ? (user.email ?? user.username) : ""}</p>
          </div>
        </div>
      }
      trigger={
        <>
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white"
          >
            {user ? initials(user.name) : ""}
          </span>
          <span className="hidden text-left leading-tight md:block">
            <span className="block text-[0.9375rem] font-semibold text-fg">{user?.name ?? " "}</span>
            <span className="mt-0.5 block text-[13px] text-fg-muted">{user ? (user.email ?? user.username) : " "}</span>
          </span>
          <Icon name="chevronDown" size={18} className="ml-1 hidden text-fg-muted md:block" />
        </>
      }
    />
  );
}
