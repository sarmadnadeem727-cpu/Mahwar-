"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";

const TESTIMONIALS = [
  {
    quoteEn: "Mahwar has transformed how our Saudi equity fund generates investment memos. Having native AAOIFI ratio screening alongside Gemini 2.5 streaming is unprecedented in Arabic.",
    quoteAr: "غير محور آلية عمل صندوقنا الاستثماري في الرياض كلياً. توفير فحص AAOIFI الشرعي اللحظي مع أبحاث الذكاء الاصطناعي باللغة العربية يمثل نقلة نوعية غير مسبوقة.",
    author: "Fahad Al-Otaibi",
    roleEn: "Senior Fund Manager",
    roleAr: "مدير أصول أول",
    institution: "Riyadh Capital Partner"
  },
  {
    quoteEn: "The speed and accuracy of the DCF & LBO engines combined with Tadawul live feeds match Wall Street Bloomberg standards while perfectly serving local Zakat tax nuances.",
    quoteAr: "سرعة ودقة محركات تقييم التدفقات DCF والـ LBO المربوطة بأسعار تداول تضاهي أنظمة بلومبرغ العالمية مع المعالجة الدقيقة لخصائص الزكاة السعودية.",
    author: "Tariq Mansoor",
    roleEn: "Private Equity Managing Director",
    roleAr: "عضو مجلس إدارة الاستحواذ",
    institution: "Abu Dhabi Sovereign Syndicate"
  },
  {
    quoteEn: "The clean dark luxury interface, instantaneous EN/AR RTL flip, and 3-statement model exports are essential daily tools for our equity research desk.",
    quoteAr: "الواجهة الفاخرة الأنيقة، التحويل الفوري بين العربية والإنجليزية، وتصدير نموذج القوائم المالية الثلاث أصبح جزءاً لا يتجزأ من جدول عملنا اليومي.",
    author: "Sara Al-Hassan",
    roleEn: "Head of Financial Research",
    roleAr: "رئيسة قسم الأبحاث المالية",
    institution: "Dubai International Wealth"
  }
];

export default function TestimonialsSection() {
  const { language } = useTerminalStore();
  const isAr = language === 'ar';
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const t = TESTIMONIALS[current];

  return (
    <section id="testimonials" className="py-28 bg-[#0F1113] relative overflow-hidden border-t border-white/10" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/20 text-[var(--gold)] text-xs font-mono font-bold uppercase tracking-widest mb-10">
          <Star size={14} fill="currentColor" />
          <span>{isAr ? "ثقة المؤسسات الاستثمارية" : "Institutional Validation"}</span>
        </div>

        <div className="relative min-h-[260px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.5 }}
              className="glass-panel p-8 md:p-12 rounded-3xl border border-white/10 bg-[#14171A] max-w-4xl"
            >
              <Quote size={36} className="text-[var(--emerald)] mx-auto mb-6 opacity-60" />

              <p className="font-garamond text-xl md:text-3xl text-white italic leading-relaxed mb-8">
                "{isAr ? t.quoteAr : t.quoteEn}"
              </p>

              <div>
                <div className="font-bold text-white text-base md:text-lg">
                  {t.author}
                </div>
                <div className="text-xs font-mono text-[var(--gold)] font-bold mt-0.5">
                  {isAr ? t.roleAr : t.roleEn} · {t.institution}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setCurrent((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1))}
            className="p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
          
          <div className="flex items-center gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  current === i ? "bg-[var(--emerald)] w-8" : "bg-white/20"
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrent((prev) => (prev + 1) % TESTIMONIALS.length)}
            className="p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
