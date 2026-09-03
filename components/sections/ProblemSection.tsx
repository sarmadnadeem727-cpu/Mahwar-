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
    <section id="problem" className="py-20 bg-[#F8FAFC] relative overflow-hidden border-t border-[#E2E8F0] font-sans" dir={isAr ? "rtl" : "ltr"}>
      {/* Background Accent Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(226,232,240,0.6)_1px,transparent_1px),linear-gradient(to_bottom,rgba(226,232,240,0.6)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.div variants={staggerItem} className="inline-flex items-center gap-2 px-3.5 py-1 bg-emerald-dim border border-emerald-border text-emerald text-xs font-mono font-bold uppercase tracking-wider mb-4 rounded-full shadow-2xs">
            <AlertTriangle size={12} />
            <span>{isAr ? "التحدي الهيكلي بالسوق" : "MARKET GAP // GCC STRUCTURAL VOID"}</span>
          </motion.div>

          <motion.h2 variants={staggerItem} className="font-serif text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
            {isAr ? "السوق الخليجي بحاجة لمكينة نمذجة مالية تكتيكية" : "GCC Markets Operating Without Precision Financial Workbench"}
          </motion.h2>

          <motion.p variants={staggerItem} className="text-slate-600 text-base md:text-lg leading-relaxed font-sans font-medium">
            {isAr 
              ? "تعتمد صناديق الاستثمار في الرياض وأبوظبي ودبي على أدوات غريبة عن البيئة الخليجية تفتقر للدعم العربي الكامل والمعالجة الشرعية الدقيقة وفق معايير AAOIFI ونماذج الزكاة."
              : "Institutional fund managers in Riyadh, Abu Dhabi, and Dubai are forced to adapt Western financial legacy terminals that lack Arabic RTL native workflows, AAOIFI Shariah screening, and Zakat tax provisions."
            }
          </motion.p>
        </motion.div>

        {/* Comparison Callout Panel */}
        <div className="bg-white p-8 md:p-12 border border-[#E2E8F0] grid grid-cols-1 md:grid-cols-2 gap-8 items-center rounded-lg shadow-sm">
          <div>
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              {isAr ? "لماذا المحور وليس البدائل التقليدية؟" : "The Mahwar Institutional Paradigm Shift"}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6 font-sans">
              {isAr 
                ? "تم بناء محور خصيصاً ليجمع بين النمذجة المتقدمة (DCF & LBO)، محرك التقارير التنفيذية، دعم اللغة العربية والاتجاه من اليمين لليسار، مع الفحص الشرعي AAOIFI وبث الأخبار المالية الحية."
                : "Mahwar combines Wall Street analytical rigor with Gulf market nuance: 5-year DCF & LBO deal engines, AAOIFI Shariah ratio screening, native RTL Arabic UI, and live NewsAPI financial wire."
              }
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                title: isAr ? "معايير المحاسبة والزكاة المحلية" : "Saudi GAAP & Zakat Provision Engine",
                desc: isAr ? "دعم كامل للغة العربية، حساب مخصص الزكاة الشرعية بنسبة 2.5% من الأصول الزكوية." : "Native Arabic RTL, Saudi GAAP zakat provision algorithms (2.5% net asset rules)."
              },
              {
                title: isAr ? "محرك تقارير الأعمال وتصدير PDF" : "Consolidated Executive Report Engine",
                desc: isAr ? "تخليق وتجميع نتائج التحليل المالي وتصديرها بصيغة PDF مؤسسية بلمح البصر." : "Synthesizing and consolidating financial modeling outputs into executive PDF & Excel reports."
              }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4 p-4 border border-[#E2E8F0] border-l-2 border-l-emerald bg-slate-50 rounded-md transition-all hover:border-emerald">
                <span className="w-2 h-2 bg-emerald mt-2 shrink-0 animate-pulse rounded-full" />
                <div>
                  <h4 className="font-bold font-mono text-slate-900 text-xs uppercase tracking-wider">{item.title}</h4>
                  <p className="text-slate-600 text-xs mt-1 font-sans">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
