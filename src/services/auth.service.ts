/**
 * Admin authentication service: the single integration point for auth.
 *
 * Talks to the Inland API at /api/admin/auth/*. Requests stay on this app's
 * own origin, and `next.config.ts` rewrites them to the API (ADMIN_API_URL). The
 * session lives in an HTTP-only cookie set by the API, so this module never
 * sees or stores a token. No localStorage is used.
 */
import type { AdminPartnerAccess, AdminUser, LoginCredentials, LoginOptions } from "@/types/auth";

const AUTH_BASE = "/api/admin/auth";

export class AuthError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

interface ApiAdmin {
  mainContactId: number;
  username: string;
  name: string | null;
  email: string | null;
  partners: AdminPartnerAccess[];
  authorizedPartnerIds: number[];
  authorizedPartnerContactIds: number[];
  selectedPartnerContactId: number;
  selectedPartnerId: number | null;
  session: { expiresAt: string };
}

function toAdminUser(admin: ApiAdmin): AdminUser {
  return {
    mainContactId: admin.mainContactId,
    username: admin.username,
    name: admin.name?.trim() || admin.username,
    email: admin.email,
    partners: admin.partners,
    authorizedPartnerIds: admin.authorizedPartnerIds,
    authorizedPartnerContactIds: admin.authorizedPartnerContactIds,
    selectedPartnerContactId: admin.selectedPartnerContactId,
    selectedPartnerId: admin.selectedPartnerId,
    sessionExpiresAt: admin.session.expiresAt,
  };
}

const FALLBACK_MESSAGES: Record<number, string> = {
  401: "Incorrect username or password. Please try again.",
  429: "Too many sign-in attempts. Please wait a few minutes and try again.",
  503: "Sign-in is temporarily unavailable. Please try again shortly.",
};

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  try {
    return await fetch(`${AUTH_BASE}${path}`, {
      ...init,
      credentials: "same-origin",
      cache: "no-store",
      headers: { Accept: "application/json", ...(init.body ? { "Content-Type": "application/json" } : {}), ...init.headers },
    });
  } catch {
    throw new AuthError("Unable to reach the sign-in service. Check your connection and try again.", "NETWORK_ERROR", 0);
  }
}

async function errorFrom(response: Response): Promise<AuthError> {
  let body: { error?: string; message?: string } = {};
  try {
    body = await response.json();
  } catch {
    // Non-JSON error (e.g. the API is down behind the rewrite).
  }
  const status = response.status;
  const message =
    body.message ?? FALLBACK_MESSAGES[status] ?? (status >= 500 ? FALLBACK_MESSAGES[503] : "Something went wrong. Please try again.");
  return new AuthError(message, body.error ?? `HTTP_${status}`, status);
}

export async function login(credentials: LoginCredentials, options: LoginOptions = {}): Promise<AdminUser> {
  const response = await request("/login", {
    method: "POST",
    body: JSON.stringify({ username: credentials.username, password: credentials.password, remember: Boolean(options.remember) }),
  });
  if (!response.ok) throw await errorFrom(response);
  const body = (await response.json()) as { admin: ApiAdmin };
  return toAdminUser(body.admin);
}

export async function logout(): Promise<void> {
  // The API clears the cookie and invalidates the session. Treat failures as signed out locally anyway.
  try {
    await request("/logout", { method: "POST" });
  } catch {
    // Ignore: the proxy will still send the user to /login if the session survives.
  }
}

/** The signed-in admin, or null when there is no valid session. Throws on other failures. */
export async function fetchCurrentUser(): Promise<AdminUser | null> {
  const response = await request("/me");
  if (response.status === 401) return null;
  if (!response.ok) throw await errorFrom(response);
  const body = (await response.json()) as { admin: ApiAdmin };
  return toAdminUser(body.admin);
}
