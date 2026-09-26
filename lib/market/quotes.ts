/**
 * lib/market/quotes.ts — live quote providers (server only).
 *
 * Default, free, no key: TradingView's public scanner endpoint
 * (`scanner.tradingview.com/global/scan`). One POST returns price, change,
 * volume AND fundamentals (market cap, P/E, P/B, yield, ROE, revenue growth,
 * 52-week range) for the whole universe. Prices are real-time or 15-minute
 * delayed depending on the exchange; the endpoint is undocumented, so treat it
 * as best-effort and switch to a keyed provider for anything production-grade.
 *
 * For a supported feed add ONE of:
 *
 *   TWELVEDATA_API_KEY   ← recommended. REST + WebSocket, covers Tadawul
 *                          (XSAU), DFM, ADX, QSE, Boursa Kuwait, Bahrain and
 *                          Muscat by MIC code. Free plan for development; GCC
 *                          real-time quotes need a paid tier (EOD data on the
 *                          cheaper tiers, delayed/real-time on the higher ones).
 *   EODHD_API_KEY        ← alternative with strong fundamentals; Tadawul via
 *                          the `.SR` suffix. Other GCC suffixes must be
 *                          verified against EODHD's exchange list.
 *
 * Both adapters normalise into `Quote`. Nothing from the visitor is forwarded:
 * the server is the only client the provider ever sees.
 */
import { UNIVERSE, EXCHANGE_MAP, TV_EXCHANGE_TO_MAHWAR, mapTVSector, type Security, type Sector } from "./universe";

export type Provider = "tradingview" | "twelvedata" | "eodhd" | "none";

export interface Quote {
  id: string;
  price: number;
  change: number;
  changePct: number;
  open?: number;
  high?: number;
  low?: number;
  prevClose?: number;
  volume?: number;
  /** ISO timestamp of the tick. */
  asOf: string;
  /** Live if the provider says the market is open; otherwise the last close. */
  live: boolean;
  /** Fundamentals, when the provider supplies them (TradingView does). They override the reference snapshot. */
  fundamentals?: Partial<LiveFundamentals>;
}

export interface LiveFundamentals {
  /** Local currency, billions. */
  marketCapB: number;
  pe: number;
  pb: number;
  divYield: number;
  roe: number;
  revenueGrowth: number;
  low52: number;
  high52: number;
}

export interface QuotesResponse {
  provider: Provider;
  live: boolean;
  asOf: string;
  quotes: Record<string, Quote>;
  /** Dynamic securities universe when all GCC stocks are fetched. */
  securities?: Security[];
  /** Human-readable reason when `provider === "none"` or the call failed. */
  note?: string;
}

const UPSTREAM: RequestInit = {
  headers: { "User-Agent": "mahwar-terminal/7 (+stock-screener)", Accept: "application/json" },
  referrerPolicy: "no-referrer",
  credentials: "omit",
  cache: "no-store",
};

const num = (v: unknown): number | undefined => {
  const n = typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? n : undefined;
};

export function activeProvider(): Provider {
  const forced = process.env.MARKET_DATA_PROVIDER as Provider | undefined;
  if (forced === "none") return "none";
  if (forced === "tradingview") return "tradingview";
  if (process.env.TWELVEDATA_API_KEY) return "twelvedata";
  if (process.env.EODHD_API_KEY) return "eodhd";
  return "tradingview";
}

/** Columns requested from the scanner, in order — the response rows come back positionally. */
const TV_COLUMNS = [
  "close", "change", "change_abs", "open", "high", "low", "volume", "update_mode",
  "market_cap_basic", "price_earnings_ttm", "price_book_ratio", "dividends_yield_current",
  "return_on_equity", "total_revenue_yoy_growth_ttm", "price_52_week_low", "price_52_week_high",
] as const;

const TV_ALL_GCC_COLUMNS = [
  "name", "description", "close", "change", "change_abs", "open", "high", "low", "volume",
  "market_cap_basic", "price_earnings_ttm", "price_book_ratio",
  "dividends_yield_current", "return_on_equity", "total_revenue_yoy_growth_ttm",
  "total_debt", "total_assets", "sector", "industry", "exchange",
  "price_52_week_low", "price_52_week_high", "update_mode",
] as const;

const ISLAMIC_BANK_TERMS = [
  "islamic", "إسلامي", "rajhi", "الراجحي", "alinma", "الإنماء",
  "bilad", "البلاد", "boubyan", "بوبيان", "warba", "وربة",
  "dib", "sib", "baraka", "qib", "مصرف قطر الإسلامي", "بيت التمويل"
];

