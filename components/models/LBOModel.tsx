"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Layers, PieChart, TrendingUp } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart as RePieChart, Pie } from "recharts";
import { useTerminalStore } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import { panelReveal } from "@/lib/motion";
import { TERMINAL_CHART_THEME } from "@/lib/chartTheme";
import NumberCounter from "@/components/ui/NumberCounter";

export default function LBOModel() {
  const { language, updateSessionAnalysis } = useTerminalStore();
  const isAr = language === 'ar';

  const [purchasePrice, setPurchasePrice] = useState<number>(850);
  const [ebitdaMultiple, setEbitdaMultiple] = useState<number>(9.5);
  const [mgmtEquityPct, setMgmtEquityPct] = useState<number>(10);
  const [seniorDebt, setSeniorDebt] = useState<number>(450);
  const [seniorRate, setSeniorRate] = useState<number>(5.5);
  const [mezzDebt, setMezzDebt] = useState<number>(100);
  const [mezzRate, setMezzRate] = useState<number>(8.5);
  const [pikNotes, setPikNotes] = useState<number>(50);
  const [pikRate, setPikRate] = useState<number>(10.0);
  const [holdPeriod, setHoldPeriod] = useState<number>(5);
  const [exitMultiple, setExitMultiple] = useState<number>(10.0);

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
    { name: isAr ? "عائدات المستثمر الرئيسي" : "Sponsor Equity Proceeds", value: Math.round(sponsorProceeds), fill: "#00FF9D" },
    { name: isAr ? "حصة الإدارة التنفيذية" : "Management Equity Share", value: Math.round(mgmtProceeds), fill: "#64748B" },
    { name: isAr ? "الديون المتبقية المسددة" : "Remaining Debt Repaid", value: Math.round(totalRemainingDebt), fill: "#FF4D4D" }
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
      className="grid grid-cols-12 gap-8 text-slate-100 font-mono"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* LEFT COLUMN: INPUT PARAMETERS (4 COLS) */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        <div className="bg-[#121721] p-6 rounded-sm border border-[#1E293B] space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
            <div className="flex items-center gap-3">
              <Layers className="text-terminal-emerald" size={22} />
              <div>
                <h2 className="font-mono text-lg font-extrabold text-white uppercase">
                  {t("lbo_inputs", language)}
                </h2>
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  {isAr ? "افتراضات صفقة الاستحواذ" : "Manual Deal Builder"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center">
              <label className="text-slate-300">{t("entry_price", language)} (SAR M)</label>
              <input
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Number(e.target.value))}
                className="w-24 px-2 py-1 bg-[#0B0E14] border border-[#1E293B] focus:border-terminal-emerald rounded-sm text-right text-white font-mono text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-300">{t("entry_ebitda_mult", language)} (x)</label>
              <input
                type="number"
                step="0.5"
                value={ebitdaMultiple}
                onChange={(e) => setEbitdaMultiple(Number(e.target.value))}
                className="w-24 px-2 py-1 bg-[#0B0E14] border border-[#1E293B] focus:border-terminal-emerald rounded-sm text-right text-white font-mono text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-300">{t("mgmt_equity_pct", language)} (%)</label>
              <input
                type="number"
                value={mgmtEquityPct}
                onChange={(e) => setMgmtEquityPct(Number(e.target.value))}
                className="w-24 px-2 py-1 bg-[#0B0E14] border border-[#1E293B] focus:border-terminal-emerald rounded-sm text-right text-white font-mono text-xs focus:outline-none"
              />
            </div>

            <hr className="border-[#1E293B]" />

            <div className="flex justify-between items-center">
              <label className="text-slate-300">{t("senior_debt", language)} (SAR M)</label>
              <input
                type="number"
                value={seniorDebt}
                onChange={(e) => setSeniorDebt(Number(e.target.value))}
                className="w-24 px-2 py-1 bg-[#0B0E14] border border-[#1E293B] focus:border-terminal-emerald rounded-sm text-right text-white font-mono text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-300">{t("mezz_debt", language)} (SAR M)</label>
              <input
                type="number"
                value={mezzDebt}
                onChange={(e) => setMezzDebt(Number(e.target.value))}
                className="w-24 px-2 py-1 bg-[#0B0E14] border border-[#1E293B] focus:border-terminal-emerald rounded-sm text-right text-white font-mono text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-300">{t("pik_notes", language)} (SAR M)</label>
              <input
                type="number"
                value={pikNotes}
                onChange={(e) => setPikNotes(Number(e.target.value))}
                className="w-24 px-2 py-1 bg-[#0B0E14] border border-[#1E293B] focus:border-terminal-emerald rounded-sm text-right text-white font-mono text-xs focus:outline-none"
              />
            </div>

            <hr className="border-[#1E293B]" />

            <div className="flex justify-between items-center">
              <label className="text-slate-300">{t("hold_period", language)}</label>
              <select
                value={holdPeriod}
                onChange={(e) => setHoldPeriod(Number(e.target.value))}
                className="w-24 px-2 py-1 bg-[#0B0E14] border border-[#1E293B] focus:border-terminal-emerald rounded-sm text-right text-white font-mono text-xs focus:outline-none cursor-pointer"
              >
                {[3, 4, 5, 6, 7].map((y) => (
                  <option key={y} value={y}>{y} Years</option>
                ))}
              </select>
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-300">{t("exit_multiple", language)} (x)</label>
              <input
                type="number"
                step="0.5"
                value={exitMultiple}
                onChange={(e) => setExitMultiple(Number(e.target.value))}
                className="w-24 px-2 py-1 bg-[#0B0E14] border border-[#1E293B] focus:border-terminal-emerald rounded-sm text-right text-white font-mono text-xs focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: RETURNS SUMMARY & CHARTS (8 COLS) */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        {/* METRICS HEADER CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#121721] p-5 rounded-sm border border-[#1E293B] text-center shadow-lg">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1 font-bold">
              Sponsor Equity Required
            </span>
            <span className="font-mono text-xl font-extrabold text-white">
              SAR <NumberCounter value={sponsorEquity} decimals={0} />M
            </span>
          </div>

          <div className="bg-terminal-emerald-dim p-5 rounded-sm border border-terminal-border-emerald text-center shadow-lg">
            <span className="text-[10px] font-mono text-terminal-emerald uppercase tracking-wider font-bold block mb-1">
              {t("moic", language)}
            </span>
            <span className="font-mono text-2xl font-extrabold text-terminal-emerald">
              <NumberCounter value={moic} decimals={2} suffix="x" />
            </span>
          </div>

          <div className="bg-[#121721] p-5 rounded-sm border border-[#1E293B] text-center shadow-lg">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1 font-bold">
              Projected IRR
            </span>
            <span className="font-mono text-2xl font-extrabold text-terminal-emerald">
              <NumberCounter value={irr} decimals={1} suffix="%" />
            </span>
          </div>
        </div>

        {/* RETURNS WATERFALL CHART */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#121721] p-6 rounded-sm border border-[#1E293B] shadow-xl flex flex-col justify-between h-[320px]">
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <PieChart size={14} className="text-terminal-emerald" />
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
                  <Tooltip contentStyle={{ backgroundColor: "#0B0E14", borderColor: "#1E293B", color: "#F8FAFC", borderRadius: "2px", fontSize: "11px", fontFamily: "monospace" }} />
                </RePieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-around text-[10px] font-mono text-slate-400 font-bold border-t border-[#1E293B] pt-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#00FF9D]" />
                <span>Sponsor</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#64748B]" />
                <span>Management</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#FF4D4D]" />
                <span>Debt</span>
              </div>
            </div>
          </div>

          {/* IRR BY HOLD PERIOD BAR CHART */}
          <div className="bg-[#121721] p-6 rounded-sm border border-[#1E293B] shadow-xl flex flex-col justify-between h-[320px]">
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <TrendingUp size={14} className="text-terminal-emerald" />
              <span>{t("irr_by_period", language)}</span>
            </h3>

            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={irrData}>
                  <XAxis dataKey="year" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'monospace' }} />
                  <YAxis stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'monospace' }} />
                  <Tooltip contentStyle={{ backgroundColor: "#0B0E14", borderColor: "#1E293B", color: "#F8FAFC", borderRadius: "2px", fontSize: "11px", fontFamily: "monospace" }} />
                  <Bar dataKey="irr" fill="#00FF9D" radius={[2, 2, 0, 0]}>
                    {irrData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === holdPeriod - 3 ? "#00FF9D" : "rgba(0, 255, 157, 0.4)"} />
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
