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
    <section id="solution" className="py-24 bg-white relative overflow-hidden border-t border-[#E2E8F0] font-sans" dir={isAr ? "rtl" : "ltr"}>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.div variants={staggerItem} className="inline-flex items-center gap-2 px-3.5 py-1 bg-emerald-dim border border-emerald-border text-emerald text-xs font-mono font-bold uppercase tracking-wider mb-4 rounded-full shadow-2xs">
            <Sparkles size={12} />
            <span>{isAr ? "قدرات المحرك التكتيكي" : "MODELING ENGINE SUITE"}</span>
          </motion.div>

          <motion.h2 variants={staggerItem} className="font-serif text-3xl md:text-5xl font-bold text-slate-900 mb-6">
            {isAr ? "أدوات مخصصة للتحليل المالي الخليجي" : "Built for the Nuances of Gulf Capital Markets"}
          </motion.h2>

          <motion.p variants={staggerItem} className="text-slate-600 text-base leading-relaxed font-sans font-medium">
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
              className="bg-white p-6 border border-[#E2E8F0] hover:border-emerald transition-all flex flex-col justify-between h-[230px] rounded-lg shadow-sm hover:shadow-md group"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-[#E2E8F0] text-emerald group-hover:border-emerald transition-colors">
                    {feature.icon}
                  </div>
                  <span className="flex items-center gap-1.5 px-2 py-0.5 border border-[#E2E8F0] bg-slate-50 text-slate-700 text-[10px] font-mono font-bold tracking-wider uppercase rounded-md">
                    <span className="w-1.5 h-1.5 bg-emerald rounded-full animate-pulse"></span>
                    {feature.badge}
                  </span>
                </div>

                <h3 className="font-serif text-base font-bold text-slate-900 mb-2 tracking-wide group-hover:text-emerald transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed font-sans">
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* INTERACTIVE LIVE DCF SENSITIVITY MATRIX PREVIEW */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16 bg-slate-50 border border-[#E2E8F0] p-6 md:p-8 rounded-xl shadow-xs"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-emerald font-mono text-xs font-bold uppercase tracking-wider mb-1">
                <BarChart3 size={14} />
                <span>{isAr ? "مصفوفة حساسية التقييم (WACC vs Growth)" : "5x5 Sensitivity Heatmap Matrix"}</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-900">
                {isAr ? "حساسية القيمة العادلة لتغير معدل الخصم والنمو النهائي" : "Saudi Aramco Intrinsic Value Sensitivity Heatmap"}
              </h3>
            </div>
            <span className="px-3 py-1 bg-white border border-[#E2E8F0] rounded font-mono text-[11px] text-slate-600 font-bold">
              {isAr ? "السعر الحالي: 27.85 ريال" : "Current Price: SAR 27.85"}
            </span>
          </div>

          {/* HEATMAP TABLE GRID */}
          <div className="overflow-x-auto">
            <table className="w-full text-center font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-slate-500">
                  <th className="p-3 text-left rtl:text-right font-bold text-slate-700">WACC \ Growth</th>
                  <th className="p-3">1.5%</th>
                  <th className="p-3">2.0%</th>
                  <th className="p-3 bg-emerald-dim text-emerald font-bold border-x border-[#E2E8F0]">2.5% (Base)</th>
                  <th className="p-3">3.0%</th>
                  <th className="p-3">3.5%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {[
                  { wacc: "7.5%", vals: ["SAR 41.20", "SAR 43.10", "SAR 45.40", "SAR 48.10", "SAR 51.30"] },
                  { wacc: "8.2%", vals: ["SAR 37.80", "SAR 39.45", "SAR 41.30", "SAR 43.50", "SAR 46.10"] },
                  { wacc: "8.9% (Base)", vals: ["SAR 35.10", "SAR 36.60", "SAR 38.45", "SAR 40.20", "SAR 42.40"], isBase: true },
                  { wacc: "9.5%", vals: ["SAR 32.90", "SAR 34.10", "SAR 35.60", "SAR 37.15", "SAR 39.00"] },
                  { wacc: "10.2%", vals: ["SAR 30.80", "SAR 31.90", "SAR 33.20", "SAR 34.60", "SAR 36.20"] },
                ].map((row, i) => (
                  <tr key={i} className={row.isBase ? "bg-slate-100 font-bold" : "hover:bg-white"}>
                    <td className="p-3 text-left rtl:text-right font-bold text-slate-800">{row.wacc}</td>
                    {row.vals.map((v, j) => {
                      const isCenter = row.isBase && j === 2;
                      return (
                        <td key={j} className={`p-3 ${isCenter ? "bg-emerald text-white font-extrabold rounded-md shadow-xs" : "text-slate-700"}`}>
                          {v}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

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
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-emerald hover:underline transition-colors group cursor-pointer uppercase tracking-wider"
          >
            <span>{isAr ? "ابدأ النمذجة الآن" : "Launch Engine Sandbox"}</span>
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
