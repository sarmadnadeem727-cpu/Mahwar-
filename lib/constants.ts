export const TICKERS: { symbol: string; name: string; price: string; change: string; percent: string; up: boolean }[] = [];

export const FEATURES = [
  {
    title: "DCF Valuation Engine",
    arabic: "محرك تقييم التدفقات النقدية (DCF)",
    description: "High-precision discounted cash flow models with automated WACC, 5-year FCF, sensitivity heatmaps, and Monte Carlo simulation.",
    icon: "⬡",
    tag: "VALUATION",
    viz: "DCF",
  },
  {
    title: "LBO Deal Builder",
    arabic: "باني صفقات الاستحواذ (LBO)",
    description: "Complex leveraged buyout modeling with senior, mezzanine, and PIK debt waterfalls, MOIC, and exit IRR trajectories.",
    icon: "✦",
    tag: "PRIVATE EQUITY",
    viz: "LBO",
  },
  {
    title: "AAOIFI Shariah Screening",
    arabic: "الفحص الشرعي المعيار 21",
    description: "Institutional AAOIFI Standard No. 21 compliance engine with debt, interest, and receivables audit plus purification metrics.",
    icon: "✧",
    tag: "COMPLIANCE",
    viz: "Shariah",
  },
  {
    title: "Company Comparator Matrix",
    arabic: "مقارنة الشركات ومصفوفة الأقران",
    description: "Multi-company valuation multiples, dividend yields, market cap matrix, and interactive scatter plot analytics.",
    icon: "⊞",
    tag: "COMPARISON",
    viz: "Matrix",
  },
  {
    title: "Linked 3-Statement Model",
    arabic: "القوائم المالية الثلاث المترابطة",
    description: "Dynamic integration of Income Statement, Balance Sheet, and Cash Flow with Saudi GAAP (2.5% Zakat) vs. IFRS toggle.",
    icon: "◎",
    tag: "ACCOUNTING",
    viz: "3S",
  },
  {
    title: "BI Report Engine",
    arabic: "محرك تقارير ذكاء الأعمال الموحد",
    description: "Executive session report generator with print styling, Excel data output, and vector PDF export.",
    icon: "△",
    tag: "REPORTING",
    viz: "Report",
  },
];
