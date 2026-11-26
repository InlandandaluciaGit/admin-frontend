import { NAV_SECTIONS } from "@/constants/navigation";
import { ROUTES } from "@/constants/site";
import type { BreadcrumbItem, NavItem } from "@/types/navigation";

const NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((section) => section.items);

export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Finds the most specific nav item that matches the current path. */
export function findNavItem(pathname: string): NavItem | undefined {
  return NAV_ITEMS.filter((item) => isActivePath(pathname, item.href)).sort(
    (a, b) => b.href.length - a.href.length,
  )[0];
}

function toTitle(segment: string): string {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Builds breadcrumbs from the URL, using nav labels where available. */
export function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: BreadcrumbItem[] = [{ label: "Admin", href: ROUTES.dashboard }];

  segments.forEach((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const navItem = NAV_ITEMS.find((item) => item.href === href);
    crumbs.push({ label: navItem?.label ?? toTitle(segment), href });
  });

  // The final crumb represents the current page and is not a link.
  return crumbs.map((crumb, index) => (index === crumbs.length - 1 ? { label: crumb.label } : crumb));
}

export function getPageTitle(pathname: string): string {
  return findNavItem(pathname)?.label ?? "Dashboard";
}
