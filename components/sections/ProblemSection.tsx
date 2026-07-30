"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";

export default function ProblemSection() {
  const { language } = useTerminalStore();
  const isAr = language === 'ar';

  const stats = [
    {
      value: "$4.2T",
      label: isAr ? "إجمالي القيمة السوقية لأسواق المال الخليجية" : "GCC Capital Markets Value",
      sub: isAr ? "Tadawul, ADX, DFM, QSE, BKP, MSX" : "Across 6 Sovereign Exchanges"
    },
    {
      value: "0",
      label: isAr ? "منصات تحليل عربية بمستوى بلومبرغ" : "Bloomberg-Grade Arabic Tools",
      sub: isAr ? "فجوة كبيرة باللغات والتقييمات الإسلامية" : "Critical gap in RTL & AAOIFI workflows"
    },
    {
      value: "3.2M",
      label: isAr ? "مستثمر محلي ومؤسسي بحاجة للأبحاث" : "GCC Institutional & Retail Analysts",
      sub: isAr ? "يتطلب أبحاث فورية معتمدة على الذكاء الاصطناعي" : "Requiring streaming AI memo synthesis"
    }
  ];

  return (
    <section id="problem" className="py-28 bg-[#0F1113] relative overflow-hidden border-t border-white/10" dir={isAr ? "rtl" : "ltr"}>
      {/* Background Accent Grid & Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[var(--emerald)]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <motion.div variants={staggerItem} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono font-bold uppercase tracking-widest mb-4">
            <AlertTriangle size={14} />
            <span>{isAr ? "التحدي الهيكلي بالسوق" : "The GCC Structural Void"}</span>
          </motion.div>

          <motion.h2 variants={staggerItem} className="font-garamond text-4xl md:text-6xl font-bold text-white mb-6">
            {isAr ? "السوق الخليجي بحجم 4.2 ترليون دولار... بدون بديل بلومبرغ عربي" : "A $4.2 Trillion Market Operating Without Local Financial Intelligence"}
          </motion.h2>

          <motion.p variants={staggerItem} className="text-slate-400 text-base md:text-lg leading-relaxed">
            {isAr 
              ? "تعتمد صناديق الاستثمار في الرياض وأبوظبي ودبي على أدوات غريبة عن البيئة الخليجية تفتقر للدعم العربي الكامل والمعالجة الشرعية الدقيقة وفق معايير AAOIFI ونماذج الزكاة."
              : "Institutional fund managers in Riyadh, Abu Dhabi, and Dubai are forced to adapt Western financial legacy terminals that lack Arabic RTL native workflows, AAOIFI Shariah screening, and Zakat tax provisions."
            }
          </motion.p>
        </motion.div>

        {/* Animated Stat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              whileHover={{ y: -6 }}
              className="glass-card p-8 rounded-2xl border border-white/10 relative group bg-gradient-to-b from-white/[0.04] to-transparent"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--emerald)]/5 rounded-bl-full pointer-events-none group-hover:bg-[var(--emerald)]/15 transition-all" />
              
              <div className="font-mono text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight group-hover:text-[var(--emerald)] transition-colors">
                {stat.value}
              </div>
              <div className="font-bold text-slate-200 text-lg mb-2">
                {stat.label}
              </div>
              <div className="text-xs font-mono text-slate-400">
                {stat.sub}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Comparison Callout Panel */}
        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#14171A]/80">
          <div>
            <h3 className="font-garamond text-2xl md:text-3xl font-bold text-white mb-4">
              {isAr ? "لماذا المحور وليس البدائل التقليدية؟" : "The Mahwar Institutional Paradigm Shift"}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              {isAr 
                ? "تم بناء محور خصيصاً ليجمع بين السرعة الفائقة، أبحاث Gemini 2.5 اللحظية، دعم اللغة العربية والاتجاه من اليمين لليسار، مع محركات التقييم المؤسسي DCF & LBO المستندة لبيانات تداول المباشرة."
                : "Mahwar combines Wall Street analytical rigor with Gulf market nuance: instant Gemini 2.5 streaming memos, AAOIFI Shariah ratio screening, native RTL Arabic UI, and SEC/Tadawul data bindings."
              }
            </p>
            <div className="space-y-3 font-mono text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-[var(--emerald)] shrink-0" />
                <span>{isAr ? "دعم كامل للغتين العربية والإنجليزي بنفس الكفاءة" : "Full Dual EN/AR RTL System Architecture"}</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-[var(--emerald)] shrink-0" />
                <span>{isAr ? "فحص شرعي وفق معيار أيوفي (AAOIFI) رقم 21" : "AAOIFI Standard No. 21 Shariah Screening"}</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-[var(--emerald)] shrink-0" />
                <span>{isAr ? "معالجة مخصصات الزكاة الشرعية (2.5%) تلقائياً" : "Automatic Saudi Zakat Provision Integration"}</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <span className="text-slate-400">Feature Comparison</span>
              <span className="text-[var(--gold)] font-bold">Legacy Terminals vs Mahwar</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Arabic Language Support</span>
              <span className="text-red-400">Basic / None &rarr; <strong className="text-[var(--emerald)]">Native RTL</strong></span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>AI Research Memos</span>
              <span className="text-red-400">Static / Manual &rarr; <strong className="text-[var(--emerald)]">Gemini 2.5 Streaming</strong></span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Zakat Treatment</span>
              <span className="text-red-400">Standard Tax Only &rarr; <strong className="text-[var(--emerald)]">Saudi GAAP / Zakat</strong></span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
