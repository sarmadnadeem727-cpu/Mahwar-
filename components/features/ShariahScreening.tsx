"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, XCircle, RefreshCw, BookOpen } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import { panelReveal } from "@/lib/motion";

export default function ShariahScreening() {
  const { activeTicker, setTicker, language } = useTerminalStore();
  const isAr = language === 'ar';

  const [tickerInput, setTickerInput] = useState(activeTicker);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const runScreening = async (symbol: string = tickerInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/shariah", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: symbol }),
      });
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("Shariah screening error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runScreening(activeTicker);
  }, [activeTicker]);

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* HEADER & TICKER CONTROLS */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-[var(--emerald)] shrink-0" size={28} />
          <div>
            <h2 className="font-garamond text-2xl font-bold text-white">
              {t("panel_shariah", language)}
            </h2>
            <span className="text-xs font-mono text-[var(--gold)]">
              {t("aaoifi_standard", language)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={tickerInput}
            onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
            placeholder="e.g. 2222.SR"
            className="terminal-input uppercase w-32"
          />
          <button
            onClick={() => {
              setTicker(tickerInput);
              runScreening(tickerInput);
            }}
            disabled={loading}
            className="px-4 py-2 bg-[var(--emerald)] hover:bg-emerald-600 text-white font-mono text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
            <span>Screen Stock</span>
          </button>
        </div>
      </div>

      {/* OVERALL VERDICT BANNER */}
      {data && (
        <div
          className={`p-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 transition-all ${
            data.verdict === "COMPLIANT"
              ? "bg-[var(--pos-bg)] border-[var(--pos)] text-[var(--pos)]"
              : data.verdict === "NON_COMPLIANT"
              ? "bg-[var(--neg-bg)] border-[var(--neg)] text-[var(--neg)]"
              : "bg-amber-500/10 border-amber-500 text-amber-400"
          }`}
        >
          <div className="flex items-center gap-4">
            {data.verdict === "COMPLIANT" ? (
              <CheckCircle2 size={36} className="shrink-0" />
            ) : data.verdict === "NON_COMPLIANT" ? (
              <XCircle size={36} className="shrink-0" />
            ) : (
              <AlertTriangle size={36} className="shrink-0" />
            )}

            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider block opacity-80">
                Overall Shariah Verdict ({data.ticker})
              </span>
              <h3 className="font-garamond text-3xl font-extrabold tracking-wide">
                {data.verdict === "COMPLIANT"
                  ? t("shariah_verdict_compliant", language)
                  : data.verdict === "NON_COMPLIANT"
                  ? t("shariah_verdict_non_compliant", language)
                  : t("shariah_verdict_under_review", language)}
              </h3>
            </div>
          </div>

          <div className="font-mono text-xs text-right bg-black/40 px-4 py-2 rounded-xl border border-current">
            <span className="block opacity-80">{t("purification_amount", language)}</span>
            <span className="text-lg font-bold">SAR {data.purificationAmountSAR} / share</span>
          </div>
        </div>
      )}

      {/* RATIOS & BUSINESS ACTIVITY GRID */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* FINANCIAL RATIOS */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
              <BookOpen size={16} className="text-[var(--gold)]" />
              <span>AAOIFI Financial Ratio Thresholds</span>
            </h3>

            {/* Debt Ratio */}
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-300">{t("debt_assets_ratio", language)}</span>
                <span className="font-bold text-white">{data.ratios.debtToAssets.value}% / 33%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden p-0.5 border border-white/10">
                <div
                  className={`h-full rounded-full ${data.ratios.debtToAssets.pass ? "bg-[var(--pos)]" : "bg-[var(--neg)]"}`}
                  style={{ width: `${Math.min(100, (data.ratios.debtToAssets.value / 33) * 100)}%` }}
                />
              </div>
              <span className={`text-[10px] font-bold ${data.ratios.debtToAssets.pass ? "text-[var(--pos)]" : "text-[var(--neg)]"}`}>
                {data.ratios.debtToAssets.pass ? "✓ PASS (Compliant Debt Threshold)" : "✗ FAIL (Exceeds 33% Debt Limit)"}
              </span>
            </div>

            {/* Interest Income Ratio */}
            <div className="space-y-1.5 font-mono text-xs pt-2 border-t border-white/5">
              <div className="flex justify-between">
                <span className="text-slate-300">{t("interest_income_ratio", language)}</span>
                <span className="font-bold text-white">{data.ratios.interestIncomeRatio.value}% / 5%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden p-0.5 border border-white/10">
                <div
                  className={`h-full rounded-full ${data.ratios.interestIncomeRatio.pass ? "bg-[var(--pos)]" : "bg-[var(--neg)]"}`}
                  style={{ width: `${Math.min(100, (data.ratios.interestIncomeRatio.value / 5) * 100)}%` }}
                />
              </div>
              <span className={`text-[10px] font-bold ${data.ratios.interestIncomeRatio.pass ? "text-[var(--pos)]" : "text-[var(--neg)]"}`}>
                {data.ratios.interestIncomeRatio.pass ? "✓ PASS (Non-Permissible Income <= 5%)" : "✗ FAIL (Exceeds 5% Limit)"}
              </span>
            </div>

            {/* Receivables Ratio */}
            <div className="space-y-1.5 font-mono text-xs pt-2 border-t border-white/5">
              <div className="flex justify-between">
                <span className="text-slate-300">{t("receivables_ratio", language)}</span>
                <span className="font-bold text-white">{data.ratios.receivablesRatio.value}% / 49%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden p-0.5 border border-white/10">
                <div
                  className={`h-full rounded-full ${data.ratios.receivablesRatio.pass ? "bg-[var(--pos)]" : "bg-[var(--neg)]"}`}
                  style={{ width: `${Math.min(100, (data.ratios.receivablesRatio.value / 49) * 100)}%` }}
                />
              </div>
              <span className={`text-[10px] font-bold ${data.ratios.receivablesRatio.pass ? "text-[var(--pos)]" : "text-[var(--neg)]"}`}>
                {data.ratios.receivablesRatio.pass ? "✓ PASS (Receivables <= 49%)" : "✗ FAIL (Exceeds 49% Limit)"}
              </span>
            </div>
          </div>

          {/* BUSINESS ACTIVITY CHECK */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider border-b border-white/10 pb-3">
              Prohibited Business Sector Screen
            </h3>

            <div className="space-y-3 font-mono text-xs">
              {data.businessActivity?.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-slate-200">{item.name}</span>
                  <span className="flex items-center gap-1 font-bold text-[var(--pos)]">
                    <CheckCircle2 size={14} />
                    CLEAN
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
