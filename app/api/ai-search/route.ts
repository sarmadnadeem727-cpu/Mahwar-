import { NextRequest } from 'next/server';
import { getServerEnv } from '@/lib/env';

// In-memory token bucket rate limiter per IP/Session
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20; // 20 requests per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.lastReset > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  entry.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  // Extract client IP for rate limiting
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous-client';

  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please wait a minute before sending more queries.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { GEMINI_API_KEY } = getServerEnv();

  if (!GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: 'Gemini API key is not configured. Please set GEMINI_API_KEY in .env.local or Vercel Environment Variables.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await req.json()) as {
      query: string;
      locale?: 'en' | 'ar';
    };

    const { query, locale = 'en' } = body;
    if (!query || typeof query !== 'string') {
      return new Response(JSON.stringify({ error: 'Query parameter is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const isAr = locale === 'ar';

    const systemInstruction = isAr
      ? `أنت المساعد المالي الذكي لمنصة "محور (Mahwar) — المحطة المالية الذكية لأسواق المال الخليجية (GCC)".
مهامك:
- تقديم إجابات مالية سريعة ودقيقة وموجزة (بين 2 إلى 4 جمل فقط ما لم يطلب المستخدم تفصيلاً عميقاً).
- الإلمام بأسواق الخليج (تداول السعودية، سوق دبي المالي DFM، سوق أبوظبي ADX، بورصة قطر، بورصة الكويت، بورصة البحرين، بورصة مسقط).
- الإلمام بمعايير المحاسبة والتقييم (DCF، مضاعفات LBO، معايير أيوفي AAOIFI للفحص الشرعي، وحسابات الزكاة الشرعية 2.5%).
- إذا سُئلت عن بيانات مالية محددة غير متوفرة لديك بدقة، قل بصراحة ووضوح "لا تتوفر لدي هذه البيانات في الوقت الحالي" وتجنب تماماً التخمين أو اختلاق أرقام غير موثوقة.
- اكتب بلغة عربية فصحى ومصطلحات مالية دقيقة.`
      : `You are the embedded AI financial assistant for "Mahwar (محور) — The Sovereign Intelligence Terminal for GCC Capital Markets".
Your tasks:
- Provide fast, precise, institutional-grade financial answers in 2–4 concise sentences unless the user explicitly requests deep breakdown.
- Possess authoritative knowledge of GCC capital markets (Saudi Tadawul, DFM, ADX, QSE, Boursa Kuwait, Bahrain Bourse, MSX).
- Possess deep understanding of financial engines (5-year DCF, LBO waterfalls, AAOIFI Standard No. 21 Shariah screening, Saudi Zakat 2.5% rules, IFRS/Saudi GAAP).
- If asked for specific company metrics or fundamental numbers that you are not 100% certain about, explicitly say "I do not have verified data for that metric in this session" rather than hallucinating numbers.
- Maintain a concise, sharp institutional tone.`;

    const prompt = `${isAr ? 'سؤال المستخدم:' : 'User Query:'} "${query}"`;

    // Using gemini-2.5-flash which is free-tier eligible with SSE streaming
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=${GEMINI_API_KEY}&alt=sse`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: `${systemInstruction}\n\n${prompt}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 600,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini AI Search API Error:', errText);
      return new Response(JSON.stringify({ error: 'AI Search generation failed' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error: any) {
    console.error('AI Search Exception:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
