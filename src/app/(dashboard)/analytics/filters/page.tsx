import type { Metadata } from "next";
import { Suspense } from "react";
import { FiltersModule } from "@/components/analytics/modules/FiltersModule";
import { GlobalLoader } from "@/components/ui/GlobalLoader";

export const metadata: Metadata = { title: "Property Filters" };

/** Reads the date range from the URL on the client, so it renders inside Suspense. */
export default function Page() {
  return (
    <Suspense fallback={<GlobalLoader variant="content" />}>
      <FiltersModule />
    </Suspense>
  );
}
