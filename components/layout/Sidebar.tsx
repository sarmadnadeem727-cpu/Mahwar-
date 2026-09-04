"use client";

import React from "react";
import Link from "next/link";
import { 
  Columns, Newspaper, Sparkles, ShieldCheck, Grid3X3, BarChart3, Layers, FileSpreadsheet, FileText
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
      { id: "news", icon: <Newspaper size={15} />, labelKey: "panel_news" },
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
      { id: "shariah", icon: <ShieldCheck size={15} />, labelKey: "panel_shariah" },
      { id: "bi_report", icon: <FileText size={15} />, labelKey: "panel_bi_report" },
    ],
  },
];

export default function Sidebar() {
  const { activePanel, setPanel, language } = useTerminalStore();
  const isAr = language === 'ar';

  return (
    <aside className="w-[220px] min-w-[220px] bg-white border-r border-[#E2E8F0] flex flex-col h-screen sticky top-0 z-30 select-none no-print font-sans" dir={isAr ? "rtl" : "ltr"}>
      {/* BRAND LOGO HEADER - LINK TO LANDING PAGE */}
      <Link 
        href="/"
        className="p-4 border-b border-[#E2E8F0] flex items-center gap-3 bg-white cursor-pointer hover:bg-slate-50 transition-colors group"
      >
        <MahwarLogo size={32} animate={true} />
        <div className="flex flex-col">
          <span className="font-serif text-sm font-extrabold tracking-wider text-slate-900 group-hover:text-emerald transition-colors">
            MAHWAR
          </span>
          <span className="text-[9px] font-mono font-bold text-emerald tracking-widest uppercase">
            محور · SOVEREIGN
          </span>
        </div>
      </Link>

      {/* NAVIGATION ITEMS */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.labelKey}>
            <div className="px-3 mb-2 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
              {t(group.labelKey as any, language)}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = activePanel === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setPanel(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                      active
                        ? "bg-emerald-dim text-emerald border-l-2 border-emerald shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <span className={active ? "text-emerald" : "text-slate-400"}>
                      {item.icon}
                    </span>
                    <span className="truncate tracking-wide">
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
      <div className="p-3.5 border-t border-[#E2E8F0] bg-slate-50 space-y-2">
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-600">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald"></span>
          </span>
          <span className="font-bold text-emerald uppercase tracking-wider">
            {isAr ? "المحرك نشط" : "Engine Active"}
          </span>
        </div>

        <div className="text-[10px] font-mono text-slate-500 border-t border-[#E2E8F0] pt-1.5 flex justify-between">
          <span>{isAr ? "محطة عمل محور" : "Mahwar Workbench"}</span>
          <span className="text-slate-900 font-bold">v2.5</span>
        </div>
      </div>
    </aside>
  );
}
