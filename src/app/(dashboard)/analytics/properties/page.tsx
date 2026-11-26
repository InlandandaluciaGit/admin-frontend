import type { Metadata } from "next";
import { Suspense } from "react";
import { PropertiesModule } from "@/components/analytics/modules/PropertiesModule";
import { GlobalLoader } from "@/components/ui/GlobalLoader";

export const metadata: Metadata = { title: "Property Performance" };

/** Reads the date range from the URL on the client, so it renders inside Suspense. */
export default function Page() {
  return (
    <Suspense fallback={<GlobalLoader variant="content" />}>
      <PropertiesModule />
    </Suspense>
  );
}
