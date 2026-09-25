/**
 * lib/security/headers.ts — the hardening layer applied to every response.
 *
 * Content-Security-Policy is deliberately strict: scripts and styles only from
 * self (plus the inline styles Next/Framer need), images from self, connections
 * to self + the news providers, frames from nowhere. Market-data providers are
 * called server-side (/api/quotes) so they never appear in connect-src. There is no auth, so no
 * third-party identity origin is allowed anywhere.
 *
 * PRIVATE_HEADERS go on the terminal itself: a visitor's working screen must
 * never land in a shared cache or a search index.
 */
const isProd = process.env.NODE_ENV === "production";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "connect-src 'self' https://news.google.com https://api.marketaux.com",
  "frame-src 'none'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

export const SECURITY_HEADERS: { key: string; value: string }[] = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=(), browsing-topics=(), attribution-reporting=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  // Off: prefetching leaks the hostnames a visitor might open next to their resolver.
  { key: "X-DNS-Prefetch-Control", value: "off" },
  ...(isProd ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : []),
];

/** Extra headers for /dashboard. */
export const PRIVATE_HEADERS: { key: string; value: string }[] = [
  { key: "Cache-Control", value: "private, no-store, max-age=0" },
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
];
