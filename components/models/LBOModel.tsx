"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Layers } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import { panelReveal } from "@/lib/motion";
import NumberCounter from "@/components/ui/NumberCounter";
import ScenarioToggle, { ScenarioCase, ScenarioDefinition } from "@/components/features/ScenarioToggle";
import LboWaterfallChart from "@/components/charts/LboWaterfallChart";

export interface LboScenarioValues {
  revGrowthDelta: number;
  ebitdaMarginDelta: number;
  waccDelta: number;
  terminalGrowthDelta: number;
}

export default function LBOModel() {
  const { language, updateSessionAnalysis } = useTerminalStore();
  const isAr = language === 'ar';

  const [basePurchasePrice, setBasePurchasePrice] = useState<number>(850);
  const [ebitdaMultiple, setEbitdaMultiple] = useState<number>(9.5);
  const [mgmtEquityPct, setMgmtEquityPct] = useState<number>(10);
  const [seniorDebt, setSeniorDebt] = useState<number>(450);
  const [seniorRate, setSeniorRate] = useState<number>(5.5);
  const [mezzDebt, setMezzDebt] = useState<number>(100);
  const [mezzRate, setMezzRate] = useState<number>(8.5);
  const [pikNotes, setPikNotes] = useState<number>(50);
  const [pikRate, setPikRate] = useState<number>(10.0);
  const [holdPeriod, setHoldPeriod] = useState<number>(5);
  const [baseExitMultiple, setBaseExitMultiple] = useState<number>(10.0);

  // Active scenario overrides
  const [activeScenario, setActiveScenario] = useState<ScenarioCase>("BASE");
  const [scenarioDeltas, setScenarioDeltas] = useState<LboScenarioValues>({
    revGrowthDelta: 0,
    ebitdaMarginDelta: 0,
    waccDelta: 0,
    terminalGrowthDelta: 0,
  });

  const lboScenarios: ScenarioDefinition<LboScenarioValues>[] = [
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

  const exitMultiple = Math.max(4.0, baseExitMultiple + (scenarioDeltas.revGrowthDelta * 0.5));
  const purchasePrice = basePurchasePrice;

  // Computations
  const totalDebt = seniorDebt + mezzDebt + pikNotes;
  const sponsorEquity = purchasePrice - totalDebt;
  const entryEBITDA = ebitdaMultiple > 0 ? purchasePrice / ebitdaMultiple : 0;

  // Exit valuation at Year `holdPeriod`
  const ebitdaCagr = 0.08 + (scenarioDeltas.revGrowthDelta * 0.01);
  const exitEBITDA = entryEBITDA * Math.pow(1 + ebitdaCagr, holdPeriod);
  const exitEV = exitEBITDA * exitMultiple;
  
  // Amortized debt remaining
  const remainingSenior = Math.max(0, seniorDebt - (seniorDebt * 0.15 * holdPeriod));
  const remainingMezz = mezzDebt;
  const remainingPik = pikNotes * Math.pow(1 + pikRate / 100, holdPeriod);
  const totalRemainingDebt = remainingSenior + remainingMezz + remainingPik;

  const totalExitEquity = exitEV - totalRemainingDebt;
  const mgmtProceeds = totalExitEquity * (mgmtEquityPct / 100);
  const sponsorProceeds = totalExitEquity - mgmtProceeds;

  const moic = sponsorEquity > 0 ? sponsorProceeds / sponsorEquity : 0;
  const irr = (moic > 0 && holdPeriod > 0) ? (Math.pow(moic, 1 / holdPeriod) - 1) * 100 : 0;

  // Hold Period Trajectory Line Data (1 - 7 years)
  const holdYearsData = [1, 2, 3, 4, 5, 6, 7].map((yr) => {
    const exEBITDA = entryEBITDA * Math.pow(1 + ebitdaCagr, yr);
    const exEV = exEBITDA * exitMultiple;
    const remDebt = Math.max(0, seniorDebt - (seniorDebt * 0.15 * yr)) + mezzDebt + (pikNotes * Math.pow(1 + pikRate / 100, yr));
    const eq = Math.max(0, exEV - remDebt) * (1 - mgmtEquityPct / 100);
    const m = sponsorEquity > 0 ? eq / sponsorEquity : 0;
    const i = (m > 0 && yr > 0) ? (Math.pow(m, 1 / yr) - 1) * 100 : 0;
    return {
      year: yr,
      irr: Number(isFinite(i) ? i.toFixed(1) : 0),
      moic: Number(isFinite(m) ? m.toFixed(2) : 0)
    };
  });

  // Update session store
  useEffect(() => {
    updateSessionAnalysis("lbo", {
      inputs: {
        purchasePrice,
        ebitdaMultiple,
        mgmtEquityPct,
        seniorDebt,
        seniorRate,
        mezzDebt,
        mezzRate,
        pikNotes,
        pikRate,
        holdPeriod,
        exitMultiple
      },
      outputs: {
        totalDebt,
        sponsorEquity,
        exitEV,
        moic: Number(moic.toFixed(2)),
        irr: Number(irr.toFixed(1)),
        sponsorProceeds: Math.round(sponsorProceeds),
        mgmtProceeds: Math.round(mgmtProceeds),
        totalRemainingDebt: Math.round(totalRemainingDebt),
        holdYearsData
      },
      computedAt: new Date().toISOString()
    });
  }, [purchasePrice, ebitdaMultiple, seniorDebt, mezzDebt, pikNotes, holdPeriod, exitMultiple, activeScenario]);

  const handleScenarioChange = (c: ScenarioCase, values?: LboScenarioValues) => {
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
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-slate-100 font-mono"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* LEFT COLUMN: ASSUMPTIONS & SCENARIOS (4 COLS) */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        <ScenarioToggle<LboScenarioValues>
          activeCase={activeScenario}
          scenarios={lboScenarios}
          onSelectCase={handleScenarioChange}
        />

        <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-3">
              <Layers className="text-emerald" size={22} />
              <div>
                <h2 className="font-mono text-lg font-extrabold text-slate-900 uppercase">
                  {t("lbo_inputs", language)}
                </h2>
                <span className="text-[10px] font-mono text-slate-500 uppercase">
                  {isAr ? "معايير الاستحواذ والهيكل المالي" : "Buyout & Debt Parameters"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center">
              <label className="text-slate-700">{t("entry_price", language)}</label>
              <input
                type="number"
                value={basePurchasePrice}
                onChange={(e) => setBasePurchasePrice(Number(e.target.value))}
                className="w-24 px-2 py-1 bg-slate-50 border border-[#E2E8F0] focus:border-emerald rounded-md text-right text-slate-900 font-mono text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-700">{t("entry_ebitda_mult", language)}</label>
              <input
                type="number"
                step="0.1"
                value={ebitdaMultiple}
                onChange={(e) => setEbitdaMultiple(Number(e.target.value))}
                className="w-24 px-2 py-1 bg-slate-50 border border-[#E2E8F0] focus:border-emerald rounded-md text-right text-slate-900 font-mono text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-700">{t("mgmt_equity_pct", language)}</label>
              <input
                type="number"
                value={mgmtEquityPct}
                onChange={(e) => setMgmtEquityPct(Number(e.target.value))}
                className="w-24 px-2 py-1 bg-slate-50 border border-[#E2E8F0] focus:border-emerald rounded-md text-right text-slate-900 font-mono text-xs focus:outline-none"
              />
            </div>

            <hr className="border-[#E2E8F0]" />

            <div className="flex justify-between items-center">
              <label className="text-slate-700">{t("senior_debt", language)}</label>
              <input
                type="number"
                value={seniorDebt}
                onChange={(e) => setSeniorDebt(Number(e.target.value))}
                className="w-24 px-2 py-1 bg-slate-50 border border-[#E2E8F0] focus:border-emerald rounded-md text-right text-slate-900 font-mono text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-700">{t("mezz_debt", language)}</label>
              <input
                type="number"
                value={mezzDebt}
                onChange={(e) => setMezzDebt(Number(e.target.value))}
                className="w-24 px-2 py-1 bg-slate-50 border border-[#E2E8F0] focus:border-emerald rounded-md text-right text-slate-900 font-mono text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-700">{t("pik_notes", language)}</label>
              <input
                type="number"
                value={pikNotes}
                onChange={(e) => setPikNotes(Number(e.target.value))}
                className="w-24 px-2 py-1 bg-slate-50 border border-[#E2E8F0] focus:border-emerald rounded-md text-right text-slate-900 font-mono text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-700">{t("exit_multiple", language)} (x)</label>
              <input
                type="number"
                step="0.5"
                value={baseExitMultiple}
                onChange={(e) => setBaseExitMultiple(Number(e.target.value))}
                className="w-24 px-2 py-1 bg-slate-50 border border-[#E2E8F0] focus:border-emerald rounded-md text-right text-slate-900 font-mono text-xs focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: RETURNS SUMMARY & CHARTS (8 COLS) */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-lg border border-[#E2E8F0] text-center shadow-xs">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1 font-bold">
              Sponsor Equity Required
            </span>
            <span className="font-mono text-xl font-extrabold text-slate-900">
              SAR <NumberCounter value={sponsorEquity} decimals={0} />M
            </span>
          </div>

          <div className="bg-emerald-dim p-5 rounded-lg border border-emerald-border text-center shadow-xs">
            <span className="text-[10px] font-mono text-emerald uppercase tracking-wider font-bold block mb-1">
              {t("moic", language)} ({activeScenario})
            </span>
            <span className="font-mono text-2xl font-extrabold text-emerald">
              <NumberCounter value={moic} decimals={2} suffix="x" />
            </span>
          </div>

          <div className="bg-white p-5 rounded-lg border border-[#E2E8F0] text-center shadow-xs">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1 font-bold">
              Projected IRR
            </span>
            <span className="font-mono text-2xl font-extrabold text-emerald">
              <NumberCounter value={irr} decimals={1} suffix="%" />
            </span>
          </div>
        </div>

        {/* LBO WATERFALL & HOLD PERIOD CHARTS */}
        <LboWaterfallChart
          entryEv={purchasePrice}
          transactionFees={Math.round(purchasePrice * 0.03)}
          sponsorEquity={sponsorEquity}
          seniorDebt={seniorDebt}
          mezzDebt={mezzDebt}
          holdYearsData={holdYearsData}
        />
      </div>
    </motion.div>
  );
}
