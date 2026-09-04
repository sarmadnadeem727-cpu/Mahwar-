"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, X, Shield, Activity, Globe, Scale } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";

export default function ComparisonSection() {
  const { language } = useTerminalStore();
  const isAr = language === 'ar';

  const rows = [
    {
      featureEn: "AAOIFI Standard No. 21 Shariah Screening",
      featureAr: "الفحص الشرعي المعتمد وفق معيار أيوفي (AAOIFI 21)",
      mahwar: true,
      legacy: false,
    },
    {
      featureEn: "Saudi GAAP Zakat Provision (2.5%) vs. IFRS Tax",
      featureAr: "معالجة الزكاة الشرعية (2.5%) مقارنة بضريبة الشركات IFRS",
      mahwar: true,
      legacy: false,
    },
    {
      featureEn: "Native Arabic RTL Terminal Parity & Dual Language",
      featureAr: "دعم اللغة العربية التفاعلية الكاملة ومطابقة الواجهة RTL",
      mahwar: true,
      legacy: false,
    },
    {
      featureEn: "Custom Private Equity LBO Returns & Debt Waterfalls",
      featureAr: "نمذجة صفقات الاستحواذ الخاص وشلالات الديون وشروط الاستثمار",
      mahwar: true,
      legacy: true,
    },
    {
      featureEn: "Real-Time GCC Market Wire (Tadawul, DFM, QSE)",
      featureAr: "موجز الأخبار المباشرة لأسواق المال السعودية والخليجية",
      mahwar: true,
      legacy: true,
    },
    {
      featureEn: "Consolidated Client PDF/Excel Session Report Builder",
      featureAr: "تصدير التقرير الموحد للعملاء بصيغ PDF و Excel موجهة للطباعة",
      mahwar: true,
      legacy: false,
    },
  ];

  return (
    <section id="problem" className="py-20 bg-surface-subtle border-b border-surface-border font-sans" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-5xl mx-auto px-6">
        
        {/* SECTION HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white border border-surface-border text-slate-heading text-mono-caption font-mono font-bold uppercase tracking-wider mb-4 rounded-full shadow-2xs">
            <Scale size={13} className="text-emerald" />
            <span>{isAr ? "الفارق التنافسي" : "MAHWAR VS. GENERIC TERMINALS"}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-heading mb-4">
            {isAr ? "مصممة خصيصاً للأنظمة والضوابط الخليجية" : "Engineered for GCC Institutional Standards"}
          </h2>

          <p className="text-slate-body text-body-sm leading-relaxed font-medium">
            {isAr
              ? "مقارنة مباشرة تبرز تفوق محور في معالجة القوانين السعودية والشرعية مقارنة بالمنصات العالمية العامة."
              : "A side-by-side architecture audit showing how Mahwar delivers localized compliance and quantitative depth over generic legacy terminals."
            }
          </p>
        </div>

        {/* COMPARISON TABLE */}
        <div className="bg-white rounded-xl border border-surface-border shadow-terminal-card overflow-hidden font-mono text-mono-caption">
          <table className="w-full text-left rtl:text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-surface-border text-slate-muted">
                <th className="p-4 text-xs font-bold uppercase tracking-wider">{isAr ? "المعيار والقدرة التكتيكية" : "Institutional Capability"}</th>
                <th className="p-4 text-center text-xs font-bold text-emerald uppercase tracking-wider bg-emerald-dim border-x border-emerald-border">
                  MAHWAR SOVEREIGN
                </th>
                <th className="p-4 text-center text-xs font-bold uppercase tracking-wider">{isAr ? "المنصات العالمية العامة" : "Generic Global Terminals"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-surface-subtle transition-colors">
                  <td className="p-4 font-sans text-xs font-semibold text-slate-heading">
                    {isAr ? row.featureAr : row.featureEn}
                  </td>
                  <td className="p-4 text-center bg-emerald-dim/40 border-x border-emerald-border/50">
                    <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald text-white font-bold">
                      <Check size={14} />
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    {row.legacy ? (
                      <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-500 font-bold">
                        <Check size={14} />
                      </div>
                    ) : (
                      <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-50 text-rose-600 font-bold">
                        <X size={14} />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </section>
  );
}
