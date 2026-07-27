"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3, Layers, Activity, Sparkles, ShieldCheck, Grid3X3, Globe, Percent, Calendar, Columns, Users, LineChart
} from "lucide-react";
import dynamic from 'next/dynamic';
import { TickerSearch } from "@/components/features/TickerSearch";
import { MetricCards } from "@/components/features/MetricCards";
import { HistoricalChart } from "@/components/features/HistoricalChart";
import { useTerminalStore, type Currency } from "@/store/useTerminalStore";
import MahwarLogo from "@/components/ui/MahwarLogo";

// Lazy loading models with zero SSR for weight optimization
const DCFModel = dynamic(() => import("@/components/models/DCFModel").then((mod) => ({ default: mod.DCFModel })), { ssr: false });
const LBOModel = dynamic(() => import("@/components/models/LBOModel").then((mod) => ({ default: mod.LBOModel })), { ssr: false });
const ThreeStatementModel = dynamic(() => import("@/components/models/ThreeStatementModel").then((mod) => ({ default: mod.ThreeStatementModel })), { ssr: false });

const AIResearch = dynamic(() => import("@/components/features/AIResearch"), { ssr: false });
const ShariahScreening = dynamic(() => import("@/components/features/ShariahScreening"), { ssr: false });
const DividendAnalysis = dynamic(() => import("@/components/features/DividendAnalysis"), { ssr: false });
const EconomicCalendar = dynamic(() => import("@/components/features/EconomicCalendar"), { ssr: false });
const OwnershipDetails = dynamic(() => import("@/components/features/OwnershipDetails"), { ssr: false });
const TechnicalCharts = dynamic(() => import("@/components/features/TechnicalCharts"), { ssr: false });

type Panel = "hub" | "DCF" | "LBO" | "FS" | "research" | "shariah" | "dividends" | "calendar" | "ownership" | "technical";

const NAV_SECTIONS = [
  {
    label: "Intelligence Hub",
    items: [
      { id: "hub" as Panel, icon: <Columns size={14} />, label: "Dashboard Hub" },
    ],
  },
  {
    label: "Sovereign Models",
    items: [
      { id: "DCF" as Panel, icon: <BarChart3 size={14} />, label: "DCF Engine" },
      { id: "LBO" as Panel, icon: <Layers size={14} />, label: "LBO Analytics" },
      { id: "FS" as Panel, icon: <Activity size={14} />, label: "3-Statement" },
    ],
  },
  {
    label: "Advanced Research",
    items: [
      { id: "research" as Panel, icon: <Sparkles size={14} />, label: "AI Research" },
      { id: "shariah" as Panel, icon: <ShieldCheck size={14} />, label: "Compliance Hub" },
      { id: "dividends" as Panel, icon: <Percent size={14} />, label: "Dividend Tracker" },
      { id: "ownership" as Panel, icon: <Users size={14} />, label: "Ownership Details" },
      { id: "technical" as Panel, icon: <LineChart size={14} />, label: "Technical Charts" },
      { id: "calendar" as Panel, icon: <Calendar size={14} />, label: "Economic Calendar" },
    ],
  },
];

