/**
 * lib/market/universe.ts — the GCC equities the screener knows about.
 *
 * Each security carries:
 *   • provider symbols (Twelve Data `CODE:MIC`, EODHD `CODE.SUFFIX`) so the
 *     /api/quotes route can pull a live price for it;
 *   • a REFERENCE snapshot of fundamentals (price, market cap, P/E, P/B, yield,
 *     ROE, growth, leverage). The snapshot is illustrative — it lets the
 *     screener work with no API key — and is replaced field-by-field by the
 *     live provider whenever one is configured. Treat it as a starting grid,
 *     not as market data.
 *   • `shariahIndicative`: a business-activity flag only. The AAOIFI engine
 *     (`AAOIFI` code) runs the ratio tests on a company's actual statements.
 */
export type Exchange = "TADAWUL" | "DFM" | "ADX" | "QSE" | "BK" | "BHB" | "MSX";

export interface ExchangeInfo {
  id: Exchange;
  en: string;
  ar: string;
  country: string;
  countryAr: string;
  currency: "SAR" | "AED" | "QAR" | "KWD" | "BHD" | "OMR";
  /** ISO 10383 MIC used by Twelve Data. */
  mic: string;
  /** EODHD exchange suffix, where known. Verify against EODHD's exchange list before relying on it. */
  eodhd?: string;
  /** TradingView exchange prefix, e.g. `TADAWUL:2222`. */
  tv: string;
  /** Local trading session, in the exchange's local time. */
  session: { open: string; close: string; tz: string };
}

export const EXCHANGES: ExchangeInfo[] = [
  { id: "TADAWUL", tv: "TADAWUL", en: "Saudi Exchange (Tadawul)", ar: "تداول السعودية", country: "Saudi Arabia", countryAr: "السعودية", currency: "SAR", mic: "XSAU", eodhd: "SR", session: { open: "10:00", close: "15:00", tz: "Asia/Riyadh" } },
  { id: "DFM", tv: "DFM", en: "Dubai Financial Market", ar: "سوق دبي المالي", country: "UAE", countryAr: "الإمارات", currency: "AED", mic: "XDFM", session: { open: "10:00", close: "14:45", tz: "Asia/Dubai" } },
  { id: "ADX", tv: "ADX", en: "Abu Dhabi Securities Exchange", ar: "سوق أبوظبي للأوراق المالية", country: "UAE", countryAr: "الإمارات", currency: "AED", mic: "XADS", session: { open: "10:00", close: "14:45", tz: "Asia/Dubai" } },
  { id: "QSE", tv: "QSE", en: "Qatar Stock Exchange", ar: "بورصة قطر", country: "Qatar", countryAr: "قطر", currency: "QAR", mic: "DSMD", session: { open: "09:30", close: "13:15", tz: "Asia/Qatar" } },
  { id: "BK", tv: "KSE", en: "Boursa Kuwait", ar: "بورصة الكويت", country: "Kuwait", countryAr: "الكويت", currency: "KWD", mic: "XKUW", session: { open: "09:00", close: "13:30", tz: "Asia/Kuwait" } },
  { id: "BHB", tv: "BAHRAIN", en: "Bahrain Bourse", ar: "بورصة البحرين", country: "Bahrain", countryAr: "البحرين", currency: "BHD", mic: "XBAH", session: { open: "09:30", close: "13:00", tz: "Asia/Bahrain" } },
  { id: "MSX", tv: "MSX", en: "Muscat Stock Exchange", ar: "بورصة مسقط", country: "Oman", countryAr: "عُمان", currency: "OMR", mic: "XMUS", session: { open: "10:00", close: "13:00", tz: "Asia/Muscat" } },
];

export const EXCHANGE_MAP: Record<Exchange, ExchangeInfo> = Object.fromEntries(EXCHANGES.map((e) => [e.id, e])) as Record<Exchange, ExchangeInfo>;

/** USD per one unit of local currency — the GCC pegs. */
export const USD_PER_UNIT: Record<ExchangeInfo["currency"], number> = {
  SAR: 1 / 3.75,
  AED: 1 / 3.6725,
  QAR: 1 / 3.64,
  KWD: 1 / 0.3069,
  BHD: 1 / 0.376,
  OMR: 1 / 0.3845,
};

