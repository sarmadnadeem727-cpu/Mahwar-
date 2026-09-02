"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";

export default function CTASection() {
  const { language } = useTerminalStore();
  const isAr = language === 'ar';

  return (
    <section className="py-24 bg-terminal-bg relative overflow-hidden" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="rounded-sm bg-terminal-panel p-10 md:p-16 text-center relative overflow-hidden shadow-sm border border-terminal-border">

          <div className="max-w-3xl mx-auto relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-terminal-emerald/10 border border-terminal-emerald/20 text-terminal-emerald font-mono text-[10px] font-bold uppercase tracking-[0.2em]">
              <Zap size={12} className="text-terminal-emerald" />
              <span>{isAr ? "جاهز للاستخدام الفوري" : "INSTANT INSTITUTIONAL ACCESS"}</span>
            </div>

            <h2 className="font-serif text-3xl md:text-5xl font-bold text-terminal-text tracking-tight">
              {isAr ? "ارتقِ بتحليلاتك المالية لمستوى المحطة السيادية" : "Elevate Your GCC Financial Intelligence Terminal Today"}
            </h2>

            <p className="text-terminal-text-secondary text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-sans">
              {isAr 
                ? "ابدأ بتوليد مذكرات الاستثمار الذكية ونمذجة التقييم المالي والتقارير الموحدة بدون أي تعقيد."
                : "Experience Wall Street analytical depth tailored specifically for Saudi & Gulf Capital Markets."
              }
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-sm bg-terminal-emerald text-white font-mono font-bold text-xs uppercase tracking-wider hover:bg-terminal-emerald-light transition-all cursor-pointer group shadow-sm"
              >
                <span>{isAr ? "تشغيل محطة المحور" : "Launch Mahwar Terminal"}</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="pt-6 mt-6 border-t border-terminal-border border-dashed text-[10px] uppercase tracking-wider font-mono text-terminal-text-secondary flex items-center justify-center gap-2">
              <ShieldCheck size={12} />
              <span>{isAr ? "مصمم ومطور بواسطة محمد سرمد نديم" : "Architected & Developed by Muhammad Sarmad Nadeem"}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
