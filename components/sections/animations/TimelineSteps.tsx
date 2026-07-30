"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Search, Database, FileText } from "lucide-react";

interface TimelineStepsProps {
  spotlight?: boolean;
}

export default function TimelineSteps({ spotlight = false }: TimelineStepsProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion) {
      setActiveStep(2);
      return;
    }

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 2500);

    return () => clearInterval(interval);
  }, [shouldReduceMotion]);

  const steps = [
    {
      icon: <Search size={14} />,
      labelEn: "Query Ticker",
      labelAr: "استعلام الرمز",
      descEn: "2222.SR selected",
      descAr: "تم اختيار ٢٢٢٢.SR"
    },
    {
      icon: <Database size={14} />,
      labelEn: "Fetch Financials",
      labelAr: "جلب القوائم",
      descEn: "GAAP/Zakat parsed",
      descAr: "تحليل المحاسبة والزكاة"
    },
    {
      icon: <FileText size={14} />,
      labelEn: "Stream Thesis",
      labelAr: "تدفق التقرير",
      descEn: "AI Memo generated",
      descAr: "تم توليد مذكرة الذكاء"
    }
  ];

  return (
    <div className={`flex flex-col h-full font-mono select-none items-center justify-center p-3 ${spotlight ? "max-w-md w-full" : ""}`}>
      <div className={`flex ${spotlight ? "flex-col md:flex-row gap-6 md:gap-4 items-center justify-between" : "flex-row gap-3 items-center"} w-full`}>
        {steps.map((step, idx) => {
          const isActive = activeStep === idx;
          const isDone = activeStep > idx;

          return (
            <React.Fragment key={idx}>
              {/* Step Card */}
              <div
                className={`p-2.5 rounded-lg border transition-all duration-300 flex items-center gap-2 text-[10px] ${
                  isActive
                    ? "border-[var(--emerald)] bg-[var(--emerald)]/10 text-white"
                    : isDone
                    ? "border-emerald-500/20 bg-emerald-950/5 text-emerald-500"
                    : "border-white/5 bg-[#0A0B0D] text-slate-500"
                }`}
              >
                <div className={`p-1 rounded bg-black/40 ${isActive ? "text-[var(--emerald)]" : ""}`}>
                  {step.icon}
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <span className="font-bold">{step.labelEn}</span>
                  <span className="text-[8px] opacity-75">{step.descEn}</span>
                </div>
              </div>

              {/* Connecting arrow/line */}
              {idx < 2 && !spotlight && (
                <div className="w-4 h-px bg-white/10 relative">
                  {isActive && (
                    <motion.div
                      layoutId="arrowGlow"
                      className="absolute inset-y-0 left-0 bg-[var(--emerald)]"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1.5, ease: "linear" }}
                    />
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-4">// PIPELINE STAGGER TIMELINE</span>
    </div>
  );
}
