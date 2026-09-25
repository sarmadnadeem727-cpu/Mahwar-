/**
 * lib/registry.ts — the ONE list of everything the terminal can open.
 *
 * Sidebar, command palette, hub grids, top-bar titles, the landing page
 * showcase, the footer and the `GO` command line all read from here.
 * Add a module once and it appears everywhere.
 */
import type { LucideIcon } from "lucide-react";
import {
  Columns, Newspaper, ShieldCheck, BarChart3, Layers, FileSpreadsheet, FileText,
  Table, Dices, Calculator, FileCheck, Coins, Handshake, Activity, RefreshCw,
  DollarSign, PackageCheck, ShieldAlert, Grid3X3, TrendingUp, Ship, Award, MapPin,
  LayoutDashboard, Sparkles, Map, Landmark, CalendarClock, Scale, Boxes, Waves, Route,
  TerminalSquare, Gauge, HeartPulse, PieChart, CalendarRange, ArrowLeftRight, ListChecks,
  Network, Target, Timer, Warehouse, GitFork, Radar, Percent,
} from "lucide-react";
import type { PanelType, SessionAnalyses } from "@/store/useTerminalStore";
import { APP_VERSION } from "@/lib/constants";

export const APP = {
  name: "Mahwar",
  nameAr: "محور",
  tagline: "The axis where capital meets logistics",
  taglineAr: "المحور الذي يلتقي فيه رأس المال بسلاسل الإمداد",
  /** Single source of truth: package.json → lib/constants.ts → here. Never type a version anywhere else. */
  version: APP_VERSION,
  url: process.env.NEXT_PUBLIC_APP_URL || "https://mahwar.vercel.app",
  repo: "https://github.com/sarmadnadeem727-cpu/Mahwar-",
  author: "Muhammad Sarmad Nadeem",
  authorAr: "محمد سرمد نديم",
  heroVideo: process.env.NEXT_PUBLIC_HERO_VIDEO || "/bg-video.mp4",
  /** Where privacy requests go. Set NEXT_PUBLIC_PRIVACY_CONTACT before going live. */
  contact: process.env.NEXT_PUBLIC_PRIVACY_CONTACT || "",
} as const;

export type SuiteId = "platform" | "finance" | "operations" | "research";

export interface Suite {
  id: SuiteId;
  en: string;
  ar: string;
  short: string;
  shortAr: string;
}

export const SUITES: Suite[] = [
  { id: "platform", en: "Platform", ar: "المنصة", short: "Platform", shortAr: "المنصة" },
  { id: "finance", en: "Financial models", ar: "النماذج المالية", short: "Finance", shortAr: "المالية" },
  { id: "operations", en: "Supply chain & operations", ar: "سلاسل الإمداد والعمليات", short: "Supply chain", shortAr: "سلاسل الإمداد" },
  { id: "research", en: "Research & reporting", ar: "الأبحاث والتقارير", short: "Research", shortAr: "الأبحاث" },
];

export interface Cluster {
  id: string;
  en: string;
  ar: string;
}

export const CLUSTERS: Record<string, Cluster> = {
  valuation: { id: "valuation", en: "Valuation", ar: "التقييم" },
  deals: { id: "deals", en: "Deals & M&A", ar: "الصفقات والاستحواذ" },
  statements: { id: "statements", en: "Statements & modelling", ar: "القوائم والنمذجة" },
  working_capital: { id: "working_capital", en: "Working capital", ar: "رأس المال العامل" },
  inventory: { id: "inventory", en: "Inventory & ordering", ar: "المخزون وأوامر التوريد" },
  planning: { id: "planning", en: "Planning & forecasting", ar: "التخطيط والتنبؤ" },
  cost: { id: "cost", en: "Cost & sourcing", ar: "التكلفة والتوريد" },
  network: { id: "network", en: "Network logistics", ar: "شبكة اللوجستيات" },
  debt: { id: "debt", en: "Debt & fixed income", ar: "الدين والدخل الثابت" },
  markets: { id: "markets", en: "Markets & screening", ar: "الأسواق والفرز" },
  research: { id: "research", en: "Research & reporting", ar: "الأبحاث والتقارير" },
};

/** Display order for the categorised engine lists (landing ENGINES chapter, sidebar sub-groups). */
export const CLUSTER_ORDER: (keyof typeof CLUSTERS)[] = [
  "markets", "valuation", "deals", "statements", "debt", "working_capital", "inventory", "planning", "cost", "network", "research",
];

