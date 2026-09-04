"use client";

import React, { ReactNode } from "react";
import { TrendingUp, TrendingDown, Layers, Sliders } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";

export type ScenarioCase = "BASE" | "BULL" | "BEAR" | "CUSTOM" | string;

export interface ScenarioDefinition<T = Record<string, number>> {
  id: ScenarioCase;
  label: string;
  labelAr: string;
  desc: string;
  descAr: string;
  iconType: "base" | "bull" | "bear" | "custom";
  values: T;
}

interface ScenarioToggleProps<T = Record<string, number>> {
  activeCase: ScenarioCase;
  scenarios: ScenarioDefinition<T>[];
  onSelectCase: (c: ScenarioCase, values?: T) => void;
  title?: string;
  titleAr?: string;
}

export default function ScenarioToggle<T>({
  activeCase,
  scenarios,
  onSelectCase,
  title = "Model Scenario Switcher",
  titleAr = "تبديل سيناريو التقييم",
}: ScenarioToggleProps<T>) {
  const { language } = useTerminalStore();
  const isAr = language === "ar";

  const getIcon = (type: "base" | "bull" | "bear" | "custom") => {
    switch (type) {
      case "bull": return <TrendingUp size={14} className="text-emerald" />;
      case "bear": return <TrendingDown size={14} className="text-rose-400" />;
      case "custom": return <Sliders size={14} className="text-sky-400" />;
      case "base": 
      default:
        return <Layers size={14} className="text-slate-400" />;
    }
  };

  return (
    <div className="panel-input p-4 font-mono text-xs space-y-3" dir={isAr ? "rtl" : "ltr"}>
      <div className="flex justify-between items-center pb-2 border-b border-[#E2E8F0]">
        <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
          {isAr ? titleAr : title}
        </span>
        <span className="text-emerald font-bold text-[10px] uppercase">
          {activeCase} ACTIVE
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {scenarios.map((c) => {
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
                <span className="font-bold text-xs">{isAr ? c.labelAr : c.label}</span>
                {getIcon(c.iconType)}
              </div>
              <span className="text-[10px] text-slate-500 truncate">{isAr ? c.descAr : c.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
