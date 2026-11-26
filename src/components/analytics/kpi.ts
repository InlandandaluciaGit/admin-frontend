import type { IconName } from "@/components/ui/Icon";
import type { Kpi } from "@/types/analytics";

/** Icon per KPI id (purely decorative). */
export const KPI_ICONS: Record<string, IconName> = {
  totalProperties: "building",
  activeProperties: "home",
  soldStatusProperties: "check",
  soldWithBuyer: "userPlus",
  soldWithoutDate: "alert",
  soldByCompetitor: "briefcase",
  totalBuyers: "users",
  newBuyers: "userPlus",
  cumulativeViews: "eye",
  liveViews: "eye",
  avgLiveViews: "activity",
  routedEnquiries: "inbox",
  propertyEnquiryRecords: "fileText",
  websiteSourceEnquiries: "globe",
  inferredSales: "key",
  newListings: "plus",
  tours: "calendar",
  uniqueBuyers: "users",
  multiSourceBuyers: "activity",
  activeSources: "globe",
  enquiredProperties: "inbox",
  enquiredUnsold: "clock",
  priceReduced: "trendDown",
  websiteVisitors: "globe",
};

export const findKpi = (kpis: Kpi[], id: string) => kpis.find((kpi) => kpi.id === id);
