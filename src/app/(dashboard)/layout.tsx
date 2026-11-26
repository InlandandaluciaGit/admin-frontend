import { AdminSessionProvider } from "@/components/auth/AdminSessionProvider";
import { DashboardShell } from "@/components/layout/DashboardShell";

/**
 * Layout for all authenticated admin routes.
 *
 * Access is enforced on the server by `src/proxy.ts`, which validates the
 * session with the API before any page here renders. `AdminSessionProvider`
 * loads the admin's identity for the UI and re-validates on focus.
 */
export default function DashboardLayout({ children }: LayoutProps<"/">) {
  return (
    <AdminSessionProvider>
      <DashboardShell>{children}</DashboardShell>
    </AdminSessionProvider>
  );
}
