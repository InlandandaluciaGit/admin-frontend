"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Popover } from "@/components/ui/Popover";

/**
 * PLACEHOLDER: notifications are not connected to any source yet, so the
 * panel always shows its empty state.
 */
export function NotificationsMenu() {
  return (
    <Popover
      triggerLabel="Notifications"
      triggerClassName="relative flex size-10 items-center justify-center rounded-full border border-border bg-surface text-fg-muted transition-colors hover:border-border-strong hover:text-fg"
      panelClassName="w-[min(22rem,calc(100vw-2rem))]"
      trigger={<Icon name="bell" size={18} />}
    >
      {() => (
        <>
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-fg">Notifications</p>
            <span className="text-xs text-fg-subtle">Not connected</span>
          </div>
          <EmptyState
            icon="bell"
            title="You're all caught up"
            description="Notifications will appear here once the admin panel is connected to the Inland backend."
            className="py-8"
          />
        </>
      )}
    </Popover>
  );
}
