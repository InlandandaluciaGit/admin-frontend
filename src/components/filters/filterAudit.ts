/**
 * Property filter inventory from a code review of the current implementation
 * (26 Nov 2026). Each entry was checked end to end:
 *
 *   Public UI  FrontEnd/src/components/properties/PropertiesLayout.tsx (list),
 *              components/search/AdvancedSearch.tsx (homepage), app/properties/
 *              advanced-search/page.tsx, app/properties/map-search/page.tsx
 *   API        BackEnd/src/controllers/propertiesController.ts (query parsing)
 *   Query      BackEnd/src/database/db.ts getProperties (the SQL actually applied)
 *
 * "Applied" means the parameter changes the SQL WHERE/ORDER BY, not merely that
 * the API reads it. Back-office availability is not in this codebase; the
 * `backOffice` flag repeats the earlier technical audit and is marked as such.
 * Nothing here is a database query, and no filter was changed.
 */

export const AUDIT_DATE = "26 Nov 2026";

export type FilterCategory = "type" | "location" | "price" | "rooms" | "features" | "status" | "other";
export type FilterStatus = "working" | "partial" | "unsupported" | "review";
export type Recommendation = "retain" | "improve" | "redundant" | "remove-or-implement" | "review";

export interface AuditedFilter {
  id: string;
  /** Original filter name. */
  name: string;
  category: FilterCategory;
  params: string;
  /** Where the public website offers it; null when it is not offered. */
  publicUi: string | null;
  /** Earlier audit: the legacy back-office search procedures take this filter. Not re-verified. */
  backOffice: boolean;
  /** Does the API apply it in the property query? */
  api: "applied" | "ignored" | "unused-endpoint";
  status: FilterStatus;
  functionality: string;
  recommendation: Recommendation;
  recommendationNote: string;
}

export const CATEGORY_LABEL: Record<FilterCategory, string> = {
  type: "Property type",
  location: "Location",
  price: "Price",
  rooms: "Bedrooms & bathrooms",
  features: "Features & amenities",
  status: "Property status",
  other: "Other & advanced",
};

export const CATEGORY_ORDER: FilterCategory[] = ["type", "location", "price", "rooms", "features", "status", "other"];

