"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { RangeKey, RangeSelection } from "@/types/analytics";

const KEYS: RangeKey[] = ["7d", "30d", "90d", "this_year", "last_year", "custom"];
const ISO = /^\d{4}-\d{2}-\d{2}$/;

/**
 * The analytics date range lives in the URL (?range=…&from=…&to=…), so a view
 * can be bookmarked or shared and survives a refresh. Defaults to the last 30 days.
 */
export function useDateRange(): [RangeSelection, (next: RangeSelection) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const selection = useMemo<RangeSelection>(() => {
    const raw = searchParams.get("range") as RangeKey | null;
    const range = raw && KEYS.includes(raw) ? raw : "30d";
    if (range !== "custom") return { range };
    const from = searchParams.get("from") ?? "";
    const to = searchParams.get("to") ?? "";
    return ISO.test(from) && ISO.test(to) ? { range, from, to } : { range: "30d" };
  }, [searchParams]);

  const setSelection = useCallback(
    (next: RangeSelection) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("range", next.range);
      if (next.range === "custom" && next.from && next.to) {
        params.set("from", next.from);
        params.set("to", next.to);
      } else {
        params.delete("from");
        params.delete("to");
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return [selection, setSelection];
}
