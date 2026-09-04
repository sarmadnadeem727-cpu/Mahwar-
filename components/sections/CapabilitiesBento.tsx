"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, BarChart3, Database, FileSpreadsheet, ArrowRight, Activity, Globe } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import Link from "next/link";

export default function CapabilitiesBento() {
  const { language } = useTerminalStore();
  const isAr = language === 'ar';

  return (
    <section className="py-24 bg-[#F8FAFC] border-y border-[#E2E8F0] overflow-hidden font-sans" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="label-pill label-pill-emerald mb-6"
          >
            <Database size={12} />
            <span>{isAr ? "قدرات النظام الأساسية" : "Core Capabilities"}</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif text-3xl sm:text-5xl font-extrabold text-slate-900 leading-tight mb-4"
          >
            {isAr ? "بنية تحتية متكاملة لأسواق رأس المال" : "Unrivaled Depth for GCC Markets"}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 font-medium"
          >
            {isAr 
              ? "مجموعة أدوات متكاملة مصممة خصيصاً لتلبية متطلبات الامتثال المحلي والمعايير المحاسبية في الشرق الأوسط."
              : "A unified suite of institutional-grade tools built specifically for Middle Eastern regulatory, accounting, and compliance frameworks."}
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[240px]">
          
          {/* Card 1: AAOIFI Shariah - Large Square */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 md:row-span-2 bg-white rounded-[10px] p-8 border border-[rgba(0,0,0,0.08)] relative overflow-hidden group" style={{ boxShadow: 'var(--shadow-card)' }}
          >
            {/* No decorative blob — removed filler gradient */}
            
            <ShieldCheck size={32} className="text-emerald mb-6" />
            <h3 className="text-2xl font-bold text-slate-900 mb-3 font-serif">
              {isAr ? "محرك الفحص الشرعي (AAOIFI)" : "AAOIFI Shariah Engine"}
            </h3>
            <p className="text-slate-500 mb-8 max-w-sm">
              {isAr 
                ? "فحص آلي وفوري للشركات بناءً على معايير هيئة المحاسبة والمراجعة للمؤسسات المالية الإسلامية مع تنقية الإيرادات."
                : "Automated real-time compliance screening against AAOIFI standards, including revenue purification and debt ratio limits."}
            </p>
            
            <div className="absolute bottom-8 left-8 right-8">
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 font-mono text-xs flex justify-between items-center">
                <span className="text-slate-600 font-bold uppercase">{isAr ? "حالة الامتثال" : "Compliance Status"}</span>
                <span className="bg-emerald/10 text-emerald px-2 py-1 rounded font-bold">COMPLIANT (PASS)</span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: LBO/DCF Modeling - Wide Rectangle */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2 lg:col-span-2 bg-slate-900 rounded-[10px] p-8 relative overflow-hidden group" style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <BarChart3 size={28} className="text-emerald mb-4" />
                <h3 className="text-xl font-bold text-white mb-2 font-serif">
                  {isAr ? "النمذجة الكمية (DCF & LBO)" : "Quantitative Valuation (DCF & LBO)"}
                </h3>
                <p className="text-slate-400 text-sm">
                  {isAr 
                    ? "نماذج تقييم متقدمة مع تكامل للزكاة وتحليل الحساسية."
                    : "Institutional modeling with integrated Zakat, WACC calculation, and multi-stage growth assumptions."}
                </p>
              </div>
              <Link href="/dashboard?panel=DCF" className="inline-flex items-center gap-2 text-emerald font-mono text-xs font-bold uppercase mt-4 hover:text-white transition-colors">
                <span>{isAr ? "استكشف النماذج" : "Launch Models"}</span>
                <ArrowRight size={14} className={isAr ? "rotate-180" : ""} />
              </Link>
            </div>
          </motion.div>

          {/* Card 3: 3-Statement - Small Square */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-[10px] p-6 border border-[rgba(0,0,0,0.08)] flex flex-col group hover:border-emerald/30 transition-colors" style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <FileSpreadsheet size={24} className="text-slate-700 mb-4 group-hover:text-emerald transition-colors" />
            <h3 className="text-lg font-bold text-slate-900 mb-2 font-serif">
              {isAr ? "القوائم المالية (IFRS)" : "3-Statement IFRS"}
            </h3>
            <p className="text-slate-500 text-sm flex-1">
              {isAr 
                ? "توليد آلي للقوائم المالية الثلاث بناءً على معايير IFRS المعتمدة في المنطقة."
                : "Auto-generated 3-statement models aligned with regional IFRS adoption."}
            </p>
          </motion.div>

          {/* Card 4: Live Data - Small Square */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-[10px] p-6 border border-[rgba(0,0,0,0.08)] flex flex-col group hover:border-emerald/30 transition-colors overflow-hidden relative" style={{ boxShadow: 'var(--shadow-card)' }}
          >
            {/* Sparkline decorative background */}
            <svg className="absolute bottom-0 left-0 w-full h-24 opacity-[0.03] group-hover:opacity-10 transition-opacity" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M0,30 L0,20 Q10,15 20,25 T40,15 T60,20 T80,5 T100,10 L100,30 Z" fill="#0E7C69" />
            </svg>
            
            <Activity size={24} className="text-slate-700 mb-4 group-hover:text-emerald transition-colors relative z-10" />
            <h3 className="text-lg font-bold text-slate-900 mb-2 font-serif relative z-10">
              {isAr ? "بيانات حية من تداول" : "Tadawul Live Data"}
            </h3>
            <p className="text-slate-500 text-sm flex-1 relative z-10">
              {isAr 
                ? "اتصال مباشر مع سوق الأسهم السعودي لاستيراد الأسعار والبيانات التاريخية."
                : "Direct feed integration for real-time Saudi equity pricing and historical financials."}
            </p>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
