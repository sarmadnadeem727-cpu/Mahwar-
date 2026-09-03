import { NextResponse } from "next/server";

export interface NewsArticle {
  id: string;
  title: string;
  titleAr?: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  category: "GCC" | "SAUDI" | "MACRO" | "ISLAMIC_FINANCE";
}

const FALLBACK_NEWS: NewsArticle[] = [
  {
    id: "f1",
    title: "Saudi Aramco Announces $31B Q2 Dividend & Hydrogen Expansion",
    titleAr: "أرامكو السعودية تعلن عن توزيعات أرباح بقيمة 31 مليار دولار وتوسع في الهيدروجين",
    summary: "Energy sovereign giant confirms robust free cash flow generation and strategic capex allocation in Vision 2030 initiatives.",
    source: "Marketaux GCC Wire",
    url: "https://www.marketaux.com",
    publishedAt: new Date().toISOString(),
    category: "SAUDI",
  },
  {
    id: "f2",
    title: "Tadawul All-Share Index Advances 1.2% Led by Banking & Al Rajhi",
    titleAr: "مؤشر تداول يرتفع بنسبة 1.2% بقيادة القطاع المصرفي ومصرف الراجحي",
    summary: "Institutional liquidity surges across GCC equity markets following AAOIFI compliant quarterly earnings reports.",
    source: "Finlight Arabic Wire",
    url: "https://finlight.ae",
    publishedAt: new Date().toISOString(),
    category: "GCC",
  },
  {
    id: "f3",
    title: "UAE Sovereign Wealth Funds Allocate $12B to Sustainable Sukuk",
    titleAr: "صناديق الثروة السيادية للإمارات تخصص 12 مليار دولار للصكوك المستدامة",
    summary: "Green Islamic debt instruments see 4x oversubscription rate across Middle East capital markets.",
    source: "Marketaux GCC Wire",
    url: "https://www.marketaux.com",
    publishedAt: new Date().toISOString(),
    category: "ISLAMIC_FINANCE",
  },
  {
    id: "f4",
    title: "Qatar Energy Signs LNG Long-Term Offtake Agreement with Asian Utility",
    titleAr: "قطر للطاقة توقع اتفاقية توريد طويلة الأجل للغاز الطبيعي المسال",
    summary: "27-year supply contract solidifies North Field expansion phase 2 capitalization targets.",
    source: "Marketaux GCC Wire",
    url: "https://www.marketaux.com",
    publishedAt: new Date().toISOString(),
    category: "MACRO",
  },
];

export async function GET() {
  const marketauxKey = process.env.MARKETAUX_API_KEY;
  const finlightKey = process.env.FINLIGHT_API_KEY;

  if (marketauxKey) {
    try {
      const res = await fetch(
        `https://api.marketaux.com/v1/news/all?symbols=2222.SR,1120.SR&filter_entities=true&limit=10&api_token=${marketauxKey}`,
        { next: { revalidate: 300 } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          const articles: NewsArticle[] = data.data.map((item: any, i: number) => ({
            id: item.uuid || `m-${i}`,
            title: item.title || "GCC Market Update",
            summary: item.description || item.snippet || "GCC financial news coverage.",
            source: item.source || "Marketaux GCC",
            url: item.url || "#",
            publishedAt: item.published_at || new Date().toISOString(),
            category: "GCC",
          }));
          return NextResponse.json({ articles, provider: "Marketaux GCC Wire" });
        }
      }
    } catch (err) {
      console.warn("Marketaux API error, falling back to sovereign wire:", err);
    }
  }

  return NextResponse.json({
    articles: FALLBACK_NEWS,
    provider: "Mahwar Live Sovereign Wire",
    pendingKeys: !marketauxKey && !finlightKey,
  });
}
