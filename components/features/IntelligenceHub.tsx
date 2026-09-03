"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, Layers, FileSpreadsheet, Sparkles, ShieldCheck, 
  Filter, FileText, ChevronRight, CheckCircle2, Clock, Newspaper,
  TrendingUp, Activity, ArrowUpRight, ArrowDownRight, Globe
} from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import { panelReveal } from "@/lib/motion";

interface MarketMover {
  ticker: string;
  name: string;
  nameAr: string;
  price: string;
  change: string;
  isPositive: boolean;
  market: string;
}

const GCC_MOVERS: MarketMover[] = [
  { ticker: "2222.SR", name: "Saudi Aramco", nameAr: "أرامكو السعودية", price: "27.85 SAR", change: "+1.2%", isPositive: true, market: "TASI" },
  { ticker: "1120.SR", name: "Al Rajhi Bank", nameAr: "مصرف الراجحي", price: "88.40 SAR", change: "+0.8%", isPositive: true, market: "TASI" },
  { ticker: "EMAAR.AE", name: "Emaar Properties", nameAr: "إعمار العقارية", price: "8.65 AED", change: "+2.1%", isPositive: true, market: "DFM" },
  { ticker: "QNBK.QA", name: "QNB Group", nameAr: "مجموعة QNB", price: "16.20 QAR", change: "-0.4%", isPositive: false, market: "QSE" },
  { ticker: "NBK.KW", name: "National Bank of Kuwait", nameAr: "بنك الكويت الوطني", price: "890 KWF", change: "+0.3%", isPositive: true, market: "BK" },
];

