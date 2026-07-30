"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";

const TICKER_DATA = [
  { symbol: "TASI", name: "Saudi Index", price: "11,842.50", change: "+0.45%", positive: true },
  { symbol: "2222.SR", name: "Saudi Aramco", price: "SAR 31.45", change: "+0.80%", positive: true },
  { symbol: "1120.SR", name: "Al Rajhi Bank", price: "SAR 88.90", change: "+1.40%", positive: true },
  { symbol: "1180.SR", name: "SNB Bank", price: "SAR 38.20", change: "-0.50%", positive: false },
  { symbol: "2010.SR", name: "SABIC", price: "SAR 74.30", change: "-1.20%", positive: false },
  { symbol: "7010.SR", name: "STC Group", price: "SAR 41.15", change: "+0.60%", positive: true },
  { symbol: "2082.SR", name: "ACWA Power", price: "SAR 345.00", change: "+3.40%", positive: true },
  { symbol: "ADX", name: "Abu Dhabi Index", price: "9,240.10", change: "+0.28%", positive: true },
  { symbol: "DFM", name: "Dubai Financial", price: "4,612.30", change: "-0.15%", positive: false },
  { symbol: "QSE", name: "Qatar Index", price: "10,180.90", change: "+0.72%", positive: true }
];

export default function TickerStrip() {
  const { setTicker, language } = useTerminalStore();
  const isAr = language === 'ar';

  return (
    <div className="w-full bg-[#0F1113]/90 border-y border-white/10 overflow-hidden py-2.5 backdrop-blur-md relative z-20">
      <div className="animate-marquee flex items-center gap-8">
        {[...TICKER_DATA, ...TICKER_DATA].map((item, idx) => (
          <div
            key={idx}
            onClick={() => item.symbol.includes('.SR') && setTicker(item.symbol)}
            className="flex items-center gap-3 px-3 py-1 rounded bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 cursor-pointer transition-colors shrink-0"
          >
            <span className="font-mono text-xs font-bold text-white">{item.symbol}</span>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">{item.name}</span>
            <span className="font-mono text-xs font-semibold text-slate-200">{item.price}</span>
            <span
              className={`flex items-center gap-0.5 text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                item.positive 
                  ? "text-[var(--pos)] bg-[var(--pos-bg)]" 
                  : "text-[var(--neg)] bg-[var(--neg-bg)]"
              }`}
            >
              {item.positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {item.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