export default function DashboardPage() {
  const [panel, setPanel] = useState<Panel>("hub");
  const { language, setLanguage, currency, setCurrency } = useTerminalStore();
  const isAr = language === 'ar';

  const renderContent = () => {
    switch (panel) {
      case "DCF": return <DCFModel />;
      case "LBO": return <LBOModel />;
      case "FS":  return <ThreeStatementModel />;
      case "research": return <AIResearch />;
      case "shariah": return <ShariahScreening />;
      case "dividends": return <DividendAnalysis />;
      case "calendar": return <EconomicCalendar />;
      case "ownership": return <OwnershipDetails />;
      case "technical": return <TechnicalCharts />;
      case "hub":
      default: return (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-8"
        >
          <MetricCards />
          
          <div className="grid grid-cols-12 gap-6">
            <HistoricalChart />
            
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
              <div className="p-6 bg-[#0a0a0a]/50 border border-white/10 rounded-xl backdrop-blur-xl mb-2">
                <h2 className="text-zinc-50 font-mono text-sm uppercase tracking-widest font-bold mb-2">Institutional Models</h2>
                <p className="text-zinc-500 text-xs leading-relaxed">Instantly project DCF and LBO valuations using real-time SEC data bindings.</p>
              </div>
              
              {NAV_SECTIONS[1].items.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => setPanel(item.id)}
                  className="bg-[#0a0a0a]/50 border border-white/10 p-5 cursor-pointer hover:bg-white/5 transition-all rounded-xl backdrop-blur-xl flex items-center gap-4 group hover:scale-[0.98]"
                >
                  <div className="text-zinc-500 group-hover:text-zinc-50 transition-colors p-3 bg-white/5 rounded-lg border border-white/10">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-zinc-50 font-mono font-bold uppercase tracking-widest text-xs mb-1">{item.label}</h3>
                    <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-mono">Launch Engine &rarr;</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      );
    }
  };

  return (
    <div className={`flex min-h-screen bg-zinc-950 selection:bg-zinc-800 text-zinc-300 ${isAr ? 'font-arabic' : ''}`} dir={isAr ? "rtl" : "ltr"}>
      {/* SIDEBAR */}
      <aside className="w-72 min-w-72 bg-[#0a0a0a] border-r border-white/10 flex flex-col sticky top-0 h-screen z-30">
        <div className="p-8 border-b border-white/10 flex flex-col items-center gap-4">
          <MahwarLogo size={60} animate={false} />
          <div className="text-center">
            <div className="font-mono text-xl font-bold tracking-[0.2em] uppercase text-zinc-50">Mahwar</div>
            <div className="text-[10px] text-zinc-500 font-bold tracking-[0.1em] uppercase">GCC TERMINAL v2.1</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-8 mt-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <div className="px-4 mb-3 text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em]">{section.label}</div>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = panel === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setPanel(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold transition-all rounded-lg ${
                        active ? "bg-white/10 text-zinc-50" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-6 border-t border-white/10">
          <div className="text-[9px] text-zinc-500 font-mono mb-2 uppercase select-none">Authored By</div>
          <div className="text-[11px] font-bold text-zinc-400">Muhammad Sarmad Nadeem</div>
          <div className="text-[8px] text-zinc-600 font-mono mt-1 uppercase">© 2026 All Rights Reserved</div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0 bg-[url('/noise.png')] bg-repeat opacity-[0.99]">
        <header className="h-20 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center gap-12 flex-1">
            <div className="font-mono text-sm font-bold uppercase tracking-widest text-zinc-50">
              {panel === "hub" ? "Intelligence_Hub" : panel}
            </div>
            <div className="flex-1 max-w-xl">
              <TickerSearch />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <select 
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="bg-[#0a0a0a] border border-white/10 text-zinc-300 text-[11px] font-bold px-3 py-1.5 rounded focus:outline-none focus:border-zinc-500 cursor-pointer"
            >
              {['SAR', 'AED', 'KWD', 'BHD', 'OMR', 'QAR', 'USD'].map(cur => (
                <option key={cur} value={cur}>{cur}</option>
              ))}
            </select>

            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-2 px-4 py-1.5 bg-[#0a0a0a] border border-white/10 text-zinc-300 text-[11px] font-bold hover:bg-white/5 transition-colors uppercase tracking-widest rounded cursor-pointer"
            >
              <Globe size={12} />
              {language === 'ar' ? "English" : "العربية"}
            </button>
          </div>
        </header>

        <main className="flex-1 p-8 lg:p-10 overflow-y-auto relative z-10">
          <AnimatePresence mode="wait">
             <motion.div key={panel} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
               {renderContent()}
             </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
