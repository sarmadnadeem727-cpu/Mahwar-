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
    articles: [],
    provider: "GCC Market Wire",
  });
}
