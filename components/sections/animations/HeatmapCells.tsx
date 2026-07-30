"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface HeatmapCell {
  ticker: string;
  pct: number;
}

export default function HeatmapCells() {
  const shouldReduceMotion = useReducedMotion();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [cells, setCells] = useState<HeatmapCell[]>([
    { ticker: "2222", pct: 1.4 },
    { ticker: "1120", pct: -0.6 },
    { ticker: "1180", pct: 2.1 },
    { ticker: "2010", pct: -1.2 },
    { ticker: "7010", pct: 0.5 },
    { ticker: "2280", pct: 1.8 }
  ]);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const interval = setInterval(() => {
      setCells((prev) =>
        prev.map((cell) => {
          const change = (Math.random() - 0.5) * 1.5;
          const next = parseFloat((cell.pct + change).toFixed(1));
          return { ...cell, pct: next };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [shouldReduceMotion]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 font-mono select-none w-full">
      <div 
        className="grid grid-cols-3 gap-2 w-full max-w-[200px]"
        onMouseLeave={() => setHoveredIdx(null)}
      >
        {cells.map((cell, idx) => {
          const isPos = cell.pct >= 0;
          const valStr = isPos ? `+${cell.pct}%` : `${cell.pct}%`;
          const bgClass = isPos 
            ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-400"
            : "bg-red-950/40 border-red-500/20 text-red-400";

          return (
            <motion.div
              key={cell.ticker}
              onMouseEnter={() => setHoveredIdx(idx)}
              whileHover={shouldReduceMotion ? {} : { scale: 1.1, zIndex: 10 }}
              animate={
                shouldReduceMotion
                  ? {}
                  : hoveredIdx !== null
                  ? {
                      scale: idx === hoveredIdx ? 1.1 : 0.92,
                      opacity: idx === hoveredIdx ? 1 : 0.65
                    }
                  : { scale: 1, opacity: 1 }
              }
              transition={{ type: "spring", stiffness: 200, damping: 14 }}
              className={`p-2 rounded border flex flex-col items-center justify-center text-[9px] cursor-pointer ${bgClass}`}
            >
              <span className="font-bold">{cell.ticker}</span>
              <span className="text-[8px] opacity-80 mt-0.5">{valStr}</span>
            </motion.div>
          );
        })}
      </div>
      <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-4">// GCC SECTOR HEATMAP</span>
    </div>
  );
}
