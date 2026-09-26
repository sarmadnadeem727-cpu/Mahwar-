/**
 * lib/finance/screener.ts — pure screening logic.
 *
 * A screen is a set of ranges over the metrics every row carries. Rows are the
 * universe's reference fundamentals with live price / change overlaid when a
 * provider is keyed. When the live price moves, price-based ratios (P/E, P/B,
 * dividend yield, market cap) are re-derived from the reference multiples so
 * the grid stays internally consistent.
 */
import { UNIVERSE, EXCHANGE_MAP, marketCapUsdB, type Security, type Exchange, type Sector } from "@/lib/market/universe";
import type { Quote } from "@/lib/market/quotes";

export interface Range { min?: number; max?: number }

export interface ScreenFilters {
  exchanges: Exchange[];
  sectors: Sector[];
  marketCapUsdB: Range;
  pe: Range;
  pb: Range;
  divYield: Range;
  roe: Range;
  revenueGrowth: Range;
  debtToAssets: Range;
  changePct: Range;
  shariahOnly: boolean;
  query: string;
}

export const EMPTY_FILTERS: ScreenFilters = {
  exchanges: [], sectors: [],
  marketCapUsdB: {}, pe: {}, pb: {}, divYield: {}, roe: {}, revenueGrowth: {}, debtToAssets: {}, changePct: {},
  shariahOnly: false, query: "",
};

export interface ScreenRow {
  sec: Security;
  currency: string;
  price: number;
  change: number;
  changePct: number;
  marketCapB: number;
  marketCapUsdB: number;
  pe: number;
  pb: number;
  divYield: number;
  roe: number;
  revenueGrowth: number;
  debtToAssets: number;
  low52: number;
  high52: number;
  /** Where in the 52-week range the price sits, 0–100. */
  rangePos: number;
  volume?: number;
  live: boolean;
  asOf?: string;
  /** Composite 0–100: value (P/E, P/B) + quality (ROE) + income (yield) + growth. */
  score: number;
}

export type SortKey = keyof Omit<ScreenRow, "sec" | "currency" | "live" | "asOf" | "volume"> | "name";

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const inRange = (v: number, r: Range) => (r.min === undefined || v >= r.min) && (r.max === undefined || v <= r.max);

/** Overlay a live quote on the reference snapshot. */
export function buildRow(sec: Security, quote?: Quote): ScreenRow {
  const ref = sec.ref;
  const f = quote?.fundamentals ?? {};
  const price = quote?.price ?? ref.price;
  const k = price / ref.price; // price drift vs the snapshot
  // Provider fundamentals win; otherwise price ratios are re-derived from the snapshot multiples.
  const pe = f.pe ?? (ref.pe > 0 ? ref.pe * k : ref.pe);
  const pb = f.pb ?? ref.pb * k;
  const divYield = f.divYield ?? ref.divYield / k;
  const marketCapB = f.marketCapB ?? ref.marketCapB * k;
  const roe = f.roe ?? ref.roe;
  const revenueGrowth = f.revenueGrowth ?? ref.revenueGrowth;
  const low52 = f.low52 ?? ref.low52;
  const high52 = f.high52 ?? ref.high52;
  const rangePos = clamp(((price - low52) / Math.max(1e-9, high52 - low52)) * 100, 0, 100);

  // Composite score — each leg 0..25, bounded and monotone.
  const value = 25 * clamp(1 - (pe > 0 ? (pe - 8) / 32 : 1), 0, 1);       // P/E 8 → 25, 40 → 0
  const quality = 25 * clamp(roe / 25, 0, 1);                              // ROE 25% → 25
  const income = 25 * clamp(divYield / 7, 0, 1);                           // 7% yield → 25
  const growth = 25 * clamp((revenueGrowth + 5) / 25, 0, 1);               // −5% → 0, 20% → 25
  const score = Math.round(value + quality + income + growth);

  return {
    sec,
    currency: EXCHANGE_MAP[sec.exchange].currency,
    price,
    change: quote?.change ?? 0,
    changePct: quote?.changePct ?? 0,
    marketCapB,
    marketCapUsdB: marketCapUsdB(sec, marketCapB),
    pe, pb, divYield, roe, revenueGrowth,
    debtToAssets: ref.debtToAssets,
    low52, high52,
    rangePos,
    volume: quote?.volume,
    live: quote?.live ?? false,
    asOf: quote?.asOf,
    score,
  };
}

export function buildRows(quotes: Record<string, Quote> = {}, securities?: Security[]): ScreenRow[] {
  const list = securities && securities.length > 0 ? securities : UNIVERSE;
  return list.map((s) => buildRow(s, quotes[s.id]));
}

