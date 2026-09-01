import { NextRequest } from 'next/server';
import { getServerEnv } from '@/lib/env';

export interface FinlightArabicArticle {
  id: string | number;
  title: string;
  summary: string;
  content?: string;
  source: string;
  url: string;
  published_at: string;
  category?: string;
  tickers?: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface FinlightResponse {
  data: FinlightArabicArticle[];
  total?: number;
  cachedAt?: string;
  fallbackMode?: boolean;
  notice?: string;
}

// In-memory cache to stay strictly within free-tier rate limits (10 min TTL)
const ARABIC_CACHE_TTL_MS = 10 * 60 * 1000;
let cachedArabicNews: { data: FinlightResponse; timestamp: number } | null = null;

// Curated Arabic Financial Intelligence fallback if key is missing or limit reached
const FALLBACK_ARABIC_NEWS: FinlightArabicArticle[] = [
  {
    id: "ar-1",
    title: "مؤشر تاسي يواصل مكاسبه بدعم من قطاعي البنوك والطاقة وتدفقات السيولة المؤسسية",
    summary: "أغلق مؤشر السوق السعودي (تاسي) مرتفعاً بدعم من مشتريات الصناديق السيادية والاستثمارية لأسهم مصرف الراجحي وأرامكو السعودية وسط ترقب لنتائج الأعمال الفصلية.",
    source: "تداول المالية",
    url: "https://www.tadawul.com.sa",
    published_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    category: "أسواق الأسهم",
    tickers: ["2222.SR", "1120.SR"],
    sentiment: "positive",
  },
  {
    id: "ar-2",
    title: "صندوق الاستثمارات العامة يعزز استثماراته في البنية التحتية للذكاء الاصطناعي ومراكز البيانات",
    summary: "أعلن صندوق الاستثمارات العامة (PIF) عن شراكات استراتيجية لتطوير الحوسبة الفائقة ومراكز البيانات المتقدمة لتعزيز ريادة المملكة في التقنيات الرقمية المتقدمة وفق رؤية 2030.",
    source: "الاستثمار السيادي الخليجي",
    url: "https://www.pif.gov.sa",
    published_at: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    category: "صناديق سيادية",
    tickers: ["7010.SR"],
    sentiment: "positive",
  },
  {
    id: "ar-3",
    title: "أرامكو السعودية تعلن توزيعات أرباح أساسية ومرتبطة بالأداء بقيمة تتجاوز 116 مليار ريال",
    summary: "مجلس إدارة أرامكو يقر توزيعات أرباح للمساهمين تؤكد قوة التدفقات النقدية الحرة وانخفاض تكلفة الاستخراج وملاءة المركز المالي واستدامة النمو.",
    source: "أخبار الطاقة والنفط",
    url: "https://www.aramco.com",
    published_at: new Date(Date.now() - 130 * 60 * 1000).toISOString(),
    category: "طاقة وبتروكيماويات",
    tickers: ["2222.SR"],
    sentiment: "positive",
  },
  {
    id: "ar-4",
    title: "هيئة السوق المالية السعودية تصدر لوائح جديدة لتعزيز حوكمة وتداول أدوات الدين والصكوك الخضراء",
    summary: "أصدرت هيئة السوق المالية (CMA) تحديثات إطارية لتعزيز جاذبية سوق الصكوك الإسلامية وجذب رؤوس الأموال الدولية لتمويل مشاريع الاستدامة والتحول الطاقي.",
    source: "هيئة السوق المالية (CMA)",
    url: "https://cma.org.sa",
    published_at: new Date(Date.now() - 210 * 60 * 1000).toISOString(),
    category: "تشريعات وأسواق الدين",
    tickers: ["SUKUK"],
    sentiment: "neutral",
  },
  {
    id: "ar-5",
    title: "سوق دبي المالي وأبوظبي يواصلان استقطاب إدراجات نوعية جديدة في قطاعات الرعاية والتكنولوجيا",
    summary: "شهدت أسواق المال الإماراتية نشاطاً ملحوظاً للاكتتابات العامة الأولية (IPOs) مع إقبال فاق التغطية المؤسسية بعدة مرات، مما يعكس متانة البيئة الاستثمارية وتنوع الاقتصاد.",
    source: "أسواق الإمارات المالية",
    url: "https://www.dfm.ae",
    published_at: new Date(Date.now() - 320 * 60 * 1000).toISOString(),
    category: "اكتتابات أولية",
    tickers: ["DFM", "ADX"],
    sentiment: "positive",
  }
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';

  const now = Date.now();
  if (cachedArabicNews && now - cachedArabicNews.timestamp < ARABIC_CACHE_TTL_MS && !search) {
    return Response.json(cachedArabicNews.data, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    });
  }

  const { FINLIGHT_API_KEY } = getServerEnv();

  if (!FINLIGHT_API_KEY) {
    const filteredFallback = FALLBACK_ARABIC_NEWS.filter(item => {
      if (search && !item.title.includes(search) && !item.summary.includes(search)) {
        return false;
      }
      return true;
    });

    return Response.json({
      data: filteredFallback,
      total: filteredFallback.length,
      cachedAt: new Date().toISOString(),
      fallbackMode: true,
      notice: 'FINLIGHT_API_KEY غير مهيأ. يتم عرض موجز الأخبار المالية العربية السيادي الاحتياطي.',
    });
  }

  try {
    let apiUrl = `https://api.finlight.me/v1/news/arabic?limit=15`;
    if (search) {
      apiUrl += `&q=${encodeURIComponent(search)}`;
    }

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${FINLIGHT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 600 },
    });

    if (!response.ok) {
      console.warn(`Finlight API returned status ${response.status}. Using fallback curated feed.`);
      return Response.json({
        data: FALLBACK_ARABIC_NEWS,
        total: FALLBACK_ARABIC_NEWS.length,
        fallbackMode: true,
        notice: `Finlight API responded with status ${response.status}. Displaying backup feed.`,
      });
    }

    const json = await response.json();
    // Normalize articles structure
    const articles: FinlightArabicArticle[] = Array.isArray(json.data) 
      ? json.data 
      : Array.isArray(json.articles) 
        ? json.articles 
        : FALLBACK_ARABIC_NEWS;

    const payload: FinlightResponse = {
      data: articles,
      total: articles.length,
      cachedAt: new Date().toISOString(),
      fallbackMode: false,
    };

    if (!search) {
      cachedArabicNews = { data: payload, timestamp: now };
    }

    return Response.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    });
  } catch (error: any) {
    console.error('Finlight API route error:', error);
    return Response.json({
      data: FALLBACK_ARABIC_NEWS,
      total: FALLBACK_ARABIC_NEWS.length,
      fallbackMode: true,
      notice: 'خطأ في الاتصال بواجهة الأخبار العربية. يتم عرض البيانات المخزنة مؤقتاً.',
    });
  }
}
