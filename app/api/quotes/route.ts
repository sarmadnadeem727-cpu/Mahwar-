import { NextRequest, NextResponse } from "next/server";
import { rateLimit, clientKey, tooMany } from "@/lib/security/rateLimit";
import { fetchQuotes, type QuotesResponse } from "@/lib/market/quotes";

/**
 * /api/quotes?ids=TADAWUL:2222,DFM:EMAAR — server-side quote proxy for the
 * stock screener. The provider key never reaches the browser, and every
 * response is cached for 15 s per instance so a screen polling live prices
 * cannot burn through a provider's credit allowance.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const cache = new Map<string, { at: number; data: QuotesResponse }>();

export async function GET(req: NextRequest) {
  const rl = rateLimit(`quotes:${clientKey(req)}`, 30, 60_000);
  if (!rl.ok) return tooMany(rl);

  const idsParam = req.nextUrl.searchParams.get("ids") ?? "";
  const ids = idsParam.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 80);
  const key = ids.length ? [...ids].sort().join(",") : "*";
  const ttl = key === "*" ? 60_000 : 15_000;

  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttl) {
    return NextResponse.json(hit.data, { headers: { "Cache-Control": `private, max-age=${key === "*" ? 60 : 15}`, "X-Cache": "HIT" } });
  }
  const data = await fetchQuotes(ids);
  cache.set(key, { at: Date.now(), data });
  if (cache.size > 200) cache.delete(cache.keys().next().value as string);
  return NextResponse.json(data, { headers: { "Cache-Control": `private, max-age=${key === "*" ? 60 : 15}`, "X-Cache": "MISS" } });
}
