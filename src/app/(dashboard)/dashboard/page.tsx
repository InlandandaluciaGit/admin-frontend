import type { Metadata } from "next";
import { Suspense } from "react";
import { OverviewModule } from "@/components/analytics/modules/OverviewModule";
import { GlobalLoader } from "@/components/ui/GlobalLoader";

export const metadata: Metadata = { title: "Dashboard" };

/** Reads the date range from the URL on the client, so it renders inside Suspense. */
export default function Page() {
  return (
    <Suspense fallback={<GlobalLoader variant="content" />}>
      <OverviewModule />
    </Suspense>
  );
}
