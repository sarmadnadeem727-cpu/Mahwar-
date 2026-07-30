"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, Calculator, TrendingUp, TrendingDown, RefreshCw, HelpCircle } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import { panelReveal } from "@/lib/motion";

export default function DCFModel() {
  const { activeTicker, language } = useTerminalStore();
  const isAr = language === 'ar';

  // Assumptions State
  const [revGrowth, setRevGrowth] = useState<number>(12);
  const [ebitdaMargin, setEbitdaMargin] = useState<number>(28);
  const [capexRev, setCapexRev] = useState<number>(8);
  const [taxZakat, setTaxZakat] = useState<number>(2.5);
  const [costEquity, setCostEquity] = useState<number>(11);
  const [costDebt, setCostDebt] = useState<number>(5);
  const [debtWeight, setDebtWeight] = useState<number>(40);
  const [terminalGrowth, setTerminalGrowth] = useState<number>(3);

  const [dcfResult, setDcfResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  const calculateDCF = async () => {
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
          currentPrice: 31.45,
          baseRevenue: 45000,
          sharesOutstanding: 242000,
          netDebt: 65000
        }),
      });
      const data = await res.json();
      setDcfResult(data);
    } catch (err) {
      console.error("DCF Error:", err);
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    calculateDCF();
  }, []);

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="grid grid-cols-12 gap-8"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* LEFT COLUMN: ASSUMPTIONS (4 COLS) */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <BarChart3 className="text-[var(--emerald)]" size={22} />
            <div>
              <h2 className="font-garamond text-xl font-bold text-white">
                {t("dcf_assumptions", language)}
              </h2>
              <span className="text-[10px] font-mono text-slate-400">
                Target: {activeTicker}
              </span>
            </div>
          </div>

          {/* Input Controls */}
          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center">
              <label className="text-slate-300">{t("rev_growth", language)}</label>
              <input
                type="number"
                value={revGrowth}
                onChange={(e) => setRevGrowth(Number(e.target.value))}
                className="terminal-input w-20 text-right"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-300">{t("ebitda_margin", language)}</label>
              <input
                type="number"
                value={ebitdaMargin}
                onChange={(e) => setEbitdaMargin(Number(e.target.value))}
                className="terminal-input w-20 text-right"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-300">{t("capex_rev", language)}</label>
              <input
                type="number"
                value={capexRev}
                onChange={(e) => setCapexRev(Number(e.target.value))}
                className="terminal-input w-20 text-right"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-300">{t("tax_zakat", language)}</label>
              <input
                type="number"
                value={taxZakat}
                onChange={(e) => setTaxZakat(Number(e.target.value))}
                className="terminal-input w-20 text-right"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-300">{t("cost_equity", language)}</label>
              <input
                type="number"
                value={costEquity}
                onChange={(e) => setCostEquity(Number(e.target.value))}
                className="terminal-input w-20 text-right"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-300">{t("cost_debt", language)}</label>
              <input
                type="number"
                value={costDebt}
                onChange={(e) => setCostDebt(Number(e.target.value))}
                className="terminal-input w-20 text-right"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-300">{t("debt_weight", language)}</label>
              <input
                type="number"
                value={debtWeight}
                onChange={(e) => setDebtWeight(Number(e.target.value))}
                className="terminal-input w-20 text-right"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-300">{t("terminal_growth", language)}</label>
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
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0E7C69] to-[#12A189] hover:brightness-110 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#0E7C69]/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
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
          <div className="glass-panel p-5 rounded-2xl border border-white/10 text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Current Market Price
            </span>
            <span className="font-mono text-2xl font-extrabold text-white">
              SAR {dcfResult?.currentPrice || 31.45}
            </span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-[var(--emerald)]/40 bg-[var(--emerald)]/10 text-center">
            <span className="text-[10px] font-mono text-[var(--emerald)] uppercase tracking-wider font-bold block mb-1">
              {t("intrinsic_value", language)}
            </span>
            <span className="font-mono text-3xl font-extrabold text-white">
              SAR {dcfResult?.intrinsicValuePerShare || "--"}
            </span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 text-center flex flex-col items-center justify-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              {t("upside_downside", language)}
            </span>
            <span className={`flex items-center gap-1 font-mono text-xl font-extrabold px-3 py-0.5 rounded ${
              (dcfResult?.upsidePct || 0) >= 0 
                ? "text-[var(--pos)] bg-[var(--pos-bg)]" 
                : "text-[var(--neg)] bg-[var(--neg-bg)]"
            }`}>
              {(dcfResult?.upsidePct || 0) >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {dcfResult?.upsidePct > 0 ? `+${dcfResult?.upsidePct}%` : `${dcfResult?.upsidePct}%`}
            </span>
          </div>
        </div>

        {/* 5-YEAR PROJECTION TABLE */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-4">
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
                    <td key={p.year} className="text-right text-slate-200">{p.revenue.toLocaleString()}</td>
                  ))}
                </tr>
                <tr>
                  <td>EBITDA</td>
                  {dcfResult?.fcfProjections?.map((p: any) => (
                    <td key={p.year} className="text-right text-slate-300">{p.ebitda.toLocaleString()}</td>
                  ))}
                </tr>
                <tr>
                  <td>EBIT</td>
                  {dcfResult?.fcfProjections?.map((p: any) => (
                    <td key={p.year} className="text-right text-slate-300">{p.ebit.toLocaleString()}</td>
                  ))}
                </tr>
                <tr>
                  <td>NOPAT (ex-Zakat)</td>
                  {dcfResult?.fcfProjections?.map((p: any) => (
                    <td key={p.year} className="text-right text-slate-300">{p.nopat.toLocaleString()}</td>
                  ))}
                </tr>
                <tr>
                  <td>CapEx</td>
                  {dcfResult?.fcfProjections?.map((p: any) => (
                    <td key={p.year} className="text-right text-red-400">-{p.capex.toLocaleString()}</td>
                  ))}
                </tr>
                <tr className="bg-[var(--emerald)]/10 font-bold">
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
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              {t("sensitivity_matrix", language)}
            </h3>
            <span className="text-[10px] font-mono text-[var(--gold)]">
              WACC (Rows) vs Terminal Growth (Cols)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full font-mono text-xs text-center border-collapse">
              <thead>
                <tr className="bg-white/5">
                  <th className="p-2 border border-white/10 text-slate-400">WACC \ Growth</th>
                  {dcfResult?.sensitivityMatrix?.[0]?.map((col: any, i: number) => (
                    <th key={i} className="p-2 border border-white/10 text-slate-200">{col.growth}%</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dcfResult?.sensitivityMatrix?.map((row: any, rIdx: number) => (
                  <tr key={rIdx}>
                    <td className="p-2 border border-white/10 font-bold text-slate-300 bg-white/5">
                      {row[0]?.wacc}%
                    </td>
                    {row.map((cell: any, cIdx: number) => {
                      const isBull = cell.intrinsicValue > (dcfResult?.currentPrice || 31.45);
                      return (
                        <td
                          key={cIdx}
                          className={`p-2 border border-white/10 font-bold transition-all ${
                            isBull 
                              ? "bg-emerald-950/60 text-emerald-300" 
                              : "bg-red-950/60 text-red-300"
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
