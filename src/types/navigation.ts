import type { IconName } from "@/components/ui/Icon";

/**
 * `available` items link to a route. `soon` items are planned modules shown
 * as disabled placeholders; switch them to `available` once the route exists.
 */
export type NavItemStatus = "available" | "soon";

export interface NavItem {
  label: string;
  href: string;
  icon: IconName;
  status?: NavItemStatus;
}

export interface NavSection {
  id: string;
  title?: string;
  items: NavItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
