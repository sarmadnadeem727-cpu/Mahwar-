import { NextRequest } from 'next/server';
import { getServerEnv } from '@/lib/env';

export interface MarketauxArticle {
  uuid: string;
  title: string;
  description: string;
  keywords: string;
  snippet: string;
  url: string;
  image_url?: string;
  language: string;
  published_at: string;
  source: string;
  entities?: Array<{
    symbol?: string;
    name?: string;
    type?: string;
    industry?: string;
    match_score?: number;
    sentiment_score?: number;
    highlights?: Array<{
      highlight: string;
      sentiment: number;
      highlighted_in: string;
    }>;
  }>;
  similar?: any[];
}

export interface MarketauxResponse {
  meta: {
    found: number;
    returned: number;
    limit: number;
    page: number;
  };
  data: MarketauxArticle[];
  cachedAt?: string;
  error?: string;
}

// In-memory server cache to strictly honor free-tier request limits (5-15 min TTL)
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache
let cachedNews: { data: MarketauxResponse; timestamp: number } | null = null;

// Fallback institutional mock data if API key is not present or free quota is reached
const FALLBACK_GCC_NEWS: MarketauxArticle[] = [
  {
    uuid: "gcc-1",
    title: "Saudi Tadawul All Share Index (TASI) Tests Key Resistance Amid Strong Institutional Inflows",
    description: "TASI climbs 0.8% driven by banking and energy heavyweights with robust foreign investor positioning ahead of Q3 corporate earnings.",
    snippet: "Saudi Arabia's main stock benchmark witnessed broad-based institutional buying across banking leaders and industrial materials.",
    keywords: "Tadawul, TASI, Saudi Arabia, Equities, Banking",
    url: "https://www.tadawul.com.sa",
    language: "en",
    published_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    source: "Tadawul Markets Intelligence",
    entities: [
      { symbol: "TASI", name: "Tadawul All Share", sentiment_score: 0.65, industry: "Index" },
      { symbol: "1120.SR", name: "Al Rajhi Bank", sentiment_score: 0.8, industry: "Financials" }
    ]
  },
  {
    uuid: "gcc-2",
    title: "UAE Sovereign Wealth Funds Accelerate Renewable Energy & AI Infrastructure Allocations",
    description: "ADQ and Mubadala outline multi-billion dollar capital deployment targets across sovereign data infrastructure and energy transition.",
    snippet: "Abu Dhabi sovereign entities announce expanded strategic allocations focusing on semiconductor capacity and high-performance compute clusters.",
    keywords: "UAE, Sovereign Wealth, ADQ, Mubadala, AI",
    url: "https://www.adx.ae",
    language: "en",
    published_at: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    source: "Emirates Financial Dispatch",
    entities: [
      { symbol: "ADX", name: "Abu Dhabi Securities Exchange", sentiment_score: 0.72, industry: "Sovereign" }
    ]
  },
  {
    uuid: "gcc-3",
    title: "Qatar Energy Advances North Field Expansion LNG Long-Term Offtake Contracts",
    description: "QatarEnergy inks bilateral supply agreements with Asian institutional buyers, solidifying global LNG cost-curve leadership.",
    snippet: "The global LNG benchmark consolidates as Qatar expands production capacity towards 142 MTPA by 2030.",
    keywords: "Qatar, LNG, Energy, QatarEnergy",
    url: "https://www.qe.com.qa",
    language: "en",
    published_at: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    source: "Gulf Energy Briefing",
    entities: [
      { symbol: "QSE", name: "Qatar Stock Exchange", sentiment_score: 0.55, industry: "Energy" }
    ]
  },
  {
    uuid: "gcc-4",
    title: "Kuwait Sovereign Fund (KIA) Rebalances Global Equity & Debt Portfolios",
    description: "Kuwait Investment Authority reports resilient performance across GCC fixed income and infrastructure private credit vehicles.",
    snippet: "KIA maintains sovereign liquidity buffers while increasing allocations to Gulf infrastructure bond issuances.",
    keywords: "Kuwait, KIA, Sovereign Funds, Debt",
    url: "https://www.boursakuwait.com.kw",
    language: "en",
    published_at: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    source: "Kuwait Financial Daily",
    entities: [
      { symbol: "BK", name: "Boursa Kuwait", sentiment_score: 0.42, industry: "Asset Management" }
    ]
  },
  {
    uuid: "gcc-5",
    title: "Oman & Bahrain Central Banks Signal Coordinated Liquidity Management Measures",
    description: "Monetary authorities in Muscat and Manama optimize repo rates and interbank Islamic liquidity instruments (Murabaha).",
    snippet: "GCC monetary coordination continues to bolster banking system capital adequacy ratios and non-oil GDP credit expansion.",
    keywords: "Oman, Bahrain, Central Bank, Islamic Liquidity",
    url: "https://www.cbo.gov.om",
    language: "en",
    published_at: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
    source: "Gulf Monetary Review",
    entities: [
      { symbol: "MSX", name: "Muscat Stock Exchange", sentiment_score: 0.35, industry: "Banking" }
    ]
  }
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get('country') || 'all'; // sa, ae, qa, kw, bh, om or all
  const search = searchParams.get('search') || '';

  // Check cache first
  const now = Date.now();
  if (cachedNews && now - cachedNews.timestamp < CACHE_TTL_MS && !search && country === 'all') {
    return Response.json(cachedNews.data, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    });
  }

  const { MARKETAUX_API_KEY } = getServerEnv();

  if (!MARKETAUX_API_KEY) {
    // Return gracefully with fallback mock data + indication
    const filteredFallback = FALLBACK_GCC_NEWS.filter(item => {
      if (search && !item.title.toLowerCase().includes(search.toLowerCase()) && !item.description.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      return true;
    });

    return Response.json({
      meta: {
        found: filteredFallback.length,
        returned: filteredFallback.length,
        limit: 10,
        page: 1,
      },
      data: filteredFallback,
      cachedAt: new Date().toISOString(),
      fallbackMode: true,
      notice: 'MARKETAUX_API_KEY not configured or offline. Showing sovereign curated GCC financial feed.',
    });
  }

  try {
    // Marketaux country filter for GCC: sa (Saudi Arabia), ae (UAE), qa (Qatar), kw (Kuwait), bh (Bahrain), om (Oman)
    const gccCountries = country === 'all' ? 'sa,ae,qa,kw,bh,om' : country;
    
    let apiUrl = `https://api.marketaux.com/v1/news/all?countries=${gccCountries}&filter_entities=true&limit=15&api_token=${MARKETAUX_API_KEY}`;
    if (search) {
      apiUrl += `&search=${encodeURIComponent(search)}`;
    }

    const response = await fetch(apiUrl, {
      next: { revalidate: 600 }, // 10 minutes cache in Next.js fetch cache
    });

    if (!response.ok) {
      console.warn(`Marketaux API returned status ${response.status}. Falling back to cached or curated data.`);
      return Response.json({
        meta: { found: FALLBACK_GCC_NEWS.length, returned: FALLBACK_GCC_NEWS.length, limit: 10, page: 1 },
        data: FALLBACK_GCC_NEWS,
        fallbackMode: true,
        notice: `Marketaux API responded with code ${response.status}. Displaying backup feed.`,
      });
    }

    const result = (await response.json()) as MarketauxResponse;
    const responsePayload = {
      ...result,
      cachedAt: new Date().toISOString(),
      fallbackMode: false,
    };

    if (!search && country === 'all') {
      cachedNews = { data: responsePayload, timestamp: now };
    }

    return Response.json(responsePayload, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    });
  } catch (error: any) {
    console.error('Marketaux API Route error:', error);
    return Response.json({
      meta: { found: FALLBACK_GCC_NEWS.length, returned: FALLBACK_GCC_NEWS.length, limit: 10, page: 1 },
      data: FALLBACK_GCC_NEWS,
      fallbackMode: true,
      notice: 'Network error contacting Marketaux API. Showing cached intelligence.',
    });
  }
}
