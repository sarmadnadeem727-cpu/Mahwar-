/** GCC hubs and corridors — real coordinates and public facts only. */
export type HubKind = "capital" | "port" | "financial";
export interface Hub {
  id: string; en: string; ar: string; lon: number; lat: number; kind: HubKind;
  exchange?: string; currency: string; port?: string; note: string; noteAr: string;
}

export const HUBS: Hub[] = [
  { id: "ruh", en: "Riyadh", ar: "الرياض", lon: 46.72, lat: 24.63, kind: "financial", exchange: "Tadawul (TASI)", currency: "SAR", note: "Largest exchange in the GCC by market capitalisation.", noteAr: "أكبر سوق مالية في الخليج من حيث القيمة السوقية." },
  { id: "jed", en: "Jeddah", ar: "جدة", lon: 39.19, lat: 21.49, kind: "port", currency: "SAR", port: "Jeddah Islamic Port", note: "Red Sea gateway and the Kingdom's busiest container port.", noteAr: "بوابة البحر الأحمر وأكثر موانئ المملكة ازدحاماً بالحاويات." },
  { id: "dmm", en: "Dammam", ar: "الدمام", lon: 50.1, lat: 26.43, kind: "port", currency: "SAR", port: "King Abdulaziz Port", note: "Eastern Province hub feeding Riyadh by road and rail.", noteAr: "مركز المنطقة الشرقية الذي يغذي الرياض براً وبالسكك." },
  { id: "kwi", en: "Kuwait City", ar: "الكويت", lon: 47.98, lat: 29.38, kind: "financial", exchange: "Boursa Kuwait", currency: "KWD", port: "Shuwaikh · Shuaiba", note: "Highest-valued currency unit in the region.", noteAr: "العملة الأعلى قيمة في المنطقة." },
  { id: "bah", en: "Manama", ar: "المنامة", lon: 50.58, lat: 26.23, kind: "financial", exchange: "Bahrain Bourse", currency: "BHD", port: "Khalifa Bin Salman Port", note: "Islamic-finance regulatory centre; AAOIFI is headquartered here.", noteAr: "مركز تنظيم التمويل الإسلامي ومقر هيئة أيوفي." },
  { id: "doh", en: "Doha", ar: "الدوحة", lon: 51.53, lat: 25.29, kind: "financial", exchange: "Qatar Stock Exchange", currency: "QAR", port: "Hamad Port", note: "LNG export economy; riyal pegged to the US dollar.", noteAr: "اقتصاد تصدير الغاز المسال؛ الريال مربوط بالدولار." },
  { id: "auh", en: "Abu Dhabi", ar: "أبوظبي", lon: 54.37, lat: 24.47, kind: "financial", exchange: "ADX", currency: "AED", port: "Khalifa Port", note: "Sovereign-wealth capital; ADGM financial free zone.", noteAr: "عاصمة الصناديق السيادية ومنطقة سوق أبوظبي العالمي." },
  { id: "dxb", en: "Dubai", ar: "دبي", lon: 55.3, lat: 25.2, kind: "port", exchange: "DFM · Nasdaq Dubai", currency: "AED", port: "Jebel Ali", note: "Jebel Ali is the busiest container port between Europe and East Asia.", noteAr: "جبل علي أكثر موانئ الحاويات ازدحاماً بين أوروبا وشرق آسيا." },
  { id: "mct", en: "Muscat", ar: "مسقط", lon: 58.41, lat: 23.59, kind: "capital", exchange: "MSX", currency: "OMR", port: "Sultan Qaboos · Sohar", note: "Outside the Strait of Hormuz — a strategic bypass for Gulf cargo.", noteAr: "خارج مضيق هرمز — ممر بديل استراتيجي لبضائع الخليج." },
  { id: "sll", en: "Salalah", ar: "صلالة", lon: 54.09, lat: 17.02, kind: "port", currency: "OMR", port: "Port of Salalah", note: "Arabian Sea transshipment hub on the Asia–Europe lane.", noteAr: "مركز إعادة شحن على بحر العرب على خط آسيا–أوروبا." },
  { id: "neom", en: "NEOM · Oxagon", ar: "نيوم · أوكساجون", lon: 35.1, lat: 28.1, kind: "port", currency: "SAR", port: "Oxagon", note: "Planned floating industrial city at the mouth of the Suez lane.", noteAr: "مدينة صناعية عائمة مخططة عند مدخل خط السويس." },
];

