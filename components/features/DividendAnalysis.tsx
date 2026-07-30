"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Percent, DollarSign, TrendingUp, Calendar, Calculator } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { useTerminalStore } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import { panelReveal } from "@/lib/motion";

const DIV_HISTORY = [
  { year: "2020", amount: 1.20 },
  { year: "2021", amount: 1.35 },
  { year: "2022", amount: 1.50 },
  { year: "2023", amount: 1.68 },
  { year: "2024", amount: 1.85 },
  { year: "2025", amount: 1.98 }
];

export default function DividendAnalysis() {
  const { activeTicker, language } = useTerminalStore();
  const isAr = language === 'ar';

  const [purchasePrice, setPurchasePrice] = useState<number>(25.0);
  const currentAnnualDiv = 1.98;
  const yieldOnCost = (currentAnnualDiv / purchasePrice) * 100;

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* SUMMARY BANNER CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-xl border border-white/10 text-center">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
            Current Dividend Yield
          </span>
          <span className="font-mono text-2xl font-extrabold text-[var(--emerald)]">
            4.82%
          </span>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-white/10 text-center">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
            Sector Average Yield
          </span>
          <span className="font-mono text-2xl font-extrabold text-[var(--gold)]">
            3.40%
          </span>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-white/10 text-center">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
            Payout Ratio (Net Income)
          </span>
          <span className="font-mono text-2xl font-extrabold text-white">
            78.5%
          </span>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-white/10 text-center">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
            5-Year Dividend CAGR
          </span>
          <span className="font-mono text-2xl font-extrabold text-[var(--pos)]">
            +10.5%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* DIVIDEND TIMELINE CHART (8 COLS) */}
        <div className="col-span-12 lg:col-span-8 glass-panel p-6 rounded-2xl border border-white/10">
          <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-4">
            Historical Annual Dividend Growth ({activeTicker})
          </h3>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DIV_HISTORY}>
                <defs>
                  <linearGradient id="divGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C9A84C" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="year" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0F1113", borderColor: "rgba(255,255,255,0.15)", borderRadius: "8px", fontSize: "11px" }} />
                <Area type="monotone" dataKey="amount" stroke="#C9A84C" strokeWidth={2.5} fillOpacity={1} fill="url(#divGrad)" name="SAR / Share" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* YIELD ON COST CALCULATOR (4 COLS) */}
        <div className="col-span-12 lg:col-span-4 glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3 text-[var(--emerald)] font-mono text-xs font-bold uppercase tracking-wider">
              <Calculator size={16} />
              <span>Yield-on-Cost Calculator</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed mb-4">
              Compute personal annual yield based on historical cost basis.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <label className="text-slate-300 block">Your Purchase Price (SAR):</label>
              <input
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Number(e.target.value))}
                className="terminal-input w-full"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--emerald)]/10 border border-[var(--emerald)]/30 text-center">
            <span className="text-[10px] font-mono text-slate-300 uppercase tracking-wider block mb-1">
              Personal Yield On Cost
            </span>
            <span className="font-mono text-3xl font-extrabold text-[var(--emerald)]">
              {yieldOnCost.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* EX-DIVIDEND DATES TABLE */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 overflow-x-auto">
        <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-4">
          Upcoming & Recent Dividend Schedule
        </h3>
        <table className="terminal-table">
          <thead>
            <tr>
              <th>Declaration Date</th>
              <th>Ex-Dividend Date</th>
              <th>Record Date</th>
              <th>Payment Date</th>
              <th>Amount / Share</th>
              <th>Frequency</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2025-05-10</td>
              <td className="font-bold text-[var(--gold)]">2025-05-22</td>
              <td>2025-05-23</td>
              <td className="text-[var(--emerald)] font-bold">2025-06-08</td>
              <td className="font-bold text-white">SAR 0.495</td>
              <td>Quarterly</td>
            </tr>
            <tr>
              <td>2025-02-15</td>
              <td className="font-bold text-[var(--gold)]">2025-02-28</td>
              <td>2025-03-01</td>
              <td className="text-[var(--emerald)] font-bold">2025-03-15</td>
              <td className="font-bold text-white">SAR 0.495</td>
              <td>Quarterly</td>
            </tr>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
