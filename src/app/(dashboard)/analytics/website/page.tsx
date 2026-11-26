import type { Metadata } from "next";
import { Suspense } from "react";
import { WebsiteModule } from "@/components/analytics/modules/WebsiteModule";
import { GlobalLoader } from "@/components/ui/GlobalLoader";

export const metadata: Metadata = { title: "Website Performance" };

/** Reads the date range from the URL on the client, so it renders inside Suspense. */
export default function Page() {
  return (
    <Suspense fallback={<GlobalLoader variant="content" />}>
      <WebsiteModule />
    </Suspense>
  );
}