export const FILTERS: AuditedFilter[] = [
  // Property type
  {
    id: "propertyType",
    name: "Property type",
    category: "type",
    params: "propertyType",
    publicUi: "Property list, homepage search, advanced search, map",
    backOffice: true,
    api: "applied",
    status: "working",
    functionality: "Matches the property type code (comma-separated codes allowed).",
    recommendation: "retain",
    recommendationNote: "Core filter, works end to end.",
  },
  {
    id: "propertyTypeId",
    name: "Property type ID",
    category: "type",
    params: "propertyTypeId",
    publicUi: null,
    backOffice: false,
    api: "applied",
    status: "working",
    functionality: "Matches PROPERTY.Property_Type_ID. Not used by the website.",
    recommendation: "redundant",
    recommendationNote: "Duplicates the type-code parameter; keep one form.",
  },

  // Location
  {
    id: "region",
    name: "Province / region",
    category: "location",
    params: "regionId",
    publicUi: "Property list, homepage search, advanced search, map",
    backOffice: true,
    api: "applied",
    status: "working",
    functionality: "Filters through POSTCODE.Region_ID.",
    recommendation: "retain",
    recommendationNote: "Core filter, works end to end.",
  },
  {
    id: "area",
    name: "Area",
    category: "location",
    params: "areaId",
    publicUi: "Property list, map",
    backOffice: true,
    api: "applied",
    status: "working",
    functionality: "Filters through POSTCODE.Area_ID.",
    recommendation: "retain",
    recommendationNote: "Works; consider adding it to the homepage search.",
  },
  {
    id: "province",
    name: "Province name",
    category: "location",
    params: "province",
    publicUi: "Sent by the property list with regionId",
    backOffice: false,
    api: "ignored",
    status: "unsupported",
    functionality: "Sent alongside regionId but never read by the API; regionId does the filtering.",
    recommendation: "redundant",
    recommendationNote: "Harmless duplicate of regionId.",
  },
  {
    id: "town",
    name: "Town",
    category: "location",
    params: "town, location",
    publicUi: "Property list (from links and the URL)",
    backOffice: false,
    api: "ignored",
    status: "partial",
    functionality:
      "Sent to the API but not read, so results are not limited to the town. The website uses it for the page heading and to pick nearby results when a search is empty.",
    recommendation: "improve",
    recommendationNote: "Either filter by town on the server or stop presenting it as a filter.",
  },
  {
    id: "postcode",
    name: "Postcode / sub-area",
    category: "location",
    params: "postcode, postcodeId, subAreaId",
    publicUi: null,
    backOffice: false,
    api: "ignored",
    status: "unsupported",
    functionality: "Read by the API but never applied. A sub-area lookup endpoint already exists.",
    recommendation: "remove-or-implement",
    recommendationNote: "Candidate for a finer location filter if the client wants one.",
  },
  {
    id: "city",
    name: "City",
    category: "location",
    params: "city",
    publicUi: null,
    backOffice: false,
    api: "ignored",
    status: "unsupported",
    functionality: "Read by the API but never applied.",
    recommendation: "remove-or-implement",
    recommendationNote: "Overlaps with town and area; likely unnecessary.",
  },
  {
    id: "bbox",
    name: "Map area",
    category: "location",
    params: "minLat, minLng, maxLat, maxLng",
    publicUi: null,
    backOffice: false,
    api: "unused-endpoint",
    status: "review",
    functionality:
      "GET /properties/map/search filters by the map bounds only and ignores every other filter. The website's map page does not call it: it uses filtered region and area counts instead.",
    recommendation: "review",
    recommendationNote: "Unused endpoint; decide whether to retire it or wire it into the map.",
  },

  // Price
  {
    id: "minPrice",
    name: "Minimum price",
    category: "price",
    params: "minPrice, priceFrom",
    publicUi: "Property list, homepage search, advanced search, map",
    backOffice: true,
    api: "applied",
    status: "working",
    functionality: "Public_Price ≥ value.",
    recommendation: "retain",
    recommendationNote: "Works; two parameter names do the same thing.",
  },
  {
    id: "maxPrice",
    name: "Maximum price",
    category: "price",
    params: "maxPrice, priceTo",
    publicUi: "Property list, homepage search, advanced search, map",
    backOffice: true,
    api: "applied",
    status: "working",
    functionality: "Public_Price ≤ value.",
    recommendation: "retain",
    recommendationNote: "Works; two parameter names do the same thing.",
  },

  // Rooms
  {
    id: "minBeds",
    name: "Minimum bedrooms",
    category: "rooms",
    params: "minBeds",
    publicUi: "Property list, homepage search, advanced search, map",
    backOffice: true,
    api: "applied",
    status: "working",
    functionality: "Bedrooms ≥ value (options 1–5+).",
    recommendation: "retain",
    recommendationNote: "Core filter, works end to end.",
  },
  {
    id: "minBaths",
    name: "Minimum bathrooms",
    category: "rooms",
    params: "minBaths",
    publicUi: "Property list, homepage search, advanced search, map",
    backOffice: true,
    api: "applied",
    status: "working",
    functionality: "Bathrooms ≥ value (options 1–5+).",
    recommendation: "retain",
    recommendationNote: "Core filter, works end to end.",
  },
  {
    id: "exactRooms",
    name: "Exact / maximum bedrooms and bathrooms",
    category: "rooms",
    params: "bedrooms, bathrooms, maxBeds, maxBaths",
    publicUi: null,
    backOffice: false,
    api: "ignored",
    status: "unsupported",
    functionality: "Read by the API but never applied.",
    recommendation: "remove-or-implement",
    recommendationNote: "Not needed while the website offers minimums only.",
  },

  // Features
  {
    id: "pool",
    name: "Pool",
    category: "features",
    params: "pool",
    publicUi: "Property list, homepage search, advanced search, map",
    backOffice: false,
    api: "applied",
    status: "working",
    functionality: "Has feature 8 or 32 in PROPERTY_FEATURES.",
    recommendation: "retain",
    recommendationNote: "Works end to end.",
  },
  {
    id: "garage",
    name: "Garage",
    category: "features",
    params: "garage",
    publicUi: "Property list, homepage search, advanced search, map",
    backOffice: false,
    api: "applied",
    status: "working",
    functionality: "Has feature 6 or 30 in PROPERTY_FEATURES.",
    recommendation: "retain",
    recommendationNote: "Works end to end.",
  },

  // Status
  {
    id: "statusIds",
    name: "Status",
    category: "status",
    params: "statusIds",
    publicUi: "Not shown; the list always sends 2,7",
    backOffice: true,
    api: "applied",
    status: "review",
    functionality:
      "Defaults to For Sale and Under Offer (2, 7). Any caller can pass other statuses, e.g. sold properties, through the public API.",
    recommendation: "review",
    recommendationNote: "Decide whether the public API should accept other statuses.",
  },
  {
    id: "includeHidden",
    name: "Include hidden",
    category: "status",
    params: "includeHidden",
    publicUi: null,
    backOffice: false,
    api: "applied",
    status: "review",
    functionality: "includeHidden=true drops the Display = 1 condition, so the public API can return properties staff have hidden.",
    recommendation: "review",
    recommendationNote: "Restrict to authenticated staff, or remove from the public API.",
  },

  // Other
  {
    id: "ref",
    name: "Reference search",
    category: "other",
    params: "ref",
    publicUi: "Homepage search (Reference tab)",
    backOffice: true,
    api: "applied",
    status: "working",
    functionality: "Exact Property_Ref lookup; opens the property page.",
    recommendation: "retain",
    recommendationNote: "Works end to end.",
  },
  {
    id: "sort",
    name: "Sort order",
    category: "other",
    params: "sortBy, sortOrder",
    publicUi: "Property list: default, price ↑, price ↓, most viewed",
    backOffice: false,
    api: "applied",
    status: "working",
    functionality: "The API also supports title, bedrooms, bathrooms, size and distance. Distance is used automatically when a search returns nothing.",
    recommendation: "improve",
    recommendationNote: "Bedrooms or size sorting could be offered at no API cost.",
  },
  {
    id: "keywords",
    name: "Keywords",
    category: "other",
    params: "keywords",
    publicUi: null,
    backOffice: false,
    api: "ignored",
    status: "unsupported",
    functionality: "Read by the API but never applied.",
    recommendation: "remove-or-implement",
    recommendationNote: "Free-text search would need a new query.",
  },
  {
    id: "advanced",
    name: "Advanced search endpoint",
    category: "other",
    params: "POST /properties/search/advanced",
    publicUi: null,
    backOffice: false,
    api: "unused-endpoint",
    status: "review",
    functionality:
      "Calls sp_AdvancedPropertySearch and falls back to the basic search if it fails. The website's advanced-search page does not call it; it opens the property list instead.",
    recommendation: "review",
    recommendationNote: "Unused; the earlier audit found the procedure missing (not re-checked).",
  },
];

