"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";

export default function CTASection() {
  const { language } = useTerminalStore();
  const isAr = language === 'ar';

  return (
    <section className="py-24 bg-[#0B0E14] relative overflow-hidden" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="rounded-sm bg-[#121721] p-10 md:p-16 text-center relative overflow-hidden shadow-2xl border border-[#1E293B]">

          <div className="max-w-3xl mx-auto relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-terminal-emerald-dim border border-terminal-border-emerald text-terminal-emerald font-mono text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm shadow-md">
              <Zap size={12} className="text-terminal-emerald" />
              <span>{isAr ? "جاهز للاستخدام الفوري" : "INSTANT INSTITUTIONAL ACCESS"}</span>
            </div>

            <h2 className="font-mono text-3xl md:text-5xl font-extrabold text-white tracking-tight uppercase">
              {isAr ? "ارتقِ بتحليلاتك المالية لمستوى المحطة التكتيكية" : "Launch Your GCC CAD Financial Engine Today"}
            </h2>

            <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-mono">
              {isAr 
                ? "ابدأ بتوليد مذكرات الاستثمار الذكية ونمذجة التقييم المالي والتقارير الموحدة بدون أي تعقيد."
                : "Experience Wall Street analytical depth tailored specifically for Saudi & Gulf Capital Markets."
              }
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-sm bg-terminal-emerald text-black font-mono font-black text-xs uppercase tracking-wider hover:bg-terminal-emerald-light transition-all cursor-pointer group shadow-lg"
              >
                <span>{isAr ? "تشغيل محطة المحور" : "Launch Engine Workbench"}</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="pt-6 mt-6 border-t border-[#1E293B] border-dashed text-[10px] uppercase tracking-wider font-mono text-slate-400 flex items-center justify-center gap-2">
              <ShieldCheck size={12} className="text-terminal-emerald" />
              <span>{isAr ? "مصمم ومطور بواسطة محمد سرمد نديم" : "Architected & Developed by Muhammad Sarmad Nadeem"}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