function isShariahIndicative(sec: Sector, name: string, desc: string, debt?: number, assets?: number): boolean {
  const text = (name + " " + desc).toLowerCase();
  if (sec === "Banks") {
    return ISLAMIC_BANK_TERMS.some((t) => text.includes(t));
  }
  if (assets && assets > 0 && debt !== undefined) {
    return debt / assets <= 0.33;
  }
  return true;
}

/**
 * Query TradingView's global scanner for the entire universe of publicly traded
 * GCC equities (~750 stocks across Tadawul, ADX, DFM, QSE, Boursa Kuwait, Bahrain).
 */
async function fetchTradingViewAllGCC(): Promise<{ quotes: Record<string, Quote>; securities: Security[] }> {
  const quotes: Record<string, Quote> = {};
  const securities: Security[] = [];
  const body = {
    filter: [
      { left: "exchange", operation: "in_range", right: ["TADAWUL", "DFM", "ADX", "QSE", "KSE", "BAHRAIN"] },
      { left: "type", operation: "equal", right: "stock" },
    ],
    columns: [...TV_ALL_GCC_COLUMNS],
    sort: { sortBy: "market_cap_basic", sortOrder: "desc" },
    range: [0, 1000],
  };

  const res = await fetch("https://scanner.tradingview.com/global/scan", {
    ...UPSTREAM,
    method: "POST",
    headers: {
      ...(UPSTREAM.headers as Record<string, string>),
      "Content-Type": "application/json",
      Origin: "https://www.tradingview.com",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`TradingView GCC scan ${res.status}`);
  const json = (await res.json()) as { data?: { s: string; d: unknown[] }[] };
  const idx = (name: (typeof TV_ALL_GCC_COLUMNS)[number]) => TV_ALL_GCC_COLUMNS.indexOf(name);
  const now = new Date().toISOString();

  for (const row of json.data ?? []) {
    const s = row.s;
    const tvEx = String(row.d[idx("exchange")] ?? "");
    const exchange = TV_EXCHANGE_TO_MAHWAR[tvEx];
    if (!exchange) continue;

    const code = String(row.d[idx("name")] || s.split(":")[1] || "");
    const id = `${exchange}:${code}`;
    const price = num(row.d[idx("close")]) ?? 0;
    if (price <= 0) continue;

    const existing = UNIVERSE.find(
      (u) => u.symbols.tradingview === s || u.id === id || (u.code === code && u.exchange === exchange)
    );

    const desc = String(row.d[idx("description")] || "");
    const name = existing?.name ?? desc ?? code;
    const nameAr = existing?.nameAr ?? name;
    const tvSec = String(row.d[idx("sector")] ?? "");
    const tvInd = String(row.d[idx("industry")] ?? "");
    const sector = existing?.sector ?? mapTVSector(tvSec, tvInd);

    const cap = num(row.d[idx("market_cap_basic")]);
    const marketCapB = cap !== undefined ? cap / 1e9 : (existing?.ref.marketCapB ?? 0);
    const pe = num(row.d[idx("price_earnings_ttm")]) ?? 0;
    const pb = num(row.d[idx("price_book_ratio")]) ?? 0;
    const divYield = num(row.d[idx("dividends_yield_current")]) ?? 0;
    const roe = num(row.d[idx("return_on_equity")]) ?? 0;
    const revenueGrowth = num(row.d[idx("total_revenue_yoy_growth_ttm")]) ?? 0;
    const totalDebt = num(row.d[idx("total_debt")]);
    const totalAssets = num(row.d[idx("total_assets")]);
    const debtToAssets = totalAssets && totalAssets > 0 && totalDebt !== undefined
      ? (totalDebt / totalAssets) * 100
      : (existing?.ref.debtToAssets ?? 0);
    const low52 = num(row.d[idx("price_52_week_low")]) ?? price;
    const high52 = num(row.d[idx("price_52_week_high")]) ?? price;

    const shariah = existing?.shariahIndicative ?? isShariahIndicative(sector, name, desc, totalDebt, totalAssets);
    const mode = String(row.d[idx("update_mode")] ?? "");
    const isLive = mode.includes("streaming");

    const sec: Security = {
      id,
      code,
      name,
      nameAr,
      exchange,
      sector,
      symbols: {
        tradingview: s,
        twelvedata: `${code}:${EXCHANGE_MAP[exchange].mic}`,
        eodhd: EXCHANGE_MAP[exchange].eodhd ? `${code}.${EXCHANGE_MAP[exchange].eodhd}` : undefined,
      },
      ref: {
        price,
        marketCapB,
        pe,
        pb,
        divYield,
        roe,
        revenueGrowth,
        debtToAssets,
        low52,
        high52,
      },
      shariahIndicative: shariah,
    };

    securities.push(sec);
    quotes[id] = {
      id,
      price,
      change: num(row.d[idx("change_abs")]) ?? 0,
      changePct: num(row.d[idx("change")]) ?? 0,
      open: num(row.d[idx("open")]),
      high: num(row.d[idx("high")]),
      low: num(row.d[idx("low")]),
      volume: num(row.d[idx("volume")]),
      asOf: now,
      live: isLive,
      fundamentals: {
        marketCapB,
        pe,
        pb,
        divYield,
        roe,
        revenueGrowth,
        low52,
        high52,
      },
    };
  }

  // Preserve any curated UNIVERSE securities not in TradingView scanner (e.g. MSX Muscat)
  for (const u of UNIVERSE) {
    if (!securities.some((s) => s.id === u.id)) {
      securities.push(u);
      quotes[u.id] = {
        id: u.id,
        price: u.ref.price,
        change: 0,
        changePct: 0,
        asOf: now,
        live: false,
        fundamentals: { ...u.ref },
      };
    }
  }

  return { quotes, securities };
}

/**
 * TradingView scanner — free, keyless. POST the exact tickers we want and read
 * the columns back positionally.
 */
async function fetchTradingView(securities: Security[]): Promise<Record<string, Quote>> {
  const out: Record<string, Quote> = {};
  const body = {
    symbols: { tickers: securities.map((s) => s.symbols.tradingview), query: { types: [] } },
    columns: [...TV_COLUMNS],
  };
  const res = await fetch("https://scanner.tradingview.com/global/scan", {
    ...UPSTREAM,
    method: "POST",
    headers: { ...(UPSTREAM.headers as Record<string, string>), "Content-Type": "application/json", Origin: "https://www.tradingview.com" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`TradingView scanner ${res.status}`);
  const json = (await res.json()) as { data?: { s: string; d: unknown[] }[] };
  const idx = (name: (typeof TV_COLUMNS)[number]) => TV_COLUMNS.indexOf(name);
  const now = new Date().toISOString();
  for (const row of json.data ?? []) {
    const sec = securities.find((s) => s.symbols.tradingview === row.s);
    const price = num(row.d[idx("close")]);
    if (!sec || price === undefined) continue;
    const mode = String(row.d[idx("update_mode")] ?? "");
    const cap = num(row.d[idx("market_cap_basic")]);
    out[sec.id] = {
      id: sec.id, price,
      change: num(row.d[idx("change_abs")]) ?? 0,
      changePct: num(row.d[idx("change")]) ?? 0,
      open: num(row.d[idx("open")]), high: num(row.d[idx("high")]), low: num(row.d[idx("low")]),
      volume: num(row.d[idx("volume")]),
      asOf: now,
      // "streaming" = real-time, "delayed_streaming_*" = delayed intraday, "endofday" = closed.
      live: mode.includes("streaming"),
      fundamentals: {
        marketCapB: cap !== undefined ? cap / 1e9 : undefined,
        pe: num(row.d[idx("price_earnings_ttm")]),
        pb: num(row.d[idx("price_book_ratio")]),
        divYield: num(row.d[idx("dividends_yield_current")]),
        roe: num(row.d[idx("return_on_equity")]),
        revenueGrowth: num(row.d[idx("total_revenue_yoy_growth_ttm")]),
        low52: num(row.d[idx("price_52_week_low")]),
        high52: num(row.d[idx("price_52_week_high")]),
      },
    };
  }
  return out;
}

/** Twelve Data batch quote: /quote?symbol=2222:XSAU,EMAAR:XDFM */
async function fetchTwelveData(securities: Security[], key: string): Promise<Record<string, Quote>> {
  const out: Record<string, Quote> = {};
  // Twelve Data caps batch size; 25 keeps well inside it and inside one credit-burst.
  for (let i = 0; i < securities.length; i += 25) {
    const chunk = securities.slice(i, i + 25);
    const symbols = chunk.map((s) => s.symbols.twelvedata).join(",");
    const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbols)}&apikey=${encodeURIComponent(key)}`;
    const res = await fetch(url, UPSTREAM);
    if (!res.ok) throw new Error(`Twelve Data ${res.status}`);
    const json = (await res.json()) as Record<string, Record<string, unknown>> | Record<string, unknown>;
    // One symbol → flat object; many → object keyed by symbol.
    const entries: [string, Record<string, unknown>][] = chunk.length === 1
      ? [[chunk[0].symbols.twelvedata, json as Record<string, unknown>]]
      : Object.entries(json as Record<string, Record<string, unknown>>);
    for (const [sym, q] of entries) {
      const sec = chunk.find((s) => s.symbols.twelvedata === sym || s.symbols.twelvedata.split(":")[0] === sym);
      if (!sec || !q || q.status === "error") continue;
      const price = num(q.close) ?? num(q.price);
      if (price === undefined) continue;
      const prev = num(q.previous_close);
      out[sec.id] = {
        id: sec.id, price,
        change: num(q.change) ?? (prev !== undefined ? price - prev : 0),
        changePct: num(q.percent_change) ?? (prev ? ((price - prev) / prev) * 100 : 0),
        open: num(q.open), high: num(q.high), low: num(q.low), prevClose: prev, volume: num(q.volume),
        asOf: q.datetime ? new Date(String(q.datetime)).toISOString() : new Date().toISOString(),
        live: q.is_market_open === true,
      };
    }
  }
  return out;
}

/** EODHD real-time: /api/real-time/2222.SR?s=1120.SR,...&fmt=json */
async function fetchEodhd(securities: Security[], key: string): Promise<Record<string, Quote>> {
  const mapped = securities.filter((s) => s.symbols.eodhd);
  if (mapped.length === 0) return {};
  const [first, ...rest] = mapped;
  const url = `https://eodhd.com/api/real-time/${encodeURIComponent(first.symbols.eodhd!)}?s=${encodeURIComponent(rest.map((s) => s.symbols.eodhd!).join(","))}&api_token=${encodeURIComponent(key)}&fmt=json`;
  const res = await fetch(url, UPSTREAM);
  if (!res.ok) throw new Error(`EODHD ${res.status}`);
  const json = await res.json();
  const rows: Record<string, unknown>[] = Array.isArray(json) ? json : [json];
  const out: Record<string, Quote> = {};
  for (const q of rows) {
    const sec = mapped.find((s) => s.symbols.eodhd === q.code);
    const price = num(q.close);
    if (!sec || price === undefined) continue;
    const ts = num(q.timestamp);
    out[sec.id] = {
      id: sec.id, price,
      change: num(q.change) ?? 0, changePct: num(q.change_p) ?? 0,
      open: num(q.open), high: num(q.high), low: num(q.low), prevClose: num(q.previousClose), volume: num(q.volume),
      asOf: ts ? new Date(ts * 1000).toISOString() : new Date().toISOString(),
      live: false,
    };
  }
  return out;
}

/** Fetch quotes for a set of universe ids (or all) from whichever provider is keyed. */
export async function fetchQuotes(ids?: string[]): Promise<QuotesResponse> {
  const provider = activeProvider();
  const asOf = new Date().toISOString();
  if (provider === "none") {
    return { provider, live: false, asOf, quotes: {}, note: "Market data disabled (MARKET_DATA_PROVIDER=none). Remove it, or set TWELVEDATA_API_KEY / EODHD_API_KEY." };
  }
  try {
    if (provider === "tradingview") {
      // If no specific IDs are requested, pull the entire ~750 GCC stock universe!
      if (!ids || ids.length === 0) {
        const { quotes, securities } = await fetchTradingViewAllGCC();
        const live = Object.values(quotes).some((q) => q.live);
        return { provider, live, asOf, quotes, securities };
      }
      const securities = UNIVERSE.filter((s) => ids.includes(s.id));
      const quotes = await fetchTradingView(securities);
      const live = Object.values(quotes).some((q) => q.live);
      return { provider, live, asOf, quotes, securities, note: Object.keys(quotes).length ? undefined : "Provider returned no quotes for these symbols." };
    }

    const securities = ids && ids.length ? UNIVERSE.filter((s) => ids.includes(s.id)) : UNIVERSE;
    const quotes = provider === "twelvedata"
      ? await fetchTwelveData(securities, process.env.TWELVEDATA_API_KEY!)
      : await fetchEodhd(securities, process.env.EODHD_API_KEY!);
    const live = Object.values(quotes).some((q) => q.live);
    return { provider, live, asOf, quotes, securities, note: Object.keys(quotes).length ? undefined : "Provider returned no quotes for these symbols." };
  } catch (err) {
    return { provider, live: false, asOf, quotes: {}, note: err instanceof Error ? err.message : "Provider request failed." };
  }
}
