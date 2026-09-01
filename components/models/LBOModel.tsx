"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Layers, PieChart, TrendingUp } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart as RePieChart, Pie } from "recharts";
import { useTerminalStore } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import { panelReveal } from "@/lib/motion";

export default function LBOModel() {
  const { language, updateSessionAnalysis } = useTerminalStore();
  const isAr = language === 'ar';

  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [ebitdaMultiple, setEbitdaMultiple] = useState<number>(0);
  const [mgmtEquityPct, setMgmtEquityPct] = useState<number>(0);
  const [seniorDebt, setSeniorDebt] = useState<number>(0);
  const [seniorRate, setSeniorRate] = useState<number>(0);
  const [mezzDebt, setMezzDebt] = useState<number>(0);
  const [mezzRate, setMezzRate] = useState<number>(0);
  const [pikNotes, setPikNotes] = useState<number>(0);
  const [pikRate, setPikRate] = useState<number>(0);
  const [holdPeriod, setHoldPeriod] = useState<number>(5);
  const [exitMultiple, setExitMultiple] = useState<number>(0);

  // Computations
  const totalDebt = seniorDebt + mezzDebt + pikNotes;
  const sponsorEquity = purchasePrice - totalDebt;
  const entryEBITDA = ebitdaMultiple > 0 ? purchasePrice / ebitdaMultiple : 0;

  // Exit valuation at Year `holdPeriod`
  const exitEBITDA = entryEBITDA * Math.pow(1.08, holdPeriod); // 8% EBITDA CAGR
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

  // IRR by Hold Period Bar Chart Data
  const irrData = [3, 4, 5, 6, 7].map((yr) => {
    const exEBITDA = entryEBITDA * Math.pow(1.08, yr);
    const exEV = exEBITDA * exitMultiple;
    const remDebt = Math.max(0, seniorDebt - (seniorDebt * 0.15 * yr)) + mezzDebt + (pikNotes * Math.pow(1 + pikRate / 100, yr));
    const eq = Math.max(0, exEV - remDebt) * (1 - mgmtEquityPct / 100);
    const m = sponsorEquity > 0 ? eq / sponsorEquity : 0;
    const i = (m > 0 && yr > 0) ? (Math.pow(m, 1 / yr) - 1) * 100 : 0;
    return {
      year: `${yr}Y`,
      irr: Number(isFinite(i) ? i.toFixed(1) : 0),
      moic: Number(isFinite(m) ? m.toFixed(2) : 0)
    };
  });

  const waterfallData = [
    { name: isAr ? "عائدات المستثمر الرئيسي" : "Sponsor Equity Proceeds", value: Math.round(sponsorProceeds), fill: "#0E7C69" },
    { name: isAr ? "حصة الإدارة التنفيذية" : "Management Equity Share", value: Math.round(mgmtProceeds), fill: "#888888" },
    { name: isAr ? "الديون المتبقية المسددة" : "Remaining Debt Repaid", value: Math.round(totalRemainingDebt), fill: "#E53E3E" }
  ];

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
        irrData,
        waterfallData
      },
      computedAt: new Date().toISOString()
    });
  }, [
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
  ]);

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="grid grid-cols-12 gap-8 text-[#171717]"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* LEFT COLUMN: INPUT PARAMETERS (4 COLS) */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        <div className="glass-panel p-6 rounded-xl border border-slate-200 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <Layers className="text-[var(--emerald)]" size={22} />
              <div>
                <h2 className="font-serif text-xl font-bold text-[#171717]">
                  {t("lbo_inputs", language)}
                </h2>
                <span className="text-[10px] font-mono text-slate-500">
                  {isAr ? "افتراضات صفقة الاستحواذ" : "Manual Deal Builder"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center">
              <label className="text-slate-700">{t("entry_price", language)}</label>
              <input
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Number(e.target.value))}
                className="terminal-input w-24 text-right"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-700">{t("entry_ebitda_mult", language)}</label>
              <input
                type="number"
                step="0.5"
                value={ebitdaMultiple}
                onChange={(e) => setEbitdaMultiple(Number(e.target.value))}
                className="terminal-input w-24 text-right"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-700">{t("mgmt_equity_pct", language)}</label>
              <input
                type="number"
                value={mgmtEquityPct}
                onChange={(e) => setMgmtEquityPct(Number(e.target.value))}
                className="terminal-input w-24 text-right"
              />
            </div>

            <hr className="border-slate-200" />

            <div className="flex justify-between items-center">
              <label className="text-slate-700">{t("senior_debt", language)}</label>
              <input
                type="number"
                value={seniorDebt}
                onChange={(e) => setSeniorDebt(Number(e.target.value))}
                className="terminal-input w-24 text-right"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-700">{t("mezz_debt", language)}</label>
              <input
                type="number"
                value={mezzDebt}
                onChange={(e) => setMezzDebt(Number(e.target.value))}
                className="terminal-input w-24 text-right"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-700">{t("pik_notes", language)}</label>
              <input
                type="number"
                value={pikNotes}
                onChange={(e) => setPikNotes(Number(e.target.value))}
                className="terminal-input w-24 text-right"
              />
            </div>

            <hr className="border-slate-200" />

            <div className="flex justify-between items-center">
              <label className="text-slate-700">{t("hold_period", language)}</label>
              <select
                value={holdPeriod}
                onChange={(e) => setHoldPeriod(Number(e.target.value))}
                className="terminal-input w-24 text-right cursor-pointer"
              >
                {[3, 4, 5, 6, 7].map((y) => (
                  <option key={y} value={y}>{y} Years</option>
                ))}
              </select>
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-700">{t("exit_multiple", language)}</label>
              <input
                type="number"
                step="0.5"
                value={exitMultiple}
                onChange={(e) => setExitMultiple(Number(e.target.value))}
                className="terminal-input w-24 text-right"
              />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: RETURNS SUMMARY & CHARTS (8 COLS) */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        {/* METRICS HEADER CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-center shadow-sm">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
              Sponsor Equity Required
            </span>
            <span className="font-mono text-xl font-extrabold text-[#171717]">
              SAR {sponsorEquity.toLocaleString()}M
            </span>
          </div>

          <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-250 text-center shadow-sm">
            <span className="text-[10px] font-mono text-[var(--emerald)] uppercase tracking-wider font-bold block mb-1">
              {t("moic", language)}
            </span>
            <span className="font-mono text-2xl font-extrabold text-[var(--emerald)]">
              {moic.toFixed(2)}x
            </span>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-center shadow-sm">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
              Projected IRR
            </span>
            <span className="font-mono text-2xl font-extrabold text-[var(--emerald)]">
              {irr.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* RETURNS WATERFALL CHART */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-[320px]">
            <h3 className="font-mono text-xs font-bold text-[#171717] uppercase tracking-wider mb-4 flex items-center gap-2">
              <PieChart size={14} className="text-[var(--emerald)]" />
              <span>{t("sources_and_uses", language)}</span>
            </h3>

            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={waterfallData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {waterfallData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      borderColor: "#E2E8F0",
                      borderRadius: "8px",
                      fontSize: "11px",
                      color: "#1E293B"
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-around text-[9px] font-mono text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#0E7C69]" />
                <span>Sponsor</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#888888]" />
                <span>Management</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#E53E3E]" />
                <span>Debt</span>
              </div>
            </div>
          </div>

          {/* IRR BY HOLD PERIOD BAR CHART */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-[320px]">
            <h3 className="font-mono text-xs font-bold text-[#171717] uppercase tracking-wider mb-4 flex items-center gap-2">
              <TrendingUp size={14} className="text-[var(--emerald)]" />
              <span>{t("irr_by_period", language)}</span>
            </h3>

            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={irrData}>
                  <XAxis dataKey="year" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      borderColor: "#E2E8F0",
                      borderRadius: "8px",
                      fontSize: "11px",
                      color: "#1E293B"
                    }}
                  />
                  <Bar dataKey="irr" fill="#0E7C69" radius={[4, 4, 0, 0]}>
                    {irrData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === holdPeriod - 3 ? "#000000" : "#0E7C69"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
