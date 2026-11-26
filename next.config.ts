import type { NextConfig } from "next";

/**
 * Base URL of the Inland API (BackEnd/). Server-side only: the browser always
 * calls this app's own origin (/api/admin/...), and Next.js proxies the request.
 * That keeps the session cookie first-party and HTTP-only, with no CORS.
 */
const ADMIN_API_URL = (process.env.ADMIN_API_URL || "http://localhost:4002").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  async rewrites() {
    return [{ source: "/api/admin/:path*", destination: `${ADMIN_API_URL}/api/admin/:path*` }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
