"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, BarChart3, Layers, ShieldCheck, Activity, LineChart, ChevronRight } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { staggerContainer, staggerItem } from "@/lib/motion";

export default function SolutionSection() {
  const { language } = useTerminalStore();
  const isAr = language === 'ar';

  const features = [
    {
      icon: <Sparkles className="text-[var(--gold)]" size={24} />,
      title: isAr ? "مذكرات أبحاث بالذكاء الاصطناعي" : "AI Research Memo Engine",
      desc: isAr ? "توليد تقارير مالية مؤسسية فورية عبر Gemini 2.5 Flash مع الربط بالبحث اللحظي." : "Instant institutional equity memo generation via Gemini 2.5 Flash with real-time web search grounding.",
      badge: "Gemini 2.5 Flash",
      panel: "research"
    },
    {
      icon: <BarChart3 className="text-[var(--emerald)]" size={24} />,
      title: isAr ? "محرك تقييم التدفقات DCF" : "Institutional DCF Engine",
      desc: isAr ? "نمذجة التدفقات النقدية 5 سنوات مع خريطة حساسيات 5×5 لمعدل الخصم والنمو النهائي." : "5-year FCF projections with WACC formulas and a 5x5 heatmap sensitivity matrix.",
      badge: "Bloomberg Grade",
      panel: "DCF"
    },
    {
      icon: <Layers className="text-[var(--gold)]" size={24} />,
      title: isAr ? "باني صفقات الاستحواذ LBO" : "LBO Deal Builder",
      desc: isAr ? "تحليل عائدات الاستحواذ للملكية الخاصة وشداول إطفاء الديون متعددة الشرائح." : "Private equity deal mechanics, multi-tranche debt amortization, and MOIC / IRR waterfalls.",
      badge: "Private Equity",
      panel: "LBO"
    },
    {
      icon: <ShieldCheck className="text-[var(--emerald)]" size={24} />,
      title: isAr ? "الفحص الشرعي AAOIFI" : "AAOIFI Shariah Screening",
      desc: isAr ? "فحص نسب الديون والإيرادات المحرمة وفق المعيار 21 وحساب مبالغ التطهير للسهم." : "AAOIFI Standard No. 21 ratio checks and per-share purification income calculation.",
      badge: "Islamic Finance",
      panel: "shariah"
    },
    {
      icon: <Activity className="text-[var(--gold)]" size={24} />,
      title: isAr ? "بيانات تداول اللحظية" : "Live Tadawul Market Suite",
      desc: isAr ? "تحديث تلقائي كل 30 ثانية لأسهم السوق السعودي مع شريط التدفقات النقدية اللحظي." : "Auto-refreshing 30s price feed for 30+ Tadawul symbols with institutional order tape.",
      badge: "Tadawul Direct",
      panel: "live_market"
    },
    {
      icon: <LineChart className="text-[var(--emerald)]" size={24} />,
      title: isAr ? "نموذج القوائم الثلاث IFRS" : "Linked 3-Statement Model",
      desc: isAr ? "قوائم مالية مترابطة بالكامل مع حساب مخصص الزكاة الشرعية وتصدير Excel & PDF." : "IFRS / Saudi GAAP model with Zakat recalculation, dynamic charts, and Excel/PDF export.",
      badge: "IFRS / Zakat",
      panel: "FS"
    }
  ];

  return (
    <section id="solution" className="py-28 bg-[#0A0B0D] relative overflow-hidden" dir={isAr ? "rtl" : "ltr"}>
      {/* Background Radial Glow */}
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-[var(--emerald)]/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <motion.div variants={staggerItem} className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--emerald)]/10 border border-[var(--emerald)]/20 text-[var(--emerald)] text-xs font-mono font-bold uppercase tracking-widest mb-4">
            <Sparkles size={14} />
            <span>{isAr ? "القدرات المؤسسية الكاملة" : "Sovereign Intelligence Capabilities"}</span>
          </motion.div>

          <motion.h2 variants={staggerItem} className="font-garamond text-4xl md:text-6xl font-bold text-white mb-6">
            {isAr ? "منظومة متكاملة بمستوى البنوك الاستثمارية العالمية" : "Engineered for Institutional Capital Allocators"}
          </motion.h2>

          <motion.p variants={staggerItem} className="text-slate-400 text-base md:text-lg">
            {isAr 
              ? "مجموعة شاملة من الأدوات والنماذج التقييمية المصممة لمديري الصناديق والمحللين في السوق السعودي والخليجي."
              : "A powerful matrix of financial engineering models, streaming generative intelligence, and AAOIFI compliance controls."
            }
          </motion.p>
        </motion.div>

        {/* 3D Tilt Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -8 }}
              className="glass-card p-8 rounded-2xl border border-white/10 flex flex-col justify-between group hover:border-[var(--emerald)]/50 transition-all bg-[#0F1113]/80"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 group-hover:bg-[var(--emerald)]/10 group-hover:border-[var(--emerald)]/30 transition-all">
                    {feature.icon}
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-white/5 text-[var(--gold)] border border-white/10">
                    {feature.badge}
                  </span>
                </div>

                <h3 className="font-bold text-white text-xl mb-3 group-hover:text-[var(--emerald)] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-6">
                  {feature.desc}
                </p>
              </div>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[var(--emerald)] group-hover:text-white transition-colors pt-4 border-t border-white/10"
              >
                <span>{isAr ? "تشغيل النموذج" : "Launch Engine"}</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
