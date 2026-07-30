"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function ThreeStatementSync() {
  const shouldReduceMotion = useReducedMotion();
  const [sync, setSync] = useState(true);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const interval = setInterval(() => {
      setSync((prev) => !prev);
    }, 3000);

    return () => clearInterval(interval);
  }, [shouldReduceMotion]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 font-mono select-none w-full">
      <div className="flex items-end justify-center gap-4 h-12 w-full max-w-[150px]">
        {/* Income Statement bar */}
        <div className="flex flex-col items-center gap-1.5">
          <motion.div
            className="w-3 bg-[var(--emerald)] rounded-t"
            animate={shouldReduceMotion ? { height: 40 } : { height: sync ? 40 : 25 }}
            transition={{ type: "spring", stiffness: 100, damping: 12 }}
          />
          <span className="text-[7px] text-slate-500">IS</span>
        </div>

        {/* Balance Sheet bar */}
        <div className="flex flex-col items-center gap-1.5">
          <motion.div
            className="w-3 bg-[var(--gold)] rounded-t"
            animate={shouldReduceMotion ? { height: 40 } : { height: sync ? 40 : 45 }}
            transition={{ type: "spring", stiffness: 100, damping: 12 }}
          />
          <span className="text-[7px] text-slate-500">BS</span>
        </div>

        {/* Cash Flow bar */}
        <div className="flex flex-col items-center gap-1.5">
          <motion.div
            className="w-3 bg-sky-500 rounded-t"
            animate={shouldReduceMotion ? { height: 40 } : { height: sync ? 40 : 30 }}
            transition={{ type: "spring", stiffness: 100, damping: 12 }}
          />
          <span className="text-[7px] text-slate-500">CF</span>
        </div>
      </div>
      <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-4">// THREE STATEMENT SYNC</span>
    </div>
  );
}
