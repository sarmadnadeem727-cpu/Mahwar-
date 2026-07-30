"use client";

import React from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem, EASE_PREMIUM } from "@/lib/motion";
import { useTerminalStore } from "@/store/useTerminalStore";
import TimelineSteps from "./animations/TimelineSteps";

export default function IntelligenceSection() {
  const { language } = useTerminalStore();
  const isAr = language === 'ar';

  return (
    <section id="ai-research" className="relative py-24 px-6 lg:px-24 bg-[#0A0B0D] overflow-hidden border-t border-white/5" dir={isAr ? "rtl" : "ltr"}>
      {/* Subtle Accent Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--gold)]/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        
        {/* Left Column - Copy */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-6"
        >
          <div className="text-[10px] font-mono text-[var(--gold)] uppercase tracking-widest">
            {isAr ? "// أبحاث الأسهم المدعومة بالذكاء الاصطناعي" : "// AI-DRIVEN EQUITY RESEARCH"}
          </div>

          <motion.h2 
            variants={staggerItem} 
            className="font-garamond text-4xl md:text-5xl font-extrabold text-white leading-tight"
          >
            {isAr ? "ذكاء اصطناعي سيادي بمستويات فحص حية" : "Generative Intelligence Grounded in Market Truth"}
          </motion.h2>

          <motion.p 
            variants={staggerItem} 
            className="text-slate-400 font-sans text-xs md:text-sm leading-relaxed max-w-lg"
          >
            {isAr 
              ? "يتحرك الذكاء الاصطناعي لدينا بسلاسة عبر بيانات تداول اللحظية لإنتاج تقارير أبحاث احترافية خالية من الهلوسة."
              : "Our analytical pipeline streams structural market data, parses historical financials, and utilizes Gemini 2.5 web search to draft precise investment thesis memos."
            }
          </motion.p>
          
          <ul className="space-y-3.5 pt-4">
            {(isAr 
              ? [
                  "ربط بالبحث المالي المباشر من Google",
                  "تحليل مخصص الزكاة والضرائب بدقة",
                  "صياغة مذكرات استثمار جاهزة للمؤسسات",
                  "فحص تلقائي لتوافق AAOIFI المالي"
                ]
              : [
                  "Grounded in live Google financial search tapes",
                  "Auto-parses Zakat and GCC corporate tax provisions",
                  "Drafts institution-grade investment memos on demand",
                  "Integrated AAOIFI shariah ratio check logs"
                ]
            ).map((item, i) => (
              <motion.li
                key={i}
                variants={staggerItem}
                className="flex items-center gap-3 text-xs text-slate-300 font-sans"
              >
                <div className="w-1.5 h-1.5 bg-[var(--gold)] rounded-full" />
                <span>{item}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Right Column - Timeline pipeline mockup */}
        <motion.div
          initial={{ opacity: 0, x: isAr ? -40 : 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: EASE_PREMIUM }}
          viewport={{ once: true }}
          className="w-full flex items-center justify-center"
        >
          <div className="w-full max-w-md border border-white/5 bg-[#0F1113]/30 p-8 rounded-2xl flex items-center justify-center min-h-[300px]">
            <TimelineSteps spotlight={true} />
          </div>
        </motion.div>

      </div>
    </section>
  );
}