export function applyFilters(rows: ScreenRow[], f: ScreenFilters): ScreenRow[] {
  const q = f.query.trim().toLowerCase();
  return rows.filter((r) => {
    if (f.exchanges.length && !f.exchanges.includes(r.sec.exchange)) return false;
    if (f.sectors.length && !f.sectors.includes(r.sec.sector)) return false;
    if (f.shariahOnly && !r.sec.shariahIndicative) return false;
    if (!inRange(r.marketCapUsdB, f.marketCapUsdB)) return false;
    if (!inRange(r.pe, f.pe)) return false;
    if (!inRange(r.pb, f.pb)) return false;
    if (!inRange(r.divYield, f.divYield)) return false;
    if (!inRange(r.roe, f.roe)) return false;
    if (!inRange(r.revenueGrowth, f.revenueGrowth)) return false;
    if (!inRange(r.debtToAssets, f.debtToAssets)) return false;
    if (!inRange(r.changePct, f.changePct)) return false;
    if (q && !(r.sec.name.toLowerCase().includes(q) || r.sec.nameAr.includes(q) || r.sec.code.toLowerCase().includes(q) || r.sec.sector.toLowerCase().includes(q))) return false;
    return true;
  });
}

export function sortRows(rows: ScreenRow[], key: SortKey, dir: "asc" | "desc"): ScreenRow[] {
  const m = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    if (key === "name") return m * a.sec.name.localeCompare(b.sec.name);
    const av = a[key] as number; const bv = b[key] as number;
    return m * (av - bv);
  });
}

export interface ScreenPreset { id: string; en: string; ar: string; descEn: string; descAr: string; filters: Partial<ScreenFilters> }

export const PRESETS: ScreenPreset[] = [
  { id: "income", en: "Dividend blue chips", ar: "الأسهم القيادية الموزِّعة", descEn: "Yield ≥ 4%, P/E ≤ 20, market cap ≥ $5bn.", descAr: "عائد ≥ 4%، مكرر ≤ 20، قيمة سوقية ≥ 5 مليار دولار.", filters: { divYield: { min: 4 }, pe: { max: 20 }, marketCapUsdB: { min: 5 } } },
  { id: "shariah_value", en: "Shariah value", ar: "قيمة متوافقة مع الشريعة", descEn: "Indicatively compliant, P/E ≤ 15, P/B ≤ 2, debt/assets ≤ 33%.", descAr: "متوافقة مبدئياً، مكرر ≤ 15، سعر/دفتري ≤ 2، دين/أصول ≤ 33%.", filters: { shariahOnly: true, pe: { max: 15 }, pb: { max: 2 }, debtToAssets: { max: 33 } } },
  { id: "quality", en: "Quality compounders", ar: "الشركات عالية الجودة", descEn: "ROE ≥ 15% with revenue growth ≥ 8%.", descAr: "عائد حقوق الملكية ≥ 15% ونمو إيرادات ≥ 8%.", filters: { roe: { min: 15 }, revenueGrowth: { min: 8 } } },
  { id: "banks", en: "Gulf banks under book ×1.5", ar: "بنوك خليجية دون 1.5× الدفتري", descEn: "Banks with P/B ≤ 1.5 and yield ≥ 4%.", descAr: "بنوك بمضاعف دفتري ≤ 1.5 وعائد ≥ 4%.", filters: { sectors: ["Banks"], pb: { max: 1.5 }, divYield: { min: 4 } } },
  { id: "logistics", en: "Transport & infrastructure", ar: "النقل والبنية التحتية", descEn: "The supply-chain names: transport, logistics, utilities.", descAr: "أسماء سلاسل الإمداد: النقل واللوجستيات والمرافق.", filters: { sectors: ["Transport & Logistics", "Utilities"] } },
];

/** Universe stats for the header tiles. */
export function summarise(rows: ScreenRow[]) {
  const n = rows.length;
  if (!n) return { n, medianPe: NaN, medianYield: NaN, capUsdB: 0, advancers: 0, decliners: 0 };
  const med = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
  return {
    n,
    medianPe: med(rows.filter((r) => r.pe > 0).map((r) => r.pe)),
    medianYield: med(rows.map((r) => r.divYield)),
    capUsdB: rows.reduce((a, r) => a + r.marketCapUsdB, 0),
    advancers: rows.filter((r) => r.changePct > 0).length,
    decliners: rows.filter((r) => r.changePct < 0).length,
  };
}
