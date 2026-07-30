"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function GaugeFill() {
  const shouldReduceMotion = useReducedMotion();
  const [irr, setIrr] = useState(24.5);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const interval = setInterval(() => {
      setIrr((prev) => {
        const diff = (Math.random() - 0.5) * 3;
        const next = Math.max(18, Math.min(35, prev + diff));
        return parseFloat(next.toFixed(1));
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [shouldReduceMotion]);

  // Radius 35, circumference 2 * Math.PI * 35 = 219.9
  const circumference = 219.9;
  const strokeDashoffset = circumference - (irr / 40) * circumference;

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 font-mono select-none">
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={shouldReduceMotion ? {} : { scale: 1.12 }}
        transition={{ type: "spring", stiffness: 350, damping: 12 }}
        className="relative w-20 h-20 flex items-center justify-center cursor-pointer"
      >
        <motion.svg 
          className="w-full h-full -rotate-90 overflow-visible"
          animate={shouldReduceMotion ? {} : { rotate: isHovered ? -120 : -90 }}
          transition={{ type: "spring", stiffness: 120, damping: 10 }}
        >
          {/* Background circle */}
          <circle
            cx="40"
            cy="40"
            r="35"
            className="stroke-white/5"
            strokeWidth="3.5"
            fill="transparent"
          />
          {/* Animated path */}
          <motion.circle
            cx="40"
            cy="40"
            r="35"
            stroke="var(--gold)"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{
              type: "spring",
              stiffness: 90,
              damping: 14,
            }}
          />
        </motion.svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-extrabold text-white">{irr}%</span>
          <span className="text-[7px] text-slate-500 uppercase tracking-widest">IRR</span>
        </div>
      </motion.div>
      <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-4">// LBO WATERFALL RETURN</span>
    </div>
  );
}
