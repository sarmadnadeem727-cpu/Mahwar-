"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";

export default function CTASection() {
  const { language } = useTerminalStore();
  const isAr = language === 'ar';
  const shouldReduceMotion = useReducedMotion();

  const letters = isAr ? ["م", "ح", "و", "ر"] : ["M", "A", "H", "W", "A", "R"];

  return (
    <section className="py-24 bg-[#0A0B0D] relative overflow-hidden border-t border-white/5" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="rounded-2xl border border-white/5 bg-[#0F1113]/30 p-10 md:p-16 text-center relative overflow-hidden">
          
          <div className="max-w-3xl mx-auto relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#0E7C69]/10 border border-[#0E7C69]/25 text-[var(--emerald)] font-mono text-[10px] font-bold uppercase tracking-widest">
              <Zap size={12} className="text-[var(--gold)]" />
              <span>{isAr ? "جاهز للاستخدام اللحظي" : "Instant Institutional Access"}</span>
            </div>

            <h2 className="font-garamond text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              {isAr ? "ارتقِ بتحليلاتك المالية لمستوى المحطة السيادية" : "Elevate Your GCC Financial Terminal Today"}
            </h2>

            <p className="text-slate-400 font-sans text-xs md:text-sm leading-relaxed max-w-xl mx-auto">
              {isAr 
                ? "ابدأ بتوليد مذكرات الاستثمار الذكية ونمذجة التقييم المالي وسوق تداول المباشر بدون تعقيد."
                : "Experience Wall Street analytical depth tailored specifically for Saudi & Gulf Capital Markets."
              }
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[var(--emerald)] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer group"
              >
                <span>{isAr ? "تشغيل محطة المحور الآن" : "Launch Mahwar Terminal"}</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Closing animated flourish wordmark */}
            <div className="pt-8 flex justify-center gap-2 select-none">
              {letters.map((letter, idx) => (
                <motion.span
                  key={idx}
                  className="font-garamond text-xl font-extrabold text-white/10"
                  animate={shouldReduceMotion ? {} : { opacity: [0.1, 0.4, 0.1], scale: [1, 1.1, 1] }}
                  transition={shouldReduceMotion ? {} : {
                    duration: 2.5,
                    repeat: Infinity,
                    delay: idx * 0.2,
                    ease: "easeInOut"
                  }}
                >
                  {letter}
                </motion.span>
              ))}
            </div>

            <div className="pt-4 text-[10px] font-mono text-slate-500 flex items-center justify-center gap-1.5">
              <ShieldCheck size={12} />
              <span>{isAr ? "مصمم ومطور بواسطة محمد سرمد نديم" : "Architected & Developed by Muhammad Sarmad Nadeem"}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
