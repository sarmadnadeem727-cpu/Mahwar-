"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, Layers, FileSpreadsheet, Sparkles, ShieldCheck, 
  Filter, FileText, ChevronRight, CheckCircle2, Clock, Newspaper,
  TrendingUp, Activity, ArrowUpRight, ArrowDownRight, Globe
} from "lucide-react";
import { useTerminalStore, PanelType } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import { panelReveal } from "@/lib/motion";



export default function IntelligenceHub() {
  const { sessionAnalyses, setPanel, language, currency } = useTerminalStore();
  const isAr = language === 'ar';

  const overviewCards: {
    id: PanelType;
    title: string;
    desc: string;
    icon: React.ReactNode;
    hasData: boolean;
    statusLabel: string;
    tag: string;
  }[] = [
    {
      id: "DCF" as const,
      title: t("panel_dcf", language),
      desc: isAr ? "نموذج تقييم التدفقات النقدية المخصومة 5 سنوات" : "5-Year Discounted Cash Flow valuation engine",
      icon: <BarChart3 className="text-terminal-emerald" size={20} />,
      hasData: !!sessionAnalyses.dcf,
      statusLabel: !!sessionAnalyses.dcf 
        ? `${isAr ? "تم الحساب: " : "Computed: "} ${currency} ${sessionAnalyses.dcf.outputs.intrinsicValuePerShare}`
        : (isAr ? "جاهز للنمذجة" : "Ready for Inputs"),
      tag: "VALUATION"
    },
    {
      id: "LBO" as const,
      title: t("panel_lbo", language),
      desc: isAr ? "تحليل باني صفقات الاستحواذ المدعوم بالديون" : "Private equity leveraged buyout returns builder",
      icon: <Layers className="text-terminal-emerald" size={20} />,
      hasData: !!sessionAnalyses.lbo,
      statusLabel: !!sessionAnalyses.lbo 
        ? `${isAr ? "العائد الداخلي: " : "IRR: "} ${sessionAnalyses.lbo.outputs.irr}%`
        : (isAr ? "جاهز للنمذجة" : "Ready for Inputs"),
      tag: "PRIVATE EQUITY"
    },
    {
      id: "FS" as const,
      title: t("panel_three_statement", language),
      desc: isAr ? "توقعات القوائم الثلاث المتكاملة GAAP / IFRS" : "5-year integrated financial statement forecasts",
      icon: <FileSpreadsheet className="text-terminal-emerald" size={20} />,
      hasData: !!sessionAnalyses.threeStatement,
      statusLabel: !!sessionAnalyses.threeStatement 
        ? (isAr ? "القوائم نشطة" : "Active Statement")
        : (isAr ? "جاهز للنمذجة" : "Ready for Inputs"),
      tag: "ACCOUNTING"
    },
    {
      id: "shariah" as const,
      title: t("panel_shariah", language),
      desc: isAr ? "فحص الامتثال الشرعي وفق المعيار 21 (AAOIFI)" : "AAOIFI Standard No. 21 compliance screening",
      icon: <ShieldCheck className="text-terminal-emerald" size={20} />,
      hasData: !!sessionAnalyses.shariah,
      statusLabel: !!sessionAnalyses.shariah 
        ? `${isAr ? "الحكم: " : "Verdict: "} ${sessionAnalyses.shariah.outputs.verdict}`
        : (isAr ? "جاهز للتدقيق" : "Ready for Audit"),
      tag: "COMPLIANCE"
    },
    {
      id: "custom_model" as const,
      title: t("panel_custom_model", language),
      desc: isAr ? "جدول نماذج مالية حرة بصيغ مخصصة" : "Excel-style spreadsheet builder with custom arithmetic formulas",
      icon: <FileSpreadsheet className="text-terminal-emerald" size={20} />,
      hasData: !!sessionAnalyses.customModel,
      statusLabel: !!sessionAnalyses.customModel
        ? `${sessionAnalyses.customModel.models.length} ${isAr ? "نماذج مدخلة" : "Models Saved"}`
        : (isAr ? "جاهز للنمذجة" : "Ready for Inputs"),
      tag: "CUSTOM MODEL"
    },
    {
      id: "bi_report" as const,
      title: t("panel_bi_report", language),
      desc: isAr ? "محرك تقارير التجميع وتصدير PDF/Excel" : "Consolidated session reporting engine and PDF export",
      icon: <FileText className="text-terminal-emerald" size={20} />,
      hasData: Object.keys(sessionAnalyses).length > 0,
      statusLabel: Object.keys(sessionAnalyses).length > 0 
        ? (isAr ? "جاهز للتصدير" : "Ready to Export")
        : (isAr ? "في انتظار البيانات" : "Awaiting Data"),
      tag: "REPORTING"
    },
    {
      id: "ddm" as const,
      title: isAr ? "نموذج DDM (توزيعات الأرباح)" : "Dividend Discount Model",
      desc: isAr ? "نموذج تقييم توزيعات الأرباح متعدد المراحل" : "Multi-stage dividend valuation engine",
      icon: <TrendingUp className="text-terminal-emerald" size={20} />,
      hasData: false,
      statusLabel: isAr ? "جاهز للنمذجة" : "Ready for Inputs",
      tag: "VALUATION"
    },
    {
      id: "wacc" as const,
      title: isAr ? "باني تكلفة رأس المال (WACC)" : "WACC & CAPM Builder",
      desc: isAr ? "حاسبة تكلفة رأس المال والمخاطر باستخدام نموذج CAPM" : "Cost of capital calculator using risk premiums and CAPM",
      icon: <Activity className="text-terminal-emerald" size={20} />,
      hasData: false,
      statusLabel: isAr ? "جاهز للنمذجة" : "Ready for Inputs",
      tag: "VALUATION"
    },
    {
      id: "merger_analysis" as const,
      title: isAr ? "تحليل الاندماج والاستحواذ" : "M&A Accretion/Dilution",
      desc: isAr ? "تحليل أثر الاستحواذ والتآزر على ربحية السهم" : "EPS impact and synergy valuation for strategic M&A",
      icon: <Layers className="text-terminal-emerald" size={20} />,
      hasData: false,
      statusLabel: isAr ? "جاهز للنمذجة" : "Ready for Inputs",
      tag: "M&A"
    },
    {
      id: "npv_irr" as const,
      title: isAr ? "حاسبة NPV و IRR السريعة" : "Quick NPV / IRR",
      desc: isAr ? "تحليل سريع للتدفقات النقدية ومعدل العائد الداخلي" : "Rapid cash flow analysis and internal rate of return",
      icon: <Sparkles className="text-terminal-emerald" size={20} />,
      hasData: false,
      statusLabel: isAr ? "جاهز للنمذجة" : "Ready for Inputs",
      tag: "VALUATION"
    }
  ];

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-8 text-slate-800 font-sans"
      dir={isAr ? "rtl" : "ltr"}
    >


      {/* HUB HEADER BANNER */}
      <div className="bg-white p-8 rounded-lg border border-[#E2E8F0] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div className="space-y-2">
          <span className="px-3 py-1 text-xs font-mono text-emerald bg-emerald-dim border border-emerald-border rounded-full font-bold uppercase tracking-wider shadow-2xs">
            {isAr ? "محطة عمل النمذجة التكتيكية v2.5" : "Institutional Sovereign Engine v2.5"}
          </span>
          <h2 className="font-serif text-3xl font-bold text-slate-900">
            {isAr ? "لوحة التحكم ومركز النمذجة الكمية" : "Quantitative Financial Workbench"}
          </h2>
          <p className="text-slate-600 text-xs leading-relaxed max-w-xl font-sans">
            {isAr 
              ? "استكشف أدوات النمذجة التكتيكية (DCF & LBO)، الفحص الشرعي AAOIFI، مقارنة الأقران، وتصنيع التقارير الموحدة." 
              : "Build institutional financial models (DCF & LBO), verify AAOIFI Shariah compliance, run peer heatmaps, and synthesize outputs into executive PDF reports."
            }
          </p>
        </div>

        <button
          onClick={() => setPanel("bi_report")}
          className="px-6 py-3 bg-emerald hover:bg-emerald-light text-white font-mono text-xs font-bold rounded-lg flex items-center gap-2 shadow-sm cursor-pointer transition-colors uppercase tracking-wider"
        >
          <FileText size={14} />
          <span>{isAr ? "تصدير التقرير الموحد" : "Generate BI Report"}</span>
        </button>
      </div>

      {/* TOOLS & STATUS GRID */}
      <div className="space-y-4">
        <h3 className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
          {isAr ? "أدوات النمذجة والتحليل الكمي" : "Sovereign Modeling Tools & Workbench Status"}
        </h3>

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.05 }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {overviewCards.map((card) => (
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
              }}
              key={card.id}
              onClick={() => setPanel(card.id)}
              className="bg-white p-6 rounded-lg border border-[#E2E8F0] hover:border-emerald transition-all cursor-pointer flex flex-col justify-between h-[180px] group relative shadow-sm hover:shadow-md"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-mono font-bold text-slate-500 tracking-wider">
                    {card.tag}
                  </span>
                  <div className="p-2 rounded-lg bg-slate-50 border border-[#E2E8F0] group-hover:border-emerald transition-colors">
                    {card.icon}
                  </div>
                </div>

                <h4 className="font-serif text-base font-bold text-slate-900 group-hover:text-emerald transition-colors">
                  {card.title}
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-normal font-sans">
                  {card.desc}
                </p>
              </div>

              {/* Status footer inside card */}
              <div className="border-t border-[#E2E8F0] pt-3 mt-4 flex justify-between items-center text-xs font-mono">
                <span className="flex items-center gap-1">
                  {card.hasData ? (
                    <>
                      <CheckCircle2 size={13} className="text-emerald" />
                      <span className="text-emerald font-bold">{card.statusLabel}</span>
                    </>
                  ) : (
                    <>
                      <Clock size={13} className="text-slate-400" />
                      <span className="text-slate-500">{card.statusLabel}</span>
                    </>
                  )}
                </span>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-emerald transition-colors" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
