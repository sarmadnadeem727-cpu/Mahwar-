import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const GEMINI_API_KEY = process.env.GOOGLE_API_KEY;
  
  if (!GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: 'AI service unavailable' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const body = (await req.json()) as {
    ticker: string;
    fundamentals: string; // Stringified JSON of the Yahoo fundamentals
    query?: string;
  };
  
  const { ticker, fundamentals, query } = body;

  const researchFocus = query 
    ? `\nRESEARCH FOCUS: The user has asked a specific question: "${query}". Ensure this question is answered in depth. Focus the report sections around this query while maintaining institutional rigor.`
    : '\nRESEARCH FOCUS: Provide a comprehensive state-of-the-market analysis and investment thesis.';

  const prompt = `You are a senior equity analyst at a top-tier Gulf investment bank. Write an institutional-grade equity research memo for the company with the ticker ${ticker}.
  
COMPANY FUNDAMENTALS (YAHOO FINANCE):
${fundamentals}

${researchFocus}

INSTRUCTIONS:
- Write the entire report in English.
- Output clean, professional Markdown. Do not use bright colors or erratic formatting. Use structured headers, bullet points, and bold text for emphasis.
- Include: Saudi GAAP/IFRS treatment, Zakat considerations (replaces corporate tax for Saudi entities), Vision 2030 sector context, CMA (Capital Market Authority) relevant disclosures if applicable.
- Use precise financial language. Include specific numbers, ratios, and year references based ONLY on the provided fundamentals. Do NOT invent numbers.
- Format as a structured report with clear section headers.

REPORT STRUCTURE:
# Executive Summary
(5-6 bullet points, most important investment thesis points)

# Financial Analysis
(key metrics, margin analysis, Zakat treatment, YoY trends based on the data)

# Risk Factors
(3-4 specific risks with severity: High/Medium/Low)

# Catalysts
(3-4 near-term positive catalysts)

# Final Verdict
(recommendation: BUY/HOLD/SELL, conviction %, total return thesis)

End with a standard CMA disclaimer paragraph.

Now write the full report:`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=${GEMINI_API_KEY}&alt=sse`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      tools: [{ google_search: {} }], // Enable Real-Time Grounding
      generationConfig: { temperature: 0.1, maxOutputTokens: 3000 },
    }),
  });

  if (!response.ok) {
    return new Response(JSON.stringify({ error: 'AI service unavailable' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Stream raw SSE back to client
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
}
