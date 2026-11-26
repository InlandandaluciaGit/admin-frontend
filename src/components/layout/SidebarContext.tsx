"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

interface SidebarContextValue {
  /** Desktop: sidebar reduced to icons. */
  collapsed: boolean;
  /** Mobile: off-canvas drawer is open. */
  mobileOpen: boolean;
  /** Toggles collapse on desktop and the drawer on smaller screens. */
  toggle: () => void;
  closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

// Matches Tailwind's `lg` breakpoint, where the sidebar becomes persistent.
const DESKTOP_QUERY = "(min-width: 64rem)";

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggle = useCallback(() => {
    if (window.matchMedia(DESKTOP_QUERY).matches) setCollapsed((value) => !value);
    else setMobileOpen((value) => !value);
  }, []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const value = useMemo(
    () => ({ collapsed, mobileOpen, toggle, closeMobile }),
    [collapsed, mobileOpen, toggle, closeMobile],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar(): SidebarContextValue {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within a SidebarProvider");
  return context;
}
