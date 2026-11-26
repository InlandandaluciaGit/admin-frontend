import { redirect } from "next/navigation";

/** Alias: the page lives at /analytics/filters (sidebar link). */
export default function Page() {
  redirect("/analytics/filters");
}
