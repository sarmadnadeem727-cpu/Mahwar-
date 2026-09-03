"use client";

import React from "react";
import { 
  Columns, Sparkles, ShieldCheck, Grid3X3, BarChart3, Layers, FileSpreadsheet, FileText
} from "lucide-react";
import { useTerminalStore, PanelType } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import MahwarLogo from "@/components/ui/MahwarLogo";

interface NavGroup {
  labelKey: string;
  items: {
    id: PanelType;
    icon: React.ReactNode;
    labelKey: string;
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    labelKey: "nav_platform",
    items: [
      { id: "hub", icon: <Columns size={15} />, labelKey: "panel_hub" },
      { id: "screener", icon: <Grid3X3 size={15} />, labelKey: "panel_screener" },
    ],
  },
  {
    labelKey: "nav_models",
    items: [
      { id: "DCF", icon: <BarChart3 size={15} />, labelKey: "panel_dcf" },
      { id: "LBO", icon: <Layers size={15} />, labelKey: "panel_lbo" },
      { id: "FS", icon: <FileSpreadsheet size={15} />, labelKey: "panel_three_statement" },
    ],
  },
  {
    labelKey: "nav_research",
    items: [
      { id: "research", icon: <Sparkles size={15} />, labelKey: "panel_ai_research" },
      { id: "shariah", icon: <ShieldCheck size={15} />, labelKey: "panel_shariah" },
      { id: "bi_report", icon: <FileText size={15} />, labelKey: "panel_bi_report" },
    ],
  },
];

export default function Sidebar() {
  const { activePanel, setPanel, language } = useTerminalStore();
  const isAr = language === 'ar';

  return (
    <aside className="w-[220px] min-w-[220px] bg-[#0B0E14] border-r border-[#1E293B] flex flex-col h-screen sticky top-0 z-30 select-none no-print font-mono" dir={isAr ? "rtl" : "ltr"}>
      {/* BRAND LOGO HEADER */}
      <div 
        onClick={() => setPanel("hub")}
        className="p-4 border-b border-[#1E293B] flex items-center gap-3 bg-[#121721] cursor-pointer hover:bg-[#161C28] transition-colors"
      >
        <MahwarLogo size={32} animate={true} />
        <div className="flex flex-col">
          <span className="font-mono text-sm font-extrabold tracking-[0.2em] text-white">
            MAHWAR
          </span>
          <span className="text-[9px] font-bold text-terminal-emerald tracking-widest uppercase">
            محور · CAD ENGINE
          </span>
        </div>
      </div>

      {/* NAVIGATION ITEMS */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.labelKey}>
            <div className="px-3 mb-2 text-[9px] font-mono font-bold text-slate-500 uppercase tracking-[0.18em]">
              {t(group.labelKey as any, language)}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = activePanel === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setPanel(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-mono font-bold rounded-sm transition-all cursor-pointer ${
                      active
                        ? "bg-terminal-emerald-dim text-terminal-emerald border-l-2 border-terminal-emerald shadow-md"
                        : "text-slate-400 hover:text-white hover:bg-[#121721]"
                    }`}
                  >
                    <span className={active ? "text-terminal-emerald" : "text-slate-500"}>
                      {item.icon}
                    </span>
                    <span className="truncate uppercase tracking-wider">
                      {t(item.labelKey as any, language)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* WORKSPACE STATUS BAR */}
      <div className="p-3 border-t border-[#1E293B] bg-[#121721] space-y-2">
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terminal-emerald opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-terminal-emerald"></span>
          </span>
          <span className="font-bold text-terminal-emerald uppercase tracking-wider">
            {isAr ? "المحرك تكتيكي" : "Engine Active"}
          </span>
        </div>

        <div className="text-[9px] font-mono text-slate-500 border-t border-[#1E293B] pt-1.5 flex justify-between">
          <span>{isAr ? "نمذجة تكتيكية" : "CAD Workbench"}</span>
          <span className="text-white font-bold">v2.5</span>
        </div>
      </div>
    </aside>
  );
}
