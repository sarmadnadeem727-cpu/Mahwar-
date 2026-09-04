"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  ArrowRight, Activity, Terminal, ShieldCheck, 
  BarChart3, Layers, CheckCircle2, TrendingUp, Sparkles, RefreshCw
} from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import NumberCounter from "@/components/ui/NumberCounter";

export default function HeroSection() {
  const { language } = useTerminalStore();
  const isAr = language === 'ar';

  // Animated ticking model state for the primary visual anchor
  const [dcfValue, setDcfValue] = useState(38.45);
  const [lboIrr, setLboIrr] = useState(24.8);
  const [activeTab, setActiveTab] = useState<"DCF" | "LBO" | "AAOIFI">("DCF");

  // Subtle live pulse effect every few seconds to simulate real quantitative engine calculation
  useEffect(() => {
    const interval = setInterval(() => {
      setDcfValue((prev) => Number((38.45 + (Math.random() * 0.4 - 0.2)).toFixed(2)));
      setLboIrr((prev) => Number((24.8 + (Math.random() * 0.3 - 0.15)).toFixed(1)));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[88vh] flex flex-col justify-center bg-white text-slate-heading pt-24 pb-16 overflow-hidden border-b border-surface-border select-none font-sans">
        {/* CONTINUOUS LIVE BACKGROUND VIDEO */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none z-0"
          src="/bg-video.mp4"
        />

        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(226,232,240,0.5)_1px,transparent_1px),linear-gradient(to_bottom,rgba(226,232,240,0.5)_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] [mask-image:radial-gradient(ellipse_80%_65%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none z-0" />



      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full flex flex-col items-center">
        
        {/* SOVEREIGN ENGINE BADGE */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="label-pill label-pill-emerald mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
          <span>{isAr ? "محرك النمذجة السيادية v2.5" : "Institutional Sovereign Engine v2.5"}</span>
        </motion.div>

        {/* HEADLINE (SOURCE SERIF 4) */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="font-serif text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-heading text-center max-w-5xl leading-[1.08] mb-5"
        >
          {isAr ? (
            <span>الاستخبارات المالية السيادية والنمذجة الكمية لأسواق الخليج</span>
          ) : (
            <span>Quantitative Financial Engine for GCC Capital Markets</span>
          )}
        </motion.h1>

        {/* SUBTITLE (INTER) */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="font-sans text-body-md text-slate-body text-center max-w-2xl leading-relaxed mb-8 font-medium"
        >
          {isAr
            ? "بناء نماذج التقييم المؤسسي (DCF & LBO)، توقعات القوائم الثلاث IFRS والزكاة، الفحص الشرعي المعياري AAOIFI، وبث الأخبار المالية المباشر."
            : "Precision 5-year DCF & LBO deal architecture, IFRS/GAAP 3-statement forecasts, AAOIFI Shariah screening & live GCC market wire."
          }
        </motion.p>

        {/* CTA BUTTONS */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="flex flex-col sm:flex-row items-center gap-3.5 mb-12 w-full sm:w-auto"
        >
          <Link
            href="/dashboard"
            className="btn-primary w-full sm:w-auto"
          >
            <span>{isAr ? "تشغيل المنصة التكتيكية" : "ENTER TERMINAL"}</span>
            <ArrowRight size={15} className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/dashboard?panel=news"
            className="btn-secondary w-full sm:w-auto"
          >
            <Activity size={14} className="text-emerald" />
            <span>{isAr ? "موجز الأخبار المباشر" : "Explore GCC Wire"}</span>
          </Link>
        </motion.div>

        {/* PRIMARY VISUAL ANCHOR: ANIMATED WORKBENCH PREVIEW CONTAINER */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-5xl bg-white rounded-xl border border-surface-border overflow-hidden text-left rtl:text-right shadow-terminal-card"
          dir={isAr ? "rtl" : "ltr"}
        >
          {/* WORKBENCH TOP BAR */}
          <div className="h-11 bg-surface-subtle border-b border-surface-border px-5 flex items-center justify-between font-mono text-mono-caption">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <span className="font-bold text-slate-heading ml-2 rtl:ml-0 rtl:mr-2">
                MAHWAR WORKBENCH // SAUDI_ARAMCO_VALUATION.MODEL
              </span>
            </div>

            {/* TAB SELECTORS INSIDE ANCHOR */}
            <div className="flex items-center gap-1.5">
              {(["DCF", "LBO", "AAOIFI"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    activeTab === tab 
                      ? "bg-emerald text-white shadow-2xs" 
                      : "bg-white border border-surface-border text-slate-muted hover:text-slate-heading"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* WORKBENCH INTERACTIVE DASHBOARD AREA */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white">
            
            {/* KPI CARD 1: DCF MODEL */}
            <div 
              onClick={() => setActiveTab("DCF")}
              className={`p-5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                activeTab === "DCF"
                  ? "border-emerald bg-emerald-dim shadow-2xs"
                  : "border-surface-border hover:border-slate-300 bg-surface-subtle"
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-mono-caption font-mono font-bold text-slate-muted uppercase">DCF Intrinsic Model</span>
                  <BarChart3 size={16} className="text-emerald" />
                </div>
                <div className="my-2">
                  <span className="text-2xl font-mono font-extrabold text-slate-heading">
                    SAR <NumberCounter value={dcfValue} decimals={2} />
                  </span>
                  <span className="text-mono-caption font-mono font-bold text-emerald block mt-0.5">
                    +18.4% Implied Upside
                  </span>
                </div>
              </div>

              {/* Animated SVG Sparkline */}
              <div className="h-10 w-full my-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30">
                  <path
                    d="M 0 25 Q 25 15, 50 18 T 100 5"
                    fill="none"
                    stroke="#0E7C69"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx="100" cy="5" r="3.5" fill="#0E7C69" className="animate-ping" />
                  <circle cx="100" cy="5" r="3.5" fill="#0E7C69" />
                </svg>
              </div>

              <div className="border-t border-surface-border pt-2.5 font-mono text-[11px] text-slate-muted flex justify-between">
                <span>WACC: 8.9%</span>
                <span className="text-emerald font-bold">5Y Growth: 8.0%</span>
              </div>
            </div>

            {/* KPI CARD 2: LBO MODEL */}
            <div 
              onClick={() => setActiveTab("LBO")}
              className={`p-5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                activeTab === "LBO"
                  ? "border-emerald bg-emerald-dim shadow-2xs"
                  : "border-surface-border hover:border-slate-300 bg-surface-subtle"
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-mono-caption font-mono font-bold text-slate-muted uppercase">LBO Buyout IRR</span>
                  <Layers size={16} className="text-emerald" />
                </div>
                <div className="my-2">
                  <span className="text-2xl font-mono font-extrabold text-emerald">
                    <NumberCounter value={lboIrr} decimals={1} />%
                  </span>
                  <span className="text-mono-caption font-mono font-bold text-slate-body block mt-0.5">
                    2.65x MOIC Multiple
                  </span>
                </div>
              </div>

              {/* Animated IRR Progress Meter */}
              <div className="space-y-1.5 my-2 font-mono text-[10px]">
                <div className="flex justify-between text-slate-muted">
                  <span>Target Return</span>
                  <span className="font-bold text-emerald">25.0% IRR</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: "95%" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-emerald rounded-full"
                  />
                </div>
              </div>

              <div className="border-t border-surface-border pt-2.5 font-mono text-[11px] text-slate-muted flex justify-between">
                <span>5Y Hold</span>
                <span className="text-slate-heading font-bold">Senior Debt: 55%</span>
              </div>
            </div>

            {/* KPI CARD 3: AAOIFI SHARIAH AUDIT */}
            <div 
              onClick={() => setActiveTab("AAOIFI")}
              className={`p-5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                activeTab === "AAOIFI"
                  ? "border-emerald bg-emerald-dim shadow-2xs"
                  : "border-surface-border hover:border-slate-300 bg-surface-subtle"
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-mono-caption font-mono font-bold text-slate-muted uppercase">AAOIFI Compliance</span>
                  <ShieldCheck size={16} className="text-emerald" />
                </div>
                <div className="my-2">
                  <span className="text-lg font-mono font-extrabold text-emerald block uppercase">
                    AAOIFI 21 PASS
                  </span>
                  <span className="text-mono-caption font-mono font-bold text-slate-body block mt-0.5">
                    Debt / Assets: 14.2% (&lt;33%)
                  </span>
                </div>
              </div>

              {/* Compliance Audit Ratio Badges */}
              <div className="flex items-center gap-2 my-2 font-mono text-[10px]">
                <span className="px-2 py-0.5 rounded bg-emerald-dim border border-emerald-border text-emerald font-bold">
                  ✓ DEBT PASS
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-dim border border-emerald-border text-emerald font-bold">
                  ✓ INTEREST PASS
                </span>
              </div>

              <div className="border-t border-surface-border pt-2.5 font-mono text-[11px] text-slate-muted flex justify-between">
                <span>Purification</span>
                <span className="text-emerald font-bold">SAR 0.00 / Share</span>
              </div>
            </div>

          </div>

          {/* WORKBENCH BOTTOM STATUS */}
          <div className="px-5 py-2.5 bg-surface-subtle border-t border-surface-border flex items-center justify-between font-mono text-[11px] text-slate-muted">
            <div className="flex items-center gap-2">
              <RefreshCw size={11} className="animate-spin text-emerald" />
              <span>{isAr ? "المحرك متصل بالبيانات المباشرة" : "Sovereign Quantitative Engine Online"}</span>
            </div>
            <div className="font-bold text-slate-heading">
              TADAWUL // GCC SOVEREIGN SUITE
            </div>
          </div>

        </motion.div>

      </div>
    </section>
  );
}
