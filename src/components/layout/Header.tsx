"use client";

import { Icon } from "@/components/ui/Icon";
import { useSidebar } from "./SidebarContext";
import { UserMenu } from "./UserMenu";

export function Header() {
  const { collapsed, mobileOpen, toggle } = useSidebar();

  return (
    <header className="sticky top-0 z-30 flex h-header shrink-0 items-center gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur-md sm:px-5 lg:px-6">
      <button
        type="button"
        onClick={toggle}
        aria-controls="admin-sidebar"
        aria-expanded={mobileOpen || !collapsed}
        aria-label="Toggle navigation"
        className="-ml-1 flex size-10 shrink-0 items-center justify-center rounded-md text-fg-muted hover:bg-surface-muted hover:text-fg"
      >
        <Icon name="menu" size={20} className="lg:hidden" />
        <Icon name="panel" size={20} className="hidden lg:block" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-1 sm:gap-2">
        <UserMenu />
      </div>
    </header>
  );
}
