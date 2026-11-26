"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ROUTES } from "@/constants/site";
import { fetchCurrentUser } from "@/services/auth.service";
import type { AdminUser } from "@/types/auth";

interface AdminSessionValue {
  user: AdminUser | null;
  /** Re-checks the session with the API; redirects to /login when it has ended. */
  refresh: () => Promise<void>;
}

const AdminSessionContext = createContext<AdminSessionValue>({ user: null, refresh: async () => {} });

/**
 * Loads the signed-in administrator for the dashboard area.
 *
 * `src/proxy.ts` already validates the session on the server before any
 * protected page renders. This provider fetches the admin's identity for the
 * UI and re-validates when the window regains focus, so a session that ended
 * (logout in another tab, expiry, admin archived) sends the user back to /login.
 */
export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);

  const refresh = useCallback(async () => {
    try {
      const current = await fetchCurrentUser();
      if (current) {
        setUser(current);
      } else {
        setUser(null);
        router.replace(ROUTES.login);
      }
    } catch {
      // Transient API problem: keep the current state; the next check will retry.
    }
  }, [router]);

  useEffect(() => {
    // Initial load of the admin's identity; state is set when the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  const value = useMemo(() => ({ user, refresh }), [user, refresh]);
  return <AdminSessionContext.Provider value={value}>{children}</AdminSessionContext.Provider>;
}

export function useAdminSession(): AdminSessionValue {
  return useContext(AdminSessionContext);
}
