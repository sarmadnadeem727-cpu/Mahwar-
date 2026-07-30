"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Play, Sparkles, Shield, Cpu } from "lucide-react";
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

  return (
    <section className="relative min-h-screen flex flex-col justify-between pt-28 pb-12 overflow-hidden bg-[#0A0B0D]" dir={isAr ? "rtl" : "ltr"}>
      {/* Background Animated Ambient Lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-[#0E7C69]/20 via-[#C9A84C]/15 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-[#0E7C69]/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Subtle Scanline Overlay */}
      <div className="scanline-overlay absolute inset-0 opacity-20 pointer-events-none" />

      {/* Grid Lines Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* MAIN HERO CONTENT */}
      <div className="max-w-6xl mx-auto px-6 relative z-10 text-center flex-1 flex flex-col items-center justify-center my-auto">
        
        {/* Sovereign Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold)] text-xs font-mono font-semibold uppercase tracking-widest mb-8 backdrop-blur-md"
        >
          <Sparkles size={14} className="animate-pulse" />
          <span>{isAr ? "محطة الاستخبارات المالية السيادية الأولى" : "The Sovereign Intelligence Operating System"}</span>
        </motion.div>

        {/* Cormorant Garamond Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-garamond text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white max-w-5xl leading-[1.05] mb-4"
        >
          {isAr ? (
            <span>محور — منصة الاستخبارات المالية السيادية</span>
          ) : (
            <span>The Sovereign Intelligence Terminal</span>
          )}
        </motion.h1>

        {/* Arabic Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-cairo text-lg md:text-2xl font-semibold text-[var(--gold)] mb-6 tracking-wide"
        >
          محور (محطة التحليل المالي والتقييم المؤسسي لأسواق المال الخليجية)
        </motion.p>

        {/* Typewriter Effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="h-10 flex items-center justify-center font-mono text-sm md:text-base text-slate-300 mb-10 bg-white/[0.03] border border-white/10 px-6 py-2 rounded-xl backdrop-blur-md"
        >
          <span className="text-[var(--emerald)] font-bold mr-2">&gt;</span>
          <span className="text-emerald-400 font-bold">{currentText}</span>
          <span className="animate-ping text-[var(--emerald)] ml-1">|</span>
        </motion.div>

        {/* Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-14"
        >
          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-[#0E7C69] via-[#10957F] to-[#12A189] hover:brightness-110 text-white font-bold text-sm shadow-xl shadow-[#0E7C69]/30 transition-all cursor-pointer group"
          >
            <span>{isAr ? "تشغيل المنصة اللحظية" : "Enter Sovereign Terminal"}</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          <a
            href="#solution"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/5 border border-white/15 hover:bg-white/10 text-slate-200 font-bold text-sm backdrop-blur-md transition-all cursor-pointer"
          >
            <Play size={16} className="text-[var(--gold)]" />
            <span>{isAr ? "استكشاف المميزات" : "Platform Overview"}</span>
          </a>
        </motion.div>

        {/* Developer Credit Tag */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-xs font-mono text-slate-400 flex items-center gap-2 bg-black/40 px-4 py-1.5 rounded-full border border-white/10"
        >
          <Cpu size={14} className="text-[var(--emerald)]" />
          <span>Architected by <strong className="text-white">Muhammad Sarmad Nadeem</strong></span>
        </motion.div>
      </div>

      {/* BOTTOM MARQUEE TICKER */}
      <div className="w-full mt-10">
        <TickerStrip />
      </div>

      {/* Bouncing Chevron Indicator */}
      <div className="flex justify-center mt-4">
        <motion.a
          href="#problem"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="text-slate-400 hover:text-[var(--emerald)] transition-colors p-2"
        >
          <ChevronDown size={22} />
        </motion.a>
      </div>
    </section>
  );
}
