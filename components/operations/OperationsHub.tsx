// components/operations/OperationsHub.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  RefreshCw, DollarSign, PackageCheck, ShieldAlert, Grid3X3, 
  TrendingUp, FileSpreadsheet, Ship, Coins, Award, MapPin, 
  ArrowRight, Sparkles, CheckCircle2, Sliders, ShieldCheck 
} from "lucide-react";
import { useTerminalStore, PanelType } from "@/store/useTerminalStore";
import { panelReveal } from "@/lib/motion";

interface ToolCardInfo {
  id: PanelType;
  title: string;
  titleAr: string;
  category: string;
  categoryAr: string;
  desc: string;
  descAr: string;
  icon: React.ReactNode;
  tag: string;
}

const OPERATIONS_TOOLS: ToolCardInfo[] = [
  // 1. Working Capital
  {
    id: "ccc",
    title: "Cash Conversion Cycle (CCC)",
    titleAr: "دورة التحويل النقدي (CCC)",
    category: "Working Capital",
    categoryAr: "رأس المال العامل",
    desc: "Measure days cash is tied up in operating cycle: DIO, DSO, and DPO with multi-period trend tracking.",
    descAr: "قياس الفترة الزمنية لتجميد السيولة النقدية: أيام المخزون والتحصيل والسداد ومسار التحسن.",
    icon: <RefreshCw size={20} className="text-emerald" />,
    tag: "WORKING CAP",
  },
  {
    id: "wc_financing",
    title: "Working Capital Financing Cost",
    titleAr: "تكلفة تمويل رأس المال العامل",
    category: "Working Capital",
    categoryAr: "رأس المال العامل",
    desc: "Quantify the actual carrying interest cost of inventory and receivables with CCC reduction sensitivity.",
    descAr: "حساب تكلفة الفائدة الفعلية لرأس المال المجمد في العمليات ومحاكاة الوفر عند تقليص أيام الدورة.",
    icon: <DollarSign size={20} className="text-emerald" />,
    tag: "CASH COST",
  },
  // 2. Inventory & Ordering
  {
    id: "eoq",
    title: "Economic Order Quantity (EOQ)",
    titleAr: "حجم الطلب الاقتصادي الأمثل (EOQ)",
    category: "Inventory & Ordering",
    categoryAr: "المخزون وأوامر التوريد",
    desc: "Calculate cost-minimizing batch order size with interactive ordering vs. holding cost curves.",
    descAr: "تحديد حجم الشحنة الأمثل الذي يحقق أدنى تكلفة كلية مع منحنيات التكلفة التفاعلية.",
    icon: <PackageCheck size={20} className="text-emerald" />,
    tag: "INVENTORY",
  },
  {
    id: "safety_stock",
    title: "Safety Stock & Reorder Point",
    titleAr: "مخزون الأمان ونقطة إعادة الطلب",
    category: "Inventory & Ordering",
    categoryAr: "المخزون وأوامر التوريد",
    desc: "Statistical buffer inventory engine with lead-time volatility and service-level tradeoff curves.",
    descAr: "حساب المخزون الاحتياطي ونقطة إعادة الطلب مع مراعاة تقلبات التوريد ومنحنى المفاضلة الإحصائي.",
    icon: <ShieldAlert size={20} className="text-emerald" />,
    tag: "SERVICE LVL",
  },
  {
    id: "abc_xyz",
    title: "ABC / XYZ Classification Tool",
    titleAr: "تصنيف المخزون المزدوج (ABC / XYZ)",
    category: "Inventory & Ordering",
    categoryAr: "المخزون وأوامر التوريد",
    desc: "3x3 strategic portfolio matrix combining Pareto annual spend value with demand volatility coefficients.",
    descAr: "مصفوفة 3×3 استراتيجية تجمع بين القيمة المالية السنوية (Pareto) ومعامل تقلب الطلب.",
    icon: <Grid3X3 size={20} className="text-emerald" />,
    tag: "PARETO MATRIX",
  },
  // 3. Planning & Forecasting
  {
    id: "demand_forecast",
    title: "Demand Forecasting Tool",
    titleAr: "محرك التنبؤ بالطلب والسلاسل الزمنية",
    category: "Planning & Forecasting",
    categoryAr: "التخطيط والتنبؤ",
    desc: "SMA, WMA, and SES statistical time-series forecasting with side-by-side MAPE / MAD tournaments.",
    descAr: "توقع المبيعات بالمتوسطات المتحركة والتمهيد الأسي مع مقارنة دقة النماذج (MAPE / MAD).",
    icon: <TrendingUp size={20} className="text-emerald" />,
    tag: "TIME SERIES",
  },
  {
    id: "sop_worksheet",
    title: "S&OP Supply / Demand Balancing",
    titleAr: "جدول موازنة العرض والطلب (S&OP)",
    category: "Planning & Forecasting",
    categoryAr: "التخطيط والتنبؤ",
    desc: "Rolling 12-month balance worksheet linking supply to forecasts, flagging stockouts and safety stock alerts.",
    descAr: "جدول موازنة متدحرج يربط خطط التوريد بتوقعات المبيعات مع تنبيهات العجز ونفاذ المخزون.",
    icon: <FileSpreadsheet size={20} className="text-emerald" />,
    tag: "ROLLING S&OP",
  },
  // 4. Cost & Sourcing
  {
    id: "landed_cost",
    title: "Landed Cost Calculator (GCC)",
    titleAr: "حاسبة التكلفة الإجمالية الواصلة",
    category: "Cost & Sourcing",
    categoryAr: "التكاليف والتوريد",
    desc: "Delivered import unit cost including FOB, ocean freight, insurance, GCC tariffs, and port fees.",
    descAr: "حساب التكلفة الفعلية للقطعة المستوردة متضمنة الشحن البحري والجمارك ورسوم الموانئ.",
    icon: <Ship size={20} className="text-emerald" />,
    tag: "IMPORT / GCC",
  },
  {
    id: "tco",
    title: "Total Cost of Ownership (TCO)",
    titleAr: "حاسبة التكلفة الإجمالية للملكية",
    category: "Cost & Sourcing",
    categoryAr: "التكاليف والتوريد",
    desc: "Discounted lifecycle present value model comparing CapEx vs. recurring OpEx and salvage values.",
    descAr: "مقارنة القرارات الاستثمارية على أساس القيمة الحالية المخصومة لكامل تكاليف التشغيل والصيانة.",
    icon: <Coins size={20} className="text-emerald" />,
    tag: "LIFECYCLE TCO",
  },
  {
    id: "supplier_scorecard",
    title: "Supplier Scorecard & Radar",
    titleAr: "بطاقة تقييم ومقارنة الموردين",
    category: "Cost & Sourcing",
    categoryAr: "التكاليف والتوريد",
    desc: "Multi-criteria weighted procurement evaluation benchmarked via dynamic spider radar charts.",
    descAr: "تقييم مرجح متعدد الأبعاد للموردين بناءً على السعر والجودة والموثوقية بمخطط راداري تفاعلي.",
    icon: <Award size={20} className="text-emerald" />,
    tag: "RADAR BENCHMARK",
  },
  // 5. Network
  {
    id: "facility_location",
    title: "Facility Location (Gravity Model)",
    titleAr: "تحديد موقع المنشأة (مركز الثقل)",
    category: "Network Logistics",
    categoryAr: "الشبكة اللوجستية",
    desc: "Geographic center of gravity model identifying optimal distribution hub coordinates minimizing ton-mileage.",
    descAr: "تحديد الإحداثيات الجغرافية المثلى لمركز التوزيع الإقليمي الذي يقلل تكاليف ومسافات النقل.",
    icon: <MapPin size={20} className="text-emerald" />,
    tag: "GEO GRAVITY",
  },
];