export type Sector =
  | "Energy" | "Banks" | "Materials" | "Telecom" | "Real Estate" | "Utilities"
  | "Consumer" | "Healthcare" | "Transport & Logistics" | "Industrials";

export const SECTORS: { id: Sector; ar: string }[] = [
  { id: "Energy", ar: "الطاقة" },
  { id: "Banks", ar: "البنوك" },
  { id: "Materials", ar: "المواد الأساسية" },
  { id: "Telecom", ar: "الاتصالات" },
  { id: "Real Estate", ar: "العقارات" },
  { id: "Utilities", ar: "المرافق" },
  { id: "Consumer", ar: "السلع الاستهلاكية" },
  { id: "Healthcare", ar: "الرعاية الصحية" },
  { id: "Transport & Logistics", ar: "النقل واللوجستيات" },
  { id: "Industrials", ar: "الصناعة" },
];

export interface ReferenceFundamentals {
  /** Last price, local currency. */
  price: number;
  /** Market capitalisation, local currency, billions. */
  marketCapB: number;
  pe: number;
  pb: number;
  /** Trailing dividend yield, %. */
  divYield: number;
  /** Return on equity, %. */
  roe: number;
  /** Revenue growth y/y, %. */
  revenueGrowth: number;
  /** Total debt / total assets, % — the AAOIFI leverage screen looks at this. */
  debtToAssets: number;
  /** Rough 52-week range, local currency. */
  low52: number;
  high52: number;
}

export interface Security {
  id: string;
  code: string;
  name: string;
  nameAr: string;
  exchange: Exchange;
  sector: Sector;
  symbols: { tradingview: string; twelvedata: string; eodhd?: string };
  ref: ReferenceFundamentals;
  shariahIndicative: boolean;
}

/** The date the reference snapshot was assembled. Shown in the UI so no one mistakes it for live data. */
export const REFERENCE_AS_OF = "2026-09";

const S = (
  code: string, name: string, nameAr: string, exchange: Exchange, sector: Sector, shariah: boolean,
  ref: ReferenceFundamentals, tdSymbol?: string
): Security => {
  const ex = EXCHANGE_MAP[exchange];
  return {
    id: `${exchange}:${code}`,
    code, name, nameAr, exchange, sector,
    symbols: { tradingview: `${ex.tv}:${code}`, twelvedata: `${tdSymbol ?? code}:${ex.mic}`, eodhd: ex.eodhd ? `${code}.${ex.eodhd}` : undefined },
    ref,
    shariahIndicative: shariah,
  };
};

