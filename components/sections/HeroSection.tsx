"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import { 
  ArrowRight, Sparkles, Activity, Terminal, ShieldCheck, 
  BarChart3, Layers, Globe
} from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import NumberCounter from "@/components/ui/NumberCounter";

// Lazy-load the 3D rotating GCC globe with zero SSR impact
const GccGlobe3D = dynamic(() => import("@/components/ui/GccGlobe3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[420px] sm:h-[480px] md:h-[540px] flex flex-col items-center justify-center text-slate-500 font-mono text-xs gap-3">
      <div className="w-16 h-16 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
      <span>INITIALIZING GCC SOVEREIGN DATA SPHERE...</span>
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
    <section className="relative min-h-screen flex flex-col justify-center bg-[#07090D] text-slate-100 pt-28 pb-20 overflow-hidden border-b border-emerald-950/40 select-none">
      {/* Background Cinematic Atmosphere & Precision Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(14,124,105,0.22),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full flex flex-col items-center">
        
        {/* SOVEREIGN TERMINAL BADGE */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 text-[11px] font-mono font-bold uppercase tracking-widest mb-6 shadow-xl backdrop-blur-md"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{isAr ? "محطة الاستخبارات المالية السيادية الأولى" : "The Sovereign Intelligence Terminal v2.5"}</span>
        </motion.div>

        {/* MAIN CINEMATIC HEADLINE */}
        <motion.h1
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white text-center max-w-6xl leading-[1.06] mb-4 drop-shadow-sm"
        >
          {isAr ? (
            <span>الاستخبارات المالية لأسواق المال الخليجية</span>
          ) : (
            <span>Sovereign Financial Intelligence for GCC Markets</span>
          )}
        </motion.h1>

        {/* SUBTITLE */}
        <motion.p
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="font-sans text-sm sm:text-base md:text-lg text-slate-400 text-center max-w-2xl leading-relaxed mb-6"
        >
          {isAr
            ? "محطة نمذجة استثمارية متكاملة لأسواق الخليج: تقييم DCF، صفقات LBO، القوائم المالية الثلاث بالمعايير والزكاة، وفحص AAOIFI الشرعي."
            : "Institutional 5-year valuation, private equity LBO returns, GAAP/IFRS 3-statement forecasts, and AAOIFI compliance for GCC capital."
          }
        </motion.p>

        {/* TYPEWRITER COMMAND PROMPT */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="h-11 flex items-center justify-center font-mono text-xs sm:text-sm text-slate-200 mb-8 bg-[#0D1117]/80 border border-slate-800 px-6 py-2 rounded-xl shadow-2xl backdrop-blur-md max-w-xl w-full"
        >
          <Terminal size={15} className="text-emerald-400 mr-2.5 rtl:mr-0 rtl:ml-2.5 shrink-0" />
          <span className="truncate font-semibold">{currentText}</span>
          <span className="text-emerald-400 font-bold animate-pulse ml-0.5">_</span>
        </motion.div>

        {/* PRIMARY CALL TO ACTION BUTTONS */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="flex flex-col sm:flex-row items-center gap-4 mb-10 w-full sm:w-auto"
        >
          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-extrabold text-xs uppercase tracking-wider shadow-[0_0_30px_rgba(16,185,129,0.35)] transition-all cursor-pointer group"
          >
            <span>{isAr ? "تشغيل المنصة السيادية" : "Enter Sovereign Terminal"}</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:bg-slate-800 text-slate-200 font-mono font-bold text-xs transition-all cursor-pointer backdrop-blur-md"
          >
            <Activity size={15} className="text-emerald-400" />
            <span>{isAr ? "استكشاف البيانات المباشرة" : "Explore Live Wire"}</span>
          </Link>
        </motion.div>

        {/* 3D ROTATING GCC GLOBE CENTERPIECE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-5xl my-4 relative flex items-center justify-center"
        >
          <GccGlobe3D isAr={isAr} />
        </motion.div>

        {/* LIVE TERMINAL INTERACTIVE MOCKUP PREVIEW */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-5xl mt-6 bg-[#0D1117]/90 rounded-2xl border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl overflow-hidden text-left rtl:text-right"
          dir={isAr ? "rtl" : "ltr"}
        >
          {/* MOCKUP HEADER BAR */}
          <div className="h-10 bg-[#161B22] border-b border-slate-800 px-4 flex items-center justify-between font-mono text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              <span className="font-bold text-slate-200 ml-2">MAHWAR TERMINAL // GCC.2222.SR</span>
            </div>
            <div className="flex items-center gap-3 text-slate-400">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>ONLINE 2.5 FLASH</span>
              </span>
            </div>
          </div>

          {/* MOCKUP CONTENT GRID */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* KPI 1: INTRINSIC VALUE */}
            <div className="p-4 rounded-xl bg-[#161B22]/70 border border-slate-800/90 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">DCF Intrinsic Valuation</span>
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/60 rounded border border-emerald-500/20">5Y WACC</span>
              </div>
              <div className="my-3">
                <span className="text-2xl font-mono font-extrabold text-white">
                  SAR <NumberCounter value={38.45} decimals={2} />
                </span>
                <span className="text-[11px] font-mono text-emerald-400 font-bold block mt-0.5">
                  +18.4% Implied Upside
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 border-t border-slate-800 pt-2 block">
                Terminal Growth: 2.5% | Cost of Equity: 8.9%
              </span>
            </div>

            {/* KPI 2: LBO RETURNS WATERFALL */}
            <div className="p-4 rounded-xl bg-[#161B22]/70 border border-slate-800/90 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">LBO Private Equity IRR</span>
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold text-slate-300 bg-slate-800/80 rounded border border-slate-700">5Y HOLD</span>
              </div>
              <div className="my-3">
                <span className="text-2xl font-mono font-extrabold text-emerald-400">
                  <NumberCounter value={24.8} decimals={1} />%
                </span>
                <span className="text-[11px] font-mono text-slate-300 font-bold block mt-0.5">
                  2.65x MOIC Multiple
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 border-t border-slate-800 pt-2 block">
                Sponsor Equity: SAR 420M | Senior Debt: 55%
              </span>
            </div>

            {/* KPI 3: AAOIFI SHARIAH COMPLIANCE */}
            <div className="p-4 rounded-xl bg-[#161B22]/70 border border-slate-800/90 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">AAOIFI Compliance</span>
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold text-emerald-300 bg-emerald-950/80 rounded border border-emerald-500/30">PASS</span>
              </div>
              <div className="my-3">
                <span className="text-sm font-mono font-extrabold text-emerald-400 block uppercase">
                  100% Shariah Compliant
                </span>
                <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                  Debt-to-Assets: 14.2% (Max 33%)
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 border-t border-slate-800 pt-2 block">
                Purification Rate: SAR 0.00 / Share
              </span>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
