import type { Metadata } from "next";
import { Suspense } from "react";
import { SalesModule } from "@/components/analytics/modules/SalesModule";
import { GlobalLoader } from "@/components/ui/GlobalLoader";

export const metadata: Metadata = { title: "Sales Performance" };

/** Reads the date range from the URL on the client, so it renders inside Suspense. */
export default function Page() {
  return (
    <Suspense fallback={<GlobalLoader variant="content" />}>
      <SalesModule />
    </Suspense>
  );
}
