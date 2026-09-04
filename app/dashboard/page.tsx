"use client";

import React, { useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from 'next/dynamic';
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { useTerminalStore, PanelType } from "@/store/useTerminalStore";

// Lazy loading feature modules with zero SSR for performance optimization
const IntelligenceHub = dynamic(() => import("@/components/features/IntelligenceHub"), { ssr: false });
const NewsFeed = dynamic(() => import("@/components/features/NewsFeed"), { ssr: false });
const ShariahScreening = dynamic(() => import("@/components/features/ShariahScreening"), { ssr: false });
const CustomModelBuilder = dynamic(() => import("@/components/features/CustomModelBuilder"), { ssr: false });
const MonteCarloPanel = dynamic(() => import("@/components/features/MonteCarloPanel"), { ssr: false });
const AcquisitionCostCalculator = dynamic(() => import("@/components/features/AcquisitionCostCalculator"), { ssr: false });
const AutoFinancialStatements = dynamic(() => import("@/components/features/AutoFinancialStatements"), { ssr: false });
const BIReportEngine = dynamic(() => import("@/components/features/BIReportEngine"), { ssr: false });
const DCFModel = dynamic(() => import("@/components/models/DCFModel"), { ssr: false });
const LBOModel = dynamic(() => import("@/components/models/LBOModel"), { ssr: false });
const ThreeStatementModel = dynamic(() => import("@/components/models/ThreeStatementModel"), { ssr: false });
const DDMModel = dynamic(() => import("@/components/models/DDMModel"), { ssr: false });
const QuickNPV = dynamic(() => import("@/components/features/QuickNPV"), { ssr: false });
const MergerAnalysis = dynamic(() => import("@/components/models/MergerAnalysis"), { ssr: false });
const WACCBuilder = dynamic(() => import("@/components/features/WACCBuilder"), { ssr: false });

function PanelContent() {
  const { activePanel, setPanel } = useTerminalStore();
  const searchParams = useSearchParams();

  useEffect(() => {
    const panelParam = searchParams.get("panel") as PanelType | null;
    if (panelParam && ["hub", "news", "shariah", "custom_model", "monte_carlo", "acquisition_cost", "auto_statements", "bi_report", "DCF", "LBO", "FS", "ddm", "npv_irr", "merger_analysis", "wacc"].includes(panelParam)) {
      setPanel(panelParam);
    }
  }, [searchParams, setPanel]);

  const renderPanel = () => {
    switch (activePanel) {
      case "news":             return <NewsFeed />;
      case "shariah":          return <ShariahScreening />;
      case "custom_model":     return <CustomModelBuilder />;
      case "monte_carlo":      return <MonteCarloPanel />;
      case "acquisition_cost": return <AcquisitionCostCalculator />;
      case "auto_statements":  return <AutoFinancialStatements />;
      case "bi_report":        return <BIReportEngine />;
      case "DCF":              return <DCFModel />;
      case "LBO":              return <LBOModel />;
      case "FS":               return <ThreeStatementModel />;
      case "ddm":              return <DDMModel />;
      case "npv_irr":          return <QuickNPV />;
      case "merger_analysis":  return <MergerAnalysis />;
      case "wacc":             return <WACCBuilder />;
      case "hub":
      default:
        return <IntelligenceHub />;
    }
  };

  return (
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
  );
}

function TerminalSkeleton() {
  return (
    <div className="space-y-6 animate-pulse font-sans">
      <div className="h-10 bg-white border border-[#E2E8F0] rounded-lg w-full" />
      <div className="h-36 bg-white border border-[#E2E8F0] rounded-lg w-full" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-44 bg-white border border-[#E2E8F0] rounded-lg" />
        <div className="h-44 bg-white border border-[#E2E8F0] rounded-lg" />
        <div className="h-44 bg-white border border-[#E2E8F0] rounded-lg" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { language } = useTerminalStore();
  const isAr = language === 'ar';

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
          <Suspense fallback={<TerminalSkeleton />}>
            <PanelContent />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

