"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Columns, Newspaper, ShieldCheck, BarChart3, Layers, 
  FileSpreadsheet, FileText, Table, Dices, Calculator, 
  FileCheck, Pin, PinOff, ChevronRight, ChevronLeft, Sparkles,
  Coins, Handshake, Activity
} from "lucide-react";
import { useTerminalStore, PanelType } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import MahwarLogo from "@/components/ui/MahwarLogo";

interface NavGroup {
  labelKey: string;
  items: {
    id: PanelType;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    labelKey: string;
    tag?: string;
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    labelKey: "nav_platform",
    items: [
      { id: "hub", icon: Columns, labelKey: "panel_hub", tag: "HUB" },
      { id: "news", icon: Newspaper, labelKey: "panel_news", tag: "LIVE" },
    ],
  },
  {
    labelKey: "nav_models",
    items: [
      { id: "DCF", icon: BarChart3, labelKey: "panel_dcf", tag: "VALUATION" },
      { id: "ddm", icon: Coins, labelKey: "panel_ddm", tag: "DIVIDEND" },
      { id: "npv_irr", icon: Calculator, labelKey: "panel_npv_irr", tag: "QUICK" },
      { id: "wacc", icon: Activity, labelKey: "panel_wacc", tag: "CAPM" },
      { id: "LBO", icon: Layers, labelKey: "panel_lbo", tag: "PE DEAL" },
      { id: "merger_analysis", icon: Handshake, labelKey: "panel_merger_analysis", tag: "M&A" },
      { id: "FS", icon: FileSpreadsheet, labelKey: "panel_three_statement", tag: "3S IFRS" },
      { id: "custom_model", icon: Table, labelKey: "panel_custom_model", tag: "BUILDER" },
      { id: "monte_carlo", icon: Dices, labelKey: "panel_monte_carlo", tag: "RISK" },
      { id: "acquisition_cost", icon: Calculator, labelKey: "panel_acquisition_cost", tag: "M&A" },
      { id: "auto_statements", icon: FileCheck, labelKey: "panel_auto_statements", tag: "AUTO" },
    ],
  },
  {
    labelKey: "nav_research",
    items: [
      { id: "shariah", icon: ShieldCheck, labelKey: "panel_shariah", tag: "AAOIFI" },
      { id: "bi_report", icon: FileText, labelKey: "panel_bi_report", tag: "SYNTHESIS" },
    ],
  },
];

