"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";

export default function CTASection() {
  const { language } = useTerminalStore();
  const isAr = language === 'ar';

  return (
    <section className="py-20 bg-white relative overflow-hidden font-sans" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="rounded-xl bg-surface-subtle p-10 md:p-14 text-center relative overflow-hidden shadow-terminal-card border border-surface-border">

          <div className="max-w-3xl mx-auto relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-dim border border-emerald-border text-emerald font-mono text-mono-caption font-bold uppercase tracking-wider rounded-full shadow-2xs">
              <Zap size={13} className="text-emerald" />
              <span>{isAr ? "جاهز للاستخدام الفوري" : "INSTANT INSTITUTIONAL ACCESS"}</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-slate-heading tracking-tight">
              {isAr ? "ارتقِ بتحليلاتك المالية لمستوى المحطة التكتيكية" : "Launch Your GCC Financial Engine Today"}
            </h2>

            <p className="text-slate-body text-body-sm leading-relaxed max-w-2xl mx-auto font-medium">
              {isAr 
                ? "ابدأ بنمذجة التقييم المالي، الفحص الشرعي، مقارنة الشركات، والتقارير الموحدة بدون أي تعقيد."
                : "Experience institutional quantitative depth tailored specifically for Saudi & Gulf Capital Markets."
              }
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-lg bg-emerald text-white font-mono font-bold text-mono-caption uppercase tracking-wider hover:bg-emerald-light transition-all cursor-pointer group shadow-sm"
              >
                <span>{isAr ? "تشغيل محطة المحور" : "ENTER TERMINAL"}</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Single Unobtrusive Technical Stack Line & Author Credit */}
            <div className="pt-6 mt-6 border-t border-surface-border border-dashed text-mono-caption font-mono text-slate-muted flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald" />
                <span>{isAr ? "تطوير: محمد سرمد نديم" : "Architected & Developed by Muhammad Sarmad Nadeem"}</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <span className="text-[10px]">Next.js 15 • Tailwind CSS • Framer Motion • Recharts</span>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
