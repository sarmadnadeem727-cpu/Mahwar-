"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function LiveTickerFlash() {
  const shouldReduceMotion = useReducedMotion();
  const [price, setPrice] = useState(32.45);
  const [displayPrice, setDisplayPrice] = useState("32.45");
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const interval = setInterval(() => {
      const up = Math.random() > 0.45;
      const diff = (Math.random() * 0.25) * (up ? 1 : -1);
      setPrice((prev) => parseFloat((prev + diff).toFixed(2)));
      setFlash(up ? "up" : "down");
      const timeout = setTimeout(() => setFlash(null), 800);
      return () => clearTimeout(timeout);
    }, 2800);

    return () => clearInterval(interval);
  }, [shouldReduceMotion]);

  // Terminal digit scrambling cascade on value update
  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayPrice(price.toFixed(2));
      return;
    }

    let iterations = 0;
    const scrambleInterval = setInterval(() => {
      if (iterations < 5) {
        // Scramble with a random price range close by
        setDisplayPrice((Math.random() * 3 + 31).toFixed(2));
        iterations++;
      } else {
        setDisplayPrice(price.toFixed(2));
        clearInterval(scrambleInterval);
      }
    }, 60);

    return () => clearInterval(scrambleInterval);
  }, [price, shouldReduceMotion]);

  const flashBg =
    flash === "up"
      ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30"
      : flash === "down"
      ? "bg-red-950/40 text-red-400 border-red-500/30"
      : "bg-black/30 text-slate-300 border-white/5";

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 font-mono select-none w-full">
      <div className={`p-4 rounded-xl border flex flex-col items-center justify-center w-full max-w-[140px] transition-all duration-300 ${flashBg}`}>
        <span className="text-[10px] font-bold tracking-wider">2222.SR</span>
        <span className="text-lg font-extrabold mt-1">SAR {displayPrice}</span>
        <span className="text-[8px] opacity-80 mt-1 uppercase tracking-widest">// LIVE FEED</span>
      </div>
      <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-4">// TADAWUL DIRECT TICK</span>
    </div>
  );
}