export default function Sidebar() {
  const { activePanel, setPanel, language } = useTerminalStore();
  const isAr = language === "ar";
  
  // Hover & Pin State
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  // Sidebar is expanded if hovered OR pinned open
  const isExpanded = isHovered || isPinned;

  return (
    <motion.aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={false}
      animate={{ 
        width: isExpanded ? 290 : 76,
      }}
      transition={{ 
        type: "spring", 
        stiffness: 320, 
        damping: 32,
        mass: 0.8
      }}
      className={`relative bg-white border-r border-[#E2E8F0] flex flex-col h-screen sticky top-0 z-30 select-none no-print font-sans shadow-[2px_0_12px_rgba(0,0,0,0.03)] transition-colors duration-200 ${
        isExpanded ? "ring-1 ring-slate-200/50" : ""
      }`}
      dir={isAr ? "rtl" : "ltr"}
      aria-label="Sidebar Navigation"
    >
      {/* BRAND LOGO HEADER */}
      <div className="h-[68px] min-h-[68px] border-b border-[#E2E8F0] px-4 flex items-center justify-between overflow-hidden bg-white/80 backdrop-blur-xs">
        <Link 
          href="/" 
          className="flex items-center gap-3.5 group cursor-pointer min-w-0"
          title={isAr ? "العودة للرئيسية" : "Back to Home"}
        >
          <div className="shrink-0">
            <MahwarLogo size={36} animate={true} />
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: isAr ? 12 : -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isAr ? 12 : -12 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col whitespace-nowrap overflow-hidden"
              >
                <span className="font-serif text-base font-extrabold tracking-wider text-slate-900 group-hover:text-emerald transition-colors leading-tight">
                  MAHWAR
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald tracking-widest uppercase">
                  محور · TERMINAL
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

        {/* PIN TOGGLE BUTTON (VISIBLE WHEN EXPANDED) */}
        <AnimatePresence>
          {isExpanded && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsPinned(prev => !prev)}
              className={`p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer ${
                isPinned ? "text-emerald bg-emerald-50 hover:bg-emerald-100" : ""
              }`}
              title={isPinned ? (isAr ? "إلغاء التثبيت" : "Unpin Sidebar") : (isAr ? "تثبيت الشريط" : "Pin Sidebar Open")}
            >
              {isPinned ? <Pin size={15} className="fill-emerald" /> : <PinOff size={15} />}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* NAVIGATION ITEMS */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-4 space-y-6 scrollbar-thin">
        {NAV_GROUPS.map((group) => (
          <div key={group.labelKey} className="space-y-1">
            {/* GROUP TITLE */}
            <AnimatePresence>
              {isExpanded ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                  className="px-3 pb-1.5 text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider overflow-hidden whitespace-nowrap"
                >
                  {t(group.labelKey as any, language)}
                </motion.div>
              ) : (
                <div className="h-2 w-full flex items-center justify-center">
                  <div className="w-5 h-[1px] bg-slate-200 rounded" />
                </div>
              )}
            </AnimatePresence>

            {/* ITEMS LIST */}
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = activePanel === item.id;
                const IconComponent = item.icon;
                const label = t(item.labelKey as any, language);

                return (
                  <button
                    key={item.id}
                    onClick={() => setPanel(item.id)}
                    title={!isExpanded ? label : undefined}
                    className={`relative w-full flex items-center rounded-xl transition-all duration-150 cursor-pointer group ${
                      isExpanded 
                        ? "gap-3.5 px-3 py-2.5" 
                        : "justify-center h-12 w-full px-0"
                    } ${
                      active
                        ? "bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/80 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium"
                    }`}
                  >
                    {/* ACTIVE ACCENT PILL */}
                    {active && (
                      <motion.div
                        layoutId="active-indicator"
                        className={`absolute rounded-full bg-emerald ${
                          isExpanded 
                            ? isAr ? "right-0 top-2 bottom-2 w-1" : "left-0 top-2 bottom-2 w-1"
                            : "top-1.5 bottom-1.5 w-1 " + (isAr ? "right-0.5" : "left-0.5")
                        }`}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}

                    {/* ICON */}
                    <div className={`shrink-0 flex items-center justify-center transition-transform group-hover:scale-105 ${
                      active ? "text-emerald" : "text-slate-400 group-hover:text-slate-700"
                    }`}>
                      <IconComponent size={19} />
                    </div>

                    {/* LABEL & TAG WHEN EXPANDED */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, x: isAr ? 10 : -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: isAr ? 10 : -10 }}
                          transition={{ duration: 0.18 }}
                          className="flex-1 flex items-center justify-between min-w-0 overflow-hidden text-start"
                        >
                          <span className="text-sm font-semibold tracking-normal truncate text-slate-800 group-hover:text-slate-950">
                            {label}
                          </span>
                          
                          {item.tag && (
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded tracking-wider shrink-0 uppercase ml-2 ${
                              active 
                                ? "bg-emerald text-white" 
                                : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                            }`}>
                              {item.tag}
                            </span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* FOOTER WORKSPACE ENGINE STATUS */}
      <div className="border-t border-[#E2E8F0] bg-slate-50/90 p-3 overflow-hidden">
        {isExpanded ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald"></span>
                </span>
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  {isAr ? "المحرك متصل" : "ENGINE ONLINE"}
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/50">
                v2.5
              </span>
            </div>

            <div className="text-[11px] font-mono text-slate-500 border-t border-slate-200/70 pt-1.5 flex items-center justify-between">
              <span className="truncate">{isAr ? "محطة عمل محور" : "Mahwar Sovereign"}</span>
              <span className="text-slate-400 text-[10px]">60FPS</span>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-1">
            <div 
              className="relative flex h-3 w-3 cursor-pointer" 
              title={isAr ? "محرك محور نشط" : "Mahwar Engine Online"}
            >
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald"></span>
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
