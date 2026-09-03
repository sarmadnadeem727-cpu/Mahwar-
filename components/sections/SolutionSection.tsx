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
      icon: <Sparkles className="text-terminal-emerald" size={20} />,
      title: isAr ? "مذكرات الاستثمار الذكية" : "AI Research Memos",
      desc: isAr ? "توليد مذكرات استثمارية وتقارير بحثية بلمح البصر بدعم من Gemini 2.5 Flash للشركات والصفقات." : "Instant investment memo and research synthesis driven by Gemini 2.5 Flash from custom financials.",
      badge: isAr ? "ذكاء اصطناعي" : "Gemini 2.5",
    },
    {
      icon: <BarChart3 className="text-terminal-emerald" size={20} />,
      title: isAr ? "محرك التدفقات المخصومة (DCF)" : "Institutional DCF Engine",
      desc: isAr ? "حساب القيمة العادلة والأثر المالي لتغير مدخلات وتوقعات رأس المال والنمو والخصم." : "5-year Discounted Cash Flow engine with editable base variables, WACC inputs, and perpetual rate scenarios.",
      badge: isAr ? "نمذجة مالية" : "Intrinsic Valuation",
    },
    {
      icon: <Layers className="text-terminal-emerald" size={20} />,
      title: isAr ? "باني صفقات الاستحواذ (LBO)" : "LBO Deal Builder",
      desc: isAr ? "نمذجة التدفقات وعوائد الاستحواذ المدعوم بالديون وإظهار معدل العائد الداخلي (IRR)." : "Leveraged buyout analysis, dynamic source/use waterfalls, and IRR calculations over multiple hold periods.",
      badge: isAr ? "استثمار خاص" : "Private Equity",
    },
    {
      icon: <ShieldCheck className="text-terminal-emerald" size={20} />,
      title: isAr ? "الفحص الشرعي (AAOIFI)" : "AAOIFI Shariah Screening",
      desc: isAr ? "تدقيق توافق الأسهم والمعاملات المالية آلياً مع المعيار الشرعي رقم 21 ونسب التطهير الموصى بها." : "Audit stock and balance sheet compliance against standard 21 thresholds, debt/interest ratios, and purification rates.",
      badge: isAr ? "توافق شرعي" : "AAOIFI Audit",
    },
    {
      icon: <Activity className="text-terminal-emerald" size={20} />,
      title: isAr ? "مقارنة الشركات والصفقات" : "Company Comparator Matrix",
      desc: isAr ? "مصفوفة مقارنة تفاعلية وخريطة حرارية للشركات والنسب المالية والصفقات المدخلة يدوياً." : "Interactive peer comparison matrix and heatmap for custom corporate profiles and deal terms.",
      badge: isAr ? "تحليل الأقران" : "Peer Analysis",
    },
    {
      icon: <LineChart className="text-terminal-emerald" size={20} />,
      title: isAr ? "نموذج القوائم الثلاث IFRS" : "Linked 3-Statement Model",
      desc: isAr ? "قوائم مالية مترابطة بالكامل مع حساب مخصص الزكاة الشرعية وتصدير Excel & PDF." : "IFRS / Saudi GAAP model with Zakat recalculation, dynamic projection sheets, and exports.",
      badge: isAr ? "قوائم مالية" : "Accounting Model",
    }
  ];

  return (
    <section id="solution" className="py-24 bg-[#0B0E14] relative overflow-hidden border-t border-[#1E293B]" dir={isAr ? "rtl" : "ltr"}>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.div variants={staggerItem} className="inline-flex items-center gap-2 px-3 py-1 bg-terminal-emerald-dim border border-terminal-border-emerald text-terminal-emerald text-[10px] font-mono font-bold uppercase tracking-[0.2em] mb-4 rounded-sm shadow-md">
            <Sparkles size={12} />
            <span>{isAr ? "قدرات المحرك التكتيكي" : "MODELING ENGINE SUITE"}</span>
          </motion.div>

          <motion.h2 variants={staggerItem} className="font-mono text-3xl md:text-5xl font-extrabold text-white mb-6 uppercase">
            {isAr ? "أدوات مخصصة للتحليل المالي الخليجي" : "Built for the Nuances of Gulf Capital Markets"}
          </motion.h2>

          <motion.p variants={staggerItem} className="text-slate-400 text-sm md:text-base leading-relaxed font-mono">
            {isAr
              ? "تحليل شامل وهندسة مالية متكاملة لبياناتك الخاصة. حسابات دقيقة للتطهير الشرعي، نسب مديونية الأقران، نماذج التدفقات، وتوليد تقارير موحدة قابلة للطباعة."
              : "Consolidated, secure workspace for custom financial modeling. Run intrinsic evaluations, Shariah audits, peer multiples comparisons, and instantly download client-ready synthesis PDF reports."
            }
          </motion.p>
        </motion.div>

        {/* FEATURES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              whileHover={{ y: -4 }}
              className="bg-[#121721] p-6 border border-[#1E293B] hover:border-terminal-emerald transition-all flex flex-col justify-between h-[230px] rounded-sm shadow-lg group"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 rounded-sm bg-[#0B0E14] border border-[#1E293B] text-terminal-emerald group-hover:border-terminal-emerald transition-colors">
                    {feature.icon}
                  </div>
                  <span className="flex items-center gap-1.5 px-2 py-0.5 border border-[#1E293B] bg-[#0B0E14] text-slate-300 text-[9px] font-mono font-bold tracking-wider uppercase rounded-sm">
                    <span className="w-1.5 h-1.5 bg-terminal-emerald rounded-full animate-pulse"></span>
                    {feature.badge}
                  </span>
                </div>

                <h3 className="font-mono text-xs font-bold text-white mb-2 tracking-wide uppercase group-hover:text-terminal-emerald transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed font-mono">
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* BOTTOM CTA LINK */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-terminal-emerald hover:text-terminal-emerald-light transition-colors group cursor-pointer uppercase tracking-wider"
          >
            <span>{isAr ? "ابدأ النمذجة الآن" : "Launch Engine Sandbox"}</span>
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
