"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Layers, PieChart, TrendingUp, DollarSign, Calculator, RefreshCw } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart as RePieChart, Pie } from "recharts";
import { useTerminalStore } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import { panelReveal } from "@/lib/motion";

export default function LBOModel() {
  const { activeTicker, language } = useTerminalStore();
  const isAr = language === 'ar';

  const [purchasePrice, setPurchasePrice] = useState<number>(50000);
  const [ebitdaMultiple, setEbitdaMultiple] = useState<number>(12);
  const [mgmtEquityPct, setMgmtEquityPct] = useState<number>(15);
  const [seniorDebt, setSeniorDebt] = useState<number>(15000);
  const [seniorRate, setSeniorRate] = useState<number>(6.5);
  const [mezzDebt, setMezzDebt] = useState<number>(5000);
  const [mezzRate, setMezzRate] = useState<number>(9.0);
  const [pikNotes, setPikNotes] = useState<number>(2500);
  const [pikRate, setPikRate] = useState<number>(12.0);
  const [holdPeriod, setHoldPeriod] = useState<number>(5);
  const [exitMultiple, setExitMultiple] = useState<number>(11);

  // LBO computations
  const totalDebt = seniorDebt + mezzDebt + pikNotes;
  const sponsorEquity = purchasePrice - totalDebt;
  const entryEBITDA = purchasePrice / ebitdaMultiple;

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

  const moic = sponsorProceeds / sponsorEquity;
  const irr = (Math.pow(moic, 1 / holdPeriod) - 1) * 100;

  // IRR by Hold Period Bar Chart Data
  const irrData = [3, 4, 5, 6, 7].map((yr) => {
    const exEBITDA = entryEBITDA * Math.pow(1.08, yr);
    const exEV = exEBITDA * exitMultiple;
    const remDebt = Math.max(0, seniorDebt - (seniorDebt * 0.15 * yr)) + mezzDebt + (pikNotes * Math.pow(1 + pikRate / 100, yr));
    const eq = Math.max(0, exEV - remDebt) * (1 - mgmtEquityPct / 100);
    const m = eq / sponsorEquity;
    const i = (Math.pow(m, 1 / yr) - 1) * 100;
    return {
      year: `${yr}Y`,
      irr: Number(i.toFixed(1)),
      moic: Number(m.toFixed(2))
    };
  });

  const waterfallData = [
    { name: "Sponsor Equity Proceeds", value: Math.round(sponsorProceeds), fill: "#0E7C69" },
    { name: "Management Equity Share", value: Math.round(mgmtProceeds), fill: "#C9A84C" },
    { name: "Remaining Debt Repaid", value: Math.round(totalRemainingDebt), fill: "#E53E3E" }
  ];

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="grid grid-cols-12 gap-8"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* LEFT COLUMN: INPUT PARAMETERS (4 COLS) */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <Layers className="text-[var(--gold)]" size={22} />
            <div>
              <h2 className="font-garamond text-xl font-bold text-white">
                {t("lbo_inputs", language)}
              </h2>
              <span className="text-[10px] font-mono text-slate-400">Target: {activeTicker}</span>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center">
              <label className="text-slate-300">{t("entry_price", language)}</label>
              <input
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Number(e.target.value))}
                className="terminal-input w-24 text-right"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-300">{t("entry_ebitda_mult", language)}</label>
              <input
                type="number"
                step="0.5"
                value={ebitdaMultiple}
                onChange={(e) => setEbitdaMultiple(Number(e.target.value))}
                className="terminal-input w-24 text-right"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-300">{t("mgmt_equity_pct", language)}</label>
              <input
                type="number"
                value={mgmtEquityPct}
                onChange={(e) => setMgmtEquityPct(Number(e.target.value))}
                className="terminal-input w-24 text-right"
              />
            </div>

            <hr className="border-white/10" />

            <div className="flex justify-between items-center">
              <label className="text-slate-300">{t("senior_debt", language)}</label>
              <input
                type="number"
                value={seniorDebt}
                onChange={(e) => setSeniorDebt(Number(e.target.value))}
                className="terminal-input w-24 text-right"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-300">{t("mezz_debt", language)}</label>
              <input
                type="number"
                value={mezzDebt}
                onChange={(e) => setMezzDebt(Number(e.target.value))}
                className="terminal-input w-24 text-right"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-slate-300">{t("pik_notes", language)}</label>
              <input
                type="number"
                value={pikNotes}
                onChange={(e) => setPikNotes(Number(e.target.value))}
                className="terminal-input w-24 text-right"
              />
            </div>

            <hr className="border-white/10" />

            <div className="flex justify-between items-center">
              <label className="text-slate-300">{t("hold_period", language)}</label>
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
              <label className="text-slate-300">{t("exit_multiple", language)}</label>
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

      {/* RIGHT COLUMN: RETURN METRICS & WATERFALL (8 COLS) */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        {/* BIG NUMBER RETURN HIGHLIGHTS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel p-6 rounded-2xl border border-[var(--emerald)]/40 bg-[var(--emerald)]/10 text-center">
            <span className="text-xs font-mono text-[var(--emerald)] uppercase tracking-wider font-bold block mb-1">
              {t("moic", language)}
            </span>
            <span className="font-mono text-4xl font-extrabold text-white">
              {moic.toFixed(2)}x
            </span>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-[var(--gold)]/40 bg-[var(--gold)]/10 text-center">
            <span className="text-xs font-mono text-[var(--gold)] uppercase tracking-wider font-bold block mb-1">
              Sponsor Project IRR ({holdPeriod}Y Hold)
            </span>
            <span className="font-mono text-4xl font-extrabold text-white">
              {irr.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* IRR BY HOLD PERIOD BAR CHART */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-4">
            {t("irr_by_period", language)}
          </h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={irrData}>
                <XAxis dataKey="year" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F1113",
                    borderColor: "rgba(255,255,255,0.15)",
                    borderRadius: "8px",
                    color: "#F8FAFC"
                  }}
                />
                <Bar dataKey="irr" radius={[4, 4, 0, 0]}>
                  {irrData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.year === `${holdPeriod}Y` ? "#0E7C69" : "#334155"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SOURCES AND USES & WATERFALL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-4">
              {t("sources_and_uses", language)}
            </h3>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Senior Secured Debt</span>
                <span className="font-bold">SAR {seniorDebt.toLocaleString()}M</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Mezzanine Debt</span>
                <span className="font-bold">SAR {mezzDebt.toLocaleString()}M</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>PIK Notes</span>
                <span className="font-bold">SAR {pikNotes.toLocaleString()}M</span>
              </div>
              <div className="flex justify-between text-[var(--gold)] font-bold border-t border-white/10 pt-2">
                <span>Sponsor Equity</span>
                <span>SAR {sponsorEquity.toLocaleString()}M</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-2">
              Exit Equity Distribution
            </h3>
            <div className="h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={waterfallData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={3}
                  >
                    {waterfallData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#0F1113", borderColor: "rgba(255,255,255,0.15)", fontSize: "11px" }} />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
