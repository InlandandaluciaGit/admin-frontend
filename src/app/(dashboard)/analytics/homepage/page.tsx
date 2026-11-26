import type { Metadata } from "next";
import { Suspense } from "react";
import { HomepageModule } from "@/components/analytics/modules/HomepageModule";
import { GlobalLoader } from "@/components/ui/GlobalLoader";

export const metadata: Metadata = { title: "Homepage Rotation" };

/** Reads the date range from the URL on the client, so it renders inside Suspense. */
export default function Page() {
  return (
    <Suspense fallback={<GlobalLoader variant="content" />}>
      <HomepageModule />
    </Suspense>
  );
}