export interface ToolDef {
  id: PanelType;
  /** Bloomberg-style function code typed into the GO line, e.g. `DCF`, `EOQ`. */
  code: string;
  suite: SuiteId;
  cluster?: keyof typeof CLUSTERS;
  en: string;
  ar: string;
  descEn: string;
  descAr: string;
  tag: string;
  icon: LucideIcon;
  keywords: string[];
  /** Key inside `SessionAnalyses` that this tool writes to, if any. */
  sessionKey?: keyof SessionAnalyses;
}

export const TOOLS: ToolDef[] = [
  // ---------------- Platform ----------------
  {
    id: "hub", code: "HOME", suite: "platform", icon: Columns, tag: "HUB",
    en: "Intelligence hub", ar: "مركز الاستخبارات",
    descEn: "Session board, module launcher and activity log.",
    descAr: "لوحة الجلسة ومشغّل الوحدات وسجل النشاط.",
    keywords: ["hub", "home", "dashboard", "overview", "الرئيسية", "مركز"],
  },
  {
    id: "news", code: "WIRE", suite: "platform", icon: Newspaper, tag: "LIVE",
    en: "Market wire", ar: "الأخبار المالية المباشرة",
    descEn: "Live GCC capital-markets headlines.",
    descAr: "عناوين أسواق رأس المال الخليجية مباشرة.",
    keywords: ["news", "wire", "headlines", "أخبار"],
  },
  {
    id: "operations_hub", code: "OPS", suite: "platform", icon: LayoutDashboard, tag: "SUITE",
    en: "Operations suite", ar: "مركز العمليات",
    descEn: "Launcher for every supply-chain and operations engine.",
    descAr: "مشغّل جميع محركات سلاسل الإمداد والعمليات.",
    keywords: ["operations", "supply chain", "logistics", "عمليات", "سلاسل"],
  },
  {
    id: "console", code: "CLI", suite: "platform", icon: TerminalSquare, tag: "CONSOLE",
    en: "Command console", ar: "وحدة التحكم",
    descEn: "Full-screen terminal: every verb and engine code, history and transcript.",
    descAr: "طرفية بملء الشاشة: كل الأوامر والأكواد والسجل.",
    keywords: ["console", "cli", "terminal", "command", "shell", "طرفية", "أوامر"],
  },

  // ---------------- Finance ----------------
  {
    id: "DCF", code: "DCF", suite: "finance", cluster: "valuation", icon: BarChart3, tag: "VALUATION", sessionKey: "dcf",
    en: "DCF valuation engine", ar: "محرك تقييم التدفقات (DCF)",
    descEn: "Five-year FCFF projection, Zakat-aware WACC, Gordon or exit-multiple terminal value and a WACC × growth sensitivity grid.",
    descAr: "توقع التدفقات النقدية لخمس سنوات، تكلفة رأس مال مراعية للزكاة، قيمة نهائية ومصفوفة حساسية.",
    keywords: ["dcf", "valuation", "discounted cash flow", "wacc", "intrinsic", "تقييم", "تدفقات"],
  },
  {
    id: "ddm", code: "DDM", suite: "finance", cluster: "valuation", icon: Coins, tag: "DIVIDEND",
    en: "Dividend discount model", ar: "نموذج خصم توزيعات الأرباح",
    descEn: "Multi-stage dividend valuation for yield-heavy GCC blue chips.",
    descAr: "تقييم متعدد المراحل لتوزيعات الأرباح للأسهم القيادية الخليجية.",
    keywords: ["ddm", "dividend", "gordon", "توزيعات"],
  },
  {
    id: "npv_irr", code: "NPV", suite: "finance", cluster: "valuation", icon: Calculator, tag: "QUICK",
    en: "NPV & IRR", ar: "صافي القيمة الحالية ومعدل العائد",
    descEn: "Rapid cash-flow appraisal with payback and IRR.",
    descAr: "تقييم سريع للتدفقات النقدية مع فترة الاسترداد ومعدل العائد الداخلي.",
    keywords: ["npv", "irr", "payback", "cash flow", "عائد"],
  },
  {
    id: "wacc", code: "WACC", suite: "finance", cluster: "valuation", icon: Activity, tag: "CAPM",
    en: "WACC & CAPM builder", ar: "باني تكلفة رأس المال (WACC)",
    descEn: "Cost of capital from risk-free, ERP, beta and target leverage.",
    descAr: "حساب تكلفة رأس المال من العائد الخالي من المخاطر وعلاوة المخاطر وبيتا.",
    keywords: ["wacc", "capm", "beta", "cost of capital", "تكلفة رأس المال"],
  },
  {
    id: "monte_carlo", code: "MC", suite: "finance", cluster: "valuation", icon: Dices, tag: "RISK", sessionKey: "monteCarlo",
    en: "Monte Carlo risk engine", ar: "محاكاة مونت كارلو",
    descEn: "Probabilistic valuation with P10 / P50 / P90 bands.",
    descAr: "تقييم احتمالي مع نطاقات P10 / P50 / P90.",
    keywords: ["monte carlo", "simulation", "risk", "p90", "محاكاة"],
  },
  {
    id: "LBO", code: "LBO", suite: "finance", cluster: "deals", icon: Layers, tag: "PE DEAL", sessionKey: "lbo",
    en: "LBO deal builder", ar: "باني صفقات الاستحواذ (LBO)",
    descEn: "Multi-tranche debt waterfall, IRR and MOIC across hold periods.",
    descAr: "شلال ديون متعدد الشرائح مع معدل العائد الداخلي ومضاعف رأس المال.",
    keywords: ["lbo", "private equity", "irr", "moic", "leverage", "استحواذ"],
  },
  {
    id: "merger_analysis", code: "MA", suite: "finance", cluster: "deals", icon: Handshake, tag: "M&A",
    en: "Merger accretion / dilution", ar: "تحليل الاندماج والاستحواذ",
    descEn: "EPS impact and synergy value for strategic combinations.",
    descAr: "أثر الصفقة على ربحية السهم وقيمة التآزر.",
    keywords: ["merger", "accretion", "dilution", "eps", "synergy", "اندماج"],
  },
  {
    id: "acquisition_cost", code: "ACQ", suite: "finance", cluster: "deals", icon: Calculator, tag: "M&A", sessionKey: "acquisitionCost",
    en: "Acquisition cost calculator", ar: "حاسبة تكاليف الاستحواذ",
    descEn: "All-in transaction cost: advisory, financing and integration.",
    descAr: "التكلفة الشاملة للصفقة: الاستشارات والتمويل والدمج.",
    keywords: ["acquisition", "fees", "transaction cost", "تكاليف"],
  },
  {
    id: "FS", code: "3S", suite: "finance", cluster: "statements", icon: FileSpreadsheet, tag: "IFRS", sessionKey: "threeStatement",
    en: "3-statement model", ar: "نموذج القوائم المالية الثلاث",
    descEn: "Linked income statement, balance sheet and cash flow with an IFRS / Saudi GAAP Zakat toggle.",
    descAr: "قوائم مترابطة مع تبديل بين المعايير الدولية والزكاة السعودية.",
    keywords: ["three statement", "income", "balance sheet", "cash flow", "zakat", "قوائم"],
  },
  {
    id: "auto_statements", code: "AUTO", suite: "finance", cluster: "statements", icon: FileCheck, tag: "AUTO", sessionKey: "autoStatements",
    en: "Auto financial statements", ar: "القوائم المالية التلقائية",
    descEn: "Guided generation of a full statement set from a handful of drivers.",
    descAr: "توليد موجه لمجموعة قوائم كاملة من عدد قليل من المحركات.",
    keywords: ["auto statements", "generate", "توليد"],
  },
  {
    id: "custom_model", code: "GRID", suite: "finance", cluster: "statements", icon: Table, tag: "BUILDER", sessionKey: "customModel",
    en: "Custom model builder", ar: "باني النماذج المخصصة",
    descEn: "Spreadsheet-style grid with formula rows and five-year outputs.",
    descAr: "شبكة بأسلوب جداول البيانات مع صفوف صيغ ومخرجات خمس سنوات.",
    keywords: ["custom model", "spreadsheet", "formula", "excel", "نموذج"],
  },

  {
    id: "sukuk", code: "SUK", suite: "finance", cluster: "debt", icon: Landmark, tag: "ISLAMIC", sessionKey: "sukuk",
    en: "Sukuk pricer", ar: "مسعّر الصكوك",
    descEn: "Price, duration and convexity of a fixed-profit sukuk from its distribution schedule and market yield.",
    descAr: "سعر ومدة وتحدب صك ثابت الربح من جدول توزيعاته وعائد السوق.",
    keywords: ["sukuk", "bond", "yield", "duration", "convexity", "fixed income", "صكوك"],
  },
  {
    id: "debt_schedule", code: "AMORT", suite: "finance", cluster: "debt", icon: CalendarClock, tag: "FACILITY", sessionKey: "debtSchedule",
    en: "Debt & murabaha schedule", ar: "جدول سداد التمويل",
    descEn: "Annuity, equal-principal or bullet repayment schedules with grace periods and all-in APR including fees.",
    descAr: "جداول سداد بقسط ثابت أو أصل متساوٍ أو دفعة واحدة مع فترات سماح والتكلفة الشاملة.",
    keywords: ["amortization", "loan", "murabaha", "schedule", "apr", "repayment", "تمويل"],
  },
  {
    id: "breakeven", code: "CVP", suite: "finance", cluster: "statements", icon: Scale, tag: "CVP", sessionKey: "breakeven",
    en: "Break-even & operating leverage", ar: "نقطة التعادل والرفع التشغيلي",
    descEn: "Cost-volume-profit: break-even units, margin of safety, degree of operating leverage and target-profit volume.",
    descAr: "تحليل التكلفة والحجم والربح: وحدات التعادل وهامش الأمان ودرجة الرفع التشغيلي.",
    keywords: ["break even", "breakeven", "cvp", "contribution", "leverage", "تعادل"],
  },

  // ---------------- v5 finance ----------------
  {
    id: "comps", code: "COMPS", suite: "finance", cluster: "valuation", icon: Gauge, tag: "MULTIPLES", sessionKey: "comps",
    en: "Trading comps valuation", ar: "تقييم الشركات المماثلة",
    descEn: "Peer-multiple valuation: EV/EBITDA, EV/Sales and P/E with median, mean and quartile ranges → implied equity value per share.",
    descAr: "تقييم بمضاعفات الشركات المماثلة: الوسيط والمتوسط والربيعيات ← قيمة السهم الضمنية.",
    keywords: ["comps", "comparables", "multiples", "ev/ebitda", "peer", "relative valuation", "مماثلة", "مضاعفات"],
  },
  {
    id: "zscore", code: "Z", suite: "finance", cluster: "statements", icon: HeartPulse, tag: "CREDIT", sessionKey: "zscore",
    en: "Altman Z-score", ar: "مؤشر ألتمان Z",
    descEn: "Bankruptcy-risk score for public, private and non-manufacturing firms with zone diagnosis and implied default probability.",
    descAr: "درجة مخاطر الإفلاس للشركات المدرجة والخاصة وغير الصناعية مع تشخيص المنطقة واحتمال التعثر.",
    keywords: ["altman", "z-score", "zscore", "bankruptcy", "credit", "distress", "ألتمان", "تعثر"],
  },
  {
    id: "ratios", code: "RATIO", suite: "finance", cluster: "statements", icon: PieChart, tag: "20 RATIOS", sessionKey: "ratios",
    en: "Ratio analysis & DuPont", ar: "تحليل النسب ودوبونت",
    descEn: "Twenty liquidity, leverage, efficiency and profitability ratios with a three-step DuPont decomposition and health score.",
    descAr: "عشرون نسبة للسيولة والرفع والكفاءة والربحية مع تحليل دوبونت الثلاثي ودرجة الصحة المالية.",
    keywords: ["ratios", "dupont", "roe", "liquidity", "leverage", "profitability", "analysis", "نسب", "دوبونت"],
  },
  {
    id: "cash13", code: "C13", suite: "finance", cluster: "working_capital", icon: CalendarRange, tag: "13-WEEK", sessionKey: "cash13",
    en: "13-week cash forecast", ar: "توقع النقد لثلاثة عشر أسبوعاً",
    descEn: "Direct-method weekly liquidity: receipts, disbursements, revolver draws and minimum-cash breaches.",
    descAr: "سيولة أسبوعية بالطريقة المباشرة: المقبوضات والمدفوعات وسحب التسهيل وتنبيهات الحد الأدنى للنقد.",
    keywords: ["13 week", "cash forecast", "liquidity", "treasury", "revolver", "weekly", "نقد", "سيولة"],
  },
  {
    id: "fx_hedge", code: "FX", suite: "finance", cluster: "debt", icon: ArrowLeftRight, tag: "TREASURY", sessionKey: "fxHedge",
    en: "FX forward & hedge", ar: "التحوط من العملات",
    descEn: "Covered-interest forward, money-market hedge and unhedged scenarios for a future foreign-currency payable or receivable.",
    descAr: "سعر آجل بتعادل الفائدة، تحوط سوق النقد وسيناريوهات بدون تحوط لالتزام أو مستحق بعملة أجنبية.",
    keywords: ["fx", "forward", "hedge", "currency", "exposure", "money market", "تحوط", "عملات"],
  },
  {
    id: "capital_rationing", code: "CAPB", suite: "finance", cluster: "valuation", icon: ListChecks, tag: "CAPEX", sessionKey: "capitalRationing",
    en: "Capital budgeting & rationing", ar: "الموازنة الرأسمالية وتقنين رأس المال",
    descEn: "Rank projects by NPV, IRR and profitability index and pick the best portfolio under a hard capital limit.",
    descAr: "ترتيب المشاريع بصافي القيمة الحالية ومعدل العائد ومؤشر الربحية واختيار أفضل محفظة ضمن سقف رأس المال.",
    keywords: ["capital budgeting", "rationing", "profitability index", "portfolio", "projects", "capex", "موازنة", "مشاريع"],
  },

  // ---------------- v7 market data ----------------
  {
    id: "screener", code: "SCR", suite: "finance", cluster: "markets", icon: Radar, tag: "LIVE", sessionKey: "screener",
    en: "GCC stock screener", ar: "فاحص الأسهم الخليجية",
    descEn: "Screen Tadawul, DFM, ADX, QSE, Kuwait, Bahrain and Muscat names by cap, P/E, P/B, yield, ROE, growth, leverage and Shariah activity — with live prices when a provider key is set.",
    descAr: "فرز أسهم تداول ودبي وأبوظبي وقطر والكويت والبحرين ومسقط حسب القيمة والمكرر والعائد والنمو والرفع والتوافق الشرعي — مع أسعار مباشرة عند ضبط مفتاح المزود.",
    keywords: ["screener", "screen", "stocks", "equities", "tadawul", "dfm", "adx", "live", "quotes", "watchlist", "أسهم", "فاحص", "فرز"],
  },

  // ---------------- Operations ----------------
  {
    id: "ccc", code: "CCC", suite: "operations", cluster: "working_capital", icon: RefreshCw, tag: "WORKING CAP", sessionKey: "ccc",
    en: "Cash conversion cycle", ar: "دورة التحويل النقدي",
    descEn: "DIO, DSO and DPO with multi-period trend tracking.",
    descAr: "أيام المخزون والتحصيل والسداد مع تتبع الاتجاه عبر الفترات.",
    keywords: ["ccc", "dio", "dso", "dpo", "working capital", "دورة"],
  },
  {
    id: "wc_financing", code: "WCF", suite: "operations", cluster: "working_capital", icon: DollarSign, tag: "CASH COST", sessionKey: "wcFinancing",
    en: "Working-capital financing cost", ar: "تكلفة تمويل رأس المال العامل",
    descEn: "Carrying interest on inventory and receivables, with CCC-reduction sensitivity.",
    descAr: "تكلفة الفائدة الفعلية لرأس المال المجمّد مع حساسية تقليص الدورة.",
    keywords: ["financing", "carrying cost", "interest", "تمويل"],
  },
  {
    id: "eoq", code: "EOQ", suite: "operations", cluster: "inventory", icon: PackageCheck, tag: "INVENTORY", sessionKey: "eoq",
    en: "Economic order quantity", ar: "حجم الطلب الاقتصادي",
    descEn: "Cost-minimising order size with ordering vs. holding cost curves.",
    descAr: "حجم الطلب الأمثل مع منحنيات تكلفة الطلب والتخزين.",
    keywords: ["eoq", "order quantity", "holding", "ordering", "مخزون"],
  },
  {
    id: "safety_stock", code: "SS", suite: "operations", cluster: "inventory", icon: ShieldAlert, tag: "SERVICE LVL", sessionKey: "safetyStock",
    en: "Safety stock & reorder point", ar: "مخزون الأمان ونقطة إعادة الطلب",
    descEn: "Statistical buffers from lead-time volatility and target service level.",
    descAr: "احتياطي إحصائي من تقلب مدة التوريد ومستوى الخدمة المستهدف.",
    keywords: ["safety stock", "reorder", "service level", "lead time", "أمان"],
  },
  {
    id: "abc_xyz", code: "ABC", suite: "operations", cluster: "inventory", icon: Grid3X3, tag: "PARETO", sessionKey: "abcXyz",
    en: "ABC / XYZ classification", ar: "تصنيف ABC / XYZ",
    descEn: "3×3 portfolio matrix of annual spend value against demand volatility.",
    descAr: "مصفوفة 3×3 تجمع قيمة الإنفاق السنوي مع تقلب الطلب.",
    keywords: ["abc", "xyz", "pareto", "classification", "تصنيف"],
  },
  {
    id: "demand_forecast", code: "FCST", suite: "operations", cluster: "planning", icon: TrendingUp, tag: "FORECAST", sessionKey: "demandForecast",
    en: "Demand forecasting", ar: "التنبؤ بالطلب",
    descEn: "SMA, WMA and exponential smoothing with MAPE / MAD model tournaments.",
    descAr: "متوسطات متحركة وتمهيد أسي مع مقارنة دقة النماذج.",
    keywords: ["forecast", "demand", "time series", "sma", "smoothing", "تنبؤ"],
  },
  {
    id: "sop_worksheet", code: "SOP", suite: "operations", cluster: "planning", icon: FileSpreadsheet, tag: "S&OP", sessionKey: "sopWorksheet",
    en: "S&OP balancing worksheet", ar: "جدول موازنة العرض والطلب",
    descEn: "Rolling 12-month supply / demand balance with stock-out flags.",
    descAr: "موازنة متدحرجة لاثني عشر شهراً مع تنبيهات العجز.",
    keywords: ["s&op", "sop", "balance", "supply demand", "موازنة"],
  },
  {
    id: "landed_cost", code: "LAND", suite: "operations", cluster: "cost", icon: Ship, tag: "IMPORT", sessionKey: "landedCost",
    en: "Landed cost calculator", ar: "حاسبة التكلفة الواصلة",
    descEn: "Delivered unit cost: FOB, freight, insurance, GCC tariffs and port fees.",
    descAr: "التكلفة الفعلية للوحدة المستوردة شاملة الشحن والجمارك والموانئ.",
    keywords: ["landed cost", "import", "freight", "tariff", "customs", "شحن"],
  },
  {
    id: "tco", code: "TCO", suite: "operations", cluster: "cost", icon: Coins, tag: "LIFECYCLE", sessionKey: "tco",
    en: "Total cost of ownership", ar: "التكلفة الإجمالية للملكية",
    descEn: "Discounted lifecycle comparison of CapEx, OpEx and salvage.",
    descAr: "مقارنة مخصومة لدورة الحياة بين الإنفاق الرأسمالي والتشغيلي والقيمة المتبقية.",
    keywords: ["tco", "lifecycle", "ownership", "capex", "opex", "ملكية"],
  },
  {
    id: "supplier_scorecard", code: "SUPP", suite: "operations", cluster: "cost", icon: Award, tag: "RADAR", sessionKey: "supplierScorecard",
    en: "Supplier scorecard", ar: "بطاقة تقييم الموردين",
    descEn: "Weighted multi-criteria supplier benchmarking on a radar chart.",
    descAr: "مقارنة مرجحة متعددة المعايير للموردين على مخطط راداري.",
    keywords: ["supplier", "scorecard", "vendor", "radar", "موردين"],
  },
  {
    id: "facility_location", code: "GRAV", suite: "operations", cluster: "network", icon: MapPin, tag: "GRAVITY", sessionKey: "facilityLocation",
    en: "Facility location (gravity)", ar: "تحديد موقع المنشأة",
    descEn: "Centre-of-gravity hub coordinates that minimise ton-kilometres.",
    descAr: "إحداثيات مركز الثقل التي تقلل الطن-كيلومتر.",
    keywords: ["facility", "location", "gravity", "hub", "distribution", "موقع"],
  },

  {
    id: "newsvendor", code: "NV", suite: "operations", cluster: "inventory", icon: Boxes, tag: "SINGLE PERIOD", sessionKey: "newsvendor",
    en: "Newsvendor order model", ar: "نموذج بائع الصحف",
    descEn: "Optimal one-shot order under uncertain demand via the critical ratio, with expected profit and fill rate.",
    descAr: "الكمية المثلى لطلب واحد تحت طلب غير مؤكد عبر النسبة الحرجة مع الربح المتوقع.",
    keywords: ["newsvendor", "critical ratio", "seasonal", "perishable", "single period", "بائع الصحف"],
  },
  {
    id: "bullwhip", code: "WHIP", suite: "operations", cluster: "planning", icon: Waves, tag: "SIMULATION", sessionKey: "bullwhip",
    en: "Bullwhip effect simulator", ar: "محاكي تأثير السوط",
    descEn: "Order-variance amplification across up to six tiers under order-up-to policies and moving-average forecasts.",
    descAr: "تضخيم تباين الطلبات عبر ستة مستويات تحت سياسات الطلب حتى المستوى.",
    keywords: ["bullwhip", "variance", "amplification", "tiers", "beer game", "السوط"],
  },
  {
    id: "transport_mode", code: "MODE", suite: "operations", cluster: "network", icon: Route, tag: "SEA · AIR · RAIL", sessionKey: "transportMode",
    en: "Transport mode comparison", ar: "مقارنة وسائل النقل",
    descEn: "Total logistics cost by mode: freight, in-transit carrying, transit-driven safety stock and carbon.",
    descAr: "التكلفة اللوجستية الكلية لكل وسيلة: الشحن وحمل المخزون في الطريق ومخزون الأمان والكربون.",
    keywords: ["transport", "mode", "sea", "air", "rail", "freight", "carbon", "نقل"],
  },
  {
    id: "network_map", code: "MAP", suite: "operations", cluster: "network", icon: Map, tag: "CONTROL TOWER", sessionKey: "corridor",
    en: "Corridor planner", ar: "مخطط الممرات",
    descEn: "Real Gulf map: pick two hubs and a mode to get distance, door-to-door days, freight plus in-transit carrying cost, and CO₂.",
    descAr: "خريطة خليجية حقيقية: اختر مركزين ووسيلة لتحصل على المسافة والأيام والتكلفة والانبعاثات.",
    keywords: ["map", "corridor", "route", "control tower", "transit", "freight", "خريطة", "ممر"],
  },

  // ---------------- v5 operations ----------------
  {
    id: "mrp", code: "MRP", suite: "operations", cluster: "planning", icon: Network, tag: "BOM", sessionKey: "mrp",
    en: "MRP planner", ar: "تخطيط الاحتياجات من المواد",
    descEn: "Bill-of-materials explosion into time-phased gross / net requirements and planned order releases with lead-time offsets.",
    descAr: "تفكيك قائمة المواد إلى احتياجات إجمالية وصافية مرحلية وأوامر مخططة مع إزاحة مدة التوريد.",
    keywords: ["mrp", "bom", "bill of materials", "requirements", "planned orders", "تخطيط", "مواد"],
  },
  {
    id: "scor_kpi", code: "KPI", suite: "operations", cluster: "planning", icon: Target, tag: "SCOR", sessionKey: "scorKpi",
    en: "SCOR KPI scorecard", ar: "بطاقة مؤشرات SCOR",
    descEn: "Perfect order, OTIF, cycle time, cost-to-serve and asset metrics scored against targets on a five-attribute scorecard.",
    descAr: "الطلب المثالي وOTIF ودورة التنفيذ وتكلفة الخدمة ومقاييس الأصول مقارنة بالأهداف.",
    keywords: ["scor", "kpi", "otif", "perfect order", "scorecard", "metrics", "مؤشرات"],
  },
  {
    id: "flow", code: "FLOW", suite: "operations", cluster: "planning", icon: Timer, tag: "LEAN", sessionKey: "flow",
    en: "Flow analytics (Little / Takt / OEE)", ar: "تحليل التدفق (ليتل / تاكت / OEE)",
    descEn: "Little's law WIP, takt vs. cycle time, bottleneck utilisation and OEE decomposition for a production line.",
    descAr: "قانون ليتل ووقت التاكت مقابل زمن الدورة واستغلال عنق الزجاجة وتفكيك OEE لخط إنتاج.",
    keywords: ["flow", "little's law", "takt", "oee", "lean", "throughput", "bottleneck", "تدفق"],
  },
  {
    id: "warehouse", code: "WHSE", suite: "operations", cluster: "network", icon: Warehouse, tag: "CAPACITY", sessionKey: "warehouse",
    en: "Warehouse capacity planner", ar: "مخطط سعة المستودع",
    descEn: "Pallet positions, aisle and honeycomb losses, storage utilisation and cost per pallet-month.",
    descAr: "مواقع المنصات وفاقد الممرات والاستغلال وتكلفة المنصة شهرياً.",
    keywords: ["warehouse", "pallet", "capacity", "storage", "racking", "utilisation", "مستودع"],
  },
  {
    id: "make_buy", code: "MVB", suite: "operations", cluster: "cost", icon: GitFork, tag: "SOURCING", sessionKey: "makeBuy",
    en: "Make vs. buy", ar: "التصنيع أم الشراء",
    descEn: "Indifference volume between in-house production and outsourcing, with risk-adjusted totals and a strategic score.",
    descAr: "حجم التعادل بين التصنيع الداخلي والتوريد الخارجي مع الإجماليات المعدلة بالمخاطر.",
    keywords: ["make or buy", "make vs buy", "outsourcing", "insourcing", "sourcing", "تصنيع", "شراء"],
  },
  {
    id: "supplier_risk", code: "RISK", suite: "operations", cluster: "cost", icon: Radar, tag: "HHI", sessionKey: "supplierRisk",
    en: "Supplier risk & concentration", ar: "مخاطر الموردين والتركّز",
    descEn: "Herfindahl concentration, single-source exposure and a probability × impact risk register with expected loss.",
    descAr: "مؤشر هيرفندال والتعرض لمصدر واحد وسجل مخاطر الاحتمال × الأثر مع الخسارة المتوقعة.",
    keywords: ["supplier risk", "concentration", "hhi", "single source", "resilience", "مخاطر", "موردين"],
  },
  {
    id: "quantity_discount", code: "QD", suite: "operations", cluster: "inventory", icon: Percent, tag: "PRICE BREAKS", sessionKey: "quantityDiscount",
    en: "Quantity-discount EOQ", ar: "حجم الطلب مع خصم الكمية",
    descEn: "All-units and incremental price breaks: total annual cost at every feasible order size and the optimum.",
    descAr: "خصومات لكل الوحدات أو تصاعدية: التكلفة السنوية الكلية عند كل حجم طلب ممكن والحل الأمثل.",
    keywords: ["quantity discount", "price break", "eoq", "all units", "incremental", "خصم", "كمية"],
  },

  // ---------------- Research ----------------
  {
    id: "shariah", code: "AAOIFI", suite: "research", cluster: "research", icon: ShieldCheck, tag: "COMPLIANCE", sessionKey: "shariah",
    en: "Shariah screening", ar: "الفحص الشرعي",
    descEn: "AAOIFI Standard 21 ratio tests with purification amounts.",
    descAr: "اختبارات نسب معيار أيوفي 21 مع مبالغ التطهير.",
    keywords: ["shariah", "aaoifi", "halal", "purification", "compliance", "شرعي"],
  },
  {
    id: "bi_report", code: "RPT", suite: "research", cluster: "research", icon: FileText, tag: "SYNTHESIS",
    en: "BI report engine", ar: "محرك تقارير الأعمال",
    descEn: "Consolidates every saved analysis into a PDF or Excel briefing.",
    descAr: "يجمّع كل التحليلات المحفوظة في تقرير PDF أو Excel.",
    keywords: ["report", "export", "pdf", "excel", "synthesis", "تقرير"],
  },
];

