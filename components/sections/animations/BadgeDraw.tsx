"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function BadgeDraw() {
  const shouldReduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<"loading" | "success">("loading");

  useEffect(() => {
    if (shouldReduceMotion) {
      setPhase("success");
      return;
    }

    const interval = setInterval(() => {
      setPhase("loading");
      const successTimeout = setTimeout(() => {
        setPhase("success");
      }, 1500);
      return () => clearTimeout(successTimeout);
    }, 4500);

    const initialTimeout = setTimeout(() => {
      setPhase("success");
    }, 1500);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, [shouldReduceMotion]);

  // Radius 18, circumference 2 * Math.PI * 18 = 113.1
  const circ = 113.1;

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 font-mono select-none">
      <div className="h-16 flex flex-col items-center justify-center relative w-full">
        <div className="w-10 h-10 relative flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 overflow-visible">
            {/* Background trace circle */}
            <circle
              cx="20"
              cy="20"
              r="18"
              fill="transparent"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="2"
            />
            {/* Staggered drawing circle */}
            <motion.circle
              cx="20"
              cy="20"
              r="18"
              fill="transparent"
              stroke={phase === "success" ? "var(--emerald)" : "var(--gold)"}
              strokeWidth="2.5"
              strokeDasharray={circ}
              animate={
                shouldReduceMotion
                  ? { strokeDashoffset: 0 }
                  : phase === "success"
                  ? { strokeDashoffset: 0 }
                  : { strokeDashoffset: [circ, 20] }
              }
              transition={{
                duration: 1.5,
                ease: "easeInOut"
              }}
            />
          </svg>

          {/* Inner checkmark draws in after circle draws */}
          {phase === "success" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3.5"
                  d="M5 13l4 4L19 7"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
              </svg>
            </div>
          )}
        </div>

        <span className={`text-[9px] font-bold uppercase tracking-widest mt-2 transition-colors duration-300 ${
          phase === "success" ? "text-emerald-400" : "text-[var(--gold)] animate-pulse"
        }`}>
          {phase === "success" ? "COMPLIANT" : "SCREENING..."}
        </span>
      </div>
      <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-3">// AAOIFI STANDARD NO. 21</span>
    </div>
  );
}
