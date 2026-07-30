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

  // Two organic curves for morphing animations
  const pathA = "M 10 40 Q 50 10, 100 40 T 190 20";
  const pathB = "M 10 20 Q 60 50, 110 15 T 190 45";

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 font-mono select-none">
      <div className="text-2xl font-bold text-[var(--gold)] mb-2 tracking-wider">
        SAR {val}
      </div>
      <div className="w-full max-w-[180px] h-[40px] flex items-center justify-center relative">
        {/* Morphing grid wave background */}
        <svg className="w-full h-full overflow-visible" viewBox="0 0 200 60">
          <motion.path
            fill="none"
            stroke="var(--emerald)"
            strokeWidth="1.5"
            initial={{ d: pathA }}
            animate={
              shouldReduceMotion
                ? {}
                : { d: [pathA, pathB, pathA] }
            }
            transition={
              shouldReduceMotion
                ? {}
                : {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
            }
          />
          {/* Subtle dots */}
          <circle cx="10" cy="40" r="2.5" fill="var(--emerald)" />
          <circle cx="190" cy="20" r="2.5" fill="var(--emerald)" />
        </svg>
      </div>
      <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-3">// INTRINSIC VALUE MODEL</span>
    </div>
  );
}
