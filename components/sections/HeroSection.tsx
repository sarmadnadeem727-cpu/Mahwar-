"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown, Play, Sparkles, Cpu } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import TickerStrip from "@/components/sections/TickerStrip";

const GCC_PHRASES_EN = [
  "Tadawul Real-Time Equities",
  "AAOIFI Shariah Screening Engine",
  "Vision 2030 Sovereign Analysis",
  "Institutional DCF & LBO Modeling",
  "Gemini 2.5 AI Investment Memos"
];

const GCC_PHRASES_AR = [
  "أسهم تداول اللحظية",
  "محرك الفحص الشرعي المعياري (AAOIFI)",
  "تحليلات رؤية المملكة 2030 السيادية",
  "نمذجة التقييم المؤسسي DCF & LBO",
  "مذكرات الاستثمار الذكية Gemini 2.5"
];

export default function HeroSection() {
  const { language } = useTerminalStore();
  const isAr = language === 'ar';
  const shouldReduceMotion = useReducedMotion();
  
  const phrases = isAr ? GCC_PHRASES_AR : GCC_PHRASES_EN;
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const targetPhrase = phrases[phraseIndex];
    let timer: NodeJS.Timeout;

    if (!isDeleting && currentText.length < targetPhrase.length) {
      timer = setTimeout(() => {
        setCurrentText(targetPhrase.slice(0, currentText.length + 1));
      }, 70);
    } else if (isDeleting && currentText.length > 0) {
      timer = setTimeout(() => {
        setCurrentText(targetPhrase.slice(0, currentText.length - 1));
      }, 40);
    } else if (!isDeleting && currentText.length === targetPhrase.length) {
      timer = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && currentText.length === 0) {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, phraseIndex, phrases]);

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const dotsCount = 75; // 15 columns * 5 rows
  const dots = Array.from({ length: dotsCount });

  return (
    <section className="relative min-h-screen flex flex-col justify-between pt-24 pb-12 overflow-hidden bg-[#0A0B0D]" dir={isAr ? "rtl" : "ltr"}>
      {/* Calm 1px Grid lines overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-6 relative z-10 text-center flex-1 flex flex-col items-center justify-center my-auto space-y-8">
        
        {/* Monospace Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xs font-mono text-[var(--gold)] uppercase tracking-widest"
        >
          {isAr ? "// استخبارات أسواق رأس المال الخليجية" : "// GCC CAPITAL MARKETS INTELLIGENCE"}
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-garamond text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white max-w-5xl leading-[1.05] mb-2"
        >
          {isAr ? (
            <span>محور — منصة الاستخبارات المالية السيادية</span>
          ) : (
            <span>The Sovereign Intelligence Terminal</span>
          )}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-slate-400 font-sans text-xs md:text-sm max-w-2xl mx-auto leading-relaxed"
        >
          {isAr 
            ? "محور (محطة التحليل المالي والتقييم المؤسسي لأسواق المال الخليجية)"
            : "The premium workspace for quantitative valuation, live AAOIFI screening, and GCC investment memos."
          }
        </motion.p>

        {/* Interactive staggered dot matrix wave animation */}
        <div className="h-16 flex items-center justify-center">
          <div 
            style={{ display: "grid", gridTemplateColumns: "repeat(15, minmax(0, 1fr))" }}
            className="gap-2"
            onMouseLeave={() => setHoveredIdx(null)}
          >
            {dots.map((_, i) => {
              const col = i % 15;
              const row = Math.floor(i / 15);
              
              let distance = 0;
              if (hoveredIdx !== null) {
                const hoveredCol = hoveredIdx % 15;
                const hoveredRow = Math.floor(hoveredIdx / 15);
                const dx = col - hoveredCol;
                const dy = row - hoveredRow;
                distance = Math.sqrt(dx * dx + dy * dy);
              }

              return (
                <motion.div
                  key={i}
                  onMouseEnter={() => setHoveredIdx(i)}
                  className="w-1.5 h-1.5 rounded-full bg-[var(--emerald)] cursor-pointer"
                  animate={
                    shouldReduceMotion
                      ? {}
                      : hoveredIdx !== null
                      ? {
                          scale: Math.max(0.6, 2.0 - distance * 0.3),
                          opacity: Math.max(0.2, 1.0 - distance * 0.15)
                        }
                      : {
                          scale: [1, 1.3, 1],
                          opacity: [0.3, 0.7, 0.3]
                        }
                  }
                  transition={
                    shouldReduceMotion
                      ? {}
                      : hoveredIdx !== null
                      ? { type: "spring", stiffness: 200, damping: 15 }
                      : {
                          duration: 2,
                          repeat: Infinity,
                          delay: col * 0.08 + row * 0.1,
                          ease: "easeInOut"
                        }
                  }
                />
              );
            })}
          </div>
        </div>

        {/* Typewriter Command Line Callout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex items-center justify-center font-mono text-xs text-slate-300 bg-white/[0.02] border border-white/5 px-5 py-2.5 rounded-lg max-w-md w-full"
        >
          <span className="text-[var(--emerald)] font-bold mr-2">&gt;</span>
          <span className="text-emerald-400 font-bold">{currentText}</span>
          <span className="animate-ping text-[var(--emerald)] ml-1">|</span>
        </motion.div>

        {/* Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md"
        >
          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[var(--emerald)] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer group"
          >
            <span>{isAr ? "تشغيل المنصة اللحظية" : "Enter Sovereign Terminal"}</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          <a
            href="#solution"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            <Play size={12} className="text-[var(--gold)]" />
            <span>{isAr ? "استكشاف المميزات" : "Platform Overview"}</span>
          </a>
        </motion.div>

        {/* Architect Credits tag */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-[10px] font-mono text-slate-500 flex items-center gap-2 bg-black/40 px-4 py-1.5 rounded-full border border-white/5"
        >
          <Cpu size={12} className="text-[var(--emerald)]" />
          <span>Architected by <strong className="text-white">Muhammad Sarmad Nadeem</strong></span>
        </motion.div>
      </div>

      {/* BOTTOM STRIP MARQUEE */}
      <div className="w-full mt-10">
        <TickerStrip />
      </div>

      {/* Dynamic chevron */}
      <div className="flex justify-center mt-4">
        <motion.a
          href="#problem"
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="text-slate-500 hover:text-[var(--emerald)] transition-colors p-2"
        >
          <ChevronDown size={18} />
        </motion.a>
      </div>
    </section>
  );
}
