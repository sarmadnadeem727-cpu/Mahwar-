"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { staggerContainer, staggerItem } from "@/lib/motion";

export default function ProblemSection() {
  const { language } = useTerminalStore();
  const isAr = language === 'ar';

  return (
    <section id="problem" className="py-28 bg-[#F7F7F5] relative overflow-hidden border-t border-slate-200" dir={isAr ? "rtl" : "ltr"}>
      {/* Background Accent Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[var(--emerald)]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <motion.div variants={staggerItem} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--emerald)]/10 border border-[var(--emerald)]/20 text-[var(--emerald)] text-xs font-mono font-bold uppercase tracking-widest mb-4">
            <AlertTriangle size={14} />
            <span>{isAr ? "التحدي الهيكلي بالسوق" : "The GCC Structural Void"}</span>
          </motion.div>

          <motion.h2 variants={staggerItem} className="font-serif text-4xl md:text-6xl font-bold text-[#171717] mb-6 leading-tight">
            {isAr ? "السوق الخليجي بحاجة لبديل بلومبرغ عربي" : "GCC Markets Operating Without Local Financial Intelligence"}
          </motion.h2>

          <motion.p variants={staggerItem} className="text-slate-600 text-base md:text-lg leading-relaxed font-sans">
            {isAr 
              ? "تعتمد صناديق الاستثمار في الرياض وأبوظبي ودبي على أدوات غريبة عن البيئة الخليجية تفتقر للدعم العربي الكامل والمعالجة الشرعية الدقيقة وفق معايير AAOIFI ونماذج الزكاة."
              : "Institutional fund managers in Riyadh, Abu Dhabi, and Dubai are forced to adapt Western financial legacy terminals that lack Arabic RTL native workflows, AAOIFI Shariah screening, and Zakat tax provisions."
            }
          </motion.p>
        </motion.div>

        {/* Comparison Callout Panel */}
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-8 items-center shadow-sm">
          <div>
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-[#171717] mb-4">
              {isAr ? "لماذا المحور وليس البدائل التقليدية؟" : "The Mahwar Institutional Paradigm Shift"}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6 font-sans">
              {isAr 
                ? "تم بناء محور خصيصاً ليجمع بين السرعة الفائقة، أبحاث Gemini 2.5 اللحظية، دعم اللغة العربية والاتجاه من اليمين لليسار، مع محركات التقييم المؤسسي DCF & LBO المستندة لبيانات تداول المباشرة."
                : "Mahwar combines Wall Street analytical rigor with Gulf market nuance: instant Gemini 2.5 streaming memos, AAOIFI Shariah ratio screening, native RTL Arabic UI, and SEC/Tadawul data bindings."
              }
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                title: isAr ? "محلي بالكامل ومخصص" : "Sovereign-First Context",
                desc: isAr ? "دعم كامل للغة العربية ونماذج الزكاة السعودية ونظام التقويم الهجري." : "Native Arabic RTL, Saudi GAAP zakat provision algorithms."
              },
              {
                title: isAr ? "أبحاث فورية معتمدة على الذكاء الاصطناعي" : "Immediate Gemini Memos",
                desc: isAr ? "بث أبحاث الاستثمار الذكية بضغطة زر واحدة." : "Constructing custom equity research summaries in seconds."
              }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--emerald)] mt-1.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                  <p className="text-slate-500 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
