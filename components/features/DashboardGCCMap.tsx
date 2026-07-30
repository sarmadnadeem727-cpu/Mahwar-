"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Globe, Compass, Landmark, TrendingUp } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import { panelReveal } from "@/lib/motion";

const GCC_MAP_DATA = [
  { id: "SA", nameEn: "Saudi Arabia", nameAr: "المملكة العربية السعودية", exchange: "Tadawul (TASI)", cap: "$2.90T", top: "Saudi Aramco (2222.SR)", change: "+0.8%" },
  { id: "UAE", nameEn: "United Arab Emirates", nameAr: "الإمارات العربية المتحدة", exchange: "ADX / DFM", cap: "$940B", top: "IHC / Emirates NBD", change: "+1.2%" },
  { id: "QA", nameEn: "Qatar", nameAr: "دولة قطر", exchange: "QSE", cap: "$180B", top: "QNB Group", change: "+0.7%" },
  { id: "KW", nameEn: "Kuwait", nameAr: "دولة الكويت", exchange: "Boursa Kuwait", cap: "$145B", top: "NBK / KFH", change: "-0.2%" },
  { id: "OM", nameEn: "Oman", nameAr: "سلطنة عمان", exchange: "MSX", cap: "$62B", top: "Bank Muscat", change: "+0.3%" },
  { id: "BH", nameEn: "Bahrain", nameAr: "مملكة البحرين", exchange: "Bahrain Bourse", cap: "$32B", top: "Ahli United Bank", change: "+0.1%" }
];

export default function DashboardGCCMap() {
  const { setPanel, language } = useTerminalStore();
  const isAr = language === 'ar';

  const [hovered, setHovered] = useState(GCC_MAP_DATA[0]);

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Compass className="text-[var(--gold)]" size={24} />
          <div>
            <h2 className="font-garamond text-2xl font-bold text-white">
              {t("panel_gcc_map", language)}
            </h2>
            <span className="text-xs font-mono text-slate-400">
              Interactive Sovereign Exchange Map & Sector Liquidity
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* MAP GRID CARDS (7 COLS) */}
        <div className="col-span-12 lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {GCC_MAP_DATA.map((c) => (
            <div
              key={c.id}
              onMouseEnter={() => setHovered(c)}
              onClick={() => setPanel("screener")}
              className={`glass-card p-5 rounded-xl border cursor-pointer transition-all ${
                hovered.id === c.id 
                  ? "border-[var(--emerald)] bg-[var(--emerald)]/10 shadow-lg shadow-[var(--emerald)]/20" 
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-xs font-bold text-[var(--gold)] px-2 py-0.5 rounded bg-[var(--gold)]/10 border border-[var(--gold)]/20">
                  {c.id}
                </span>
                <span className="text-xs font-mono font-bold text-[var(--pos)]">
                  {c.change}
                </span>
              </div>
              <h3 className="font-bold text-white text-sm mb-1">{isAr ? c.nameAr : c.nameEn}</h3>
              <div className="text-[10px] font-mono text-slate-400">{c.exchange}</div>
            </div>
          ))}
        </div>

        {/* HOVERED DETAILS PANEL (5 COLS) */}
        <div className="col-span-12 lg:col-span-5 glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-mono text-[var(--emerald)] uppercase tracking-wider font-bold block mb-1">
              Active Regional Focus ({hovered.id})
            </span>
            <h3 className="font-garamond text-3xl font-bold text-white mb-4">
              {isAr ? hovered.nameAr : hovered.nameEn}
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-black/40 border border-white/10 flex justify-between">
                <span className="text-slate-400">Stock Exchange</span>
                <span className="text-white font-bold">{hovered.exchange}</span>
              </div>

              <div className="p-3 rounded-lg bg-black/40 border border-white/10 flex justify-between">
                <span className="text-slate-400">Total Market Cap</span>
                <span className="text-[var(--emerald)] font-bold">{hovered.cap}</span>
              </div>

              <div className="p-3 rounded-lg bg-black/40 border border-white/10 flex justify-between">
                <span className="text-slate-400">Benchmark Leader</span>
                <span className="text-[var(--gold)] font-bold truncate max-w-[150px]">{hovered.top}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setPanel("screener")}
            className="w-full py-3 bg-[var(--emerald)] hover:bg-emerald-600 text-white font-mono text-xs font-bold rounded-xl shadow-lg transition-colors cursor-pointer"
          >
            Launch Market Screener for {hovered.id} &rarr;
          </button>
        </div>
      </div>
    </motion.div>
  );
}
