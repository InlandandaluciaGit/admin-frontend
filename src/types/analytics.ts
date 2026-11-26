/**
 * Types for the analytics API (`/api/admin/analytics/*`).
 * They mirror `BackEnd/src/services/analytics/*`.
 */

export type RangeKey = "7d" | "30d" | "90d" | "this_year" | "last_year" | "custom";
export type Granularity = "day" | "week" | "month";

export interface RangeSelection {
  range: RangeKey;
  from?: string;
  to?: string;
}

export interface ResolvedRange {
  key: RangeKey;
  label: string;
  from: string;
  to: string;
  days: number;
  granularity: Granularity;
  previous: { from: string; to: string; label: string };
}

/** dated = events inside the range; snapshot = database state now; cumulative = all-time total without dates. */
export type MetricKind = "dated" | "snapshot" | "cumulative";

export interface MetricDefinition {
  label: string;
  kind: MetricKind;
  source: string;
  calculation: string;
  dateField: string | null;
  exclusions?: string;
  limitations?: string;
  inferred?: boolean;
  /** Dated, but deliberately shows all history regardless of the date filter. */
  allHistory?: boolean;
}

export type Definitions = Record<string, MetricDefinition>;

export interface Kpi {
  id: string;
  value: number | null;
  previous?: number | null;
  unavailableReason?: string;
}

export interface SeriesPoint {
  key: string;
  label: string;
  value: number;
}

export interface Breakdown {
  id: string;
  label: string;
  value: number;
}

export interface AnalyticsResponse<T> {
  success: true;
  module: string;
  range: ResolvedRange;
  generatedAt: string;
  scope: "all-partners";
  data: T;
  definitions: Definitions;
}

// ---- modules ---------------------------------------------------------------------------

export interface OverviewData {
  kpis: Kpi[];
  enquiryTrend: SeriesPoint[];
  salesTrend: SeriesPoint[];
  toursTrend: SeriesPoint[];
  conversion: { newLeads: number; toured: number; bought: number };
}

export interface Attribution {
  sales: number;
  firstTouch: Breakdown[];
  lastTouch: Breakdown[];
  storedSource: Breakdown[];
  attributable: number;
  firstEqualsLast: number;
}

export interface LeadsData {
  kpis: Kpi[];
  sources: { id: string; label: string; enquiries: number; buyers: number; previousEnquiries: number }[];
  sourceTrends: { id: string; label: string; total: number; points: SeriesPoint[] }[];
  yearly: { years: number[]; rows: { id: string; label: string; values: number[]; total: number }[]; totals: number[] };
  multiSource: { buyersInRange: number; multiSourceInRange: number; buyersAllTime: number; multiSourceAllTime: number };
  attribution: Attribution;
  websiteForm: { submissions: number; matchedInRouted: number };
  conversion: { newLeads: number; toured: number; bought: number };
}

export interface SalesData {
  kpis: Kpi[];
  trend: SeriesPoint[];
  yearly: { year: number; total: number; archived: number }[];
  byType: Breakdown[];
  byRegion: Breakdown[];
  byArea: Breakdown[];
  archivedInRange: number;
  attribution: Attribution;
  chain: { buyerLinked: number; toured: number; routedEnquiry: number; propertyEnquiry: number; paymentOrReserved: number };
}

export interface UnavailableMetric {
  id: string;
  label: string;
  reason: string;
}

export interface WebsiteData {
  ga4: { configured: false; reason: string; trackingInstalled: true; customEvents: false };
  kpis: Kpi[];
  websiteEnquiryTrend: SeriesPoint[];
  viewsByType: Breakdown[];
  topViewed: { ref: string; type: string; area: string; views: number; ageDays: number | null; viewsPerDay: number | null }[];
  unavailable: UnavailableMetric[];
}

export interface PropertiesData {
  kpis: Kpi[];
  statusDistribution: Breakdown[];
  liveByType: Breakdown[];
  liveByRegion: Breakdown[];
  liveByArea: Breakdown[];
  priceReduction: { count: number; averagePercent: number | null; medianPercent: number | null };
}

export type PropertyListKind = "most-viewed" | "most-enquired" | "sold" | "enquired-unsold" | "price-reduced";

export interface PropertyListRow {
  propertyId: number;
  ref: string;
  type: string;
  region: string;
  area: string;
  status: string;
  price: number | null;
  originalPrice: number | null;
  views: number;
  enquiries: number | null;
  lifetimeEnquiries: number;
  saleDate: string | null;
  createdAt: string | null;
}

export interface PropertyListData {
  kind: PropertyListKind;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  items: PropertyListRow[];
}

export interface HomepageItem {
  position: number;
  propertyId: number;
  ref: string;
  type: string;
  area: string;
  price: number | null;
  originalPrice: number | null;
  createdAt: string | null;
  enquiries: number;
  enquiryWindowDays: number;
  lifetimeEnquiries: number;
  reasons: string[];
  alsoIn: string[];
}

export interface FeaturedEntry {
  ref: string;
  propertyId: number | null;
  type: string;
  area: string;
  sortOrder: number | null;
  featuredDate: string | null;
  expiryDate: string | null;
  expired: boolean;
  live: boolean;
  enquiries30d: number;
  shownPosition: number | null;
}

export interface HomepageData {
  computedAt: string;
  limit: number;
  sections: { popular: HomepageItem[]; newListings: HomepageItem[]; exclusives: HomepageItem[] };
  popularFellBack: boolean;
  pools: {
    live: number;
    newWithin30Days: number;
    priceReduced: number;
    popularEligible: number;
    featuredTotal: number;
    featuredLive: number;
    featuredLiveExpired: number;
  };
  featured: FeaturedEntry[];
  rules: { newListings: string; popular: string; exclusives: string; shared: string };
}

export type FilterStatus = "works" | "ignored" | "hidden" | "client-only";

export interface FiltersData {
  inventory: { id: string; name: string; where: string; apiParams: string; implementation: string; status: FilterStatus; note?: string }[];
  sortOptions: { shown: string[]; apiOnly: string[] };
  redundancy: string[];
  advancedSearch: string;
  usageTracked: false;
  completeness: { id: string; label: string; count: number; live: number; note: string }[];
  features: Breakdown[];
  buyerCriteria: { id: string; label: string; total: number; options: { label: string; value: number }[] }[];
}
