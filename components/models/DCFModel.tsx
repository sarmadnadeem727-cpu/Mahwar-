"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, Calculator, TrendingUp, TrendingDown, RefreshCw, Activity, PieChart, Sliders } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import { panelReveal } from "@/lib/motion";
import NumberCounter from "@/components/ui/NumberCounter";
import ScenarioToggle, { ScenarioCase, ScenarioDefinition } from "@/components/features/ScenarioToggle";
import FootballFieldChart from "@/components/charts/FootballFieldChart";
import TornadoChart from "@/components/charts/TornadoChart";
import MonteCarloSimulation from "@/components/features/MonteCarloSimulation";

export interface DcfScenarioValues {
  revGrowthDelta: number;
  ebitdaMarginDelta: number;
  waccDelta: number;
  terminalGrowthDelta: number;
}

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

  const [activeScenario, setActiveScenario] = useState<ScenarioCase>("BASE");
  const [scenarioDeltas, setScenarioDeltas] = useState<DcfScenarioValues>({
    revGrowthDelta: 0,
    ebitdaMarginDelta: 0,
    waccDelta: 0,
    terminalGrowthDelta: 0,
  });

  const dcfScenarios: ScenarioDefinition<DcfScenarioValues>[] = [
    {
      id: "BASE",
      label: "Base Case",
      labelAr: "الحالة الأساسية",
      desc: "Consensus Base Model",
      descAr: "افتراضات الإدارة والإجماع",
      iconType: "base",
      values: { revGrowthDelta: 0, ebitdaMarginDelta: 0, waccDelta: 0, terminalGrowthDelta: 0 },
    },
    {
      id: "BULL",
      label: "Bull Case",
      labelAr: "الحالة التفاؤلية",
      desc: "+3% Rev, +3% Margin, -0.5% WACC",
      descAr: "نمو أعلى + خصم أقل",
      iconType: "bull",
      values: { revGrowthDelta: 3.0, ebitdaMarginDelta: 3.0, waccDelta: -0.5, terminalGrowthDelta: 0.5 },
    },
    {
      id: "BEAR",
      label: "Bear Case",
      labelAr: "الحالة التحفظية",
      desc: "-3% Rev, -3% Margin, +1.0% WACC",
      descAr: "نمو أقل + خصم أعلى",
      iconType: "bear",
      values: { revGrowthDelta: -3.0, ebitdaMarginDelta: -3.0, waccDelta: 1.0, terminalGrowthDelta: -0.5 },
    },
    {
      id: "CUSTOM",
      label: "Custom Case",
      labelAr: "سيناريو مخصص",
      desc: "User Assumption Overrides",
      descAr: "تعديل المدخلات يدوياً",
      iconType: "custom",
      values: { revGrowthDelta: 0, ebitdaMarginDelta: 0, waccDelta: 0, terminalGrowthDelta: 0 },
    },
  ];

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

  const handleScenarioChange = (c: ScenarioCase, values?: DcfScenarioValues) => {
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
        <ScenarioToggle<DcfScenarioValues>
          activeCase={activeScenario}
          scenarios={dcfScenarios}
          onSelectCase={handleScenarioChange}
        />

        <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-3">
              <BarChart3 className="text-emerald" size={22} />
              <div>
                <h2 className="font-mono text-lg font-extrabold text-slate-900 uppercase">
                  {t("dcf_assumptions", language)}
                </h2>
                <span className="text-[10px] font-mono text-slate-500 uppercase">
                  {isAr ? "مدخلات التقييم اليدوية" : "Manual Valuation Inputs"}
                </span>
              </div>
            </div>
          </div>

          {/* Base Financials Section */}
          <div className="space-y-3 font-mono text-xs border-b border-[#E2E8F0] pb-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              {isAr ? "بيانات الشركة الأساسية" : "Company Base Figures"}
            </span>

            <div className="flex justify-between items-center">
              <label className="text-slate-700">{isAr ? "الإيرادات الأساسية (مليون)" : "Base Revenue (M)"}</label>
              <input
                type="number"
                value={baseRevenue}
                onChange={(e) => setBaseRevenue(Number(e.target.value))}
                className="w-24 px-2 py-1 bg-slate-50 border border-[#E2E8F0] focus:border-emerald rounded-md text-right text-slate-900 font-mono text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-700">{isAr ? "صافي الديون (مليون)" : "Net Debt (M)"}</label>
              <input
                type="number"
                value={netDebt}
                onChange={(e) => setNetDebt(Number(e.target.value))}
                className="w-24 px-2 py-1 bg-slate-50 border border-[#E2E8F0] focus:border-emerald rounded-md text-right text-slate-900 font-mono text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-700">{isAr ? "الأسهم القائمة (مليون)" : "Shares Outstanding (M)"}</label>
              <input
                type="number"
                value={sharesOutstanding}
                onChange={(e) => setSharesOutstanding(Number(e.target.value))}
                className="w-24 px-2 py-1 bg-slate-50 border border-[#E2E8F0] focus:border-emerald rounded-md text-right text-slate-900 font-mono text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-700">{isAr ? "سعر السهم الحالي" : "Current Price (SAR)"}</label>
              <input
                type="number"
                step="0.01"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(Number(e.target.value))}
                className="w-24 px-2 py-1 bg-slate-50 border border-[#E2E8F0] focus:border-emerald rounded-md text-right text-slate-900 font-mono text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Model Controls Section */}
          <div className="space-y-3 font-mono text-xs">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              {isAr ? "افتراضات التقييم" : "Model Drivers"}
            </span>

            <div className="flex justify-between items-center">
              <label className="text-slate-700">{t("rev_growth", language)} (%)</label>
              <input
                type="number"
                value={baseRevGrowth}
                onChange={(e) => setBaseRevGrowth(Number(e.target.value))}
                className="w-20 px-2 py-1 bg-slate-50 border border-[#E2E8F0] focus:border-emerald rounded-md text-right text-slate-900 font-mono text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-700">{t("ebitda_margin", language)} (%)</label>
              <input
                type="number"
                value={baseEbitdaMargin}
                onChange={(e) => setBaseEbitdaMargin(Number(e.target.value))}
                className="w-20 px-2 py-1 bg-slate-50 border border-[#E2E8F0] focus:border-emerald rounded-md text-right text-slate-900 font-mono text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-700">{t("capex_rev", language)} (%)</label>
              <input
                type="number"
                value={baseCapexRev}
                onChange={(e) => setBaseCapexRev(Number(e.target.value))}
                className="w-20 px-2 py-1 bg-slate-50 border border-[#E2E8F0] focus:border-emerald rounded-md text-right text-slate-900 font-mono text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-700">{t("cost_equity", language)} (%)</label>
              <input
                type="number"
                value={costEquity}
                onChange={(e) => setCostEquity(Number(e.target.value))}
                className="w-20 px-2 py-1 bg-slate-50 border border-[#E2E8F0] focus:border-emerald rounded-md text-right text-slate-900 font-mono text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-700">{t("terminal_growth", language)} (%)</label>
              <input
                type="number"
                value={baseTerminalGrowth}
                onChange={(e) => setBaseTerminalGrowth(Number(e.target.value))}
                className="w-20 px-2 py-1 bg-slate-50 border border-[#E2E8F0] focus:border-emerald rounded-md text-right text-slate-900 font-mono text-xs focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={calculateDCF}
            disabled={isCalculating}
            className="w-full py-3 rounded-md bg-emerald hover:bg-emerald-light text-white font-mono font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
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
          <div className="bg-white p-5 rounded-lg border border-[#E2E8F0] text-center shadow-xs">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1 font-bold">
              Current Market Price
            </span>
            <span className="font-mono text-2xl font-extrabold text-slate-900">
              SAR <NumberCounter value={currentPrice} decimals={2} />
            </span>
          </div>

          <div className="bg-emerald-dim p-5 rounded-lg border border-emerald-border text-center shadow-xs">
            <span className="text-[10px] font-mono text-emerald uppercase tracking-wider font-bold block mb-1">
              {t("intrinsic_value", language)} ({activeScenario})
            </span>
            <span className="font-mono text-3xl font-extrabold text-emerald">
              {dcfResult?.intrinsicValuePerShare ? (
                <>SAR <NumberCounter value={Number(dcfResult.intrinsicValuePerShare)} decimals={2} /></>
              ) : (
                "SAR --"
              )}
            </span>
          </div>

          <div className="bg-white p-5 rounded-lg border border-[#E2E8F0] text-center flex flex-col items-center justify-center shadow-xs">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1 font-bold">
              {t("upside_downside", language)}
            </span>
            <span className={`flex items-center gap-1 font-mono text-xl font-extrabold px-3 py-0.5 rounded-md ${
              (dcfResult?.upsidePct || 0) >= 0 
                ? "text-emerald bg-emerald-dim border border-emerald-border" 
                : "text-rose-600 bg-rose-50 border border-rose-200"
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
        <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3 overflow-x-auto">
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
                className={`px-4 py-2 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? "bg-emerald text-white shadow-xs font-bold"
                    : "bg-white text-slate-600 border border-[#E2E8F0] hover:text-slate-900"
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
            <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-xs">
              <h3 className="font-mono text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                5-Year Free Cash Flow Projections (SAR Millions)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full font-mono text-xs text-left rtl:text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-[#E2E8F0]">
                      <th className="p-2.5">Metric</th>
                      {dcfResult?.fcfProjections?.map((p: any) => (
                        <th key={p.year} className="p-2.5 text-right">{p.year}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900">Revenue</td>
                      {dcfResult?.fcfProjections?.map((p: any) => (
                        <td key={p.year} className="p-2.5 text-right text-slate-700">{p.revenue.toLocaleString()}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-2.5 text-slate-700">EBITDA</td>
                      {dcfResult?.fcfProjections?.map((p: any) => (
                        <td key={p.year} className="p-2.5 text-right text-slate-700">{p.ebitda.toLocaleString()}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-2.5 text-slate-700">EBIT</td>
                      {dcfResult?.fcfProjections?.map((p: any) => (
                        <td key={p.year} className="p-2.5 text-right text-slate-700">{p.ebit.toLocaleString()}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-2.5 text-slate-700">NOPAT (ex-Zakat)</td>
                      {dcfResult?.fcfProjections?.map((p: any) => (
                        <td key={p.year} className="p-2.5 text-right text-slate-700">{p.nopat.toLocaleString()}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-2.5 text-slate-600">CapEx</td>
                      {dcfResult?.fcfProjections?.map((p: any) => (
                        <td key={p.year} className="p-2.5 text-right text-rose-600">-{p.capex.toLocaleString()}</td>
                      ))}
                    </tr>
                    <tr className="bg-emerald-dim font-bold border-t border-emerald-border">
                      <td className="p-2.5 text-emerald">Free Cash Flow (FCF)</td>
                      {dcfResult?.fcfProjections?.map((p: any) => (
                        <td key={p.year} className="p-2.5 text-right text-emerald font-bold">{p.fcf.toLocaleString()}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5x5 SENSITIVITY MATRIX HEATMAP */}
            <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-mono text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {t("sensitivity_matrix", language)}
                </h3>
                <span className="text-[10px] font-mono text-emerald font-bold">
                  WACC (Rows) vs Terminal Growth (Cols)
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full font-mono text-xs text-center border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="p-2 border border-[#E2E8F0] text-slate-600">WACC \ Growth</th>
                      {dcfResult?.sensitivityMatrix?.[0]?.map((col: any, i: number) => (
                        <th key={i} className="p-2 border border-[#E2E8F0] text-slate-700">{col.growth}%</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dcfResult?.sensitivityMatrix?.map((row: any, rIdx: number) => (
                      <tr key={rIdx}>
                        <td className="p-2 border border-[#E2E8F0] font-bold text-slate-800 bg-slate-50">
                          {row[0]?.wacc}%
                        </td>
                        {row.map((cell: any, cIdx: number) => {
                          const isBull = cell.intrinsicValue > currentPrice;
                          return (
                            <td
                              key={cIdx}
                              className={`p-2 border border-[#E2E8F0] font-bold transition-all ${
                                isBull 
                                  ? "bg-emerald-dim text-emerald" 
                                  : "bg-rose-50 text-rose-700"
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

