"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { ROUTES } from "@/constants/site";
import { logout } from "@/services/auth.service";

/**
 * Logout action shared by the sidebar and the user menu. The API invalidates
 * the server-side session and clears the HTTP-only cookie.
 */
export function useLogout() {
  const router = useRouter();
  return useCallback(async () => {
    await logout();
    router.replace(ROUTES.login);
    router.refresh();
  }, [router]);
}
