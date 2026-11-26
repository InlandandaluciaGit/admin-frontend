import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { ROUTES } from "@/constants/site";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <EmptyState
        icon="alert"
        title="Page not found"
        description="The page you are looking for does not exist or has been moved."
        action={
          <Link
            href={ROUTES.dashboard}
            className="inline-flex h-10 items-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
          >
            Back to dashboard
          </Link>
        }
      />
    </main>
  );
}
