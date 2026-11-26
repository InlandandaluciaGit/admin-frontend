import { redirect } from "next/navigation";

/** Alias: the page lives at /analytics/homepage (sidebar and dashboard links). */
export default function Page() {
  redirect("/analytics/homepage");
}
