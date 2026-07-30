import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkQuota } from '@/lib/usage/checkQuota';

export async function POST(req: NextRequest) {
  const GEMINI_API_KEY = process.env.GOOGLE_API_KEY;
  
  if (!GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: 'Gemini API key is not configured' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: 'unauthorized', message: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Quota check
  const quota = await checkQuota(user.id, 'ai_research');
  if (!quota.allowed) {
    return new Response(
      JSON.stringify({ 
        error: 'quota_exceeded', 
        plan: quota.plan, 
        upgradeUrl: '/pricing' 
      }), 
      { 
        status: 402, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    const body = (await req.json()) as {
      ticker: string;
      fundamentals: any;
      query?: string;
      language?: 'en' | 'ar';
    };
    
    const { ticker, fundamentals, query, language = 'en' } = body;
    const isAr = language === 'ar';

    const fundamentalsString = typeof fundamentals === 'string' 
      ? fundamentals 
      : JSON.stringify(fundamentals, null, 2);

    const researchFocus = query 
      ? (isAr 
          ? `\nتركيز البحث المحدد: قام المستخدم بطرح السؤال التالي: "${query}". يرجى الإجابة عن هذا السؤال بتفصيل عميق ودقة مؤسسية مع مراعاة بيانات الشركة.` 
          : `\nSPECIFIC RESEARCH FOCUS: The user asked: "${query}". Ensure this question is thoroughly answered with institutional depth based on company data.`)
      : (isAr 
          ? '\nتركيز البحث: تقديم تحليل شامل لأوضاع الشركة بالسوق، والتقييم المالي، وأطروحة الاستثمار.' 
          : '\nRESEARCH FOCUS: Provide a comprehensive state-of-the-market analysis, valuation breakdown, and investment thesis.');

    const prompt = isAr ? `أنت محلل أول لأسهم الشركات في بنك استثماري مرموق بالخليج العربي. اكتب مذكرة أبحاث استثمارية مؤسسية رفيعة المستوى لشركة ذات الرمز ${ticker}.

بيانات الشركة المالية (YAHOO FINANCE FUNDAMENTALS):
${fundamentalsString}

${researchFocus}

التعليمات:
- اكتب التقرير بالكامل باللغة العربية الفصحى برصانة مالية عالية.
- استخدم تنسيق Markdown أنيق وواضح مع رؤوس أقسام رئيسية بتبويب واضح.
- تضمن: المعايير المحاسبية السعودية (Saudi GAAP / IFRS)، المعالجة الشرعية للزكاة (2.5% من الأصول الزكوية)، وسياق رؤية المملكة 2030 للقطاع، وإفصاحات هيئة السوق المالية (CMA).
- استخدم الأرقام الدقيقة والنسب المالية بناءً على البيانات المقدمة فقط.

هيكل التقرير المطلوب:
# الملخص التنفيذي
(5-6 نقاط جوهرية توضح أطروحة الاستثمار)

# التحليل المالي والزكاة
(المؤشرات الرئيسية، هامش الربحية، معالجة الزكاة الشرعية، الاتجاهات السنوية)

# عوامل المخاطرة
(3-4 مخاطر رئيسية مع تحديد مستوى الخطورة: عالية / متوسطة / منخفضة)

# المحفزات المستقبلية
(3-4 محفزات إيجابية قريبة المدى)

# الحكم والتقييم النهائي
(التوصية: شراء / احتفاظ / بيع، نسبة القناعة %، وأطروحة العائد الكلي)

ا ختم التقرير بفقرة إخلاء مسؤولية قياسية معتمدة من هيئة السوق المالية (CMA).`
      : `You are a senior equity research analyst at a premier Gulf investment bank. Write an institutional-grade equity research memo for the GCC company with ticker ${ticker}.

COMPANY FUNDAMENTALS (YAHOO FINANCE):
${fundamentalsString}

${researchFocus}

INSTRUCTIONS:
- Write the entire report in professional financial English.
- Output clean Markdown with structured header formatting.
- Include: Saudi GAAP/IFRS treatment, Zakat considerations (replaces corporate tax for Saudi entities), Vision 2030 sector context, Capital Market Authority (CMA) disclosures.
- Use precise financial language, margins, and ratios based strictly on the provided fundamentals.

REQUIRED REPORT STRUCTURE:
# Executive Summary
(5-6 bullet points highlighting core investment thesis)

# Financial & Zakat Analysis
(Key ratios, profit margins, Zakat treatment, YoY performance trends)

# Risk Factors
(3-4 specific risks labeled with Severity: High/Medium/Low)

# Catalysts
(3-4 near-term positive growth triggers)

# Final Verdict
(Recommendation: BUY / HOLD / SELL, Conviction %, Total return target thesis)

End with a standard CMA compliance disclaimer paragraph.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=${GEMINI_API_KEY}&alt=sse`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }], // Real-time web grounding enabled
        generationConfig: { temperature: 0.1, maxOutputTokens: 3500 },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API Error:', errText);
      return new Response(JSON.stringify({ error: 'AI research generation service failed' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
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
    console.error('Research API Exception:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
