import type { NavSection } from "@/types/navigation";
import { ROUTES } from "./site";

/**
 * Sidebar navigation — the single source for the sidebar and breadcrumbs.
 *
 * Only built pages are listed. To add a module: create
 * `src/app/(dashboard)/<module>/page.tsx` (it inherits the shell and route
 * protection), then add an item here.
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    id: "overview",
    items: [{ label: "Dashboard", href: ROUTES.dashboard, icon: "dashboard", status: "available" }],
  },
  {
    id: "analytics",
    title: "Analytics",
    items: [
      { label: "Lead sources", href: "/analytics/leads", icon: "activity", status: "available" },
      { label: "Sales", href: "/analytics/sales", icon: "key", status: "available" },
      { label: "Website", href: "/analytics/website", icon: "globe", status: "available" },
      { label: "Properties", href: "/analytics/properties", icon: "building", status: "available" },
      { label: "Homepage rotation", href: "/analytics/homepage", icon: "home", status: "available" },
      { label: "Property filters", href: "/analytics/filters", icon: "filter", status: "available" },
    ],
  },
];
