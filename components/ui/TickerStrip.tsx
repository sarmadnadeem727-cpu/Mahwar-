"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Ticker {
  symbol: string;
  name: string;
  price: string;
  change: string;
  percent: string;
  up: boolean;
  stale?: boolean;
}

// Source: Yahoo Finance API (multi-symbol quote request)
// Refresh Cadence: 5 minutes background refetch
const SYMBOLS_STRING = "^TASI,2222.SR,1120.SR,1180.SR,7010.SR,2010.SR,1211.SR,4003.SR";

const TickerStrip = () => {
  const [displayTickers, setDisplayTickers] = useState<Ticker[]>([]);

  const { data, isLoading } = useQuery<any[]>({
    queryKey: ["tickerStripQuotes"],
    queryFn: async () => {
      const res = await fetch(`/api/yahoo/${SYMBOLS_STRING}?type=quote`);
      if (!res.ok) throw new Error("Failed to fetch quote strip");
      return res.json();
    },
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    if (data && Array.isArray(data)) {
      const parsed = data.map((q: any) => {
        const isUp = (q.regularMarketChange ?? 0) >= 0;
        return {
          symbol: q.symbol === "^TASI" ? "TASI" : q.symbol,
          name: q.shortName || q.longName || q.symbol,
          price: (q.regularMarketPrice ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          change: (q.regularMarketChange ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          percent: (q.regularMarketChangePercent ?? 0).toFixed(2) + "%",
          up: isUp,
          stale: false,
        };
      });
      setDisplayTickers(parsed);
      localStorage.setItem("cached_ticker_strip", JSON.stringify(parsed));
    } else {
      // Try to load from localStorage cache if API fails or we are offline
      const cached = localStorage.getItem("cached_ticker_strip");
      if (cached) {
        try {
          const parsed = JSON.parse(cached).map((t: Ticker) => ({ ...t, stale: true }));
          setDisplayTickers(parsed);
        } catch {
          // ignore
        }
      }
    }
  }, [data]);

  if (isLoading && displayTickers.length === 0) {
    return (
      <div className="sticky top-16 w-full h-10 bg-[rgba(5,5,15,0.98)] border-y border-[var(--border)] z-40 flex items-center justify-center">
        <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest flex items-center gap-2">
          <Loader2 className="w-3 h-3 animate-spin text-[var(--emerald)]" />
          Synchronizing Live GCC Feed...
        </div>
      </div>
    );
  }

  const itemsToRender = displayTickers.length > 0 ? displayTickers : [
    { symbol: "TASI", name: "Tadawul All Share", price: "---", change: "---", percent: "---", up: true },
    { symbol: "2222.SR", name: "Saudi Aramco", price: "---", change: "---", percent: "---", up: true },
    { symbol: "1120.SR", name: "Al Rajhi Bank", price: "---", change: "---", percent: "---", up: true },
    { symbol: "1180.SR", name: "SNB", price: "---", change: "---", percent: "---", up: true },
    { symbol: "7010.SR", name: "STC", price: "---", change: "---", percent: "---", up: false },
    { symbol: "2010.SR", name: "SABIC", price: "---", change: "---", percent: "---", up: true },
    { symbol: "1211.SR", name: "Ma'aden", price: "---", change: "---", percent: "---", up: true },
    { symbol: "4003.SR", name: "Extra", price: "---", change: "---", percent: "---", up: false },
  ];

  return (
    <div className="sticky top-16 w-full h-10 bg-[rgba(5,5,15,0.98)] border-y border-[var(--border)] z-40 overflow-hidden flex items-center">
      {/* Gradient Masks */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[var(--bg1)] to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[var(--bg1)] to-transparent z-10" />

      <motion.div
        animate={{ x: [0, "-50%"] }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear",
        }}
        className="flex items-center gap-12 whitespace-nowrap px-6"
        style={{ width: "fit-content" }}
      >
        {[...itemsToRender, ...itemsToRender].map((item, i) => (
          <div key={i} className="flex items-center gap-4 group cursor-default">
            <div className="flex items-center gap-2">
              <span className="text-[var(--emerald)] font-bold text-[8px]">●</span>
              <span className="font-mono text-[10px] font-bold text-[var(--text1)] tracking-wider">
                {item.symbol} {item.stale && <span className="text-amber-500 text-[8px] uppercase tracking-normal font-sans">[Stale]</span>}
              </span>
            </div>
            
            <span className="font-dm-sans text-[11px] text-[var(--text2)] group-hover:text-[var(--text1)] transition-colors">
              {item.name}
            </span>

            <span className="font-mono text-[11px] text-[var(--text1)]">
              SAR {item.price}
            </span>

            {item.percent !== "---" && (
              <span
                className={`font-mono text-[10px] flex items-center gap-1 ${
                  item.up ? "text-[var(--positive)]" : "text-[var(--negative)]"
                }`}
              >
                {item.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {item.percent}
              </span>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default TickerStrip;
