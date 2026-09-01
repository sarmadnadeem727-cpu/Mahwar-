"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";

export default function CTASection() {
  const { language } = useTerminalStore();
  const isAr = language === 'ar';

  return (
    <section className="py-24 bg-white relative overflow-hidden" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="rounded-3xl bg-gradient-to-r from-[#0E7C69] via-[#10957F] to-[#12A189] p-10 md:p-16 text-center relative overflow-hidden shadow-lg border border-slate-200/20">
          
          {/* Subtle Ambient Glow Shapes */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl mx-auto relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white font-mono text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
              <Zap size={14} className="text-white" />
              <span>{isAr ? "جاهز للاستخدام الفوري" : "Instant Institutional Access"}</span>
            </div>

            <h2 className="font-serif text-4xl md:text-6xl font-bold text-white tracking-tight">
              {isAr ? "ارتقِ بتحليلاتك المالية لمستوى المحطة السيادية" : "Elevate Your GCC Financial Intelligence Terminal Today"}
            </h2>

            <p className="text-emerald-50 text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-sans">
              {isAr 
                ? "ابدأ بتوليد مذكرات الاستثمار الذكية ونمذجة التقييم المالي والتقارير الموحدة بدون أي تعقيد."
                : "Experience Wall Street analytical depth tailored specifically for Saudi & Gulf Capital Markets."
              }
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-white text-[#0E7C69] font-extrabold text-sm shadow-md hover:bg-slate-50 transition-all cursor-pointer group"
              >
                <span>{isAr ? "تشغيل محطة المحور" : "Launch Mahwar Terminal"}</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="pt-4 text-xs font-mono text-emerald-100/80 flex items-center justify-center gap-2">
              <ShieldCheck size={14} />
              <span>{isAr ? "مصمم ومطور بواسطة محمد سرمد نديم" : "Architected & Developed by Muhammad Sarmad Nadeem"}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