export const UNIVERSE: Security[] = [
  // ---------------- Tadawul (SAR) ----------------
  S("2222", "Saudi Aramco", "أرامكو السعودية", "TADAWUL", "Energy", true, { price: 26.2, marketCapB: 6340, pe: 16.4, pb: 1.6, divYield: 6.4, roe: 19.8, revenueGrowth: -2.1, debtToAssets: 14, low52: 23.7, high52: 30.1 }),
  S("1120", "Al Rajhi Bank", "مصرف الراجحي", "TADAWUL", "Banks", true, { price: 95.4, marketCapB: 381, pe: 19.2, pb: 3.2, divYield: 2.6, roe: 17.9, revenueGrowth: 14.3, debtToAssets: 9, low52: 78.2, high52: 104.8 }),
  S("1180", "Saudi National Bank", "البنك الأهلي السعودي", "TADAWUL", "Banks", true, { price: 35.9, marketCapB: 215, pe: 10.1, pb: 1.2, divYield: 5.6, roe: 12.4, revenueGrowth: 7.8, debtToAssets: 11, low52: 30.4, high52: 40.6 }),
  S("2010", "SABIC", "سابك", "TADAWUL", "Materials", true, { price: 61.8, marketCapB: 185, pe: 30.5, pb: 1.1, divYield: 4.3, roe: 3.9, revenueGrowth: 1.4, debtToAssets: 22, low52: 55.9, high52: 78.4 }),
  S("7010", "stc", "إس تي سي", "TADAWUL", "Telecom", true, { price: 42.1, marketCapB: 210, pe: 14.1, pb: 2.5, divYield: 3.9, roe: 17.1, revenueGrowth: 5.9, debtToAssets: 12, low52: 37.5, high52: 46.2 }),
  S("1211", "Ma'aden", "معادن", "TADAWUL", "Materials", true, { price: 52.3, marketCapB: 195, pe: 32.4, pb: 3.0, divYield: 0, roe: 9.1, revenueGrowth: 18.6, debtToAssets: 24, low52: 41.2, high52: 58.9 }),
  S("2082", "ACWA Power", "أكوا باور", "TADAWUL", "Utilities", true, { price: 241, marketCapB: 176, pe: 84.6, pb: 6.1, divYield: 0.3, roe: 7.2, revenueGrowth: 11.2, debtToAssets: 33, low52: 195, high52: 480 }),
  S("2280", "Almarai", "المراعي", "TADAWUL", "Consumer", true, { price: 52.4, marketCapB: 52, pe: 21.3, pb: 2.9, divYield: 2.4, roe: 13.8, revenueGrowth: 6.5, debtToAssets: 28, low52: 48.1, high52: 59.8 }),
  S("4030", "Bahri", "البحري", "TADAWUL", "Transport & Logistics", true, { price: 30.2, marketCapB: 24, pe: 12.1, pb: 1.6, divYield: 5.2, roe: 13.4, revenueGrowth: 3.2, debtToAssets: 31, low52: 25.8, high52: 33.5 }),
  S("5110", "Saudi Electricity", "الكهرباء السعودية", "TADAWUL", "Utilities", false, { price: 15.1, marketCapB: 63, pe: 14.2, pb: 0.8, divYield: 4.6, roe: 5.4, revenueGrowth: 4.8, debtToAssets: 41, low52: 13.2, high52: 18.4 }),
  S("2050", "Savola Group", "مجموعة صافولا", "TADAWUL", "Consumer", true, { price: 31.6, marketCapB: 17, pe: 18.4, pb: 2.0, divYield: 1.8, roe: 10.4, revenueGrowth: 8.9, debtToAssets: 30, low52: 27.3, high52: 37.2 }),
  S("4013", "Dr. Sulaiman Al Habib", "سليمان الحبيب", "TADAWUL", "Healthcare", true, { price: 280, marketCapB: 98, pe: 40.2, pb: 12.1, divYield: 1.2, roe: 30.1, revenueGrowth: 13.7, debtToAssets: 12, low52: 245, high52: 325 }),
  S("1150", "Alinma Bank", "مصرف الإنماء", "TADAWUL", "Banks", true, { price: 26.9, marketCapB: 67, pe: 12.2, pb: 1.7, divYield: 3.7, roe: 15.3, revenueGrowth: 12.1, debtToAssets: 10, low52: 23.1, high52: 30.8 }),
  S("4002", "Mouwasat Medical", "المواساة", "TADAWUL", "Healthcare", true, { price: 90.5, marketCapB: 22, pe: 28.1, pb: 5.5, divYield: 1.9, roe: 20.3, revenueGrowth: 9.4, debtToAssets: 15, low52: 80.4, high52: 104.2 }),

  // ---------------- DFM (AED) ----------------
  S("EMAAR", "Emaar Properties", "إعمار العقارية", "DFM", "Real Estate", true, { price: 13.5, marketCapB: 119, pe: 8.1, pb: 1.3, divYield: 7.4, roe: 16.2, revenueGrowth: 27.4, debtToAssets: 9, low52: 8.9, high52: 15.4 }),
  S("EMIRATESNBD", "Emirates NBD", "بنك الإمارات دبي الوطني", "DFM", "Banks", false, { price: 21.2, marketCapB: 134, pe: 6.3, pb: 1.1, divYield: 4.7, roe: 19.8, revenueGrowth: 9.6, debtToAssets: 12, low52: 17.4, high52: 24.1 }),
  S("DIB", "Dubai Islamic Bank", "بنك دبي الإسلامي", "DFM", "Banks", true, { price: 8.5, marketCapB: 61, pe: 8.4, pb: 1.2, divYield: 5.9, roe: 15.1, revenueGrowth: 8.2, debtToAssets: 10, low52: 6.2, high52: 9.4 }),
  S("DEWA", "DEWA", "هيئة كهرباء ومياه دبي", "DFM", "Utilities", false, { price: 2.6, marketCapB: 130, pe: 18.2, pb: 1.6, divYield: 4.8, roe: 8.9, revenueGrowth: 5.1, debtToAssets: 34, low52: 2.3, high52: 2.9 }),
  S("SALIK", "Salik", "سالك", "DFM", "Transport & Logistics", true, { price: 5.5, marketCapB: 41, pe: 33.1, pb: 24.6, divYield: 2.9, roe: 88.4, revenueGrowth: 12.2, debtToAssets: 52, low52: 3.9, high52: 6.1 }),
  S("DU", "du (EITC)", "دو", "DFM", "Telecom", true, { price: 9.5, marketCapB: 43, pe: 15.4, pb: 5.0, divYield: 5.2, roe: 33.4, revenueGrowth: 7.3, debtToAssets: 14, low52: 7.1, high52: 10.2 }),

  // ---------------- ADX (AED) ----------------
  S("FAB", "First Abu Dhabi Bank", "بنك أبوظبي الأول", "ADX", "Banks", false, { price: 16.1, marketCapB: 177, pe: 10.2, pb: 1.3, divYield: 4.6, roe: 14.1, revenueGrowth: 11.8, debtToAssets: 13, low52: 12.8, high52: 17.6 }),
  S("IHC", "International Holding Co.", "القابضة (IHC)", "ADX", "Industrials", true, { price: 401, marketCapB: 880, pe: 59.8, pb: 4.5, divYield: 0.3, roe: 8.1, revenueGrowth: 22.5, debtToAssets: 21, low52: 380, high52: 420 }),
  S("ADNOCGAS", "ADNOC Gas", "أدنوك للغاز", "ADX", "Energy", true, { price: 3.5, marketCapB: 269, pe: 14.3, pb: 3.2, divYield: 4.9, roe: 23.8, revenueGrowth: 4.4, debtToAssets: 7, low52: 3.1, high52: 3.9 }),
  S("ALDAR", "Aldar Properties", "الدار العقارية", "ADX", "Real Estate", true, { price: 8.5, marketCapB: 67, pe: 12.1, pb: 1.7, divYield: 2.3, roe: 15.2, revenueGrowth: 31.5, debtToAssets: 26, low52: 6.2, high52: 9.4 }),
  S("ADCB", "Abu Dhabi Commercial Bank", "بنك أبوظبي التجاري", "ADX", "Banks", false, { price: 12.1, marketCapB: 88, pe: 9.1, pb: 1.3, divYield: 4.9, roe: 15.0, revenueGrowth: 13.4, debtToAssets: 14, low52: 9.6, high52: 13.4 }),
  S("ADNOCDIST", "ADNOC Distribution", "أدنوك للتوزيع", "ADX", "Consumer", true, { price: 3.6, marketCapB: 45, pe: 15.2, pb: 12.4, divYield: 5.7, roe: 79.6, revenueGrowth: 6.2, debtToAssets: 44, low52: 3.2, high52: 3.9 }),

  // ---------------- QSE (QAR) ----------------
  S("QNBK", "QNB Group", "مجموعة QNB", "QSE", "Banks", false, { price: 17.0, marketCapB: 157, pe: 9.2, pb: 1.4, divYield: 4.1, roe: 15.1, revenueGrowth: 6.4, debtToAssets: 15, low52: 14.9, high52: 18.7 }),
  S("IQCD", "Industries Qatar", "صناعات قطر", "QSE", "Materials", true, { price: 13.0, marketCapB: 79, pe: 16.4, pb: 2.1, divYield: 6.1, roe: 12.9, revenueGrowth: -3.5, debtToAssets: 4, low52: 11.6, high52: 14.2 }),
  S("QIBK", "Qatar Islamic Bank", "مصرف قطر الإسلامي", "QSE", "Banks", true, { price: 22.1, marketCapB: 52, pe: 11.3, pb: 1.9, divYield: 3.6, roe: 17.8, revenueGrowth: 7.1, debtToAssets: 11, low52: 19.3, high52: 24.0 }),
  S("ORDS", "Ooredoo", "Ooredoo", "QSE", "Telecom", true, { price: 12.0, marketCapB: 38, pe: 11.1, pb: 1.4, divYield: 5.0, roe: 12.7, revenueGrowth: 2.8, debtToAssets: 17, low52: 10.4, high52: 13.1 }),

  // ---------------- Boursa Kuwait (KWD) ----------------
  S("KFH", "Kuwait Finance House", "بيت التمويل الكويتي", "BK", "Banks", true, { price: 0.77, marketCapB: 12.5, pe: 18.1, pb: 2.0, divYield: 3.3, roe: 11.2, revenueGrowth: 9.8, debtToAssets: 12, low52: 0.66, high52: 0.85 }),
  S("NBK", "National Bank of Kuwait", "بنك الكويت الوطني", "BK", "Banks", false, { price: 0.98, marketCapB: 8.6, pe: 13.4, pb: 2.0, divYield: 3.6, roe: 15.2, revenueGrowth: 6.7, debtToAssets: 14, low52: 0.86, high52: 1.05 }),
  S("ZAIN", "Zain Group", "مجموعة زين", "BK", "Telecom", true, { price: 0.48, marketCapB: 2.1, pe: 12.2, pb: 1.3, divYield: 7.1, roe: 10.4, revenueGrowth: 3.1, debtToAssets: 29, low52: 0.41, high52: 0.53 }),
  S("AGLTY", "Agility Global", "أجيليتي", "BK", "Transport & Logistics", true, { price: 0.28, marketCapB: 0.7, pe: 25.3, pb: 0.4, divYield: 3.5, roe: 2.9, revenueGrowth: 5.5, debtToAssets: 33, low52: 0.22, high52: 0.34 }),

  // ---------------- Bahrain Bourse (BHD) ----------------
  S("ALBH", "Aluminium Bahrain (Alba)", "ألمنيوم البحرين (ألبا)", "BHB", "Materials", true, { price: 1.31, marketCapB: 1.85, pe: 12.4, pb: 1.3, divYield: 8.0, roe: 10.9, revenueGrowth: 4.1, debtToAssets: 25, low52: 1.05, high52: 1.42 }),
  S("BEYON", "Beyon (Batelco)", "بيون (بتلكو)", "BHB", "Telecom", true, { price: 0.50, marketCapB: 0.85, pe: 12.1, pb: 1.4, divYield: 6.5, roe: 12.2, revenueGrowth: 2.6, debtToAssets: 22, low52: 0.44, high52: 0.55 }),

  // ---------------- Muscat Stock Exchange (OMR) ----------------
  S("OQGN", "OQ Gas Networks", "شبكات غاز أوكيو", "MSX", "Utilities", true, { price: 0.17, marketCapB: 0.73, pe: 15.2, pb: 1.5, divYield: 6.5, roe: 10.1, revenueGrowth: 3.9, debtToAssets: 36, low52: 0.14, high52: 0.19 }),
  S("BKMB", "Bank Muscat", "بنك مسقط", "MSX", "Banks", false, { price: 0.30, marketCapB: 2.3, pe: 10.4, pb: 1.0, divYield: 6.0, roe: 10.2, revenueGrowth: 5.0, debtToAssets: 13, low52: 0.26, high52: 0.33 }),
];

export const UNIVERSE_MAP: Record<string, Security> = Object.fromEntries(UNIVERSE.map((s) => [s.id, s]));

/** Market cap in USD billions, via the peg. */
export function marketCapUsdB(s: Security, marketCapB = s.ref.marketCapB): number {
  return marketCapB * USD_PER_UNIT[EXCHANGE_MAP[s.exchange].currency];
}
