import { NextResponse, type NextRequest } from "next/server";
import { ROUTES } from "@/constants/site";

/**
 * Route guard. Runs on the server before any page renders.
 *
 * The session is an opaque HTTP-only cookie issued by the Inland API. Its
 * presence alone proves nothing, so the guard asks the API to validate it
 * (GET /api/admin/auth/me) before letting a protected page render. When the API
 * cannot be reached the guard fails closed and sends the user to /login.
 */
const SESSION_COOKIE = "inland_admin_session";
const ADMIN_API_URL = (process.env.ADMIN_API_URL || "http://localhost:4002").replace(/\/+$/, "");
const PUBLIC_PATHS = new Set<string>([ROUTES.login]);

async function hasValidSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  // Forward the client address so the API's per-IP rate limiting does not lump every admin together.
  const clientIp = request.headers.get("x-forwarded-for")?.split(",").pop()?.trim();
  try {
    const response = await fetch(`${ADMIN_API_URL}/api/admin/auth/me`, {
      headers: {
        cookie: `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
        accept: "application/json",
        ...(clientIp ? { "x-forwarded-for": clientIp } : {}),
      },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

function withoutStaleCookie(response: NextResponse, request: NextRequest, authenticated: boolean): NextResponse {
  if (!authenticated && request.cookies.has(SESSION_COOKIE)) response.cookies.delete(SESSION_COOKIE);
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = await hasValidSession(request);
  const isPublic = PUBLIC_PATHS.has(pathname);

  if (pathname === ROUTES.home) {
    return withoutStaleCookie(
      NextResponse.redirect(new URL(isAuthenticated ? ROUTES.dashboard : ROUTES.login, request.url)),
      request,
      isAuthenticated,
    );
  }
  if (!isPublic && !isAuthenticated) {
    return withoutStaleCookie(NextResponse.redirect(new URL(ROUTES.login, request.url)), request, false);
  }
  if (isPublic && isAuthenticated) {
    return NextResponse.redirect(new URL(ROUTES.dashboard, request.url));
  }
  return withoutStaleCookie(NextResponse.next(), request, isAuthenticated);
}

export const config = {
  // Everything except API calls (rewritten to the Inland API), Next internals and static files.
  matcher: ["/((?!api/|_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)"],
};
