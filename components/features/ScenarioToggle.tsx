"use client";

import React from "react";
import { TrendingUp, TrendingDown, Layers, Sliders } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";

export type ScenarioCase = "BASE" | "BULL" | "BEAR" | "CUSTOM";

export interface ScenarioValues {
  revGrowthDelta: number; // e.g. +3%
  ebitdaMarginDelta: number; // e.g. +3%
  waccDelta: number; // e.g. -0.5%
  terminalGrowthDelta: number; // e.g. +0.5%
}

interface ScenarioToggleProps {
  activeCase: ScenarioCase;
  onSelectCase: (c: ScenarioCase, values?: ScenarioValues) => void;
}

export default function ScenarioToggle({
  activeCase,
  onSelectCase,
}: ScenarioToggleProps) {
  const { language } = useTerminalStore();
  const isAr = language === "ar";

  const cases = [
    {
      id: "BASE" as ScenarioCase,
      label: isAr ? "الحالة الأساسية" : "Base Case",
      desc: isAr ? "افتراضات الإدارة والإجماع" : "Consensus Base Model",
      icon: <Layers size={14} className="text-slate-400" />,
      values: { revGrowthDelta: 0, ebitdaMarginDelta: 0, waccDelta: 0, terminalGrowthDelta: 0 },
    },
    {
      id: "BULL" as ScenarioCase,
      label: isAr ? "الحالة التفاؤلية" : "Bull Case",
      desc: isAr ? "نمو أعلى + خصم أقل" : "+3% Rev, +3% Margin, -0.5% WACC",
      icon: <TrendingUp size={14} className="text-emerald" />,
      values: { revGrowthDelta: 3.0, ebitdaMarginDelta: 3.0, waccDelta: -0.5, terminalGrowthDelta: 0.5 },
    },
    {
      id: "BEAR" as ScenarioCase,
      label: isAr ? "الحالة التحفظية" : "Bear Case",
      desc: isAr ? "نمو أقل + خصم أعلى" : "-3% Rev, -3% Margin, +1.0% WACC",
      icon: <TrendingDown size={14} className="text-rose-400" />,
      values: { revGrowthDelta: -3.0, ebitdaMarginDelta: -3.0, waccDelta: 1.0, terminalGrowthDelta: -0.5 },
    },
    {
      id: "CUSTOM" as ScenarioCase,
      label: isAr ? "سيناريو مخصص" : "Custom Case",
      desc: isAr ? "تعديل المدخلات يدوياً" : "User Assumption Overrides",
      icon: <Sliders size={14} className="text-sky-400" />,
      values: { revGrowthDelta: 0, ebitdaMarginDelta: 0, waccDelta: 0, terminalGrowthDelta: 0 },
    },
  ];

  return (
    <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] shadow-sm font-mono text-xs space-y-3">
      <div className="flex justify-between items-center pb-2 border-b border-[#E2E8F0]">
        <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
          {isAr ? "تبديل سيناريو التقييم" : "Model Scenario Switcher"}
        </span>
        <span className="text-emerald font-bold text-[10px] uppercase">
          {activeCase} ACTIVE
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {cases.map((c) => {
          const isActive = activeCase === c.id;
          return (
            <button
              key={c.id}
              onClick={() => onSelectCase(c.id, c.values)}
              className={`p-3 rounded-lg border transition-all text-left rtl:text-right cursor-pointer flex flex-col justify-between h-[75px] ${
                isActive
                  ? "bg-emerald-dim border-emerald-border text-slate-900 font-bold shadow-2xs"
                  : "bg-slate-50 border-[#E2E8F0] hover:border-slate-300 text-slate-700"
              }`}
            >
              <div className="flex justify-between items-center w-full">
                <span className="font-bold text-xs">{c.label}</span>
                {c.icon}
              </div>
              <span className="text-[10px] text-slate-500 truncate">{c.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