export default function OperationsHub() {
  const { language, setPanel } = useTerminalStore();
  const isAr = language === "ar";

  const categories = isAr
    ? ["الكل", "رأس المال العامل", "المخزون وأوامر التوريد", "التخطيط والتنبؤ", "التكاليف والتوريد", "الشبكة اللوجستية"]
    : ["All", "Working Capital", "Inventory & Ordering", "Planning & Forecasting", "Cost & Sourcing", "Network Logistics"];

  const [activeCategory, setActiveCategory] = React.useState<string>(categories[0]);

  const filteredTools = OPERATIONS_TOOLS.filter((tool) => {
    if (activeCategory === categories[0]) return true;
    if (isAr) {
      return tool.categoryAr === activeCategory;
    }
    return tool.category === activeCategory;
  });

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 font-sans text-slate-800"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* HEADER BANNER */}
      <div className="panel-input p-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="label-pill label-pill-emerald text-[9px]">
            {isAr ? "حزمة سلاسل الإمداد والعمليات" : "SOVEREIGN OPERATIONS SUITE"}
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            {isAr ? "11 نموذجاً حسابياً حركياً" : "11 CLIENT-SIDE ENGINES"}
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-slate-heading">
              {isAr ? "منصة سلاسل الإمداد والعمليات التشغيلية" : "Supply Chain & Operations Suite"}
            </h1>
            <p className="text-xs text-slate-muted font-sans font-medium mt-1 max-w-2xl">
              {isAr
                ? "حزمة أدوات متقدمة لحساب دورات رأس المال العامل، تحسين المخزون، التنبؤ بالطلب، تكاليف الاستيراد (Landed Cost)، والمفاضلة اللوجستية، مع تدقيق رياضي كامل وتصدير Excel و PDF."
                : "Institutional-grade decision models for working capital velocity, inventory buffer optimization, statistical demand forecasting, GCC landed cost, and logistics network modeling."}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-dim border border-emerald-border text-emerald font-mono font-bold text-xs">
              100% Client-Side Engine
            </span>
          </div>
        </div>

        {/* CATEGORY FILTER TABS */}
        <div className="flex items-center gap-1.5 pt-3 border-t border-surface-border overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat
                  ? "bg-emerald text-white shadow-2xs"
                  : "bg-surface-subtle text-slate-600 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* TOOLS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTools.map((tool) => (
          <motion.div
            key={tool.id}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.15 }}
            onClick={() => setPanel(tool.id)}
            className="card-nav p-5 flex flex-col justify-between cursor-pointer group"
          >
            <div className="space-y-3.5">
              <div className="flex justify-between items-start">
                <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[rgba(0,0,0,0.08)] group-hover:border-emerald-border group-hover:bg-emerald-dim transition-colors">
                  {tool.icon}
                </div>
                <span className="label-pill text-slate-muted text-[9px]">
                  {tool.tag}
                </span>
              </div>

              <div>
                <h3 className="font-serif text-base font-bold text-slate-heading group-hover:text-emerald transition-colors">
                  {isAr ? tool.titleAr : tool.title}
                </h3>
                <span className="text-[10px] font-mono text-slate-400 block mb-1">
                  {isAr ? tool.categoryAr : tool.category}
                </span>
                <p className="text-slate-body text-xs leading-relaxed font-sans font-medium line-clamp-3">
                  {isAr ? tool.descAr : tool.desc}
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[rgba(0,0,0,0.07)] flex items-center justify-between text-xs font-mono font-bold text-emerald">
              <span>{isAr ? "تشغيل المحرك" : "Launch Engine"}</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
