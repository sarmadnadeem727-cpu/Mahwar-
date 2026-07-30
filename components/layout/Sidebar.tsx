"use client";

import React from "react";
import { 
  Columns, Activity, LineChart, Sparkles, ShieldCheck, Grid3X3, 
  Percent, Users, Calendar, BarChart3, Layers, FileSpreadsheet, Compass, FileText
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
      { id: "live_market", icon: <Activity size={15} />, labelKey: "panel_live_market" },
      { id: "technical", icon: <LineChart size={15} />, labelKey: "panel_technical" },
    ],
  },
  {
    labelKey: "nav_research",
    items: [
      { id: "research", icon: <Sparkles size={15} />, labelKey: "panel_ai_research" },
      { id: "shariah", icon: <ShieldCheck size={15} />, labelKey: "panel_shariah" },
      { id: "screener", icon: <Grid3X3 size={15} />, labelKey: "panel_screener" },
      { id: "dividends", icon: <Percent size={15} />, labelKey: "panel_dividends" },
      { id: "ownership", icon: <Users size={15} />, labelKey: "panel_ownership" },
      { id: "calendar", icon: <Calendar size={15} />, labelKey: "panel_calendar" },
      { id: "bi_report", icon: <FileText size={15} />, labelKey: "panel_bi_report" },
    ],
  },
  {
    labelKey: "nav_models",
    items: [
      { id: "DCF", icon: <BarChart3 size={15} />, labelKey: "panel_dcf" },
      { id: "LBO", icon: <Layers size={15} />, labelKey: "panel_lbo" },
      { id: "FS", icon: <FileSpreadsheet size={15} />, labelKey: "panel_three_statement" },
      { id: "gcc_map", icon: <Compass size={15} />, labelKey: "panel_gcc_map" },
    ],
  },
];

export default function Sidebar() {
  const { activePanel, setPanel, language } = useTerminalStore();
  const isAr = language === 'ar';

  return (
    <aside className="w-[220px] min-w-[220px] bg-[#0F1113] border-r border-white/10 flex flex-col h-screen sticky top-0 z-30 select-none" dir={isAr ? "rtl" : "ltr"}>
      {/* BRAND LOGO HEADER */}
      <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-[#0A0B0D]">
        <MahwarLogo size={32} animate={true} />
        <div className="flex flex-col">
          <span className="font-mono text-sm font-extrabold tracking-[0.2em] text-white">
            MAHWAR
          </span>
          <span className="text-[9px] font-bold text-[var(--gold)] tracking-widest uppercase">
            محور · GCC v2.5
          </span>
        </div>
      </div>

      {/* NAVIGATION ITEMS */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.labelKey}>
            <div className="px-3 mb-2 text-[9px] font-mono font-bold text-slate-400 uppercase tracking-[0.15em]">
              {t(group.labelKey as any, language)}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = activePanel === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setPanel(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      active
                        ? "bg-[var(--emerald)]/15 text-[var(--emerald)] border-l-2 border-[var(--emerald)] font-bold shadow-sm"
                        : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                    }`}
                  >
                    <span className={active ? "text-[var(--emerald)]" : "text-slate-400"}>
                      {item.icon}
                    </span>
                    <span className="truncate">
                      {t(item.labelKey as any, language)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* TADAWUL LIVE STATUS BAR */}
      <div className="p-3 border-t border-white/10 bg-[#0A0B0D] space-y-2">
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--pos)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--pos)]"></span>
          </span>
          <span className="font-bold text-[var(--pos)] uppercase tracking-wider">
            {t("market_status_open", language)}
          </span>
        </div>

        <div className="text-[9px] font-mono text-slate-400 border-t border-white/5 pt-1.5 flex justify-between">
          <span>TASI Live</span>
          <span className="text-white font-bold">10:00–15:00 AST</span>
        </div>
      </div>
    </aside>
  );
}
