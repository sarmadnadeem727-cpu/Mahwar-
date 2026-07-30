// lib/i18n.ts

export const translations = {
  en: {
    // Brand & Identity
    app_name: "Mahwar",
    app_subtitle: "The Sovereign Intelligence Terminal for GCC Capital Markets",
    tagline_ar: "محور — المحطة المالية الذكية لأسواق المال الخليجية",
    author: "Muhammad Sarmad Nadeem",

    // Top Bar & Global Controls
    search_placeholder: "Search GCC stock ticker (e.g. 2222.SR, 1120.SR, Aramco)...",
    tasi_index: "TASI Index",
    market_status_open: "Tadaul Live",
    market_status_closed: "Market Closed",
    launch_terminal: "Enter Terminal",
    watch_demo: "Watch Overview",
    back_to_hub: "Intelligence Hub",
    language_toggle: "العربية",

    // Sidebar & Navigation
    nav_platform: "PLATFORM",
    nav_research: "RESEARCH & ANALYTICS",
    nav_models: "SOVEREIGN FINANCIAL MODELS",
    
    panel_hub: "Intelligence Hub",
    panel_live_market: "Live KSA Market",
    panel_technical: "Technical Charts",
    panel_ai_research: "AI Research Memos",
    panel_shariah: "Shariah Screening",
    panel_screener: "Market Screener",
    panel_dividends: "Dividend Intelligence",
    panel_ownership: "Ownership Structure",
    panel_calendar: "Economic Calendar",
    panel_bi_report: "BI Report Engine",
    panel_dcf: "DCF Valuation Engine",
    panel_lbo: "LBO Deal Builder",
    panel_three_statement: "3-Statement Model",
    panel_gcc_map: "GCC Regional Map",

    // Intelligence Hub
    market_summary: "Market Overview",
    performance_alpha: "Performance Alpha vs TASI Benchmark",
    quick_launch_tools: "Sovereign Model Launchpad",
    institutional_flow: "Institutional Order Flow Tape",
    side_buy: "BUY",
    side_sell: "SELL",
    status_executed: "EXECUTED",
    status_pending: "PENDING",

    // AI Research
    ai_research_title: "AI Equity Research Generator",
    ai_ticker_label: "Target Ticker",
    ai_query_placeholder: "Ask specific research question (e.g., Zakat impact on Q3 net margin)...",
    generate_memo: "Generate Equity Memo",
    model_badge: "Gemini 2.5 Flash + Google Search Grounding",
    copy_report: "Copy Report",
    download_pdf: "Download PDF",
    recent_searches: "Recent Research History",
    verdict_buy: "BUY",
    verdict_hold: "HOLD",
    verdict_sell: "SELL",

    // DCF Engine
    dcf_assumptions: "Valuation Assumptions",
    rev_growth: "Revenue Growth Rate (%)",
    ebitda_margin: "EBITDA Margin (%)",
    capex_rev: "CapEx / Revenue (%)",
    tax_zakat: "Zakat / Tax Rate (%)",
    cost_equity: "Cost of Equity (%)",
    cost_debt: "Cost of Debt (%)",
    debt_weight: "Debt Weight (%)",
    terminal_growth: "Terminal Growth Rate (%)",
    run_dcf: "Run Valuation Model",
    intrinsic_value: "Intrinsic Value / Share",
    upside_downside: "Upside / Downside",
    sensitivity_matrix: "5x5 Sensitivity Heatmap (WACC vs Growth)",

    // LBO Builder
    lbo_inputs: "Deal Parameters",
    entry_price: "Entry Purchase Price (SAR M)",
    entry_ebitda_mult: "Entry EBITDA Multiple (x)",
    mgmt_equity_pct: "Management Equity (%)",
    senior_debt: "Senior Debt (SAR M)",
    mezz_debt: "Mezzanine Debt (SAR M)",
    pik_notes: "PIK Notes (SAR M)",
    hold_period: "Investment Hold Period",
    exit_multiple: "Exit EBITDA Multiple (x)",
    model_lbo: "Compute LBO Returns",
    moic: "MOIC (Multiple on Invested Capital)",
    irr_by_period: "IRR Projection by Hold Period",
    sources_and_uses: "Sources & Uses of Funds",

    // 3-Statement Model
    tab_income: "Income Statement",
    tab_balance: "Balance Sheet",
    tab_cashflow: "Cash Flow Statement",
    gaap_toggle: "Saudi GAAP / IFRS Mode",
    zakat_provision: "Zakat Provision (2.5% Net Assets)",
    export_excel: "Export Excel (.xlsx)",
    export_pdf: "Export PDF",

    // Shariah Screening
    shariah_verdict_compliant: "SHARIAH COMPLIANT",
    shariah_verdict_non_compliant: "NON-COMPLIANT",
    shariah_verdict_under_review: "UNDER REVIEW",
    aaoifi_standard: "Per AAOIFI Standard No. 21",
    debt_assets_ratio: "Debt-to-Assets Ratio (Max 33%)",
    interest_income_ratio: "Interest Income Ratio (Max 5%)",
    receivables_ratio: "Receivables Ratio (Max 49%)",
    purification_amount: "Purification Amount / Share",

    // Market Screener & Live KSA
    sector_filter: "Sector",
    all_sectors: "All Tadawul Sectors",
    heatmap_view: "Heatmap View",
    table_view: "Table View",
    auto_refresh_sec: "Auto Refreshing in",
    manual_refresh: "Refresh Feed",

    // Common Financial Terms
    ticker: "Ticker",
    company: "Company",
    price: "Price",
    change: "Change",
    market_cap: "Market Cap",
    volume: "Volume",
    pe_ratio: "P/E Ratio",
    div_yield: "Div Yield",
    high_52w: "52W High",
    low_52w: "52W Low",
    date: "Date"
  },
  ar: {
    // Brand & Identity
    app_name: "محور",
    app_subtitle: "منصة الاستخبارات المالية السيادية لأسواق المال الخليجية",
    tagline_ar: "محور — المحطة المالية الذكية لأسواق المال الخليجية",
    author: "محمد سرمد نديم",

    // Top Bar & Global Controls
    search_placeholder: "ابحث عن رمز سهم (مثلاً: 2222.SR، 1120.SR، أرامكو)...",
    tasi_index: "مؤشر تاسي",
    market_status_open: "تداول مباشر",
    market_status_closed: "السوق مغلق",
    launch_terminal: "تشغيل المنصة",
    watch_demo: "عرض التوضيح",
    back_to_hub: "مركز الاستخبارات",
    language_toggle: "English",

    // Sidebar & Navigation
    nav_platform: "المنصة",
    nav_research: "الأبحاث والتحليلات",
    nav_models: "النماذج المالية السيادية",
    
    panel_hub: "مركز الاستخبارات",
    panel_live_market: "السوق السعودي المباشر",
    panel_technical: "الرسوم البيانية الفنية",
    panel_ai_research: "مذكرات أبحاث الذكاء الاصطناعي",
    panel_shariah: "الفحص الشرعي (AAOIFI)",
    panel_screener: "فاحص أسواق الخليج",
    panel_dividends: "تحليل توزيعات الأرباح",
    panel_ownership: "هيكل الملكية المؤسسية",
    panel_calendar: "المفكرة الاقتصادية",
    panel_bi_report: "محرك تقارير ذكاء الأعمال",
    panel_dcf: "محرك تقييم التدفقات (DCF)",
    panel_lbo: "باني صفقات الاستحواذ (LBO)",
    panel_three_statement: "نموذج القوائم المالية الثلاث",
    panel_gcc_map: "خريطة أسواق الخليج",

    // Intelligence Hub
    market_summary: "نظرة عامة على السوق",
    performance_alpha: "أداء ألفا مقارنة بمؤشر تاسي",
    quick_launch_tools: "منصة تشغيل النماذج السيادية",
    institutional_flow: "شريط التدفقات النقدية المؤسسية",
    side_buy: "شراء",
    side_sell: "بيع",
    status_executed: "منفذ",
    status_pending: "قيد التنفيذ",

    // AI Research
    ai_research_title: "مولد أبحاث الأسهم بالذكاء الاصطناعي",
    ai_ticker_label: "الرمز المستهدف",
    ai_query_placeholder: "طرح سؤال بحثي محدد (مثلاً: أثر الزكاة على هامش صافي الربح)...",
    generate_memo: "توليد مذكرة التقييم",
    model_badge: "مدعوم بـ Gemini 2.5 Flash مع الربط بالبحث المباشر",
    copy_report: "نسخ التقرير",
    download_pdf: "تحميل PDF",
    recent_searches: "سجل الأبحاث الأخيرة",
    verdict_buy: "شراء",
    verdict_hold: "احتفاظ",
    verdict_sell: "بيع",

    // DCF Engine
    dcf_assumptions: "افتراضات التقييم",
    rev_growth: "معدل نمو الإيرادات (%)",
    ebitda_margin: "هامش الأرباح قبل الفوائد والضرائب (%)",
    capex_rev: "النفقات الرأسمالية / الإيرادات (%)",
    tax_zakat: "معدل الزكاة / الضريبة (%)",
    cost_equity: "تكلفة الملكية (%)",
    cost_debt: "تكلفة الدين (%)",
    debt_weight: "وزن الدين (%)",
    terminal_growth: "معدل النمو النهائي (%)",
    run_dcf: "تشغيل نموذج التقييم",
    intrinsic_value: "القيمة العادلة / السهم",
    upside_downside: "معدل الارتفاع / الهبوط",
    sensitivity_matrix: "خريطة الحساسية (معدل الخصم مقابل النمو)",

    // LBO Builder
    lbo_inputs: "معايير الصفقة",
    entry_price: "سعر الشراء (مليون ريال)",
    entry_ebitda_mult: "مضاعف الأرباح عند الدخول (x)",
    mgmt_equity_pct: "حصة الإدارة (%)",
    senior_debt: "الدين الممتاز (مليون ريال)",
    mezz_debt: "الدين الثانوي (مليون ريال)",
    pik_notes: "سندات الفائدة العينية (مليون ريال)",
    hold_period: "فترة الاستثمار",
    exit_multiple: "مضاعف الأرباح عند الخروج (x)",
    model_lbo: "حساب عائدات الاستحواذ",
    moic: "مضاعف رأس المال المستثمر (MOIC)",
    irr_by_period: "معدل العائد الداخلي (IRR) حسب الفترة",
    sources_and_uses: "مصادر واستخدامات الأموال",

    // 3-Statement Model
    tab_income: "قائمة الدخل",
    tab_balance: "الميزانية العمومية",
    tab_cashflow: "قائمة التدفقات النقدية",
    gaap_toggle: "وضع المعايير السعودية / الدولية (IFRS)",
    zakat_provision: "مخصص الزكاة الشرعية (2.5% من صافي الأصول)",
    export_excel: "تصدير إلى Excel (.xlsx)",
    export_pdf: "تصدير إلى PDF",

    // Shariah Screening
    shariah_verdict_compliant: "متوافق مع الشريعة الإسلامية",
    shariah_verdict_non_compliant: "غير متوافق شرعاً",
    shariah_verdict_under_review: "قيد المراجعة والتدقيق",
    aaoifi_standard: "وفق معيار أيوفي (AAOIFI) رقم 21",
    debt_assets_ratio: "نسبة الدين إلى الأصول (الحد الأقصى 33%)",
    interest_income_ratio: "نسبة الإيرادات المحرمة (الحد الأقصى 5%)",
    receivables_ratio: "نسبة الديون المستحقة (الحد الأقصى 49%)",
    purification_amount: "مبلغ التطهير واجب التبرع به / السهم",

    // Market Screener & Live KSA
    sector_filter: "القطاع",
    all_sectors: "جميع قطاعات تداول",
    heatmap_view: "عرض الخريطة الحرارية",
    table_view: "عرض الجدول",
    auto_refresh_sec: "تحديث تلقائي خلال",
    manual_refresh: "تحديث البيانات",

    // Common Financial Terms
    ticker: "الرمز",
    company: "الشركة",
    price: "السعر",
    change: "التغير",
    market_cap: "القيمة السوقية",
    volume: "حجم التداول",
    pe_ratio: "مكرر الأرباح",
    div_yield: "عائد التوزيعات",
    high_52w: "أعلى 52 أسبوع",
    low_52w: "أدنى 52 أسبوع",
    date: "التاريخ"
  }
};

export type Language = 'en' | 'ar';
export type TranslationKey = keyof typeof translations.en;

export function t(key: TranslationKey, lang: Language = 'en'): string {
  return translations[lang]?.[key] || translations['en'][key] || key;
}
