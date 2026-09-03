"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, Calculator, TrendingUp, TrendingDown, RefreshCw, Activity, PieChart, Sliders } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import { panelReveal } from "@/lib/motion";
import NumberCounter from "@/components/ui/NumberCounter";
import ScenarioToggle, { ScenarioCase, ScenarioValues } from "@/components/features/ScenarioToggle";
import FootballFieldChart from "@/components/charts/FootballFieldChart";
import TornadoChart from "@/components/charts/TornadoChart";
import MonteCarloSimulation from "@/components/features/MonteCarloSimulation";

export default function DCFModel() {
  const { language, updateSessionAnalysis } = useTerminalStore();
  const isAr = language === 'ar';

  // Base assumptions
  const [baseRevGrowth, setBaseRevGrowth] = useState<number>(8);
  const [baseEbitdaMargin, setBaseEbitdaMargin] = useState<number>(35);
  const [baseCapexRev, setBaseCapexRev] = useState<number>(10);
  const [taxZakat, setTaxZakat] = useState<number>(2.5);
  const [costEquity, setCostEquity] = useState<number>(9.5);
  const [costDebt, setCostDebt] = useState<number>(4.5);
  const [debtWeight, setDebtWeight] = useState<number>(20);
  const [baseTerminalGrowth, setBaseTerminalGrowth] = useState<number>(2.5);

  // Active scenario overrides
  const [activeScenario, setActiveScenario] = useState<ScenarioCase>("BASE");
  const [scenarioDeltas, setScenarioDeltas] = useState<ScenarioValues>({
    revGrowthDelta: 0,
    ebitdaMarginDelta: 0,
    waccDelta: 0,
    terminalGrowthDelta: 0,
  });

  // Effective drivers (base + scenario delta)
  const revGrowth = baseRevGrowth + scenarioDeltas.revGrowthDelta;
  const ebitdaMargin = baseEbitdaMargin + scenarioDeltas.ebitdaMarginDelta;
  const terminalGrowth = baseTerminalGrowth + scenarioDeltas.terminalGrowthDelta;

  // Editable Base Financial Metrics
  const [baseRevenue, setBaseRevenue] = useState<number>(1200);
  const [netDebt, setNetDebt] = useState<number>(250);
  const [sharesOutstanding, setSharesOutstanding] = useState<number>(100);
  const [currentPrice, setCurrentPrice] = useState<number>(32.50);

  const [dcfResult, setDcfResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"PROJECTIONS" | "FOOTBALL" | "TORNADO" | "MONTE_CARLO">("PROJECTIONS");

  const calculateDCF = async () => {
    if (baseRevenue <= 0 || sharesOutstanding <= 0) return;

    setIsCalculating(true);
    try {
      const res = await fetch("/api/dcf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          revGrowth,
          ebitdaMargin,
          capexRev: baseCapexRev,
          taxZakat,
          costEquity: costEquity + scenarioDeltas.waccDelta,
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

      updateSessionAnalysis("dcf", {
        inputs: {
          revGrowth,
          ebitdaMargin,
          capexRev: baseCapexRev,
          taxZakat,
          costEquity,
          costDebt,
          debtWeight,
          terminalGrowth,
          currentPrice,
          baseRevenue,
          sharesOutstanding,
          netDebt,
          activeScenario
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

  useEffect(() => {
    calculateDCF();
  }, [activeScenario, scenarioDeltas]);

  const handleScenarioChange = (c: ScenarioCase, values?: ScenarioValues) => {
    setActiveScenario(c);
    if (values) {
      setScenarioDeltas(values);
    }
  };

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="grid grid-cols-12 gap-8 text-slate-100 font-mono"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* LEFT COLUMN: ASSUMPTIONS & SCENARIOS (4 COLS) */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        {/* SCENARIO CASE TOGGLE */}
        <ScenarioToggle
          activeCase={activeScenario}
          onSelectCase={handleScenarioChange}
        />

        <div className="bg-[#121721] p-6 rounded-sm border border-[#1E293B] space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
            <div className="flex items-center gap-3">
              <BarChart3 className="text-terminal-emerald" size={22} />
              <div>
                <h2 className="font-mono text-lg font-extrabold text-white uppercase">
                  {t("dcf_assumptions", language)}
                </h2>
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  {isAr ? "مدخلات التقييم اليدوية" : "Manual Valuation Inputs"}
                </span>
              </div>
            </div>
          </div>

          {/* Base Financials Section */}
          <div className="space-y-3 font-mono text-xs border-b border-[#1E293B] pb-4">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              {isAr ? "بيانات الشركة الأساسية" : "Company Base Figures"}
            </span>

            <div className="flex justify-between items-center">
              <label className="text-slate-300">{isAr ? "الإيرادات الأساسية (مليون)" : "Base Revenue (M)"}</label>
              <input
                type="number"
                value={baseRevenue}
                onChange={(e) => setBaseRevenue(Number(e.target.value))}
                className="w-24 px-2 py-1 bg-[#0B0E14] border border-[#1E293B] focus:border-terminal-emerald rounded-sm text-right text-white font-mono text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-300">{isAr ? "صافي الديون (مليون)" : "Net Debt (M)"}</label>
              <input
                type="number"
                value={netDebt}
                onChange={(e) => setNetDebt(Number(e.target.value))}
                className="w-24 px-2 py-1 bg-[#0B0E14] border border-[#1E293B] focus:border-terminal-emerald rounded-sm text-right text-white font-mono text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-300">{isAr ? "الأسهم القائمة (مليون)" : "Shares Outstanding (M)"}</label>
              <input
                type="number"
                value={sharesOutstanding}
                onChange={(e) => setSharesOutstanding(Number(e.target.value))}
                className="w-24 px-2 py-1 bg-[#0B0E14] border border-[#1E293B] focus:border-terminal-emerald rounded-sm text-right text-white font-mono text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-300">{isAr ? "سعر السهم الحالي" : "Current Price (SAR)"}</label>
              <input
                type="number"
                step="0.01"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(Number(e.target.value))}
                className="w-24 px-2 py-1 bg-[#0B0E14] border border-[#1E293B] focus:border-terminal-emerald rounded-sm text-right text-white font-mono text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Model Controls Section */}
          <div className="space-y-3 font-mono text-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              {isAr ? "افتراضات التقييم" : "Model Drivers"}
            </span>

            <div className="flex justify-between items-center">
              <label className="text-slate-300">{t("rev_growth", language)} (%)</label>
              <input
                type="number"
                value={baseRevGrowth}
                onChange={(e) => setBaseRevGrowth(Number(e.target.value))}
                className="w-20 px-2 py-1 bg-[#0B0E14] border border-[#1E293B] focus:border-terminal-emerald rounded-sm text-right text-white font-mono text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-300">{t("ebitda_margin", language)} (%)</label>
              <input
                type="number"
                value={baseEbitdaMargin}
                onChange={(e) => setBaseEbitdaMargin(Number(e.target.value))}
                className="w-20 px-2 py-1 bg-[#0B0E14] border border-[#1E293B] focus:border-terminal-emerald rounded-sm text-right text-white font-mono text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-300">{t("capex_rev", language)} (%)</label>
              <input
                type="number"
                value={baseCapexRev}
                onChange={(e) => setBaseCapexRev(Number(e.target.value))}
                className="w-20 px-2 py-1 bg-[#0B0E14] border border-[#1E293B] focus:border-terminal-emerald rounded-sm text-right text-white font-mono text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-300">{t("cost_equity", language)} (%)</label>
              <input
                type="number"
                value={costEquity}
                onChange={(e) => setCostEquity(Number(e.target.value))}
                className="w-20 px-2 py-1 bg-[#0B0E14] border border-[#1E293B] focus:border-terminal-emerald rounded-sm text-right text-white font-mono text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-300">{t("terminal_growth", language)} (%)</label>
              <input
                type="number"
                value={baseTerminalGrowth}
                onChange={(e) => setBaseTerminalGrowth(Number(e.target.value))}
                className="w-20 px-2 py-1 bg-[#0B0E14] border border-[#1E293B] focus:border-terminal-emerald rounded-sm text-right text-white font-mono text-xs focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={calculateDCF}
            disabled={isCalculating}
            className="w-full py-3 rounded-sm bg-terminal-emerald hover:bg-terminal-emerald-light text-black font-mono font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isCalculating ? <RefreshCw size={14} className="animate-spin" /> : <Calculator size={14} />}
            <span>{t("run_dcf", language)}</span>
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: OUTPUT & VISUALIZATION SUITE (8 COLS) */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        {/* VALUATION SUMMARY BANNER */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#121721] p-5 rounded-sm border border-[#1E293B] text-center shadow-lg">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1 font-bold">
              Current Market Price
            </span>
            <span className="font-mono text-2xl font-extrabold text-white">
              SAR <NumberCounter value={currentPrice} decimals={2} />
            </span>
          </div>

          <div className="bg-terminal-emerald-dim p-5 rounded-sm border border-terminal-border-emerald text-center shadow-lg">
            <span className="text-[10px] font-mono text-terminal-emerald uppercase tracking-wider font-bold block mb-1">
              {t("intrinsic_value", language)} ({activeScenario})
            </span>
            <span className="font-mono text-3xl font-extrabold text-terminal-emerald">
              {dcfResult?.intrinsicValuePerShare ? (
                <>SAR <NumberCounter value={Number(dcfResult.intrinsicValuePerShare)} decimals={2} /></>
              ) : (
                "SAR --"
              )}
            </span>
          </div>

          <div className="bg-[#121721] p-5 rounded-sm border border-[#1E293B] text-center flex flex-col items-center justify-center shadow-lg">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1 font-bold">
              {t("upside_downside", language)}
            </span>
            <span className={`flex items-center gap-1 font-mono text-xl font-extrabold px-3 py-0.5 rounded-sm ${
              (dcfResult?.upsidePct || 0) >= 0 
                ? "text-terminal-emerald bg-terminal-emerald-dim border border-terminal-border-emerald" 
                : "text-rose-400 bg-rose-950/40 border border-rose-800"
            }`}>
              {(dcfResult?.upsidePct || 0) >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {dcfResult?.upsidePct ? (
                <NumberCounter value={Number(dcfResult.upsidePct)} decimals={1} prefix={Number(dcfResult.upsidePct) > 0 ? "+" : ""} suffix="%" />
              ) : (
                "0.0%"
              )}
            </span>
          </div>
        </div>

        {/* VISUALIZATION SUITE NAVIGATION TABS */}
        <div className="flex items-center gap-2 border-b border-[#1E293B] pb-3 overflow-x-auto">
          {[
            { id: "PROJECTIONS", label: isAr ? "توقعات التدفقات" : "5Y Cash Flows" },
            { id: "FOOTBALL", label: isAr ? "ملعب التقييم" : "Football Field" },
            { id: "TORNADO", label: isAr ? "تورنادو الحساسية" : "Tornado Chart" },
            { id: "MONTE_CARLO", label: isAr ? "مونت كارلو (1000)" : "Monte Carlo (1K)" },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-xs font-mono font-bold rounded-sm transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? "bg-terminal-emerald text-black shadow-md"
                    : "bg-[#121721] text-slate-400 border border-[#1E293B] hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS */}
        {activeTab === "PROJECTIONS" && (
          <div className="space-y-6">
            <div className="bg-[#121721] p-6 rounded-sm border border-[#1E293B] shadow-xl">
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-4">
                5-Year Free Cash Flow Projections (SAR Millions)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full font-mono text-xs text-left rtl:text-right border-collapse">
                  <thead>
                    <tr className="bg-[#0B0E14] text-slate-400 border-b border-[#1E293B]">
                      <th className="p-2.5">Metric</th>
                      {dcfResult?.fcfProjections?.map((p: any) => (
                        <th key={p.year} className="p-2.5 text-right">{p.year}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]">
                    <tr>
                      <td className="p-2.5 font-bold text-white">Revenue</td>
                      {dcfResult?.fcfProjections?.map((p: any) => (
                        <td key={p.year} className="p-2.5 text-right text-slate-200">{p.revenue.toLocaleString()}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-2.5 text-slate-300">EBITDA</td>
                      {dcfResult?.fcfProjections?.map((p: any) => (
                        <td key={p.year} className="p-2.5 text-right text-slate-300">{p.ebitda.toLocaleString()}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-2.5 text-slate-300">EBIT</td>
                      {dcfResult?.fcfProjections?.map((p: any) => (
                        <td key={p.year} className="p-2.5 text-right text-slate-300">{p.ebit.toLocaleString()}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-2.5 text-slate-300">NOPAT (ex-Zakat)</td>
                      {dcfResult?.fcfProjections?.map((p: any) => (
                        <td key={p.year} className="p-2.5 text-right text-slate-300">{p.nopat.toLocaleString()}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-2.5 text-slate-400">CapEx</td>
                      {dcfResult?.fcfProjections?.map((p: any) => (
                        <td key={p.year} className="p-2.5 text-right text-rose-400">-{p.capex.toLocaleString()}</td>
                      ))}
                    </tr>
                    <tr className="bg-terminal-emerald-dim font-bold border-t border-terminal-border-emerald">
                      <td className="p-2.5 text-terminal-emerald">Free Cash Flow (FCF)</td>
                      {dcfResult?.fcfProjections?.map((p: any) => (
                        <td key={p.year} className="p-2.5 text-right text-terminal-emerald font-bold">{p.fcf.toLocaleString()}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5x5 SENSITIVITY MATRIX HEATMAP */}
            <div className="bg-[#121721] p-6 rounded-sm border border-[#1E293B] shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  {t("sensitivity_matrix", language)}
                </h3>
                <span className="text-[10px] font-mono text-terminal-emerald font-bold">
                  WACC (Rows) vs Terminal Growth (Cols)
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full font-mono text-xs text-center border-collapse">
                  <thead>
                    <tr className="bg-[#0B0E14]">
                      <th className="p-2 border border-[#1E293B] text-slate-400">WACC \ Growth</th>
                      {dcfResult?.sensitivityMatrix?.[0]?.map((col: any, i: number) => (
                        <th key={i} className="p-2 border border-[#1E293B] text-slate-300">{col.growth}%</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dcfResult?.sensitivityMatrix?.map((row: any, rIdx: number) => (
                      <tr key={rIdx}>
                        <td className="p-2 border border-[#1E293B] font-bold text-slate-200 bg-[#0B0E14]">
                          {row[0]?.wacc}%
                        </td>
                        {row.map((cell: any, cIdx: number) => {
                          const isBull = cell.intrinsicValue > currentPrice;
                          return (
                            <td
                              key={cIdx}
                              className={`p-2 border border-[#1E293B] font-bold transition-all ${
                                isBull 
                                  ? "bg-terminal-emerald-dim text-terminal-emerald" 
                                  : "bg-rose-950/40 text-rose-300"
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
        )}

        {activeTab === "FOOTBALL" && (
          <FootballFieldChart
            currentPrice={currentPrice}
            dcfBasePx={dcfResult?.intrinsicValuePerShare ? Number(dcfResult.intrinsicValuePerShare) : 38.45}
            dcfBearPx={dcfResult?.intrinsicValuePerShare ? Number((Number(dcfResult.intrinsicValuePerShare) * 0.85).toFixed(2)) : 32.10}
            dcfBullPx={dcfResult?.intrinsicValuePerShare ? Number((Number(dcfResult.intrinsicValuePerShare) * 1.18).toFixed(2)) : 45.80}
          />
        )}

        {activeTab === "TORNADO" && (
          <TornadoChart
            baseSharePrice={dcfResult?.intrinsicValuePerShare ? Number(dcfResult.intrinsicValuePerShare) : 38.45}
          />
        )}

        {activeTab === "MONTE_CARLO" && (
          <MonteCarloSimulation
            baseSharePrice={dcfResult?.intrinsicValuePerShare ? Number(dcfResult.intrinsicValuePerShare) : 38.45}
          />
        )}
      </div>
    </motion.div>
  );
}

