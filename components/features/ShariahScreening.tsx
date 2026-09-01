"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, HelpCircle } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import { panelReveal } from "@/lib/motion";

export default function ShariahScreening() {
  const { language, updateSessionAnalysis } = useTerminalStore();
  const isAr = language === 'ar';

  // Manual inputs state
  const [totalAssets, setTotalAssets] = useState<number>(0);
  const [totalDebt, setTotalDebt] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [interestIncome, setInterestIncome] = useState<number>(0);
  const [receivables, setReceivables] = useState<number>(0);
  const [sharesOutstanding, setSharesOutstanding] = useState<number>(0);

  // Client-side calculations
  const debtRatio = totalAssets > 0 ? (totalDebt / totalAssets) * 100 : 0;
  const interestRatio = totalRevenue > 0 ? (interestIncome / totalRevenue) * 100 : 0;
  const receivablesRatio = totalAssets > 0 ? (receivables / totalAssets) * 100 : 0;
  const purificationPerShare = sharesOutstanding > 0 ? (interestIncome / sharesOutstanding) : 0;

  // Threshold compliance checks
  const isDebtCompliant = debtRatio <= 33;
  const isInterestCompliant = interestRatio <= 5;
  const isReceivablesCompliant = receivablesRatio <= 49;

  const isCompliant = isDebtCompliant && isInterestCompliant && isReceivablesCompliant;

  // Save to terminal session state
  useEffect(() => {
    updateSessionAnalysis("shariah", {
      inputs: {
        totalAssets,
        totalDebt,
        totalRevenue,
        interestIncome,
        receivables,
        sharesOutstanding
      },
      outputs: {
        debtRatio: Number(debtRatio.toFixed(2)),
        interestRatio: Number(interestRatio.toFixed(2)),
        receivablesRatio: Number(receivablesRatio.toFixed(2)),
        purificationPerShare: Number(purificationPerShare.toFixed(4)),
        verdict: isCompliant 
          ? (isAr ? "متوافق مع ضوابط الهيئة الشرعية (AAOIFI)" : "Compliant (AAOIFI Standards)")
          : (isAr ? "غير متوافق" : "Non-Compliant")
      },
      computedAt: new Date().toISOString()
    });
  }, [totalAssets, totalDebt, totalRevenue, interestIncome, receivables, sharesOutstanding, isCompliant]);

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="grid grid-cols-12 gap-8 text-[#171717]"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* LEFT COLUMN: MANUAL ENTRY FORM (4 COLS) */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        <div className="glass-panel p-6 rounded-xl border border-slate-200 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-[var(--emerald)]" size={22} />
              <div>
                <h2 className="font-serif text-xl font-bold text-[#171717]">
                  {isAr ? "الفحص الشرعي اليدوي" : "Shariah Screening Inputs"}
                </h2>
                <span className="text-[10px] font-mono text-slate-500">
                  {isAr ? "مدخلات النسب الشرعية" : "AAOIFI Standard 21 Audit"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-700 block">{isAr ? "إجمالي الأصول (SAR)" : "Total Assets (SAR)"}</label>
              <input
                type="number"
                value={totalAssets}
                onChange={(e) => setTotalAssets(Number(e.target.value))}
                className="terminal-input w-full"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 block">{isAr ? "إجمالي الديون الربوية (SAR)" : "Total Debt (SAR)"}</label>
              <input
                type="number"
                value={totalDebt}
                onChange={(e) => setTotalDebt(Number(e.target.value))}
                className="terminal-input w-full"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 block">{isAr ? "إجمالي الإيرادات (SAR)" : "Total Revenue (SAR)"}</label>
              <input
                type="number"
                value={totalRevenue}
                onChange={(e) => setTotalRevenue(Number(e.target.value))}
                className="terminal-input w-full"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 block">{isAr ? "الإيرادات المحرمة / الفوائد (SAR)" : "Interest/Non-Compliant Income (SAR)"}</label>
              <input
                type="number"
                value={interestIncome}
                onChange={(e) => setInterestIncome(Number(e.target.value))}
                className="terminal-input w-full"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 block">{isAr ? "إجمالي الذمم المدينة والمدينون (SAR)" : "Receivables (SAR)"}</label>
              <input
                type="number"
                value={receivables}
                onChange={(e) => setReceivables(Number(e.target.value))}
                className="terminal-input w-full"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 block">{isAr ? "الأسهم القائمة (مليون)" : "Shares Outstanding (M)"}</label>
              <input
                type="number"
                value={sharesOutstanding}
                onChange={(e) => setSharesOutstanding(Number(e.target.value))}
                className="terminal-input w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: SCREENING REPORT (8 COLS) */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        {/* COMPLIANCE VERDICT BANNER */}
        <div className={`p-6 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm ${
          isCompliant 
            ? "bg-green-50 border-green-250 text-green-800" 
            : "bg-red-50 border-red-250 text-red-800"
        }`}>
          <div>
            <h3 className="font-serif text-2xl font-bold uppercase tracking-wide">
              {isCompliant ? (isAr ? "متوافق مع الشريعة" : "Shariah Compliant") : (isAr ? "غير متوافق" : "Non-Compliant")}
            </h3>
            <p className="text-xs font-mono mt-1 opacity-80">
              {isAr 
                ? "تم الفحص بناءً على معايير الهيئة الشرعية للتمويل والاستثمار (AAOIFI)" 
                : "Audited client-side against AAOIFI investment standard thresholds"}
            </p>
          </div>

          <div className="text-center sm:text-right shrink-0">
            <span className="text-[10px] font-mono uppercase tracking-wider block opacity-85">
              {isAr ? "مبلغ التطهير لكل سهم" : "Purification per Share"}
            </span>
            <span className="font-mono text-xl font-extrabold block mt-0.5">
              SAR {purificationPerShare.toFixed(4)}
            </span>
          </div>
        </div>

        {/* DETAILED SCREENING RATIOS METRIC CARDS */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-6 shadow-sm">
          <h3 className="font-mono text-xs font-bold text-[#171717] uppercase tracking-wider">
            {isAr ? "مؤشرات الامتثال المالي الشرعي" : "AAOIFI Compliance Ratio Analysis"}
          </h3>

          <div className="space-y-6 font-mono text-xs">
            {/* Ratio 1: Debt Ratio */}
            <div className="space-y-2">
              <div className="flex justify-between text-slate-700">
                <span>{isAr ? "نسبة الديون إلى الأصول" : "Debt / Total Assets Ratio"}</span>
                <span className="font-bold">{debtRatio.toFixed(2)}% / 33.00% max</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${isDebtCompliant ? "bg-[var(--emerald)]" : "bg-red-500"}`}
                  style={{ width: `${Math.min(100, debtRatio)}%` }}
                />
              </div>
              <span className={`text-[10px] block ${isDebtCompliant ? "text-green-600 font-bold" : "text-red-500 font-bold"}`}>
                {isDebtCompliant ? (isAr ? "✓ ضمن الحدود الشرعية" : "✓ Within Limit") : (isAr ? "✗ يتجاوز الحد المسموح" : "✗ Exceeds Limit")}
              </span>
            </div>

            {/* Ratio 2: Interest Income Ratio */}
            <div className="space-y-2">
              <div className="flex justify-between text-slate-700">
                <span>{isAr ? "نسبة الإيرادات المحرمة" : "Interest Income / Total Revenue"}</span>
                <span className="font-bold">{interestRatio.toFixed(2)}% / 5.00% max</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${isInterestCompliant ? "bg-[var(--emerald)]" : "bg-red-500"}`}
                  style={{ width: `${Math.min(100, interestRatio * 10)}%` }} // Scaled for visibility
                />
              </div>
              <span className={`text-[10px] block ${isInterestCompliant ? "text-green-600 font-bold" : "text-red-500 font-bold"}`}>
                {isInterestCompliant ? (isAr ? "✓ ضمن الحدود الشرعية" : "✓ Within Limit") : (isAr ? "✗ يتجاوز الحد المسموح" : "✗ Exceeds Limit")}
              </span>
            </div>

            {/* Ratio 3: Receivables Ratio */}
            <div className="space-y-2">
              <div className="flex justify-between text-slate-700">
                <span>{isAr ? "نسبة الذمم المدينة إلى الأصول" : "Receivables / Total Assets Ratio"}</span>
                <span className="font-bold">{receivablesRatio.toFixed(2)}% / 49.00% max</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${isReceivablesCompliant ? "bg-[var(--emerald)]" : "bg-red-500"}`}
                  style={{ width: `${Math.min(100, receivablesRatio)}%` }}
                />
              </div>
              <span className={`text-[10px] block ${isReceivablesCompliant ? "text-green-600 font-bold" : "text-red-500 font-bold"}`}>
                {isReceivablesCompliant ? (isAr ? "✓ ضمن الحدود الشرعية" : "✓ Within Limit") : (isAr ? "✗ يتجاوز الحد المسموح" : "✗ Exceeds Limit")}
              </span>
            </div>
          </div>
        </div>

        {/* PURIFICATION METRIC INFO CARD */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-mono flex items-start gap-3">
          <HelpCircle size={16} className="text-[var(--emerald)] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-[#171717]">{isAr ? "معادلة التطهير الشرعي" : "Purification Action Guidelines"}</h4>
            <p className="leading-relaxed">
              {isAr 
                ? "يجب استبعاد نسبة الإيرادات غير المتوافقة (الربوية) وتوجيهها للمشاريع الخيرية العامة. يتم احتساب التطهير لكل سهم عن طريق قسمة الإيرادات المحرمة الإجمالية على عدد الأسهم المصدرة." 
                : "Islamic jurists recommend separating non-compliant components of earnings. The purification amount is calculated by dividing total interest income by outstanding shares and must be donated to charitable causes."}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
