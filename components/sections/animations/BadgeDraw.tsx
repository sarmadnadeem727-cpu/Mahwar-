"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function BadgeDraw() {
  const shouldReduceMotion = useReducedMotion();
  const [step, setStep] = useState<"loading" | "compliant">("loading");

  useEffect(() => {
    if (shouldReduceMotion) {
      setStep("compliant");
      return;
    }

    const interval = setInterval(() => {
      setStep("loading");
      const timeout = setTimeout(() => {
        setStep("compliant");
      }, 1500);
      return () => clearTimeout(timeout);
    }, 4500);

    // Initial trigger
    const initialTimeout = setTimeout(() => {
      setStep("compliant");
    }, 1500);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, [shouldReduceMotion]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 font-mono select-none">
      <div className="h-16 flex items-center justify-center relative">
        {step === "loading" ? (
          <div className="flex flex-col items-center space-y-2">
            <div className="w-5 h-5 border-2 border-[var(--gold)]/30 border-t-[var(--gold)] rounded-full animate-spin"></div>
            <span className="text-[10px] text-[var(--gold)] animate-pulse uppercase tracking-wider">Screening...</span>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center space-y-2"
          >
            <div className="w-8 h-8 rounded-full border border-emerald-500/30 bg-emerald-950/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M5 13l4 4L19 7"
                  initial={shouldReduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
                  animate={shouldReduceMotion ? {} : { pathLength: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </svg>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">COMPLIANT</span>
          </motion.div>
        )}
      </div>
      <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-3">// AAOIFI STANDARD NO. 21</span>
    </div>
  );
}
