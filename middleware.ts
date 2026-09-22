import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig, isAuthConfigured } from "@/auth";
import { SECURITY_HEADERS } from "@/lib/security/headers";

/**
 * middleware.ts — the gate in front of the terminal.
 *
 *  1. Security headers on every response (CSP, HSTS, no-frame, no-sniff …).
 *  2. /dashboard and /api/session require a signed-in Google user when auth is
 *     configured. Without AUTH_GOOGLE_ID the terminal runs in guest mode so a
 *     fresh clone still works out of the box.
 *  3. Signed-in users hitting /login are sent straight to the terminal.
 */
const { auth } = NextAuth(authConfig);

const PROTECTED = ["/dashboard", "/api/session"];

function withHeaders(res: NextResponse) {
  for (const { key, value } of SECURITY_HEADERS) res.headers.set(key, value);
  return res;
}

export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const configured = isAuthConfigured();
  const signedIn = !!req.auth?.user;

  if (configured && !signedIn && PROTECTED.some((p) => pathname.startsWith(p))) {
    if (pathname.startsWith("/api/")) {
      return withHeaders(NextResponse.json({ error: "Sign in required." }, { status: 401 }));
    }
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("next", pathname + search);
    return withHeaders(NextResponse.redirect(url));
  }

  if (configured && signedIn && pathname === "/login") {
    const next = req.nextUrl.searchParams.get("next");
    const safe = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
    return withHeaders(NextResponse.redirect(new URL(safe, req.nextUrl.origin)));
  }

  return withHeaders(NextResponse.next());
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|bg-video.mp4|.*\\.(?:png|jpg|jpeg|svg|webp|ico|mp4|woff2?)).*)"],
};
