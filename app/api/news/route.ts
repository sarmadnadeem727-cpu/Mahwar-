import { NextRequest, NextResponse } from "next/server";
import { rateLimit, clientKey, tooMany } from "@/lib/security/rateLimit";

/**
 * /api/news — two lanes, one wire.
 *   finance      : GCC capital markets, Tadawul, sukuk, central banks
 *   supply_chain : ports, shipping, logistics, freight, NEOM, Etihad Rail, procurement
 *
 * Provider order: Marketaux (if MARKETAUX_API_KEY) → Google News RSS → honest empty.
 * Every article is tagged with a lane and a finer category derived from its title.
 */

export type NewsLane = "finance" | "supply_chain";
export type NewsCategory =
  | "GCC" | "SAUDI" | "MACRO" | "ISLAMIC_FINANCE"
  | "PORTS_SHIPPING" | "LOGISTICS" | "PROCUREMENT" | "INDUSTRY";

export interface NewsArticle {
  id: string;
  title: string;
  titleAr?: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  lane: NewsLane;
  category: NewsCategory;
}

/**
 * Upstream requests carry nothing from the visitor: a fixed User-Agent, no
 * referrer, no cookies, no forwarded IP. The server is the only client the
 * news providers ever see.
 */
const UPSTREAM: RequestInit = {
  headers: { "User-Agent": "mahwar-terminal/5 (+news-wire)", Accept: "application/rss+xml, application/json;q=0.9, */*;q=0.5" },
  referrerPolicy: "no-referrer",
  credentials: "omit",
};

/** Several searches per lane, merged and de-duplicated, for breadth. */
const RSS_QUERIES: Record<NewsLane, string[]> = {
  finance: [
    "Saudi Tadawul OR GCC capital markets OR Gulf stocks",
    "sukuk OR Islamic finance OR SAMA OR Gulf central bank",
    "DFM OR ADX OR Qatar Stock Exchange OR Boursa Kuwait IPO",
  ],
  supply_chain: [
    "GCC supply chain OR Saudi logistics OR Middle East logistics",
    "Jebel Ali OR DP World OR Mawani OR Hamad Port OR Gulf shipping freight",
    "Red Sea shipping OR Suez Canal OR Strait of Hormuz tanker container",
    "Etihad Rail OR Saudi Landbridge OR NEOM Oxagon OR Gulf warehousing procurement",
  ],
};

const FINANCE_RULES: [RegExp, NewsCategory][] = [
  [/sukuk|islamic|shariah|takaful|murabaha/i, "ISLAMIC_FINANCE"],
  [/saudi|tadawul|aramco|riyadh|pif\b|sama\b/i, "SAUDI"],
  [/oil|opec|brent|energy|inflation|gdp|central bank|rate/i, "MACRO"],
];
const SUPPLY_RULES: [RegExp, NewsCategory][] = [
  [/port|shipping|vessel|container|jebel ali|hormuz|red sea|suez|maritime|tanker/i, "PORTS_SHIPPING"],
  [/procure|tender|supplier|sourcing|contract award/i, "PROCUREMENT"],
  [/factory|manufactur|industrial|plant|neom|oxagon|mining/i, "INDUSTRY"],
];

function categorise(title: string, lane: NewsLane): NewsCategory {
  const rules = lane === "finance" ? FINANCE_RULES : SUPPLY_RULES;
  const hit = rules.find(([re]) => re.test(title));
  return hit ? hit[1] : lane === "finance" ? "GCC" : "LOGISTICS";
}

function decode(s: string) {
  return s
    .replace(/<!\[CDATA\[(.*?)\]\]>/gis, "$1")
    .replace(/&amp;/g, "&").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .trim();
}

