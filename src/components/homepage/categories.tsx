import type { ReactNode } from "react";

export type CategoryId = "newListings" | "popular" | "exclusives";

export interface CategoryStyle {
  id: CategoryId;
  title: string;
  /** Section name on the website itself. */
  siteName: string;
  /** Icon tile and rank chip colours (match the dashboard's Homepage Highlights card). */
  tile: string;
  chip: string;
  icon: ReactNode;
}

const svg = (children: ReactNode) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

export const CATEGORIES: Record<CategoryId, CategoryStyle> = {
  newListings: {
    id: "newListings",
    title: "New Listings",
    siteName: "Nuevos anuncios",
    tile: "bg-[#f1effe] text-[#634de8]",
    chip: "bg-[#f1effe] text-[#4f3bd0]",
    icon: svg(<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />),
  },
  popular: {
    id: "popular",
    title: "Popular of the Week",
    siteName: "Populares esta semana",
    tile: "bg-[#fff1ee] text-[#ea580c]",
    chip: "bg-[#fff1ee] text-[#c2410c]",
    icon: svg(
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />,
    ),
  },
  exclusives: {
    id: "exclusives",
    title: "Exclusive Featured",
    siteName: "Exclusivas",
    tile: "bg-[#fef7e6] text-[#d97706]",
    chip: "bg-[#fef7e6] text-[#b45309]",
    icon: svg(<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />),
  },
};
