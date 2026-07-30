"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Grid3X3, Table, Filter, TrendingUp, TrendingDown } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import { panelReveal } from "@/lib/motion";

export default function MarketScreener() {
  const { setTicker, language } = useTerminalStore();
  const isAr = language === 'ar';

  const [viewMode, setViewMode] = useState<"table" | "heatmap">("table");
  const [selectedSector, setSelectedSector] = useState<string>("ALL");
  const [minYield, setMinYield] = useState<number>(0);
  const [maxPE, setMaxPE] = useState<number>(50);
  const [stocks, setStocks] = useState<any[]>([]);

  useEffect(() => {
    async function fetchScreener() {
      try {
        const res = await fetch(`/api/screener?sector=${selectedSector}&minYield=${minYield}&maxPE=${maxPE}`);
        const data = await res.json();
        setStocks(data.stocks || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchScreener();
  }, [selectedSector, minYield, maxPE]);

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* FILTER BAR & VIEW TOGGLE */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 font-mono text-xs w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-[var(--gold)]" />
            <span className="font-bold text-white">Sector:</span>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="terminal-input cursor-pointer"
            >
              <option value="ALL">All Sectors</option>
              <option value="Energy">Energy</option>
              <option value="Banking">Banking</option>
              <option value="Materials">Materials</option>
              <option value="Utilities">Utilities</option>
              <option value="Telecom">Telecom</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-300">Min Yield:</span>
            <input
              type="number"
              value={minYield}
              onChange={(e) => setMinYield(Number(e.target.value))}
              className="terminal-input w-16"
            />
            <span className="text-slate-400">%</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-300">Max P/E:</span>
            <input
              type="number"
              value={maxPE}
              onChange={(e) => setMaxPE(Number(e.target.value))}
              className="terminal-input w-16"
            />
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-[#0A0B0D] p-1 rounded-lg border border-white/10 font-mono text-xs">
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all cursor-pointer ${
              viewMode === "table" ? "bg-[var(--emerald)] text-white font-bold" : "text-slate-400"
            }`}
          >
            <Table size={13} />
            <span>{t("table_view", language)}</span>
          </button>
          <button
            onClick={() => setViewMode("heatmap")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all cursor-pointer ${
              viewMode === "heatmap" ? "bg-[var(--emerald)] text-white font-bold" : "text-slate-400"
            }`}
          >
            <Grid3X3 size={13} />
            <span>{t("heatmap_view", language)}</span>
          </button>
        </div>
      </div>

      {/* DISPLAY CONTENT */}
      {viewMode === "table" ? (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 overflow-x-auto">
          <table className="terminal-table">
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Company</th>
                <th>Sector</th>
                <th>Price (SAR)</th>
                <th>Change %</th>
                <th>Market Cap (M)</th>
                <th>P/E</th>
                <th>Div Yield</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((s) => (
                <tr
                  key={s.ticker}
                  onClick={() => setTicker(s.ticker)}
                  className="cursor-pointer hover:bg-white/5"
                >
                  <td className="font-bold text-[var(--gold)]">{s.ticker}</td>
                  <td className="text-slate-200">{isAr ? s.nameAr : s.name}</td>
                  <td className="text-slate-400">{s.sector}</td>
                  <td className="font-bold text-white">SAR {s.price}</td>
                  <td>
                    <span className={`flex items-center gap-0.5 font-bold ${s.changePct >= 0 ? "text-[var(--pos)]" : "text-[var(--neg)]"}`}>
                      {s.changePct >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {s.changePct > 0 ? `+${s.changePct}%` : `${s.changePct}%`}
                    </span>
                  </td>
                  <td className="text-slate-300">SAR {s.marketCap.toLocaleString()}M</td>
                  <td className="text-slate-300">{s.pe}x</td>
                  <td className="text-[var(--gold)] font-bold">{s.divYield}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* HEATMAP VIEW */
        <div className="glass-panel p-6 rounded-2xl border border-white/10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {stocks.map((s) => {
            const isPos = s.changePct >= 0;
            return (
              <div
                key={s.ticker}
                onClick={() => setTicker(s.ticker)}
                className={`p-5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.03] ${
                  isPos 
                    ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300" 
                    : "bg-red-950/60 border-red-500/40 text-red-300"
                }`}
              >
                <div>
                  <span className="font-mono text-xs font-bold block text-white">{s.ticker}</span>
                  <span className="text-[10px] opacity-80 block truncate">{isAr ? s.nameAr : s.name}</span>
                </div>
                <div className="mt-4 pt-2 border-t border-current/20 font-mono flex justify-between items-center text-xs font-extrabold">
                  <span>SAR {s.price}</span>
                  <span>{s.changePct > 0 ? `+${s.changePct}%` : `${s.changePct}%`}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
