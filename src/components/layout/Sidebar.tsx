"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/common/Logo";
import { Icon } from "@/components/ui/Icon";
import { NAV_SECTIONS } from "@/constants/navigation";
import { ROUTES } from "@/constants/site";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { useLogout } from "@/hooks/useLogout";
import { cn } from "@/lib/cn";
import type { NavItem } from "@/types/navigation";
import { isActivePath } from "@/utils/routes";
import { useSidebar } from "./SidebarContext";

const itemBase =
  "group relative flex h-10 w-full items-center gap-3 rounded-md px-3 text-[0.875rem] transition-colors";

function SidebarNavItem({ item, active, collapsed, onNavigate }: { item: NavItem; active: boolean; collapsed: boolean; onNavigate: () => void }) {
  const isSoon = item.status === "soon";
  const label = <span className={cn("flex-1 truncate", collapsed && "lg:sr-only")}>{item.label}</span>;
  const icon = <Icon name={item.icon} size={19} className="shrink-0" />;

  if (isSoon) {
    return (
      <span
        aria-disabled="true"
        title={`${item.label} — coming soon`}
        className={cn(itemBase, "cursor-not-allowed text-fg-subtle", collapsed && "lg:justify-center lg:px-0")}
      >
        {icon}
        {label}
        <span
          className={cn(
            "rounded-md bg-surface-muted px-1.5 py-px text-[10px] font-semibold tracking-wide text-fg-subtle uppercase",
            collapsed && "lg:hidden",
          )}
        >
          Soon
        </span>
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      className={cn(
        itemBase,
        collapsed && "lg:justify-center lg:px-0",
        active
          ? "bg-brand-600 font-semibold text-white shadow-sm shadow-brand-600/20"
          : "font-medium text-fg-muted hover:bg-brand-50 hover:text-brand-600",
      )}
    >
      <Icon
        name={item.icon}
        size={19}
        className={cn("shrink-0", active ? "text-white" : "text-fg-subtle group-hover:text-brand-600")}
      />
      {label}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, mobileOpen, closeMobile } = useSidebar();
  const handleLogout = useLogout();

  useEscapeKey(closeMobile, mobileOpen);
  useBodyScrollLock(mobileOpen);

  return (
    <>
      <div
        aria-hidden="true"
        onClick={closeMobile}
        className={cn("fixed inset-0 z-40 bg-brand-950/40 backdrop-blur-[2px] lg:hidden", mobileOpen ? "block" : "hidden")}
      />

      <aside
        id="admin-sidebar"
        aria-label="Main navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-sidebar flex-col border-r border-border bg-surface",
          "transition-[transform,width] duration-200 motion-reduce:transition-none",
          mobileOpen ? "translate-x-0 shadow-popover" : "-translate-x-full",
          "lg:translate-x-0 lg:shadow-none",
          collapsed && "lg:w-sidebar-collapsed",
        )}
      >
        <div className={cn("flex h-20 shrink-0 items-center px-5", collapsed && "lg:justify-center lg:px-0")}>
          <Link href={ROUTES.dashboard} onClick={closeMobile} className="flex items-center rounded-md" aria-label="Inland Admin dashboard">
            <Logo priority className={cn("h-[3.75rem]", collapsed && "lg:hidden")} />
            <Logo variant="mark" className={cn("hidden", collapsed && "lg:block")} />
          </Link>
          <button
            type="button"
            onClick={closeMobile}
            aria-label="Close navigation"
            className="ml-auto flex size-9 items-center justify-center rounded-lg text-fg-muted hover:bg-surface-muted lg:hidden"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pt-2 pb-4" aria-label="Admin">
          {NAV_SECTIONS.map((section) => (
            <div key={section.id} className="mb-6 last:mb-0">
              {section.title ? (
                <>
                  <p
                    className={cn(
                      "px-3 pb-2 text-[10.5px] font-semibold tracking-[0.1em] text-fg-subtle/90 uppercase",
                      collapsed && "lg:sr-only",
                    )}
                  >
                    {section.title}
                  </p>
                  {collapsed ? <hr aria-hidden="true" className="mx-3 mb-3 hidden border-border lg:block" /> : null}
                </>
              ) : null}
              <ul className="flex flex-col gap-0.5">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <SidebarNavItem
                      item={item}
                      active={isActivePath(pathname, item.href)}
                      collapsed={collapsed}
                      onNavigate={closeMobile}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <button
            type="button"
            onClick={handleLogout}
            title={collapsed ? "Log out" : undefined}
            className={cn(itemBase, "text-fg-muted hover:bg-danger-50 hover:text-danger-600", collapsed && "lg:justify-center lg:px-0")}
          >
            <Icon name="logout" size={19} className="shrink-0" />
            <span className={cn("truncate", collapsed && "lg:sr-only")}>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
