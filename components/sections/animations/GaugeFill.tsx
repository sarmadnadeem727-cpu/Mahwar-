"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function GaugeFill() {
  const shouldReduceMotion = useReducedMotion();
  const [irr, setIrr] = useState(24.5);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const interval = setInterval(() => {
      setIrr((prev) => {
        const diff = (Math.random() - 0.5) * 2;
        const next = Math.max(18, Math.min(32, prev + diff));
        return parseFloat(next.toFixed(1));
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [shouldReduceMotion]);

  // Radius 40, circumference 2 * Math.PI * 40 = 251.2
  const circumference = 251.2;
  const strokeDashoffset = circumference - (irr / 40) * circumference;

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 font-mono select-none">
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 overflow-visible">
          {/* Background circle */}
          <circle
            cx="40"
            cy="40"
            r="35"
            className="stroke-white/5"
            strokeWidth="3"
            fill="transparent"
          />
          {/* Animated path */}
          <motion.circle
            cx="40"
            cy="40"
            r="35"
            stroke="var(--gold)"
            strokeWidth="3.5"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{
              type: "spring",
              stiffness: 80,
              damping: 15,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-sm font-bold text-white">{irr}%</span>
          <span className="text-[7px] text-slate-500 uppercase tracking-wider">IRR</span>
        </div>
      </div>
      <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-3">// LBO WATERFALL RETURN</span>
    </div>
  );
}
