"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { SidebarProvider, useSidebar } from "./SidebarContext";

function ShellFrame({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar();
  return (
    <div className="min-h-dvh">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:shadow-popover"
      >
        Skip to content
      </a>
      <Sidebar />
      <div
        className={cn(
          "flex min-h-dvh flex-col transition-[padding] duration-200 motion-reduce:transition-none",
          collapsed ? "lg:pl-sidebar-collapsed" : "lg:pl-sidebar",
        )}
      >
        <Header />
        <main id="main-content" className="flex flex-1 flex-col px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
          <div className="flex w-full flex-1 flex-col">{children}</div>
        </main>
      </div>
    </div>
  );
}

/** Client shell (sidebar + header). Page content is passed through as server-rendered children. */
export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <ShellFrame>{children}</ShellFrame>
    </SidebarProvider>
  );
}
