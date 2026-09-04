"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  BarChart3, Layers, ShieldCheck, Filter, FileSpreadsheet, 
  FileText, ArrowRight, CheckCircle2, Download, TrendingUp, Sliders
} from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";

export default function ToolShowcase() {
  const { language } = useTerminalStore();
  const isAr = language === 'ar';

  const tools = [
    {
      id: "DCF",
      title: isAr ? "محرك تقييم التدفقات (DCF)" : "DCF Valuation Engine",
      tag: "VALUATION",
      desc: isAr 
        ? "نموذج تقييم القيمة الجوهرية لـ 5 سنوات مع افتراضات WACC ونسب النمو الحركية وحساسية المحاكاة."
        : "5-year Discounted Cash Flow valuation engine with WACC sensitivity matrix and Monte Carlo simulation.",
      icon: <BarChart3 className="text-emerald" size={20} />,
      visual: (
        <div className="bg-surface-subtle p-3 rounded-lg border border-surface-border font-mono text-[11px] space-y-2">
          <div className="flex justify-between items-center text-slate-muted">
            <span>5Y FCF Trajectory</span>
            <span className="text-emerald font-bold">+18.4% Upside</span>
          </div>
          <div className="h-9 w-full">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 24">
              <path
                d="M 0 20 L 25 15 L 50 17 L 75 8 L 100 3"
                fill="none"
                stroke="#0E7C69"
                strokeWidth="2"
              />
              <circle cx="100" cy="3" r="3" fill="#0E7C69" />
            </svg>
          </div>
          <div className="flex justify-between text-[10px] text-slate-heading font-bold border-t border-surface-border pt-1.5">
            <span>FCF: SAR 1,250M</span>
            <span>Intrinsic: SAR 38.45</span>
          </div>
        </div>
      )
    },
    {
      id: "LBO",
      title: isAr ? "باني صفقات الاستحواذ (LBO)" : "LBO Deal Builder",
      tag: "PRIVATE EQUITY",
      desc: isAr 
        ? "تحليل صفقات الاستحواذ المدعوم بالديون، شلالات الديون متعددة الشرائح، وتوقعات معدل العائد الداخلي (IRR)."
        : "Leveraged buyout returns engine with senior, mezzanine & PIK debt waterfalls, MOIC, and exit IRR mapping.",
      icon: <Layers className="text-emerald" size={20} />,
      visual: (
        <div className="bg-surface-subtle p-3 rounded-lg border border-surface-border font-mono text-[11px] space-y-2">
          <div className="flex justify-between items-center text-slate-muted">
            <span>Projected Returns</span>
            <span className="text-emerald font-bold">2.65x MOIC</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-body">
              <span>Sponsor IRR</span>
              <span className="font-bold text-emerald">24.8%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald rounded-full w-[82%]" />
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-heading font-bold border-t border-surface-border pt-1.5">
            <span>Senior Debt: 55%</span>
            <span>Exit Multiple: 10.0x</span>
          </div>
        </div>
      )
    },
    {
      id: "shariah",
      title: isAr ? "الفحص الشرعي (AAOIFI 21)" : "AAOIFI Shariah Screening",
      tag: "COMPLIANCE",
      desc: isAr 
        ? "تدقيق آلي للامتثال المالي وفق المعيار الشرعي رقم 21 لحساب نسب الديون والربا وحساب مبلغ التطهير."
        : "Automated balance sheet compliance audit against AAOIFI Standard No. 21 ratio thresholds and purification per share.",
      icon: <ShieldCheck className="text-emerald" size={20} />,
      visual: (
        <div className="bg-surface-subtle p-3 rounded-lg border border-surface-border font-mono text-[11px] space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-muted">AAOIFI Status</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold text-emerald bg-emerald-dim border border-emerald-border">AAOIFI PASS</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
            <div className="p-1.5 bg-white border border-surface-border rounded text-center">
              <span className="text-slate-muted block text-[9px]">Debt / Assets</span>
              <span className="font-bold text-emerald">14.2% &lt; 33%</span>
            </div>
            <div className="p-1.5 bg-white border border-surface-border rounded text-center">
              <span className="text-slate-muted block text-[9px]">Purification</span>
              <span className="font-bold text-slate-heading">SAR 0.00</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "screener",
      title: isAr ? "مقارنة الشركات ومصفوفة الأقران" : "Company Comparator Matrix",
      tag: "COMPARISON",
      desc: isAr 
        ? "مصفوفة مقارنة تفاعلية وخريطة حرارية للشركات والنسب المالية والصفقات المدخلة يدوياً."
        : "Multi-company valuation multiples, dividend yields, market cap matrix, and scatter plot analytics.",
      icon: <Filter className="text-emerald" size={20} />,
      visual: (
        <div className="bg-surface-subtle p-3 rounded-lg border border-surface-border font-mono text-[11px] space-y-1.5">
          <div className="flex justify-between items-center text-slate-muted mb-1">
            <span>Peer Heatmap Swatch</span>
            <span className="text-emerald font-bold">6 Peers</span>
          </div>
          <div className="grid grid-cols-3 gap-1 text-[10px] text-center font-bold">
            <div className="p-1 bg-emerald-dim text-emerald rounded border border-emerald-border">ARAMCO 15.2x</div>
            <div className="p-1 bg-white text-slate-heading rounded border border-surface-border">RAJHI 18.5x</div>
            <div className="p-1 bg-emerald-dim text-emerald rounded border border-emerald-border">STC 14.8x</div>
          </div>
        </div>
      )
    },
    {
      id: "FS",
      title: isAr ? "القوائم المالية الثلاث المترابطة" : "Linked 3-Statement Model",
      tag: "ACCOUNTING",
      desc: isAr 
        ? "توقعات القوائم الثلاث (الأرباح، الميزانية، التدفقات) مع تبادل المعيار بين الزكاة السعودية 2.5% وضريبة IFRS."
        : "5-year linked income statement, balance sheet, and cash flow with Saudi GAAP (2.5% Zakat) vs. IFRS toggle.",
      icon: <FileSpreadsheet className="text-emerald" size={20} />,
      visual: (
        <div className="bg-surface-subtle p-3 rounded-lg border border-surface-border font-mono text-[11px] space-y-2">
          <div className="flex justify-between items-center text-slate-muted">
            <span>Accounting Standard</span>
            <span className="px-1.5 py-0.5 bg-white border border-surface-border text-emerald font-bold rounded text-[9px]">Saudi GAAP (Zakat 2.5%)</span>
          </div>
          <div className="flex justify-between text-[10px] text-slate-heading border-t border-surface-border pt-1.5 font-bold">
            <span>Rev CAGR: +12.0%</span>
            <span>Net Margin: 24.5%</span>
          </div>
        </div>
      )
    },
    {
      id: "custom_model",
      title: isAr ? "باني النماذج المخصصة (أسلوب إكسل)" : "Custom Model Builder (Excel-Style)",
      tag: "SPREADSHEET",
      desc: isAr
        ? "جدول مالي مرن يدعم الصيغ الحسابية المباشرة (=Revenue - COGS)، المخططات البيانية التفاعلية، والتصدير."
        : "Spreadsheet grid with live cascading arithmetic formulas (=Revenue - COGS), Recharts projections, and model persistence.",
      icon: <FileSpreadsheet className="text-emerald" size={20} />,
      visual: (
        <div className="bg-surface-subtle p-3 rounded-lg border border-surface-border font-mono text-[11px] space-y-1.5">
          <div className="flex justify-between items-center text-slate-muted mb-1">
            <span>Live Formula Grid</span>
            <span className="text-emerald font-bold font-mono">=Revenue - COGS</span>
          </div>
          <div className="space-y-1 text-[10px]">
            <div className="p-1 bg-white border border-surface-border rounded flex justify-between">
              <span>Gross Profit</span>
              <span className="font-bold text-emerald">SAR 4,500M</span>
            </div>
            <div className="p-1 bg-emerald-dim border border-emerald-border rounded flex justify-between text-emerald">
              <span>Net Income</span>
              <span className="font-bold">SAR 2,150M</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "bi_report",
      title: isAr ? "محرك تقارير ذكاء الأعمال" : "BI Report Engine (PDF/Excel)",
      tag: "REPORTING",
      desc: isAr 
        ? "تجميع نتائج النمذجة والحسابات وتصدير تقارير رفيعة المستوى ببيانات Excel وبملفات PDF موجهة للطباعة."
        : "Consolidates session modeling outputs, custom calculations, tables, and graphs into client-ready PDF and Excel reports.",
      icon: <FileText className="text-emerald" size={20} />,
      visual: (
        <div className="bg-surface-subtle p-3 rounded-lg border border-surface-border font-mono text-[11px] space-y-2">
          <div className="flex justify-between items-center text-slate-muted">
            <span>Report Export Mode</span>
            <span className="flex items-center gap-1 text-emerald font-bold">
              <Download size={11} />
              <span>PDF & XLSX</span>
            </span>
          </div>
          <div className="p-1.5 bg-white border border-surface-border rounded text-[10px] text-slate-heading font-bold flex justify-between items-center">
            <span>MAHWAR_REPORT.pdf</span>
            <span className="text-emerald">READY</span>
          </div>
        </div>
      )
    }
  ];

  return (
    <section id="solution" className="py-20 bg-white relative border-b border-surface-border font-sans" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-6">
        
        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-emerald-dim border border-emerald-border text-emerald text-mono-caption font-mono font-bold uppercase tracking-wider mb-4 rounded-full shadow-2xs">
            <span>{isAr ? "قدرات المحرك الكمي (7 نماذج)" : "THE 7-ENGINE WORKBENCH SUITE"}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-slate-heading mb-4">
            {isAr ? "أدوات مخصصة للتحليل المالي الخليجي" : "Built for the Nuances of GCC Capital Markets"}
          </h2>

          <p className="text-slate-body text-body-sm leading-relaxed font-sans font-medium">
            {isAr
              ? "تحليل شامل وهندسة مالية متكاملة لبياناتك الخاصة. حسابات دقيقة للتطهير الشرعي، نسب مديونية الأقران، نماذج التدفقات، وتوليد تقارير موحدة قابلة للطباعة."
              : "Consolidated, secure workspace for custom financial modeling. Run intrinsic evaluations, Shariah audits, peer multiples comparisons, and instantly download client-ready synthesis PDF reports."
            }
          </p>
        </div>

        {/* SHOWCASE GRID WITH REAL VISUAL PREVIEWS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, idx) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.06 }}
              className="bg-white p-6 rounded-xl border border-surface-border hover:border-emerald transition-all shadow-terminal-card hover:shadow-terminal-hover flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 rounded-lg bg-surface-subtle border border-surface-border text-emerald group-hover:border-emerald transition-colors">
                    {tool.icon}
                  </div>
                  <span className="px-2 py-0.5 rounded border border-surface-border bg-surface-subtle text-slate-muted font-mono font-bold text-[10px] tracking-wider uppercase">
                    {tool.tag}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-heading group-hover:text-emerald transition-colors mb-1">
                    {tool.title}
                  </h3>
                  <p className="text-slate-body text-xs leading-relaxed font-sans">
                    {tool.desc}
                  </p>
                </div>

                {/* Real Visual Sample Component */}
                <div className="pt-2">
                  {tool.visual}
                </div>
              </div>

              {/* Card Footer Link */}
              <div className="border-t border-surface-border pt-4 mt-6 flex justify-between items-center text-mono-caption font-mono">
                <Link
                  href={`/dashboard?panel=${tool.id}`}
                  className="flex items-center gap-1.5 text-emerald font-bold hover:underline group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform"
                >
                  <span>{isAr ? "تشغيل النموذج" : "Launch Engine"}</span>
                  <ArrowRight size={13} />
                </Link>
                <CheckCircle2 size={14} className="text-emerald" />
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
