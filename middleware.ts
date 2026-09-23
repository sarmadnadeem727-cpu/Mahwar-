import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SECURITY_HEADERS, PRIVATE_HEADERS } from "@/lib/security/headers";

/**
 * middleware.ts — hardening headers only.
 *
 * There is no authentication in Mahwar: the terminal is anonymous and every
 * analysis lives in the visitor's own browser. This middleware just applies
 * the strict Content-Security-Policy and friends to every response, and marks
 * the terminal itself as never-cached / never-indexed.
 */
const PRIVATE = ["/dashboard"];

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;
  for (const { key, value } of SECURITY_HEADERS) res.headers.set(key, value);
  if (PRIVATE.some((p) => pathname.startsWith(p))) for (const { key, value } of PRIVATE_HEADERS) res.headers.set(key, value);
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico|mp4|woff2?)).*)"],
};
