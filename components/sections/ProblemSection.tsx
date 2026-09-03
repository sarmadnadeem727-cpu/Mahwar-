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
    <section id="problem" className="py-20 bg-[#0B0E14] relative overflow-hidden border-t border-[#1E293B]" dir={isAr ? "rtl" : "ltr"}>
      {/* Background Accent Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(30,41,59,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(30,41,59,0.2)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.div variants={staggerItem} className="inline-flex items-center gap-2 px-3 py-1 bg-terminal-emerald-dim border border-terminal-border-emerald text-terminal-emerald text-[10px] font-mono font-bold uppercase tracking-[0.2em] mb-4 rounded-sm shadow-md">
            <AlertTriangle size={12} />
            <span>{isAr ? "التحدي الهيكلي بالسوق" : "MARKET GAP // GCC STRUCTURAL VOID"}</span>
          </motion.div>

          <motion.h2 variants={staggerItem} className="font-mono text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight uppercase">
            {isAr ? "السوق الخليجي بحاجة لمكينة نمذجة مالية تكتيكية" : "GCC Markets Operating Without Precision Financial Workbench"}
          </motion.h2>

          <motion.p variants={staggerItem} className="text-slate-400 text-base md:text-lg leading-relaxed font-mono">
            {isAr 
              ? "تعتمد صناديق الاستثمار في الرياض وأبوظبي ودبي على أدوات غريبة عن البيئة الخليجية تفتقر للدعم العربي الكامل والمعالجة الشرعية الدقيقة وفق معايير AAOIFI ونماذج الزكاة."
              : "Institutional fund managers in Riyadh, Abu Dhabi, and Dubai are forced to adapt Western financial legacy terminals that lack Arabic RTL native workflows, AAOIFI Shariah screening, and Zakat tax provisions."
            }
          </motion.p>
        </motion.div>

        {/* Comparison Callout Panel */}
        <div className="bg-[#121721] p-8 md:p-12 border border-[#1E293B] grid grid-cols-1 md:grid-cols-2 gap-8 items-center rounded-sm shadow-2xl">
          <div>
            <h3 className="font-mono text-2xl md:text-3xl font-extrabold text-white mb-4 uppercase">
              {isAr ? "لماذا المحور وليس البدائل التقليدية؟" : "The Mahwar Institutional Paradigm Shift"}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 font-mono">
              {isAr 
                ? "تم بناء محور خصيصاً ليجمع بين النمذجة المتقدمة (DCF & LBO)، محرك التقارير التنفيذية، دعم اللغة العربية والاتجاه من اليمين لليسار، مع الفحص الشرعي AAOIFI وبث الأخبار المالية الحية."
                : "Mahwar combines Wall Street analytical rigor with Gulf market nuance: 5-year DCF & LBO deal engines, AAOIFI Shariah ratio screening, native RTL Arabic UI, and live NewsAPI financial wire."
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
                title: isAr ? "محرك تقارير الأعمال وتصدير PDF" : "Consolidated BI Report Engine",
                desc: isAr ? "تخليق وتجميع نتائج التحليل المالي وتصديرها بصيغة PDF مؤسسية." : "Synthesizing and consolidating financial modeling outputs into executive PDF reports."
              }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4 p-4 border border-[#1E293B] border-l-2 border-l-terminal-emerald bg-[#0B0E14] rounded-sm transition-all hover:border-terminal-emerald-light">
                <span className="w-1.5 h-1.5 bg-terminal-emerald mt-2 shrink-0 animate-pulse rounded-full" />
                <div>
                  <h4 className="font-bold font-mono text-white text-xs uppercase tracking-wider">{item.title}</h4>
                  <p className="text-slate-400 text-xs mt-1 font-mono">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
