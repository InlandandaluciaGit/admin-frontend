import { GlobalLoader } from "@/components/ui/GlobalLoader";

/** Route-level fallback inside the dashboard shell (sidebar and header stay put). */
export default function Loading() {
  return <GlobalLoader variant="content" />;
}
