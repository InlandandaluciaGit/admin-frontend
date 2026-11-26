import type { Metadata } from "next";
import { Suspense } from "react";
import { LeadsModule } from "@/components/analytics/modules/LeadsModule";
import { GlobalLoader } from "@/components/ui/GlobalLoader";

export const metadata: Metadata = { title: "Lead sources" };

/** Reads the date range from the URL on the client, so it renders inside Suspense. */
export default function Page() {
  return (
    <Suspense fallback={<GlobalLoader variant="content" />}>
      <LeadsModule />
    </Suspense>
  );
}
