"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { staggerContainer, staggerItem } from "@/lib/motion";

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

  return (
    <section id="testimonials" className="py-20 bg-[#0F1113] relative overflow-hidden border-t border-white/5" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[var(--emerald)]/10 border border-[var(--emerald)]/25 text-[var(--emerald)] text-[10px] font-mono font-bold uppercase tracking-wider mb-4">
            <Star size={12} fill="currentColor" />
            <span>{isAr ? "ثقة المؤسسات الاستثمارية" : "Institutional Validation"}</span>
          </div>

          <h2 className="font-garamond text-3xl md:text-5xl font-extrabold text-white mb-5">
            {isAr ? "توصيات قادة الفكر المالي بالخليج" : "Endorsed by Gulf Capital Managers"}
          </h2>
        </div>

        {/* Testimonials Static Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {TESTIMONIALS.map((item, idx) => (
            <motion.div
              key={idx}
              variants={staggerItem}
              className="p-6 rounded-xl border border-white/5 bg-[#0A0B0D]/40 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <Quote size={20} className="text-[var(--gold)] opacity-50" />
                <p className="font-sans text-xs text-slate-300 leading-relaxed italic">
                  "{isAr ? item.quoteAr : item.quoteEn}"
                </p>
              </div>

              <div>
                <div className="font-bold text-white text-xs">
                  {item.author}
                </div>
                <div className="text-[9px] font-mono text-[var(--emerald)] mt-1">
                  {isAr ? item.roleAr : item.roleEn} &middot; {item.institution}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
