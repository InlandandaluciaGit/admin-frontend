/**
 * Analytics API client. Requests go to this app's own origin and are rewritten
 * to the Inland API (see next.config.ts), carrying the HTTP-only admin session.
 */
import type { AnalyticsResponse, PropertyListData, PropertyListKind, RangeSelection, ResolvedRange } from "@/types/analytics";

const BASE = "/api/admin/analytics";

export class AnalyticsError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AnalyticsError";
  }
}

export function rangeQuery(selection: RangeSelection): URLSearchParams {
  const params = new URLSearchParams({ range: selection.range });
  if (selection.range === "custom") {
    if (selection.from) params.set("from", selection.from);
    if (selection.to) params.set("to", selection.to);
  }
  return params;
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE}${path}`, { credentials: "same-origin", cache: "no-store", headers: { Accept: "application/json" }, signal });
  } catch (error) {
    if ((error as Error)?.name === "AbortError") throw error;
    throw new AnalyticsError("Unable to reach the analytics service. Check your connection and try again.", 0);
  }
  if (!response.ok) {
    let message = "This analytics data could not be loaded. Please try again.";
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {
      // Non-JSON error body.
    }
    if (response.status === 401) message = "Your session has ended. Please sign in again.";
    throw new AnalyticsError(message, response.status);
  }
  return (await response.json()) as T;
}

export type AnalyticsModule = "overview" | "leads" | "sales" | "website" | "properties" | "homepage-rotation" | "filters";

export function fetchAnalytics<T>(module: AnalyticsModule, selection: RangeSelection, signal?: AbortSignal) {
  return getJson<AnalyticsResponse<T>>(`/${module}?${rangeQuery(selection).toString()}`, signal);
}

export function fetchPropertyList(kind: PropertyListKind, selection: RangeSelection, page: number, pageSize: number, signal?: AbortSignal) {
  const params = rangeQuery(selection);
  params.set("kind", kind);
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  return getJson<{ range: ResolvedRange; data: PropertyListData }>(`/properties/list?${params.toString()}`, signal);
}
