"use client";

import { useAdminSession } from "@/components/auth/AdminSessionProvider";
import type { AdminUser } from "@/types/auth";

/**
 * Current admin, or `null` while it is loading / when signed out.
 * Pages stay statically rendered; identity fills in on the client.
 */
export function useCurrentUser(): AdminUser | null {
  return useAdminSession().user;
}