export default function IntelligenceHub() {
  const { sessionAnalyses, setPanel, language } = useTerminalStore();
  const isAr = language === 'ar';

  const overviewCards = [
    {
      id: "DCF" as const,
      title: t("panel_dcf", language),
      desc: isAr ? "نموذج تقييم التدفقات النقدية المخصومة 5 سنوات" : "5-Year Discounted Cash Flow valuation engine",
      icon: <BarChart3 className="text-terminal-emerald" size={20} />,
      hasData: !!sessionAnalyses.dcf,
      statusLabel: !!sessionAnalyses.dcf 
        ? `${isAr ? "تم الحساب: " : "Computed: "} SAR ${sessionAnalyses.dcf.outputs.intrinsicValuePerShare}`
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
      id: "screener" as const,
      title: isAr ? "مقارنة الشركات" : "Company Comparator",
      desc: isAr ? "مقارنة نسب ومؤشرات الشركات والصفقات" : "Peer multiples, yields, and performance matrix",
      icon: <Filter className="text-terminal-emerald" size={20} />,
      hasData: !!sessionAnalyses.comparator,
      statusLabel: !!sessionAnalyses.comparator 
        ? `${sessionAnalyses.comparator.rows.length} ${isAr ? "شركات مدخلة" : "Companies Added"}`
        : (isAr ? "جاهز للمقارنة" : "Ready for Comparison"),
      tag: "COMPARISON"
    },
    {
      id: "research" as const,
      title: t("panel_ai_research", language),
      desc: isAr ? "مذكرات أبحاث استثمارية من Gemini 2.5 Flash" : "Equity research memos backed by Gemini 2.5 Flash",
      icon: <Sparkles className="text-terminal-emerald" size={20} />,
      hasData: !!sessionAnalyses.researchMemo,
      statusLabel: !!sessionAnalyses.researchMemo 
        ? (isAr ? "المذكرة نشطة" : "Active Memo")
        : (isAr ? "جاهز للتوليد" : "Ready for Synthesis"),
      tag: "RESEARCH"
    }
  ];

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-8 text-slate-100 font-mono"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* GCC LIVE MOVERS TAPE */}
      <div className="bg-[#121721] border border-[#1E293B] rounded-sm p-3 shadow-md">
        <div className="flex items-center justify-between gap-4 overflow-x-auto text-xs font-mono">
          <div className="flex items-center gap-2 text-terminal-emerald font-bold shrink-0">
            <Activity size={14} className="animate-pulse" />
            <span className="uppercase">{isAr ? "مؤشرات الخليج" : "GCC Bourses"}</span>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {GCC_MOVERS.map((mover) => (
              <div 
                key={mover.ticker}
                onClick={() => setPanel("DCF")}
                className="flex items-center gap-2 px-2.5 py-1 rounded-sm bg-[#0B0E14] border border-[#1E293B] hover:border-terminal-emerald transition-colors cursor-pointer"
              >
                <span className="font-bold text-white">{mover.ticker}</span>
                <span className="text-slate-400 font-mono text-[11px]">{isAr ? mover.nameAr : mover.name}</span>
                <span className="font-semibold text-slate-200">{mover.price}</span>
                <span className={`flex items-center gap-0.5 font-bold ${mover.isPositive ? "text-terminal-emerald" : "text-rose-400"}`}>
                  {mover.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  <span>{mover.change}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HUB HEADER BANNER */}
      <div className="bg-[#121721] p-8 rounded-sm border border-[#1E293B] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl">
        <div className="space-y-2">
          <span className="px-3 py-1 text-[10px] font-mono text-terminal-emerald bg-terminal-emerald-dim border border-terminal-border-emerald rounded-sm font-bold uppercase tracking-widest shadow-md">
            {isAr ? "محطة عمل النمذجة التكتيكية v2.5" : "Tactical CAD Modeling Engine v2.5"}
          </span>
          <h2 className="font-mono text-3xl font-extrabold text-white tracking-wide uppercase">
            {isAr ? "لوحة التحكم ومركز النمذجة الكمية" : "Quantitative Financial Workbench"}
          </h2>
          <p className="text-slate-400 text-xs leading-relaxed max-w-xl font-mono">
            {isAr 
              ? "استكشف أدوات النمذجة التكتيكية (DCF & LBO)، الفحص الشرعي AAOIFI، مقارنة الأقران، وتصنيع التقارير الموحدة." 
              : "Build institutional financial models (DCF & LBO), verify AAOIFI Shariah compliance, run peer heatmaps, and synthesize outputs into executive PDF reports."
            }
          </p>
        </div>

        <button
          onClick={() => setPanel("bi_report")}
          className="px-6 py-3 bg-terminal-emerald hover:bg-terminal-emerald-light text-black font-mono text-xs font-black rounded-sm flex items-center gap-2 shadow-lg cursor-pointer transition-colors uppercase tracking-wider"
        >
          <FileText size={14} />
          <span>{isAr ? "تصدير التقرير الموحد" : "Generate BI Report"}</span>
        </button>
      </div>

      {/* TOOLS & STATUS GRID */}
      <div className="space-y-4">
        <h3 className="font-mono text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
          {isAr ? "أدوات النمذجة والتحليل الكمي" : "Sovereign Modeling Tools & Workbench Status"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {overviewCards.map((card) => (
            <div
              key={card.id}
              onClick={() => setPanel(card.id)}
              className="bg-[#121721] p-6 rounded-sm border border-[#1E293B] hover:border-terminal-emerald transition-all cursor-pointer flex flex-col justify-between h-[180px] group relative shadow-lg"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[9px] font-mono font-bold text-slate-500 tracking-wider">
                    {card.tag}
                  </span>
                  <div className="p-2 rounded-sm bg-[#0B0E14] border border-[#1E293B] group-hover:border-terminal-emerald transition-colors">
                    {card.icon}
                  </div>
                </div>

                <h4 className="font-mono text-xs font-bold text-white group-hover:text-terminal-emerald transition-colors uppercase">
                  {card.title}
                </h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal font-mono">
                  {card.desc}
                </p>
              </div>

              {/* Status footer inside card */}
              <div className="border-t border-[#1E293B] pt-3 mt-4 flex justify-between items-center text-[10px] font-mono">
                <span className="flex items-center gap-1">
                  {card.hasData ? (
                    <>
                      <CheckCircle2 size={12} className="text-terminal-emerald" />
                      <span className="text-terminal-emerald font-bold">{card.statusLabel}</span>
                    </>
                  ) : (
                    <>
                      <Clock size={12} className="text-slate-500" />
                      <span className="text-slate-500">{card.statusLabel}</span>
                    </>
                  )}
                </span>
                <ChevronRight size={14} className="text-slate-500 group-hover:text-terminal-emerald transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
