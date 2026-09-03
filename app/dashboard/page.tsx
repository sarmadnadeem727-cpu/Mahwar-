"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from 'next/dynamic';
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { useTerminalStore } from "@/store/useTerminalStore";

// Lazy loading feature modules with zero SSR for performance optimization
const IntelligenceHub = dynamic(() => import("@/components/features/IntelligenceHub"), { ssr: false });
const NewsFeed = dynamic(() => import("@/components/features/NewsFeed"), { ssr: false });
const AIResearch = dynamic(() => import("@/components/features/AIResearch"), { ssr: false });
const ShariahScreening = dynamic(() => import("@/components/features/ShariahScreening"), { ssr: false });
const CompanyComparator = dynamic(() => import("@/components/features/CompanyComparator"), { ssr: false });
const BIReportEngine = dynamic(() => import("@/components/features/BIReportEngine"), { ssr: false });
const DCFModel = dynamic(() => import("@/components/models/DCFModel"), { ssr: false });
const LBOModel = dynamic(() => import("@/components/models/LBOModel"), { ssr: false });
const ThreeStatementModel = dynamic(() => import("@/components/models/ThreeStatementModel"), { ssr: false });

export default function DashboardPage() {
  const { activePanel, language } = useTerminalStore();
  const isAr = language === 'ar';

  const renderPanel = () => {
    switch (activePanel) {
      case "news":         return <NewsFeed />;
      case "research":     return <AIResearch />;
      case "shariah":      return <ShariahScreening />;
      case "screener":     return <CompanyComparator />;
      case "bi_report":    return <BIReportEngine />;
      case "DCF":          return <DCFModel />;
      case "LBO":          return <LBOModel />;
      case "FS":           return <ThreeStatementModel />;
      case "hub":
      default:
        return <IntelligenceHub />;
    }
  };

  return (
    <div 
      className={`flex h-screen bg-[#F8FAFC] text-slate-800 overflow-hidden font-sans selection:bg-emerald selection:text-white ${
        isAr ? 'font-arabic' : ''
      }`}
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* SIDEBAR NAVIGATION */}
      <Sidebar />

      {/* MAIN ENGINE CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#F8FAFC]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePanel}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {renderPanel()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