/** Plain-language findings for the client summary. Verified = checked in code for this review. */
export const VERIFIED_FINDINGS = [
  "Nine filters work end to end on the public website: property type, province, area, minimum and maximum price, minimum bedrooms and bathrooms, pool and garage. Reference search and sorting also work.",
  "Town is sent by the website but ignored by the API, so a town selection does not limit results.",
  "Nine API parameters are read but never applied: postcode, postcodeId, subAreaId, city, keywords, bedrooms, bathrooms, maxBeds and maxBaths. The province name the website sends is not read at all.",
  "The map page and the advanced-search page do not use their dedicated endpoints; both rely on the standard property list.",
  "The public API accepts statusIds and includeHidden, which can return sold or hidden properties.",
  "Filter usage is not recorded anywhere, so how often customers use each filter is unknown.",
];

export const RECOMMENDATIONS = [
  "Keep the nine working filters as the public filter set.",
  "Make Town filter on the server, or stop showing it as a filter.",
  "Restrict statusIds and includeHidden to staff before go-live.",
  "Remove or implement the ignored parameters so the API only accepts what it applies.",
  "Consider new filters where the data is complete enough (see field coverage below).",
  "Add filter usage tracking if the client wants to measure which filters matter.",
];

/** Filters a customer can actually use on the public website today (controls, links or the reference box). */
export const ON_PUBLIC_WEBSITE = new Set(["propertyType", "region", "area", "town", "minPrice", "maxPrice", "minBeds", "minBaths", "pool", "garage", "ref", "sort"]);
