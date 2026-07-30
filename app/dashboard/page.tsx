"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from 'next/dynamic';
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { useTerminalStore } from "@/store/useTerminalStore";

// Lazy loading feature modules with zero SSR for performance optimization
const IntelligenceHub = dynamic(() => import("@/components/features/IntelligenceHub"), { ssr: false });
const LiveMarket = dynamic(() => import("@/components/features/LiveMarket"), { ssr: false });
const TechnicalCharts = dynamic(() => import("@/components/features/TechnicalCharts"), { ssr: false });
const AIResearch = dynamic(() => import("@/components/features/AIResearch"), { ssr: false });
const ShariahScreening = dynamic(() => import("@/components/features/ShariahScreening"), { ssr: false });
const MarketScreener = dynamic(() => import("@/components/features/MarketScreener"), { ssr: false });
const DividendAnalysis = dynamic(() => import("@/components/features/DividendAnalysis"), { ssr: false });
const OwnershipDetails = dynamic(() => import("@/components/features/OwnershipDetails"), { ssr: false });
const EconomicCalendar = dynamic(() => import("@/components/features/EconomicCalendar"), { ssr: false });
const BIReportEngine = dynamic(() => import("@/components/features/BIReportEngine"), { ssr: false });
const DCFModel = dynamic(() => import("@/components/models/DCFModel"), { ssr: false });
const LBOModel = dynamic(() => import("@/components/models/LBOModel"), { ssr: false });
const ThreeStatementModel = dynamic(() => import("@/components/models/ThreeStatementModel"), { ssr: false });
const DashboardGCCMap = dynamic(() => import("@/components/features/DashboardGCCMap"), { ssr: false });

export default function DashboardPage() {
  const { activePanel, language } = useTerminalStore();
  const isAr = language === 'ar';

  const renderPanel = () => {
    switch (activePanel) {
      case "live_market": return <LiveMarket />;
      case "technical":   return <TechnicalCharts />;
      case "research":    return <AIResearch />;
      case "shariah":     return <ShariahScreening />;
      case "screener":    return <MarketScreener />;
      case "dividends":   return <DividendAnalysis />;
      case "ownership":   return <OwnershipDetails />;
      case "calendar":    return <EconomicCalendar />;
      case "bi_report":   return <BIReportEngine />;
      case "DCF":         return <DCFModel />;
      case "LBO":         return <LBOModel />;
      case "FS":          return <ThreeStatementModel />;
      case "gcc_map":     return <DashboardGCCMap />;
      case "hub":
      default:            return <IntelligenceHub />;
    }
  };

  return (
    <div 
      className={`flex min-h-screen bg-[#0A0B0D] text-slate-100 selection:bg-[var(--emerald)] selection:text-white ${
        isAr ? 'font-cairo' : ''
      }`}
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* FIXED 220px SIDEBAR */}
      <Sidebar />

      {/* MAIN TERMINAL CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0A0B0D]">
        {/* STICKY 64px TOPBAR */}
        <TopBar />

        {/* MAIN PANEL CONTENT AREA */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePanel}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {renderPanel()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
