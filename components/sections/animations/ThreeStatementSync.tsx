"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function ThreeStatementSync() {
  const shouldReduceMotion = useReducedMotion();
  const [sync, setSync] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const interval = setInterval(() => {
      setSync((prev) => !prev);
    }, 2500);

    return () => clearInterval(interval);
  }, [shouldReduceMotion]);

  return (
    <div 
      className="flex flex-col items-center justify-center h-full p-4 font-mono select-none w-full cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-end justify-center gap-4 h-12 w-full max-w-[150px]">
        {/* Income Statement bar */}
        <div className="flex flex-col items-center gap-1.5">
          <motion.div
            className="w-3 bg-[var(--emerald)] rounded-t"
            animate={
              shouldReduceMotion
                ? { height: 40 }
                : isHovered
                ? { height: 45 }
                : { height: sync ? 40 : 22 }
            }
            transition={{
              type: "spring",
              stiffness: 140,
              damping: 10,
              delay: 0
            }}
          />
          <span className="text-[7px] text-slate-500">IS</span>
        </div>

        {/* Balance Sheet bar */}
        <div className="flex flex-col items-center gap-1.5">
          <motion.div
            className="w-3 bg-[var(--gold)] rounded-t"
            animate={
              shouldReduceMotion
                ? { height: 40 }
                : isHovered
                ? { height: 45 }
                : { height: sync ? 40 : 45 }
            }
            transition={{
              type: "spring",
              stiffness: 140,
              damping: 10,
              delay: 0.08
            }}
          />
          <span className="text-[7px] text-slate-500">BS</span>
        </div>

        {/* Cash Flow bar */}
        <div className="flex flex-col items-center gap-1.5">
          <motion.div
            className="w-3 bg-sky-500 rounded-t"
            animate={
              shouldReduceMotion
                ? { height: 40 }
                : isHovered
                ? { height: 45 }
                : { height: sync ? 40 : 30 }
            }
            transition={{
              type: "spring",
              stiffness: 140,
              damping: 10,
              delay: 0.16
            }}
          />
          <span className="text-[7px] text-slate-500">CF</span>
        </div>
      </div>
      <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-4">// THREE STATEMENT SYNC</span>
    </div>
  );
}
