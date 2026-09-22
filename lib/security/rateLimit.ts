/**
 * lib/security/rateLimit.ts — sliding-window limiter for API routes.
 *
 * In-memory by design: the terminal has no database, and each serverless
 * instance protecting itself is enough to stop casual abuse of the news and
 * DCF endpoints. Swap `store` for Redis/Upstash if you ever scale out.
 */
interface Bucket { hits: number[] }

const store = new Map<string, Bucket>();
const SWEEP_EVERY = 5 * 60 * 1000;
let lastSweep = Date.now();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetMs: number;
}

export function rateLimit(key: string, limit = 60, windowMs = 60_000): RateLimitResult {
  const now = Date.now();
  if (now - lastSweep > SWEEP_EVERY) {
    for (const [k, b] of store) if (b.hits.every((t) => now - t > windowMs)) store.delete(k);
    lastSweep = now;
  }
  const bucket = store.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);
  const ok = bucket.hits.length < limit;
  if (ok) bucket.hits.push(now);
  store.set(key, bucket);
  const oldest = bucket.hits[0] ?? now;
  return { ok, remaining: Math.max(0, limit - bucket.hits.length), resetMs: Math.max(0, windowMs - (now - oldest)) };
}

/** Best-effort client identifier behind Vercel / Cloudflare / nginx. */
export function clientKey(req: Request): string {
  const h = req.headers;
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    h.get("cf-connecting-ip") ||
    "anonymous"
  );
}

export function tooMany(result: RateLimitResult) {
  return new Response(JSON.stringify({ error: "Too many requests. Slow down." }), {
    status: 429,
    headers: {
      "Content-Type": "application/json",
      "Retry-After": String(Math.ceil(result.resetMs / 1000)),
      "X-RateLimit-Remaining": String(result.remaining),
    },
  });
}
