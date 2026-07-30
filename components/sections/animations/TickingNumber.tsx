"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function TickingNumber() {
  const shouldReduceMotion = useReducedMotion();
  const [val, setVal] = useState(48.2);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const interval = setInterval(() => {
      setVal((prev) => {
        const diff = (Math.random() - 0.5) * 1.5;
        const next = Math.max(40, Math.min(60, prev + diff));
        return parseFloat(next.toFixed(1));
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [shouldReduceMotion]);

  // Small looping sparkline data
  const points = "10,50 30,45 50,48 70,35 90,40 110,25 130,30 150,15 170,22 190,10";

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 font-mono select-none">
      <div className="text-2xl font-bold text-[var(--gold)] mb-2 tracking-wider">
        SAR {val}
      </div>
      <div className="w-full max-w-[180px] h-[40px] flex items-center justify-center">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 200 60">
          <motion.polyline
            fill="none"
            stroke="var(--emerald)"
            strokeWidth="1.5"
            points={points}
            initial={shouldReduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
            animate={shouldReduceMotion ? {} : { pathLength: 1 }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          {/* Subtle dots */}
          <circle cx="10" cy="50" r="2" fill="var(--emerald)" />
          <circle cx="190" cy="10" r="2" fill="var(--emerald)" />
        </svg>
      </div>
      <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-2">// INTRINSIC VALUE MODEL</span>
    </div>
  );
}
