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
import { MahwarBackgroundLogo } from "@/components/ui/MahwarSplash";

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

  useEffect(() => {
    const phrases = isAr ? [
      "محرك تقييم التدفقات النقدية المخصومة (5-Year DCF Engine)",
      "باني صفقات الاستحواذ المدعوم بالديون (LBO Deal Builder)",
      "الفحص الشرعي المعتمد وفق معيار أيوفي (AAOIFI Standard 21)",
      "مذكرات أبحاث الأسهم والتقارير الموحدة (Equity Research Memos)",
    ] : [
      "5-Year Institutional DCF Valuation Engine",
      "Private Equity Leveraged Buyout (LBO) Deal Builder",
      "AAOIFI Standard No. 21 Shariah Screening Engine",
      "Real-Time Institutional Equity Research Memos",
    ];

    const safeTextIndex = textIndex % phrases.length;
    const currentPhrase = phrases[safeTextIndex] || "";

    if (charIndex < currentPhrase.length) {
      const timeout = setTimeout(() => {
        setCurrentText((prev) => prev + (currentPhrase[charIndex] || ""));
        setCharIndex((prev) => prev + 1);
      }, 35);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setCurrentText("");
        setCharIndex(0);
        setTextIndex((prev) => (prev + 1) % phrases.length);
      }, 2500);
      return () => clearTimeout(timeout);
    }
  }, [charIndex, textIndex, isAr]);

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-center bg-white text-slate-900 pt-28 pb-16 overflow-hidden border-b border-[#E2E8F0] select-none font-sans">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(226,232,240,0.6)_1px,transparent_1px),linear-gradient(to_bottom,rgba(226,232,240,0.6)_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] [mask-image:radial-gradient(ellipse_75%_60%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* GLOWING ANIMATED RADAR LOGO WATERMARK IN BACKGROUND */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-[550px] h-[550px] sm:w-[700px] sm:h-[700px] opacity-10 pointer-events-none z-0">
        <MahwarBackgroundLogo className="w-full h-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full flex flex-col items-center">
        
        {/* SOVEREIGN TERMINAL BADGE */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#E2E8F0] bg-slate-50 text-emerald text-xs font-mono font-bold uppercase tracking-wider mb-6 shadow-2xs"
        >
          <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
          <span>{isAr ? "محرك النمذجة التكتيكي v2.5" : "Institutional Sovereign Engine v2.5"}</span>
        </motion.div>

        {/* MAIN DISPLAY HEADLINE (SOURCE SERIF 4) */}
        <motion.h1
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="font-serif text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 text-center max-w-5xl leading-[1.08] mb-4"
        >
          {isAr ? (
            <span>الاستخبارات المالية السيادية والنمذجة الكمية لأسواق الخليج</span>
          ) : (
            <span>Quantitative Financial Engine for GCC Capital Markets</span>
          )}
        </motion.h1>

        {/* SUBTITLE (INTER) */}
        <motion.p
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="font-sans text-sm sm:text-base text-slate-600 text-center max-w-2xl leading-relaxed mb-6 font-medium"
        >
          {isAr
            ? "بناء نماذج التقييم المؤسسي (DCF & LBO)، توقعات القوائم الثلاث IFRS والزكاة، الفحص الشرعي المعياري AAOIFI، وبث الأخبار المالية المباشر."
            : "Precision 5-year DCF & LBO deal architecture, IFRS/GAAP 3-statement forecasts, AAOIFI Shariah screening & live market wire."
          }
        </motion.p>

        {/* TYPEWRITER COMMAND PROMPT (IBM PLEX MONO) */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="h-10 flex items-center justify-center font-mono text-xs sm:text-sm text-slate-800 mb-8 bg-slate-50 border border-[#E2E8F0] px-5 py-2 rounded-lg shadow-2xs max-w-xl w-full"
        >
          <Terminal size={14} className="text-emerald mr-2 rtl:mr-0 rtl:ml-2 shrink-0" />
          <span className="truncate font-bold">{currentText || (isAr ? "جاهز لتشغيل النماذج" : "READY FOR MODEL EXECUTION")}</span>
          <span className="text-emerald font-bold animate-pulse ml-0.5">_</span>
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
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-lg bg-emerald hover:bg-emerald-light text-white font-mono font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer group"
          >
            <span>{isAr ? "تشغيل المنصة التكتيكية" : "Launch Engine Workbench"}</span>
            <ArrowRight size={15} className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-slate-50 border border-[#E2E8F0] hover:bg-slate-100 text-slate-800 font-mono font-bold text-xs transition-all cursor-pointer"
          >
            <Activity size={14} className="text-emerald" />
            <span>{isAr ? "استكشاف النماذج المباشرة" : "Explore Active Models"}</span>
          </Link>
        </motion.div>

        {/* 2D GCC MAP CENTERPIECE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-5xl my-2 p-1 bg-white border border-[#E2E8F0] flex items-center justify-center relative rounded-lg shadow-sm"
        >
          <GccMap2D isAr={isAr} />
        </motion.div>

        {/* LIVE TERMINAL INTERACTIVE MOCKUP PREVIEW */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-5xl mt-6 bg-white rounded-lg border border-[#E2E8F0] overflow-hidden text-left rtl:text-right shadow-sm"
          dir={isAr ? "rtl" : "ltr"}
        >
          {/* MOCKUP HEADER BAR */}
          <div className="h-10 bg-slate-50 border-b border-[#E2E8F0] px-4 flex items-center justify-between font-mono text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <span className="font-bold text-slate-900 ml-2">WORKBENCH // SAUDI_ARAMCO_DCF.MODEL</span>
            </div>
            <div className="flex items-center gap-3 text-slate-500">
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold text-emerald bg-emerald-dim border border-emerald-border rounded">
                SAMPLE MODEL OUTPUT // 2222.SR
              </span>
              <span className="text-emerald font-bold flex items-center gap-1 hidden sm:flex">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
                <span>LIVE CALCULATION</span>
              </span>
            </div>
          </div>

          {/* MOCKUP CONTENT GRID */}
          <div className="p-0 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E2E8F0] bg-white">
            {/* KPI 1: INTRINSIC VALUE */}
            <div className="p-5 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono text-slate-500 uppercase font-bold tracking-wider">DCF Intrinsic Valuation</span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold text-emerald bg-emerald-dim border border-emerald-border rounded">5Y WACC</span>
              </div>
              <div className="my-3">
                <span className="text-2xl font-mono font-extrabold text-slate-900">
                  SAR <NumberCounter value={38.45} decimals={2} />
                </span>
                <span className="text-xs font-mono text-emerald font-bold block mt-0.5">
                  +18.4% Implied Upside
                </span>
              </div>
              <span className="text-xs font-mono text-slate-500 border-t border-dashed border-[#E2E8F0] pt-2 block">
                Terminal Growth: 2.5% | Cost of Equity: 8.9%
              </span>
            </div>

            {/* KPI 2: LBO RETURNS WATERFALL */}
            <div className="p-5 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono text-slate-500 uppercase font-bold tracking-wider">LBO Private Equity IRR</span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold text-slate-700 bg-slate-100 rounded">5Y HOLD</span>
              </div>
              <div className="my-3">
                <span className="text-2xl font-mono font-extrabold text-emerald">
                  <NumberCounter value={24.8} decimals={1} />%
                </span>
                <span className="text-xs font-mono text-slate-700 font-bold block mt-0.5">
                  2.65x MOIC Multiple
                </span>
              </div>
              <span className="text-xs font-mono text-slate-500 border-t border-dashed border-[#E2E8F0] pt-2 block">
                Sponsor Equity: SAR 420M | Senior Debt: 55%
              </span>
            </div>

            {/* KPI 3: AAOIFI SHARIAH COMPLIANCE */}
            <div className="p-5 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono text-slate-500 uppercase font-bold tracking-wider">AAOIFI Compliance</span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold text-emerald bg-emerald-dim border border-emerald-border rounded">PASS</span>
              </div>
              <div className="my-3">
                <span className="text-sm font-mono font-extrabold text-emerald block uppercase">
                  100% Shariah Compliant
                </span>
                <span className="text-xs font-mono text-slate-700 block mt-0.5">
                  Debt-to-Assets: 14.2% (Max 33%)
                </span>
              </div>
              <span className="text-xs font-mono text-slate-500 border-t border-dashed border-[#E2E8F0] pt-2 block">
                Purification Rate: SAR 0.00 / Share
              </span>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
