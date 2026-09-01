"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Calculator, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import { panelReveal } from "@/lib/motion";

export default function DCFModel() {
  const { language, updateSessionAnalysis } = useTerminalStore();
  const isAr = language === 'ar';

  // Assumptions State
  const [revGrowth, setRevGrowth] = useState<number>(0);
  const [ebitdaMargin, setEbitdaMargin] = useState<number>(0);
  const [capexRev, setCapexRev] = useState<number>(0);
  const [taxZakat, setTaxZakat] = useState<number>(0);
  const [costEquity, setCostEquity] = useState<number>(0);
  const [costDebt, setCostDebt] = useState<number>(0);
  const [debtWeight, setDebtWeight] = useState<number>(0);
  const [terminalGrowth, setTerminalGrowth] = useState<number>(0);

  // Editable Base Financial Metrics
  const [baseRevenue, setBaseRevenue] = useState<number>(0);
  const [netDebt, setNetDebt] = useState<number>(0);
  const [sharesOutstanding, setSharesOutstanding] = useState<number>(0);
  const [currentPrice, setCurrentPrice] = useState<number>(0);

  const [dcfResult, setDcfResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  const calculateDCF = async () => {
    // Guard: don't call API with zero inputs
    if (baseRevenue <= 0 || sharesOutstanding <= 0) return;

    setIsCalculating(true);
    try {
      const res = await fetch("/api/dcf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          revGrowth,
          ebitdaMargin,
          capexRev,
          taxZakat,
          costEquity,
          costDebt,
          debtWeight,
          terminalGrowth,
          currentPrice,
          baseRevenue,
          sharesOutstanding,
          netDebt
        }),
      });
      const data = await res.json();
      setDcfResult(data);

      // Save to terminal session state
      updateSessionAnalysis("dcf", {
        inputs: {
          revGrowth,
          ebitdaMargin,
          capexRev,
          taxZakat,
          costEquity,
          costDebt,
          debtWeight,
          terminalGrowth,
          currentPrice,
          baseRevenue,
          sharesOutstanding,
          netDebt
        },
        outputs: data,
        computedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("DCF Error:", err);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="grid grid-cols-12 gap-8 text-[#171717]"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* LEFT COLUMN: ASSUMPTIONS (4 COLS) */}
      <div className="col-span-12 lg:col-span-4 space-y-6 animate-fade-in">
        <div className="glass-panel p-6 rounded-xl border border-slate-200 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <BarChart3 className="text-[var(--emerald)]" size={22} />
              <div>
                <h2 className="font-serif text-xl font-bold text-[#171717]">
                  {t("dcf_assumptions", language)}
                </h2>
                <span className="text-[10px] font-mono text-slate-500">
                  {isAr ? "مدخلات التقييم اليدوية" : "Manual Valuation Inputs"}
                </span>
              </div>
            </div>
          </div>

          {/* Base Financials Section */}
          <div className="space-y-3 font-mono text-xs border-b border-slate-200 pb-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              {isAr ? "بيانات الشركة الأساسية" : "Company Base Figures"}
            </span>

            <div className="flex justify-between items-center">
              <label className="text-slate-700">{isAr ? "الإيرادات الأساسية (مليون)" : "Base Revenue (M)"}</label>
              <input
                type="number"
                value={baseRevenue}
                onChange={(e) => setBaseRevenue(Number(e.target.value))}
                className="terminal-input w-24 text-right"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-700">{isAr ? "صافي الديون (مليون)" : "Net Debt (M)"}</label>
              <input
                type="number"
                value={netDebt}
                onChange={(e) => setNetDebt(Number(e.target.value))}
                className="terminal-input w-24 text-right"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-700">{isAr ? "الأسهم القائمة (مليون)" : "Shares Outstanding (M)"}</label>
              <input
                type="number"
                value={sharesOutstanding}
                onChange={(e) => setSharesOutstanding(Number(e.target.value))}
                className="terminal-input w-24 text-right"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-700">{isAr ? "سعر السهم الحالي" : "Current Price (SAR)"}</label>
              <input
                type="number"
                step="0.01"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(Number(e.target.value))}
                className="terminal-input w-24 text-right"
              />
            </div>
          </div>

          {/* Model Controls Section */}
          <div className="space-y-3 font-mono text-xs">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              {isAr ? "افتراضات التقييم" : "Model Drivers"}
            </span>

            <div className="flex justify-between items-center">
              <label className="text-slate-700">{t("rev_growth", language)}</label>
              <input
                type="number"
                value={revGrowth}
                onChange={(e) => setRevGrowth(Number(e.target.value))}
                className="terminal-input w-20 text-right"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-700">{t("ebitda_margin", language)}</label>
              <input
                type="number"
                value={ebitdaMargin}
                onChange={(e) => setEbitdaMargin(Number(e.target.value))}
                className="terminal-input w-20 text-right"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-700">{t("capex_rev", language)}</label>
              <input
                type="number"
                value={capexRev}
                onChange={(e) => setCapexRev(Number(e.target.value))}
                className="terminal-input w-20 text-right"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-700">{t("tax_zakat", language)}</label>
              <input
                type="number"
                value={taxZakat}
                onChange={(e) => setTaxZakat(Number(e.target.value))}
                className="terminal-input w-20 text-right"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-700">{t("cost_equity", language)}</label>
              <input
                type="number"
                value={costEquity}
                onChange={(e) => setCostEquity(Number(e.target.value))}
                className="terminal-input w-20 text-right"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-700">{t("cost_debt", language)}</label>
              <input
                type="number"
                value={costDebt}
                onChange={(e) => setCostDebt(Number(e.target.value))}
                className="terminal-input w-20 text-right"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-700">{t("debt_weight", language)}</label>
              <input
                type="number"
                value={debtWeight}
                onChange={(e) => setDebtWeight(Number(e.target.value))}
                className="terminal-input w-20 text-right"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-700">{t("terminal_growth", language)}</label>
              <input
                type="number"
                value={terminalGrowth}
                onChange={(e) => setTerminalGrowth(Number(e.target.value))}
                className="terminal-input w-20 text-right"
              />
            </div>
          </div>

          <button
            onClick={calculateDCF}
            disabled={isCalculating}
            className="w-full py-3 rounded-lg bg-[var(--emerald)] hover:bg-[#12A189] text-white font-mono font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer border border-transparent"
          >
            {isCalculating ? <RefreshCw size={14} className="animate-spin" /> : <Calculator size={14} />}
            <span>{t("run_dcf", language)}</span>
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: OUTPUT & SENSITIVITY MATRIX (8 COLS) */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        {/* VALUATION SUMMARY BANNER */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-center shadow-sm">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
              Current Market Price
            </span>
            <span className="font-mono text-2xl font-extrabold text-[#171717]">
              SAR {currentPrice}
            </span>
          </div>

          <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-250 text-center shadow-sm">
            <span className="text-[10px] font-mono text-[var(--emerald)] uppercase tracking-wider font-bold block mb-1">
              {t("intrinsic_value", language)}
            </span>
            <span className="font-mono text-3xl font-extrabold text-[var(--emerald)]">
              SAR {dcfResult?.intrinsicValuePerShare || "--"}
            </span>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-center flex flex-col items-center justify-center shadow-sm">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
              {t("upside_downside", language)}
            </span>
            <span className={`flex items-center gap-1 font-mono text-xl font-extrabold px-3 py-0.5 rounded ${
              (dcfResult?.upsidePct || 0) >= 0 
                ? "text-green-700 bg-green-100" 
                : "text-red-700 bg-red-100"
            }`}>
              {(dcfResult?.upsidePct || 0) >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {dcfResult?.upsidePct > 0 ? `+${dcfResult?.upsidePct}%` : `${dcfResult?.upsidePct}%`}
            </span>
          </div>
        </div>

        {/* 5-YEAR PROJECTION TABLE */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-mono text-xs font-bold text-[#171717] uppercase tracking-wider mb-4">
            5-Year Free Cash Flow Projections (SAR Millions)
          </h3>
          <div className="overflow-x-auto">
            <table className="terminal-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  {dcfResult?.fcfProjections?.map((p: any) => (
                    <th key={p.year} className="text-right">{p.year}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-bold">Revenue</td>
                  {dcfResult?.fcfProjections?.map((p: any) => (
                    <td key={p.year} className="text-right text-slate-800">{p.revenue.toLocaleString()}</td>
                  ))}
                </tr>
                <tr>
                  <td>EBITDA</td>
                  {dcfResult?.fcfProjections?.map((p: any) => (
                    <td key={p.year} className="text-right text-slate-700">{p.ebitda.toLocaleString()}</td>
                  ))}
                </tr>
                <tr>
                  <td>EBIT</td>
                  {dcfResult?.fcfProjections?.map((p: any) => (
                    <td key={p.year} className="text-right text-slate-700">{p.ebit.toLocaleString()}</td>
                  ))}
                </tr>
                <tr>
                  <td>NOPAT (ex-Zakat)</td>
                  {dcfResult?.fcfProjections?.map((p: any) => (
                    <td key={p.year} className="text-right text-slate-700">{p.nopat.toLocaleString()}</td>
                  ))}
                </tr>
                <tr>
                  <td>CapEx</td>
                  {dcfResult?.fcfProjections?.map((p: any) => (
                    <td key={p.year} className="text-right text-red-650">-{p.capex.toLocaleString()}</td>
                  ))}
                </tr>
                <tr className="bg-emerald-50/70 font-bold border-t border-emerald-100">
                  <td className="text-[var(--emerald)]">Free Cash Flow (FCF)</td>
                  {dcfResult?.fcfProjections?.map((p: any) => (
                    <td key={p.year} className="text-right text-[var(--emerald)] font-bold">{p.fcf.toLocaleString()}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 5x5 SENSITIVITY MATRIX HEATMAP */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-mono text-xs font-bold text-[#171717] uppercase tracking-wider">
              {t("sensitivity_matrix", language)}
            </h3>
            <span className="text-[10px] font-mono text-[var(--emerald)] font-bold">
              WACC (Rows) vs Terminal Growth (Cols)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full font-mono text-xs text-center border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-2 border border-slate-200 text-slate-500">WACC \ Growth</th>
                  {dcfResult?.sensitivityMatrix?.[0]?.map((col: any, i: number) => (
                    <th key={i} className="p-2 border border-slate-200 text-slate-750">{col.growth}%</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dcfResult?.sensitivityMatrix?.map((row: any, rIdx: number) => (
                  <tr key={rIdx}>
                    <td className="p-2 border border-slate-200 font-bold text-slate-700 bg-slate-50">
                      {row[0]?.wacc}%
                    </td>
                    {row.map((cell: any, cIdx: number) => {
                      const isBull = cell.intrinsicValue > currentPrice;
                      return (
                        <td
                          key={cIdx}
                          className={`p-2 border border-slate-200 font-bold transition-all ${
                            isBull 
                              ? "bg-green-50 text-green-750" 
                              : "bg-red-50 text-red-750"
                          }`}
                        >
                          SAR {cell.intrinsicValue}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
