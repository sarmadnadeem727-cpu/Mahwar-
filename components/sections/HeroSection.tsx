"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import { 
  ArrowRight, Activity, Terminal, ShieldCheck, 
  BarChart3, Layers, Sparkles
} from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import NumberCounter from "@/components/ui/NumberCounter";

// Lazy-load the 2D GCC Map with zero SSR impact
const GccMap2D = dynamic(() => import("@/components/ui/GccMap2D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] sm:h-[460px] md:h-[500px] flex flex-col items-center justify-center text-slate-500 font-mono text-xs gap-3">
      <span className="font-semibold text-slate-600">INITIALIZING GCC SOVEREIGN MAP...</span>
    </div>
  ),
});

export default function HeroSection() {
  const { language } = useTerminalStore();
  const isAr = language === 'ar';

  const [currentText, setCurrentText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  const typewriterPhrases = isAr ? [
    "محرك تقييم التدفقات النقدية المخصومة (5-Year DCF Engine)",
    "باني صفقات الاستحواذ المدعوم بالديون (LBO Deal Builder)",
    "الفحص الشرعي المعتمد وفق معيار أيوفي (AAOIFI Standard 21)",
    "أبحاث الأسهم الفورية المدعومة بـ Gemini 2.5 Flash",
  ] : [
    "5-Year Institutional DCF Valuation Engine",
    "Private Equity Leveraged Buyout (LBO) Deal Builder",
    "AAOIFI Standard No. 21 Shariah Screening Engine",
    "Real-Time Gemini 2.5 Flash Equity Research Memos",
  ];

  useEffect(() => {
    const currentPhrase = typewriterPhrases[textIndex];
    if (charIndex < currentPhrase.length) {
      const timeout = setTimeout(() => {
        setCurrentText((prev) => prev + currentPhrase[charIndex]);
        setCharIndex((prev) => prev + 1);
      }, 35);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setCurrentText("");
        setCharIndex(0);
        setTextIndex((prev) => (prev + 1) % typewriterPhrases.length);
      }, 2500);
      return () => clearTimeout(timeout);
    }
  }, [charIndex, textIndex, typewriterPhrases]);

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-center bg-[#FFFFFF] text-terminal-text pt-28 pb-16 overflow-hidden border-b border-terminal-border select-none">
      {/* Background Precision Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full flex flex-col items-center">
        
        {/* SOVEREIGN TERMINAL BADGE */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-terminal-border-strong bg-terminal-surface text-terminal-emerald text-[11px] font-mono font-bold uppercase tracking-widest mb-6 shadow-xs"
        >
          <span className="w-2 h-2 rounded-full bg-terminal-emerald animate-pulse" />
          <span>{isAr ? "محطة الاستخبارات المالية السيادية v2.5" : "The Sovereign Financial Terminal v2.5"}</span>
        </motion.div>

        {/* MAIN HEADLINE */}
        <motion.h1
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-terminal-text text-center max-w-5xl leading-[1.08] mb-4"
        >
          {isAr ? (
            <span>الاستخبارات المالية لأسواق رأس المال الخليجية</span>
          ) : (
            <span>Sovereign Financial Intelligence for GCC Capital Markets</span>
          )}
        </motion.h1>

        {/* SUBTITLE */}
        <motion.p
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="font-mono text-xs sm:text-sm text-terminal-text-secondary text-center max-w-2xl leading-relaxed mb-6 uppercase tracking-wide"
        >
          {isAr
            ? "بناء نماذج التقييم المؤسسية (DCF & LBO)، القوائم المالية الثلاث بمعايير المحاسبة والزكاة، الفحص الشرعي AAOIFI، وبث أبحاث الأسهم الفورية."
            : "Institutional 5-year DCF & LBO modeling, GAAP/IFRS 3-statement forecasts, AAOIFI Shariah screening, and Gemini 2.5 AI research wire."
          }
        </motion.p>

        {/* TYPEWRITER COMMAND PROMPT */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="h-10 flex items-center justify-center font-mono text-xs sm:text-sm text-terminal-text mb-8 bg-terminal-surface border border-terminal-border px-5 py-2 rounded-lg shadow-xs max-w-xl w-full"
        >
          <Terminal size={14} className="text-terminal-emerald mr-2 rtl:mr-0 rtl:ml-2 shrink-0" />
          <span className="truncate font-semibold">{currentText || (isAr ? "جاهز لاستقبال الأوامر" : "Ready for execution")}</span>
          <span className="text-terminal-emerald font-bold animate-pulse ml-0.5">_</span>
        </motion.div>

        {/* PRIMARY CALL TO ACTION BUTTONS */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="flex flex-col sm:flex-row items-center gap-3.5 mb-10 w-full sm:w-auto"
        >
          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-lg bg-terminal-emerald hover:bg-terminal-emerald-light text-white font-mono font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer group"
          >
            <span>{isAr ? "تشغيل المنصة السيادية" : "Enter Sovereign Terminal"}</span>
            <ArrowRight size={15} className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-terminal-surface border border-terminal-border-strong hover:bg-terminal-hover text-terminal-text font-mono font-bold text-xs transition-all cursor-pointer"
          >
            <Activity size={14} className="text-terminal-emerald" />
            <span>{isAr ? "استكشاف البيانات المباشرة" : "Explore Live Wire"}</span>
          </Link>
        </motion.div>

        {/* 2D GCC MAP CENTERPIECE (IN LIGHT-MODE CARD PANEL) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-5xl my-2 p-1 sm:p-2 bg-terminal-surface border border-terminal-border flex items-center justify-center relative rounded-sm"
        >
          <GccMap2D isAr={isAr} />
        </motion.div>

        {/* LIVE TERMINAL INTERACTIVE MOCKUP PREVIEW */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-5xl mt-6 bg-terminal-panel rounded-sm border border-terminal-border overflow-hidden text-left rtl:text-right shadow-sm"
          dir={isAr ? "rtl" : "ltr"}
        >
          {/* MOCKUP HEADER BAR */}
          <div className="h-10 bg-terminal-surface border-b border-terminal-border px-4 flex items-center justify-between font-mono text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <span className="font-bold text-terminal-text ml-2">MAHWAR TERMINAL // GCC.2222.SR</span>
            </div>
            <div className="flex items-center gap-3 text-slate-500">
              <span className="text-terminal-emerald font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-terminal-emerald animate-pulse" />
                <span>ONLINE 2.5 FLASH</span>
              </span>
            </div>
          </div>

          {/* MOCKUP CONTENT GRID */}
          <div className="p-0 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-terminal-border bg-terminal-panel">
            {/* KPI 1: INTRINSIC VALUE */}
            <div className="p-4 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">DCF Intrinsic Valuation</span>
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold text-terminal-emerald bg-emerald-50 rounded-sm">5Y WACC</span>
              </div>
              <div className="my-3">
                <span className="text-2xl font-mono font-extrabold text-terminal-text">
                  SAR <NumberCounter value={38.45} decimals={2} />
                </span>
                <span className="text-[11px] font-mono text-terminal-positive font-bold block mt-0.5">
                  +18.4% Implied Upside
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 border-t border-terminal-border border-dashed pt-2 block">
                Terminal Growth: 2.5% | Cost of Equity: 8.9%
              </span>
            </div>

            {/* KPI 2: LBO RETURNS WATERFALL */}
            <div className="p-4 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">LBO Private Equity IRR</span>
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold text-slate-700 bg-slate-200/60 rounded-sm">5Y HOLD</span>
              </div>
              <div className="my-3">
                <span className="text-2xl font-mono font-extrabold text-terminal-emerald">
                  <NumberCounter value={24.8} decimals={1} />%
                </span>
                <span className="text-[11px] font-mono text-slate-600 font-bold block mt-0.5">
                  2.65x MOIC Multiple
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 border-t border-terminal-border border-dashed pt-2 block">
                Sponsor Equity: SAR 420M | Senior Debt: 55%
              </span>
            </div>

            {/* KPI 3: AAOIFI SHARIAH COMPLIANCE */}
            <div className="p-4 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">AAOIFI Compliance</span>
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold text-emerald-700 bg-emerald-100 rounded-sm">PASS</span>
              </div>
              <div className="my-3">
                <span className="text-sm font-mono font-extrabold text-terminal-emerald block uppercase">
                  100% Shariah Compliant
                </span>
                <span className="text-[11px] font-mono text-slate-600 block mt-0.5">
                  Debt-to-Assets: 14.2% (Max 33%)
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 border-t border-terminal-border border-dashed pt-2 block">
                Purification Rate: SAR 0.00 / Share
              </span>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
