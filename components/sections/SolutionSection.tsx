"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Cpu } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { staggerContainer, staggerItem } from "@/lib/motion";

// Micro-animations imports
import TickingNumber from "./animations/TickingNumber";
import GaugeFill from "./animations/GaugeFill";
import BadgeDraw from "./animations/BadgeDraw";
import HeatmapCells from "./animations/HeatmapCells";
import TimelineSteps from "./animations/TimelineSteps";
import ThreeStatementSync from "./animations/ThreeStatementSync";
import LiveTickerFlash from "./animations/LiveTickerFlash";

export default function SolutionSection() {
  const { language } = useTerminalStore();
  const isAr = language === 'ar';

  const capabilities = [
    {
      eyebrow: "01 // QUANTITATIVE VALUATION",
      eyebrowAr: "٠١ // التقييم الكمي المتقدم",
      title: isAr ? "محرك تقييم التدفقات DCF" : "Institutional DCF Engine",
      desc: isAr 
        ? "نمذجة التدفقات النقدية 5 سنوات مع خريطة حساسيات 5×5 لمعدل الخصم والنمو النهائي." 
        : "5-year FCF projections with WACC formulas and a 5x5 heatmap sensitivity matrix.",
      demo: <TickingNumber />,
      bullets: isAr
        ? ["توقعات التدفقات النقدية الحرة", "حسابات معدل الخصم WACC", "مصفوفة حساسية الأرباح"]
        : ["Free Cash Flow projections", "WACC recalculation module", "Sensitivity heatmap matrices"]
    },
    {
      eyebrow: "02 // TRANSACTION STRUCTURE",
      eyebrowAr: "٠٢ // هيكلة صفقات الاستحواذ",
      title: isAr ? "باني صفقات الاستحواذ LBO" : "LBO Deal Builder",
      desc: isAr 
        ? "تحليل عائدات الاستحواذ للملكية الخاصة وشداول إطفاء الديون متعددة الشرائح." 
        : "Private equity deal mechanics, multi-tranche debt amortization, and MOIC / IRR waterfalls.",
      demo: <GaugeFill />,
      bullets: isAr
        ? ["شلال توزيع العوائد والمخاطر", "إطفاء الدين متعدد المستويات", "تتبع التدفقات للملكية الخاصة"]
        : ["Waterfalls return logic", "Multi-tranche debt scheduling", "PE fund metrics tracking"]
    },
    {
      eyebrow: "03 // SHARIAH AUDIT",
      eyebrowAr: "٠٣ // التدقيق والفحص الشرعي",
      title: isAr ? "الفحص الشرعي AAOIFI" : "AAOIFI Shariah Screening",
      desc: isAr 
        ? "فحص نسب الديون والإيرادات المحرمة وفق المعيار 21 وحساب مبالغ التطهير للسهم." 
        : "AAOIFI Standard No. 21 ratio checks and per-share purification income calculation.",
      demo: <BadgeDraw />,
      bullets: isAr
        ? ["تدقيق معيار أيوفي رقم ٢١", "حساب مبالغ تطهير الأرباح", "فحص الديون والأصول التلقائي"]
        : ["AAOIFI Standard 21 audits", "Purification accounting", "Automated debt ratio checks"]
    },
    {
      eyebrow: "04 // INTELLIGENCE PIPELINE",
      eyebrowAr: "٠٤ // سلسلة استخبارات الأسهم",
      title: isAr ? "مذكرات أبحاث بالذكاء الاصطناعي" : "AI Research Memo Engine",
      desc: isAr 
        ? "توليد تقارير مالية مؤسسية فورية عبر Gemini 2.5 Flash مع الربط بالبحث اللحظي." 
        : "Instant institutional equity memo generation via Gemini 2.5 Flash with real-time web search grounding.",
      demo: <TimelineSteps />,
      bullets: isAr
        ? ["توليد مذكرات فورية متكاملة", "بحث مالي حي من غوغل", "دعم كامل للغة العربية"]
        : ["Instant memo generation", "Google financial search grounding", "Bilingual report structuring"]
    },
    {
      eyebrow: "05 // EQUITY FILTERS",
      eyebrowAr: "٠٥ // فاحص ومصفّي الأسهم",
      title: isAr ? "فاحص السوق الخليجي" : "Market Screener",
      desc: isAr 
        ? "فحص وتصفية أسهم الخليج بناءً على المؤشرات المالية والقيم الفنية." 
        : "Screen and filter GCC equities based on key financial metrics and technical indicators.",
      demo: <HeatmapCells />,
      bullets: isAr
        ? ["تصفية متعددة العوامل", "مؤشرات مالية مخصصة", "تحديث قيم التقييم تلقائياً"]
        : ["Multi-factor screen logic", "Custom financial metrics", "Auto-refreshing valuation tags"]
    },
    {
      eyebrow: "06 // FINANCIAL STATEMENTS",
      eyebrowAr: "٠٦ // تكامل القوائم المحاسبية",
      title: isAr ? "نموذج القوائم الثلاث IFRS" : "Linked 3-Statement Model",
      desc: isAr 
        ? "قوائم مالية مترابطة بالكامل مع حساب مخصص الزكاة الشرعية وتصدير Excel & PDF." 
        : "IFRS / Saudi GAAP model with Zakat recalculation, dynamic charts, and Excel/PDF export.",
      demo: <ThreeStatementSync />,
      bullets: isAr
        ? ["ربط ديناميكي للقوائم الثلاث", "حساب الزكاة والضرائب الخليجية", "تصدير فوري بصيغة Excel"]
        : ["Dynamic 3-statement linking", "Zakat and GCC tax formulas", "Instant excel report building"]
    },
    {
      eyebrow: "07 // TADAWUL DIRECT",
      eyebrowAr: "٠٧ // بيانات السوق السعودي الحية",
      title: isAr ? "بيانات تداول اللحظية" : "Live Tadawul Market Suite",
      desc: isAr 
        ? "تحديث تلقائي لأسهم السوق السعودي مع شريط التدفقات النقدية اللحظي للمحافظ." 
        : "Auto-refreshing price feed for Tadawul symbols with institutional order tape.",
      demo: <LiveTickerFlash />,
      bullets: isAr
        ? ["تحديث الأسعار فوري", "شريط صفقات السيولة المؤسسية", "تنبيهات حركة السوق والارتفاع"]
        : ["Real-time price feeds", "Institutional cash flow tape", "Volatility flash tracking"]
    }
  ];

  return (
    <section id="solution" className="py-24 bg-[#0A0B0D] border-t border-white/5 relative overflow-hidden" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* SECTION HEADER */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-3xl mb-20"
        >
          <motion.div 
            variants={staggerItem} 
            className="text-[10px] font-mono text-[var(--emerald)] uppercase tracking-widest mb-3 flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--emerald)] animate-pulse"></span>
            <span>{isAr ? "المنظومة المالية السيادية" : "Sovereign Intelligence Terminal"}</span>
          </motion.div>

          <motion.h2 
            variants={staggerItem} 
            className="font-garamond text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-wide leading-tight"
          >
            {isAr ? "منظومة متكاملة بمستوى البنوك الاستثمارية العالمية" : "Engineered for GCC Institutional Capital"}
          </motion.h2>

          <motion.p 
            variants={staggerItem} 
            className="text-slate-400 font-sans text-xs md:text-sm leading-relaxed max-w-xl"
          >
            {isAr 
              ? "مجموعة شاملة من الأدوات والنماذج التقييمية المصممة لمديري الصناديق والمحللين في السوق السعودي والخليجي."
              : "A powerful matrix of financial engineering models, streaming generative intelligence, and AAOIFI compliance controls."
            }
          </motion.p>
        </motion.div>

        {/* Dense Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {capabilities.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: (idx % 2) * 0.1 }}
              className="flex flex-col md:flex-row gap-6 p-6 rounded-xl border border-white/5 bg-[#0F1113]/30 hover:border-white/10 transition-all duration-300 items-stretch"
            >
              {/* Copy Side */}
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[9px] font-mono text-[var(--gold)] uppercase tracking-wider block">
                    {isAr ? item.eyebrowAr : item.eyebrow}
                  </span>
                  <h3 className="font-garamond text-lg font-bold text-white tracking-wide">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 font-sans text-[11px] leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <ul className="space-y-1.5 pt-2">
                  {item.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="flex items-center gap-2 text-[10px] text-slate-300 font-sans">
                      <span className="w-1 h-1 bg-[var(--emerald)] rounded-full"></span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4 border-t border-white/5 mt-auto">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-[var(--emerald)] hover:text-white transition-colors"
                  >
                    <span>{isAr ? "تشغيل النموذج" : "Launch Engine"}</span>
                    <ChevronRight size={12} className="mt-0.5" />
                  </Link>
                </div>
              </div>

              {/* Demo Side */}
              <div className="w-full md:w-[220px] min-h-[160px] shrink-0 border border-white/5 bg-black/40 rounded-lg overflow-hidden flex items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none"></div>
                {item.demo}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