export const TOOL_MAP: Record<string, ToolDef> = Object.fromEntries(TOOLS.map((tool) => [tool.id, tool]));

export function getTool(id: PanelType | string | null | undefined): ToolDef | undefined {
  return id ? TOOL_MAP[id] : undefined;
}

export function toolsBySuite(suite: SuiteId): ToolDef[] {
  return TOOLS.filter((tool) => tool.suite === suite);
}

/**
 * The analytical engines — everything except the platform shell (hub, wire,
 * launcher, console). `ENGINES.length` is the number the landing page quotes;
 * it is derived, never typed.
 */
export const ENGINES: ToolDef[] = TOOLS.filter((tool) => tool.suite !== "platform");

/** Engines grouped by cluster in CLUSTER_ORDER — the one canonical categorised list. */
export function enginesByCluster(): { cluster: Cluster; tools: ToolDef[] }[] {
  return CLUSTER_ORDER
    .map((id) => ({ cluster: CLUSTERS[id], tools: ENGINES.filter((t) => t.cluster === id) }))
    .filter((g) => g.tools.length > 0);
}

/** Flagship engines — each gets a full chapter with a live computed demo on the landing page. */
export const FLAGSHIP_IDS: PanelType[] = ["DCF", "LBO", "monte_carlo", "eoq", "ccc", "zscore"];
export const FLAGSHIPS: ToolDef[] = FLAGSHIP_IDS.map((id) => TOOL_MAP[id]).filter(Boolean);

/** Resolve a GO-line entry like `dcf`, `EOQ` or a fuzzy name to a tool. */
export function resolveCommand(input: string): ToolDef | undefined {
  const query = input.trim().toLowerCase();
  if (!query) return undefined;
  return (
    TOOLS.find((tool) => tool.code.toLowerCase() === query) ||
    TOOLS.find((tool) => tool.id.toLowerCase() === query) ||
    TOOLS.find((tool) => tool.en.toLowerCase().startsWith(query)) ||
    TOOLS.find((tool) => tool.keywords.some((keyword) => keyword.toLowerCase().startsWith(query)))
  );
}

export function isPanelType(value: string | null | undefined): value is PanelType {
  return !!value && value in TOOL_MAP;
}

export const FEATURE_ICON = Sparkles;

