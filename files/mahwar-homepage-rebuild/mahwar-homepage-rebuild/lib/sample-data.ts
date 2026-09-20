/**
 * SAMPLE DATA — illustrative only. Nothing here is connected to a live feed.
 * The integrating agent may later replace `tickers` and `headlines` with the
 * project's real market-data / news hooks; keep the shapes below.
 */

export type ExchangeCode = "TADAWUL" | "DFM" | "ADX" | "QSE" | "BK" | "BHB" | "MSX";

export interface Exchange {
  code: ExchangeCode;
  name: string;
  currency: string;
  /** Decimal places quoted on that exchange */
  decimals: number;
}

export const exchanges: Record<ExchangeCode, Exchange> = {
  TADAWUL: { code: "TADAWUL", name: "Saudi Exchange", currency: "SAR", decimals: 2 },
  DFM: { code: "DFM", name: "Dubai Financial Market", currency: "AED", decimals: 2 },
  ADX: { code: "ADX", name: "Abu Dhabi Securities Exchange", currency: "AED", decimals: 2 },
  QSE: { code: "QSE", name: "Qatar Stock Exchange", currency: "QAR", decimals: 2 },
  BK: { code: "BK", name: "Boursa Kuwait", currency: "KWD", decimals: 3 },
  BHB: { code: "BHB", name: "Bahrain Bourse", currency: "BHD", decimals: 3 },
  MSX: { code: "MSX", name: "Muscat Stock Exchange", currency: "OMR", decimals: 3 },
};

export interface Ticker {
  exchange: ExchangeCode;
  symbol: string;
  price: number;
  /** Absolute change */
  change: number;
  /** Percentage change */
  pct: number;
  /** Index rows render without a currency prefix */
  isIndex?: boolean;
}

export const tickers: readonly Ticker[] = [
  { exchange: "TADAWUL", symbol: "TASI", price: 12140.55, change: 50.8, pct: 0.42, isIndex: true },
  { exchange: "TADAWUL", symbol: "2222", price: 27.85, change: 0.35, pct: 1.27 },
  { exchange: "TADAWUL", symbol: "1120", price: 92.1, change: -0.6, pct: -0.65 },
  { exchange: "TADAWUL", symbol: "2010", price: 68.4, change: 0.9, pct: 1.33 },
  { exchange: "TADAWUL", symbol: "7010", price: 41.25, change: -0.15, pct: -0.36 },
  { exchange: "TADAWUL", symbol: "2082", price: 231.8, change: 3.2, pct: 1.4 },
  { exchange: "DFM", symbol: "DFMGI", price: 5412.3, change: -12.4, pct: -0.23, isIndex: true },
  { exchange: "DFM", symbol: "EMAAR", price: 12.85, change: 0.15, pct: 1.18 },
  { exchange: "DFM", symbol: "DIB", price: 7.42, change: -0.03, pct: -0.4 },
  { exchange: "DFM", symbol: "EMIRATESNBD", price: 21.9, change: 0.25, pct: 1.15 },
  { exchange: "ADX", symbol: "FADX15", price: 9820.15, change: 31.2, pct: 0.32, isIndex: true },
  { exchange: "ADX", symbol: "FAB", price: 15.62, change: 0.08, pct: 0.51 },
  { exchange: "ADX", symbol: "ADNOCGAS", price: 3.41, change: -0.02, pct: -0.58 },
  { exchange: "ADX", symbol: "ALDAR", price: 8.94, change: 0.11, pct: 1.25 },
  { exchange: "QSE", symbol: "QEI", price: 10455.7, change: 18.9, pct: 0.18, isIndex: true },
  { exchange: "QSE", symbol: "QNBK", price: 17.8, change: 0.12, pct: 0.68 },
  { exchange: "QSE", symbol: "IQCD", price: 13.15, change: -0.09, pct: -0.68 },
  { exchange: "BK", symbol: "KFH", price: 0.812, change: 0.006, pct: 0.74 },
  { exchange: "BK", symbol: "NBK", price: 0.985, change: -0.004, pct: -0.4 },
  { exchange: "BK", symbol: "ZAIN", price: 0.478, change: 0.002, pct: 0.42 },
  { exchange: "BHB", symbol: "BBK", price: 0.52, change: 0.005, pct: 0.97 },
  { exchange: "BHB", symbol: "ALBH", price: 1.18, change: -0.01, pct: -0.84 },
  { exchange: "MSX", symbol: "BKMB", price: 0.276, change: 0.002, pct: 0.73 },
  { exchange: "MSX", symbol: "OTEL", price: 1.02, change: 0.005, pct: 0.49 },
  { exchange: "MSX", symbol: "OQGN", price: 0.146, change: -0.001, pct: -0.68 },
] as const;

