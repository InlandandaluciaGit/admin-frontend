"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ROUTES } from "@/constants/site";
import { AnalyticsError, fetchAnalytics, type AnalyticsModule } from "@/services/analytics.service";
import type { AnalyticsResponse, RangeSelection } from "@/types/analytics";

export interface AnalyticsState<T> {
  response: AnalyticsResponse<T> | null;
  error: string | null;
  /** True on the very first load (no data yet). */
  loading: boolean;
  /** True while a new range loads; the previous result stays on screen. */
  refreshing: boolean;
}

/**
 * Loads one analytics module for a date range. On a range change the previous
 * result is kept (shown dimmed) until the new one arrives: no skeleton flash.
 */
export function useAnalytics<T>(module: AnalyticsModule, selection: RangeSelection): AnalyticsState<T> & { retry: () => void } {
  const router = useRouter();
  const [response, setResponse] = useState<AnalyticsResponse<T> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const key = `${module}|${selection.range}|${selection.from ?? ""}|${selection.to ?? ""}|${attempt}`;

  useEffect(() => {
    const controller = new AbortController();
    // Mark the request as pending; the result is applied when it resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPending(true);
    fetchAnalytics<T>(module, selection, controller.signal)
      .then((result) => {
        setResponse(result);
        setError(null);
      })
      .catch((err: unknown) => {
        if ((err as Error)?.name === "AbortError") return;
        if (err instanceof AnalyticsError && err.status === 401) {
          router.replace(ROUTES.login);
          return;
        }
        setError(err instanceof Error ? err.message : "This analytics data could not be loaded.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setPending(false);
      });
    return () => controller.abort();
    // `key` captures module, selection and retry attempts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return {
    response,
    error,
    loading: pending && response === null,
    refreshing: pending && response !== null,
    retry: () => setAttempt((n) => n + 1),
  };
}
