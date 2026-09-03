"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";

export default function CTASection() {
  const { language } = useTerminalStore();
  const isAr = language === 'ar';

  return (
    <section className="py-24 bg-white relative overflow-hidden font-sans" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="rounded-lg bg-slate-50 p-10 md:p-16 text-center relative overflow-hidden shadow-xs border border-[#E2E8F0]">

          <div className="max-w-3xl mx-auto relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-dim border border-emerald-border text-emerald font-mono text-xs font-bold uppercase tracking-wider rounded-full shadow-2xs">
              <Zap size={12} className="text-emerald" />
              <span>{isAr ? "جاهز للاستخدام الفوري" : "INSTANT INSTITUTIONAL ACCESS"}</span>
            </div>

            <h2 className="font-serif text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
              {isAr ? "ارتقِ بتحليلاتك المالية لمستوى المحطة التكتيكية" : "Launch Your GCC Financial Engine Today"}
            </h2>

            <p className="text-slate-600 text-base leading-relaxed max-w-2xl mx-auto font-sans font-medium">
              {isAr 
                ? "ابدأ بتوليد مذكرات الاستثمار الذكية ونمذجة التقييم المالي والتقارير الموحدة بدون أي تعقيد."
                : "Experience Wall Street analytical depth tailored specifically for Saudi & Gulf Capital Markets."
              }
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-lg bg-emerald text-white font-mono font-bold text-xs uppercase tracking-wider hover:bg-emerald-light transition-all cursor-pointer group shadow-sm"
              >
                <span>{isAr ? "تشغيل محطة المحور" : "Launch Engine Workbench"}</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="pt-6 mt-6 border-t border-[#E2E8F0] border-dashed text-xs uppercase tracking-wider font-mono text-slate-500 flex items-center justify-center gap-2">
              <ShieldCheck size={14} className="text-emerald" />
              <span>{isAr ? "مصمم ومطور بواسطة محمد سرمد نديم" : "Architected & Developed by Muhammad Sarmad Nadeem"}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