export type Feed = "gcc" | "arabic" | "supply";

export interface Headline {
  id: string;
  feed: Feed;
  /** Feed label shown in the widget */
  source: string;
  /** Arabia Standard Time, 24h */
  time: string;
  title: string;
  /** Set for Arabic headlines so the row renders RTL */
  lang?: "ar";
}

export const headlines: readonly Headline[] = [
  {
    id: "h1",
    feed: "gcc",
    source: "GCC Markets",
    time: "14:32",
    title: "Tadawul: Aramco prices SAR 11.2bn sukuk as regional issuance passes 2025 full-year total",
  },
  {
    id: "h2",
    feed: "arabic",
    source: "الأخبار المالية",
    time: "13:05",
    lang: "ar",
    title: "البنك المركزي السعودي يُبقي على معدل إعادة الشراء دون تغيير عقب قرار الاحتياطي الفيدرالي",
  },
  {
    id: "h3",
    feed: "supply",
    source: "Supply Chain & Logistics",
    time: "11:48",
    title: "Jebel Ali–Dammam corridor: container dwell time down 18% after customs integration pilot",
  },
  {
    id: "h4",
    feed: "gcc",
    source: "GCC Markets",
    time: "10:15",
    title: "DFM: Emaar Development raises full-year sales guidance after record third-quarter launches",
  },
] as const;

export interface ComparisonRow {
  dimension: string;
  detail: string;
  mahwar: "yes" | "partial" | "no";
  generic: "yes" | "partial" | "no";
}

export const comparison: readonly ComparisonRow[] = [
  {
    dimension: "Native Arabic RTL",
    detail: "Full terminal in Arabic, right-to-left, not a translated overlay",
    mahwar: "yes",
    generic: "no",
  },
  {
    dimension: "AAOIFI Shariah screening",
    detail: "Standard No. 21 ratio tests and purification per share",
    mahwar: "yes",
    generic: "no",
  },
  {
    dimension: "Saudi GAAP Zakat provisions",
    detail: "2.5% Zakat base built into the 3-statement model, with IFRS toggle",
    mahwar: "yes",
    generic: "no",
  },
  {
    dimension: "Seven GCC exchanges",
    detail: "Tadawul, DFM, ADX, QSE, Boursa Kuwait, Bahrain Bourse, MSX",
    mahwar: "yes",
    generic: "partial",
  },
  {
    dimension: "GCC supply chain tools",
    detail: "Landed cost, EOQ, S&OP and facility location for Gulf import routes",
    mahwar: "yes",
    generic: "no",
  },
  {
    dimension: "DCF, LBO and 3-statement modeling",
    detail: "Five-year linked models with sensitivity and Monte Carlo",
    mahwar: "yes",
    generic: "yes",
  },
] as const;

export interface NavLink {
  label: string;
  /** Placeholder — INTEGRATION.md lists the real route for each */
  href: string;
}

export interface NavGroup {
  heading: string;
  links: readonly NavLink[];
}

export const footerNav: readonly NavGroup[] = [
  {
    heading: "Platform",
    links: [
      { label: "Intelligence Hub", href: "#" },
      { label: "GCC Wire", href: "#" },
      { label: "BI Report Engine", href: "#" },
      { label: "Operations Suite", href: "#" },
    ],
  },
  {
    heading: "Models",
    links: [
      { label: "DCF Valuation Engine", href: "#" },
      { label: "LBO Deal Builder", href: "#" },
      { label: "3-Statement Model", href: "#" },
      { label: "Custom Model Builder", href: "#" },
    ],
  },
  {
    heading: "Research & Analytics",
    links: [
      { label: "Shariah Screening (AAOIFI)", href: "#" },
      { label: "Monte Carlo Simulation", href: "#" },
      { label: "Market Data", href: "#" },
      { label: "Documentation", href: "#" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  },
] as const;