export type RouteKind = "road" | "sea" | "capital";
export interface Route { a: string; b: string; kind: RouteKind; bend?: number }

/** `bend` bows the drawn curve (screen px at 1000-wide canvas) so sea lanes stay in the water. */
export const ROUTES: Route[] = [
  { a: "jed", b: "ruh", kind: "road" }, { a: "ruh", b: "dmm", kind: "road" }, { a: "dmm", b: "kwi", kind: "road", bend: -16 },
  { a: "dmm", b: "bah", kind: "road" }, { a: "bah", b: "doh", kind: "road" }, { a: "doh", b: "auh", kind: "road", bend: 8 },
  { a: "auh", b: "dxb", kind: "road" }, { a: "dxb", b: "mct", kind: "road", bend: 12 }, { a: "neom", b: "jed", kind: "road", bend: -10 },
  { a: "jed", b: "sll", kind: "sea", bend: 80 }, { a: "sll", b: "mct", kind: "sea", bend: 40 }, { a: "mct", b: "dxb", kind: "sea", bend: -34 },
  { a: "dxb", b: "doh", kind: "sea", bend: -36 }, { a: "doh", b: "kwi", kind: "sea", bend: 44 }, { a: "neom", b: "jed", kind: "sea", bend: 34 },
  { a: "ruh", b: "dxb", kind: "capital", bend: -44 }, { a: "ruh", b: "doh", kind: "capital", bend: -22 }, { a: "ruh", b: "kwi", kind: "capital", bend: 18 },
];

export const HUB_MAP: Record<string, Hub> = Object.fromEntries(HUBS.map((h) => [h.id, h]));

/** Great-circle distance in km. */
export function haversineKm(a: { lon: number; lat: number }, b: { lon: number; lat: number }) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat), dLon = toRad(b.lon - a.lon);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/** GCC exchange sessions (local time, published trading hours). Days: 0 = Sunday. */
export interface Exchange { id: string; name: string; nameAr: string; city: string; tz: string; open: string; close: string; days: number[]; hubId: string }
export const EXCHANGES: Exchange[] = [
  { id: "tasi", name: "Tadawul", nameAr: "تداول", city: "Riyadh", tz: "Asia/Riyadh", open: "10:00", close: "15:00", days: [0, 1, 2, 3, 4], hubId: "ruh" },
  { id: "dfm", name: "DFM", nameAr: "سوق دبي المالي", city: "Dubai", tz: "Asia/Dubai", open: "10:00", close: "15:00", days: [1, 2, 3, 4, 5], hubId: "dxb" },
  { id: "adx", name: "ADX", nameAr: "سوق أبوظبي", city: "Abu Dhabi", tz: "Asia/Dubai", open: "10:00", close: "15:00", days: [1, 2, 3, 4, 5], hubId: "auh" },
  { id: "qse", name: "QSE", nameAr: "بورصة قطر", city: "Doha", tz: "Asia/Qatar", open: "09:30", close: "13:15", days: [0, 1, 2, 3, 4], hubId: "doh" },
  { id: "bk", name: "Boursa Kuwait", nameAr: "بورصة الكويت", city: "Kuwait", tz: "Asia/Kuwait", open: "09:00", close: "12:40", days: [0, 1, 2, 3, 4], hubId: "kwi" },
  { id: "bhb", name: "Bahrain Bourse", nameAr: "بورصة البحرين", city: "Manama", tz: "Asia/Bahrain", open: "09:30", close: "13:00", days: [0, 1, 2, 3, 4], hubId: "bah" },
  { id: "msx", name: "MSX", nameAr: "بورصة مسقط", city: "Muscat", tz: "Asia/Muscat", open: "10:00", close: "13:00", days: [0, 1, 2, 3, 4], hubId: "mct" },
];

/** Live session status computed from the real clock (no market data involved). */
export function exchangeStatus(ex: Exchange, now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: ex.tz, hour: "2-digit", minute: "2-digit", weekday: "short", hour12: false }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const dayIdx = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  const mins = Number(get("hour")) * 60 + Number(get("minute"));
  const toMin = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3));
  const tradingDay = ex.days.includes(dayIdx);
  const open = tradingDay && mins >= toMin(ex.open) && mins < toMin(ex.close);
  const pre = tradingDay && mins < toMin(ex.open);
  return { open, phase: open ? "open" : pre ? "pre" : "closed", local: `${get("hour")}:${get("minute")}` } as const;
}

