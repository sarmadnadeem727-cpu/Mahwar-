"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";

const TICKER_DATA = [
  { symbol: "TASI", name: "Saudi Index", price: "11,842.50", change: "+0.45%", positive: true },
  { symbol: "2222.SR", name: "Saudi Aramco", price: "31.45", change: "+0.80%", positive: true },
  { symbol: "1120.SR", name: "Al Rajhi Bank", price: "88.90", change: "+1.40%", positive: true },
  { symbol: "1180.SR", name: "SNB Bank", price: "38.20", change: "-0.50%", positive: false },
  { symbol: "2010.SR", name: "SABIC", price: "74.30", change: "-1.20%", positive: false },
  { symbol: "7010.SR", name: "STC Group", price: "41.15", change: "+0.60%", positive: true },
  { symbol: "2082.SR", name: "ACWA Power", price: "345.00", change: "+3.40%", positive: true },
  { symbol: "ADX", name: "Abu Dhabi Index", price: "9,240.10", change: "+0.28%", positive: true },
  { symbol: "DFM", name: "Dubai Financial", price: "4,612.30", change: "-0.15%", positive: false },
  { symbol: "QSE", name: "Qatar Index", price: "10,180.90", change: "+0.72%", positive: true }
];

export default function TickerStrip() {
  const { setTicker } = useTerminalStore();

  return (
    <div className="w-full bg-[#0A0B0D] border-y border-white/5 overflow-hidden py-1.5 relative z-20">
      <div className="animate-marquee flex items-center gap-10">
        {[...TICKER_DATA, ...TICKER_DATA].map((item, idx) => (
          <div
            key={idx}
            onClick={() => item.symbol.includes('.SR') && setTicker(item.symbol)}
            className="flex items-center gap-2.5 cursor-pointer shrink-0 font-mono text-[10px]"
          >
            <span className="font-bold text-white">{item.symbol}</span>
            <span className="text-slate-500 hidden sm:inline">{item.name}</span>
            <span className="text-slate-300 font-medium">{item.price}</span>
            <span
              className={`flex items-center gap-0.5 font-bold ${
                item.positive ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {item.positive ? "+" : ""}{item.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