function parseRss(xml: string, lane: NewsLane): NewsArticle[] {
  const items = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
  return items.slice(0, 15).map((item, idx) => {
    const title = decode(item.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "");
    const link = decode(item.match(/<link>([\s\S]*?)<\/link>/i)?.[1] ?? "");
    const pub = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1];
    const source = decode(item.match(/<source[^>]*>([\s\S]*?)<\/source>/i)?.[1] ?? "Google News");
    const clean = title.replace(/ - [^-]+$/, "").trim();
    return {
      id: `${lane}-${idx}-${Buffer.from(link).toString("base64url").slice(0, 12)}`,
      title: clean,
      summary: clean,
      source,
      url: link,
      publishedAt: pub ? new Date(pub).toISOString() : new Date().toISOString(),
      lane,
      category: categorise(clean, lane),
    };
  }).filter((a) => a.title && a.url);
}

async function fromMarketaux(key: string, lane: NewsLane): Promise<NewsArticle[]> {
  const params = new URLSearchParams({
    api_token: key,
    countries: "sa,ae,qa,kw,bh,om",
    language: "en",
    limit: "12",
    filter_entities: "true",
  });
  if (lane === "supply_chain") params.set("search", "port | shipping | logistics | freight | supply chain");
  const res = await fetch(`https://api.marketaux.com/v1/news/all?${params}`, { ...UPSTREAM, next: { revalidate: 300 } });
  if (!res.ok) return [];
  const data = await res.json();
  return (data?.data ?? []).map((it: any, i: number) => ({
    id: it.uuid || `mx-${lane}-${i}`,
    title: it.title || "",
    summary: it.description || it.snippet || "",
    source: it.source || "Marketaux",
    url: it.url || "",
    publishedAt: it.published_at || new Date().toISOString(),
    lane,
    category: categorise(it.title || "", lane),
  })).filter((a: NewsArticle) => a.title && a.url);
}

async function fromRss(lane: NewsLane): Promise<NewsArticle[]> {
  const batches = await Promise.all(
    RSS_QUERIES[lane].map(async (query) => {
      try {
        const res = await fetch(`https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`, { ...UPSTREAM, next: { revalidate: 300 } });
        return res.ok ? parseRss(await res.text(), lane) : [];
      } catch {
        return [];
      }
    })
  );
  const seen = new Set<string>();
  return batches.flat().filter((a) => {
    const k = a.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

async function loadLane(lane: NewsLane, key?: string): Promise<{ articles: NewsArticle[]; provider: string | null }> {
  if (key) {
    try {
      const list = await fromMarketaux(key, lane);
      if (list.length) return { articles: list, provider: "Marketaux" };
    } catch (e) {
      console.warn(`[news] marketaux ${lane} failed`, e);
    }
  }
  try {
    const list = await fromRss(lane);
    if (list.length) return { articles: list, provider: "Google News RSS" };
  } catch (e) {
    console.warn(`[news] rss ${lane} failed`, e);
  }
  return { articles: [], provider: null };
}

export const revalidate = 300;

export async function GET(req: NextRequest) {
  const rl = rateLimit(`news:${clientKey(req)}`, 30, 60_000);
  if (!rl.ok) return tooMany(rl);
  const laneParam = req.nextUrl.searchParams.get("lane");
  const lanes: NewsLane[] = laneParam === "finance" || laneParam === "supply_chain" ? [laneParam] : ["finance", "supply_chain"];
  const key = process.env.MARKETAUX_API_KEY || undefined;

  const results = await Promise.all(lanes.map((l) => loadLane(l, key)));
  const articles = results
    .flatMap((r) => r.articles)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  const providers = Array.from(new Set(results.map((r) => r.provider).filter(Boolean))) as string[];

  return NextResponse.json({
    articles,
    provider: providers.length ? providers.join(" + ") : null,
    lanes: Object.fromEntries(lanes.map((l, i) => [l, results[i].articles.length])),
    error: articles.length ? null : "No news provider reachable. Set MARKETAUX_API_KEY or allow outbound access to news.google.com.",
  });
}

