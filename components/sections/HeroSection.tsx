"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Play, Sparkles, Cpu } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";

const GCC_PHRASES_EN = [
  "AAOIFI Shariah Screening Engine",
  "Institutional DCF & LBO Modeling",
  "Consolidated BI Report Generator",
  "Dynamic Company Peer Comparator",
  "Gemini 2.5 AI Investment Memos"
];

const GCC_PHRASES_AR = [
  "محرك الفحص الشرعي المعياري (AAOIFI)",
  "نمذجة التقييم المؤسسي DCF & LBO",
  "منشئ تقارير ذكاء الأعمال الموحدة",
  "مقارن الشركات التفاعلي للشركات والصفقات",
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
    <section className="relative min-h-screen flex flex-col justify-between pt-28 pb-12 overflow-hidden bg-white" dir={isAr ? "rtl" : "ltr"}>
      {/* Background Soft Accent Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-[#0E7C69]/5 via-transparent to-transparent rounded-full blur-[140px] pointer-events-none" />
      
      {/* Simple Grid Lines Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* MAIN HERO CONTENT */}
      <div className="max-w-6xl mx-auto px-6 relative z-10 text-center flex-1 flex flex-col items-center justify-center my-auto">
        
        {/* Sovereign Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-[var(--emerald)] text-xs font-mono font-semibold uppercase tracking-widest mb-8 shadow-sm"
        >
          <Sparkles size={14} className="text-[var(--emerald)]" />
          <span>{isAr ? "محطة الاستخبارات المالية السيادية الأولى" : "The Sovereign Intelligence Operating System"}</span>
        </motion.div>

        {/* Source Serif 4 Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-[#171717] max-w-5xl leading-[1.05] mb-4"
        >
          {isAr ? (
            <span>محور — منصة الاستخبارات المالية السيادية</span>
          ) : (
            <span>The Sovereign Intelligence Terminal</span>
          )}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-cairo text-lg md:text-2xl font-semibold text-[var(--emerald)] mb-6 tracking-wide"
        >
          {isAr 
            ? "محور (محطة التحليل المالي والتقييم المؤسسي لأسواق المال الخليجية)" 
            : "Mahwar - Capital Modeling & Deal Suite for GCC Markets"
          }
        </motion.p>

        {/* Typewriter Effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="h-10 flex items-center justify-center font-mono text-sm md:text-base text-slate-700 mb-10 bg-slate-50 border border-slate-200 px-6 py-2 rounded-xl"
        >
          <span className="text-[var(--emerald)] font-bold mr-2">&gt;</span>
          <span className="text-[#171717] font-bold">{currentText}</span>
          <span className="text-[var(--emerald)] ml-1 font-bold animate-pulse">|</span>
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
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[var(--emerald)] hover:bg-[#12A189] text-white font-bold text-sm shadow-md transition-all cursor-pointer group"
          >
            <span>{isAr ? "تشغيل المنصة" : "Enter Sovereign Terminal"}</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          <a
            href="#solution"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold text-sm transition-all cursor-pointer"
          >
            <Play size={16} className="text-[var(--emerald)]" />
            <span>{isAr ? "استكشاف المميزات" : "Platform Overview"}</span>
          </a>
        </motion.div>

        {/* Developer Credit Tag */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-xs font-mono text-slate-500 flex items-center gap-2 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-200"
        >
          <Cpu size={14} className="text-[var(--emerald)]" />
          <span>Architected by <strong className="text-[#171717]">Muhammad Sarmad Nadeem</strong></span>
        </motion.div>
      </div>

      {/* Bouncing Chevron Indicator */}
      <div className="flex justify-center mt-10">
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
