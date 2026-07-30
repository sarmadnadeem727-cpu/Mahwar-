"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { staggerContainer, staggerItem } from "@/lib/motion";

export default function ProblemSection() {
  const { language } = useTerminalStore();
  const isAr = language === 'ar';

  const stats = [
    {
      value: "$4.2T",
      label: isAr ? "إجمالي القيمة السوقية لأسواق المال الخليجية" : "GCC Capital Markets Value",
      sub: isAr ? "تحتوي أسهم تداول، أبوظبي ودبي" : "Tadawul, ADX, DFM, QSE exchanges"
    },
    {
      value: "0",
      label: isAr ? "منصات تحليل عربية بمستوى بلومبرغ" : "Bloomberg-Grade Arabic Tools",
      sub: isAr ? "فجوة كبيرة باللغات والتقييمات الإسلامية" : "Critical gap in native RTL workflows"
    },
    {
      value: "3.2M",
      label: isAr ? "مستثمر محلي ومؤسسي بحاجة للأبحاث" : "GCC Market Analysts",
      sub: isAr ? "يتطلب أبحاث استثمارية متكاملة" : "Requiring streaming data solutions"
    }
  ];

  return (
    <section id="problem" className="py-20 bg-[#0F1113] border-t border-white/5 relative overflow-hidden" dir={isAr ? "rtl" : "ltr"}>
      {/* Grid Lines Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* HEADER */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.div 
            variants={staggerItem} 
            className="inline-flex items-center gap-2 px-3 py-1 rounded bg-red-950/20 border border-red-500/20 text-red-400 text-[10px] font-mono font-bold uppercase tracking-wider mb-4"
          >
            <AlertTriangle size={12} />
            <span>{isAr ? "التحدي الهيكلي بالسوق" : "The GCC Structural Void"}</span>
          </motion.div>

          <motion.h2 
            variants={staggerItem} 
            className="font-garamond text-3xl md:text-5xl font-extrabold text-white mb-5 tracking-wide leading-tight"
          >
            {isAr ? "السوق الخليجي بحجم 4.2 ترليون دولار... بدون بديل بلومبرغ عربي" : "A $4.2 Trillion Market Operating Without Local Intelligence"}
          </motion.h2>

          <motion.p 
            variants={staggerItem} 
            className="text-slate-400 font-sans text-xs md:text-sm leading-relaxed"
          >
            {isAr 
              ? "تعتمد صناديق الاستثمار في الرياض وأبوظبي ودبي على أدوات غريبة عن البيئة الخليجية تفتقر للدعم العربي الكامل والمعالجة الشرعية الدقيقة ونماذج الزكاة."
              : "Institutional fund managers in Riyadh, Abu Dhabi, and Dubai are forced to adapt Western financial legacy terminals that lack Arabic RTL native workflows, AAOIFI Shariah screening, and Zakat tax provisions."
            }
          </motion.p>
        </motion.div>

        {/* Dense Minimal Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-6 rounded-xl border border-white/5 bg-[#0A0B0D]/50 relative flex flex-col justify-between"
            >
              <div className="font-mono text-4xl lg:text-5xl font-extrabold text-white mb-2 tracking-tight">
                {stat.value}
              </div>
              <div>
                <h4 className="font-bold text-slate-200 text-xs mb-1">
                  {stat.label}
                </h4>
                <p className="text-[10px] font-mono text-slate-500">
                  {stat.sub}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Flat Comparison Callout Panel */}
        <div className="p-6 md:p-10 rounded-xl border border-white/5 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-[#0F1113]">
          <div className="space-y-4">
            <h3 className="font-garamond text-xl md:text-2xl font-bold text-white">
              {isAr ? "لماذا المحور وليس البدائل التقليدية؟" : "The Mahwar Institutional Paradigm Shift"}
            </h3>
            <p className="text-slate-400 font-sans text-xs leading-relaxed">
              {isAr 
                ? "تم بناء محور خصيصاً ليجمع بين السرعة الفائقة، أبحاث Gemini 2.5 اللحظية، دعم اللغة العربية والاتجاه من اليمين لليسار، مع محركات التقييم المؤسسي DCF & LBO المستندة لبيانات تداول المباشرة."
                : "Mahwar combines Wall Street analytical rigor with Gulf market nuance: instant Gemini 2.5 streaming memos, AAOIFI Shariah ratio screening, native RTL Arabic UI, and SEC/Tadawul data bindings."
              }
            </p>
            <div className="space-y-2 font-mono text-[10px] text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={12} className="text-[var(--emerald)] shrink-0" />
                <span>{isAr ? "دعم كامل للغتين العربية والإنجليزي بنفس الكفاءة" : "Full Dual EN/AR RTL System Architecture"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={12} className="text-[var(--emerald)] shrink-0" />
                <span>{isAr ? "فحص شرعي وفق معيار أيوفي (AAOIFI) رقم 21" : "AAOIFI Standard No. 21 Shariah Screening"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={12} className="text-[var(--emerald)] shrink-0" />
                <span>{isAr ? "معالجة مخصصات الزكاة الشرعية (2.5%) تلقائياً" : "Automatic Saudi Zakat Provision Integration"}</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-lg bg-black/40 border border-white/5 font-mono text-[10px] space-y-3.5">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-slate-500">Feature Comparison</span>
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
