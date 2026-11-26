"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

function greetingFor(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

/**
 * Time-of-day greeting and today's date in the viewer's timezone.
 * Returns `null` on the server so static HTML never shows a wrong time.
 */
export function useGreeting(): { greeting: string; date: string } | null {
  const snapshot = useSyncExternalStore(
    noopSubscribe,
    () => {
      const now = new Date();
      return `${greetingFor(now.getHours())}|${dateFormatter.format(now)}`;
    },
    () => null,
  );
  if (!snapshot) return null;
  const [greeting, date] = snapshot.split("|");
  return { greeting, date };
}
