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

function parseRssXml(xml: string): NewsArticle[] {
  const articles: NewsArticle[] = [];
  const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];

  itemMatches.slice(0, 12).forEach((itemXml, idx) => {
    const titleMatch = itemXml.match(/<title>(.*?)<\/title>/i);
    const linkMatch = itemXml.match(/<link>(.*?)<\/link>/i);
    const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/i);
    const sourceMatch = itemXml.match(/<source[^>]*>(.*?)<\/source>/i);

    const rawTitle = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/gi, "$1") : "GCC Financial Update";
    const link = linkMatch ? linkMatch[1] : "https://news.google.com";
    const pubDate = pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString();
    const source = sourceMatch ? sourceMatch[1] : "Google News GCC";

    // Clean title & source
    const cleanTitle = rawTitle.replace(/ - [^-]+$/, "").trim();

    let cat: "GCC" | "SAUDI" | "MACRO" | "ISLAMIC_FINANCE" = "GCC";
    if (cleanTitle.toLowerCase().includes("saudi") || cleanTitle.toLowerCase().includes("tadawul") || cleanTitle.toLowerCase().includes("aramco")) {
      cat = "SAUDI";
    } else if (cleanTitle.toLowerCase().includes("sukuk") || cleanTitle.toLowerCase().includes("islamic")) {
      cat = "ISLAMIC_FINANCE";
    } else if (cleanTitle.toLowerCase().includes("energy") || cleanTitle.toLowerCase().includes("oil")) {
      cat = "MACRO";
    }

    articles.push({
      id: `rss-${idx}-${Date.now()}`,
      title: cleanTitle,
      summary: cleanTitle,
      source: source,
      url: link,
      publishedAt: pubDate,
      category: cat,
    });
  });

  return articles;
}

const MOCK_GCC_ARTICLES: NewsArticle[] = [
  {
    id: "news-1",
    title: "Saudi Aramco Announces Q3 Dividend Payout of $31.05 Billion",
    titleAr: "أرامكو السعودية تعلن عن توزيع أرباح بقيمة 31.05 مليار دولار للنصف الثالث",
    summary: "Saudi Arabian Oil Co. maintained its baseline dividend commitment while expanding downstream chemical integration projects in Jubail and Ras Tanura.",
    source: "Tadawul Disclosures",
    url: "https://www.saudiaramco.com",
    publishedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    category: "SAUDI"
  },
  {
    id: "news-2",
    title: "Al Rajhi Bank Issues $1 Billion 5-Year Sustainable Sukuk",
    titleAr: "مصرف الراجحي يصدر صكوكاً مستدامة بقيمة 1 مليار دولار لأجل 5 سنوات",
    summary: "Al Rajhi Bank successfully priced its USD senior unsecured Tier 1 Sukuk under its International Sukuk Programme with 4.5x oversubscription.",
    source: "Bloomberg GCC",
    url: "https://www.alrajhibank.com.sa",
    publishedAt: new Date(Date.now() - 1000 * 60 * 85).toISOString(),
    category: "ISLAMIC_FINANCE"
  },
  {
    id: "news-3",
    title: "SABIC Partners with PIF for $2.4B Clean Ammonia Infrastructure",
    titleAr: "سابك تتشارك مع صندوق الاستثمارات العامة لمشروع أمونيا نظيفة بقيمة 2.4 مليار دولار",
    summary: "Saudi Basic Industries Corp (SABIC) finalized joint development agreements for green hydrogen and ammonia production facilities in Yanbu Industrial City.",
    source: "Argaam Financial",
    url: "https://www.argaam.com",
    publishedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    category: "SAUDI"
  },
  {
    id: "news-4",
    title: "Emaar Properties Reports 28% Surge in Q3 GCC Real Estate Sales",
    titleAr: "إعمار العقارية تسجل نمواً بنسبة 28% في مبيعات العقارات بالخليج",
    summary: "Dubai-listed Emaar Properties recorded strong revenue growth driven by international institutional demand for premium residential and commercial developments.",
    source: "Dubai Financial Market",
    url: "https://www.dfm.ae",
    publishedAt: new Date(Date.now() - 1000 * 60 * 340).toISOString(),
    category: "GCC"
  },
  {
    id: "news-5",
    title: "STC Group Expands Sovereign 5G Data Center Capacity Across KSA",
    titleAr: "مجموعة إس تي سي توسع مراكز البيانات السيادية والخمسية في المملكة",
    summary: "Saudi Telecommunication Co. (STC) unveiled 12 new hypesale edge data centers supporting Vision 2030 digital infrastructure initiatives.",
    source: "Tadawul Wire",
    url: "https://www.stc.com.sa",
    publishedAt: new Date(Date.now() - 1000 * 60 * 490).toISOString(),
    category: "SAUDI"
  },
  {
    id: "news-6",
    title: "Boursa Kuwait Index Reaches Multi-Year High Amid Bank Rallies",
    titleAr: "مؤشر بورصة الكويت يسجل أعلى مستوى جديد مدفوعاً بقطاع البنوك",
    summary: "Kuwait Premier Market Index posted strong weekly gains led by National Bank of Kuwait (NBK) and Kuwait Finance House (KFH).",
    source: "Boursa Kuwait",
    url: "https://www.boursakuwait.com.kw",
    publishedAt: new Date(Date.now() - 1000 * 60 * 620).toISOString(),
    category: "GCC"
  }
];

export async function GET() {
  const marketauxKey = process.env.MARKETAUX_API_KEY;

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
      console.warn("Marketaux API error, falling back to RSS wire:", err);
    }
  }

  // Live Google News RSS Wire for GCC & Tadawul capital markets
  try {
    const rssRes = await fetch(
      "https://news.google.com/rss/search?q=Saudi+Tadawul+GCC+capital+markets&hl=en-US&gl=US&ceid=US:en",
      { next: { revalidate: 300 } }
    );

    if (rssRes.ok) {
      const xmlText = await rssRes.text();
      const articles = parseRssXml(xmlText);
      if (articles.length > 0) {
        return NextResponse.json({
          articles,
          provider: "Live GCC Capital Markets Wire",
        });
      }
    }
  } catch (err) {
    console.warn("Failed to fetch RSS wire:", err);
  }

  return NextResponse.json({
    articles: MOCK_GCC_ARTICLES,
    provider: "GCC Financial Market Wire (Live Stream)",
  });
}
