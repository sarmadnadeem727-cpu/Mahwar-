"use client";

import React, { Suspense, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import StatusBar from "@/components/layout/StatusBar";
import MobileNav from "@/components/layout/MobileNav";
import Toasts from "@/components/ui/Toasts";
import { useTerminalStore, type PanelType, selectLanguage, selectActivePanel, selectSetPanel } from "@/store/useTerminalStore";
import { isPanelType } from "@/lib/registry";

function PanelSkeleton() {
  return (
    <div className="space-y-5 animate-pulse" aria-hidden="true">
      <div className="h-24 panel-data" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="h-44 panel-data" />
        <div className="h-44 panel-data" />
        <div className="h-44 panel-data" />
      </div>
      <div className="h-72 panel-data" />
    </div>
  );
}

const lazy = (loader: () => Promise<{ default: React.ComponentType }>) =>
  dynamic(loader, { ssr: false, loading: () => <PanelSkeleton /> });

// One entry per PanelType. The registry (lib/registry.ts) describes each of these;
// this map only says which component renders it.
const PANELS: Record<PanelType, React.ComponentType> = {
  hub: lazy(() => import("@/components/features/IntelligenceHub")),
  news: lazy(() => import("@/components/features/NewsFeed")),
  shariah: lazy(() => import("@/components/features/ShariahScreening")),
  custom_model: lazy(() => import("@/components/features/CustomModelBuilder")),
  monte_carlo: lazy(() => import("@/components/features/MonteCarloPanel")),
  acquisition_cost: lazy(() => import("@/components/features/AcquisitionCostCalculator")),
  auto_statements: lazy(() => import("@/components/features/AutoFinancialStatements")),
  bi_report: lazy(() => import("@/components/features/BIReportEngine")),
  DCF: lazy(() => import("@/components/models/DCFModel")),
  LBO: lazy(() => import("@/components/models/LBOModel")),
  FS: lazy(() => import("@/components/models/ThreeStatementModel")),
  ddm: lazy(() => import("@/components/models/DDMModel")),
  npv_irr: lazy(() => import("@/components/features/QuickNPV")),
  merger_analysis: lazy(() => import("@/components/models/MergerAnalysis")),
  wacc: lazy(() => import("@/components/features/WACCBuilder")),
  operations_hub: lazy(() => import("@/components/operations/OperationsHub")),
  ccc: lazy(() => import("@/components/operations/CashConversionCycle")),
  wc_financing: lazy(() => import("@/components/operations/WorkingCapitalFinancing")),
  eoq: lazy(() => import("@/components/operations/EconomicOrderQuantity")),
  safety_stock: lazy(() => import("@/components/operations/SafetyStockCalculator")),
  abc_xyz: lazy(() => import("@/components/operations/AbcXyzClassification")),
  demand_forecast: lazy(() => import("@/components/operations/DemandForecasting")),
  sop_worksheet: lazy(() => import("@/components/operations/SopWorksheet")),
  landed_cost: lazy(() => import("@/components/operations/LandedCostCalculator")),
  tco: lazy(() => import("@/components/operations/TcoCalculator")),
  supplier_scorecard: lazy(() => import("@/components/operations/SupplierScorecard")),
  facility_location: lazy(() => import("@/components/operations/FacilityLocation")),
  sukuk: lazy(() => import("@/components/engines/SukukPricer")),
  debt_schedule: lazy(() => import("@/components/engines/DebtSchedule")),
  breakeven: lazy(() => import("@/components/engines/BreakevenAnalysis")),
  newsvendor: lazy(() => import("@/components/engines/NewsvendorModel")),
  bullwhip: lazy(() => import("@/components/engines/BullwhipSimulator")),
  transport_mode: lazy(() => import("@/components/engines/TransportModeCompare")),
  network_map: lazy(() => import("@/components/engines/CorridorPlanner")),
  // v5
  console: lazy(() => import("@/components/engines/ConsolePanel")),
  comps: lazy(() => import("@/components/engines/CompsAnalysis")),
  zscore: lazy(() => import("@/components/engines/AltmanZScore")),
  ratios: lazy(() => import("@/components/engines/RatioAnalysis")),
  cash13: lazy(() => import("@/components/engines/Cash13Forecast")),
  fx_hedge: lazy(() => import("@/components/engines/FxHedge")),
  capital_rationing: lazy(() => import("@/components/engines/CapitalRationing")),
  mrp: lazy(() => import("@/components/engines/MrpPlanner")),
  scor_kpi: lazy(() => import("@/components/engines/ScorScorecard")),
  flow: lazy(() => import("@/components/engines/FlowAnalytics")),
  warehouse: lazy(() => import("@/components/engines/WarehousePlanner")),
  make_buy: lazy(() => import("@/components/engines/MakeVsBuy")),
  supplier_risk: lazy(() => import("@/components/engines/SupplierRisk")),
  quantity_discount: lazy(() => import("@/components/engines/QuantityDiscount")),
};

function PanelContent() {
  const activePanel = useTerminalStore(selectActivePanel);
  const setPanel = useTerminalStore(selectSetPanel);
  const searchParams = useSearchParams();
  // The first panel is mounted only after the deep link has been applied. Mounting the
  // hub and swapping it out mid-entrance left AnimatePresence (mode="wait") waiting for
  // an exit that never finished, so /dashboard?panel=… showed an empty workspace.
  const [ready, setReady] = useState(false);

  // Deep links: /dashboard?panel=eoq
  useEffect(() => {
    const param = searchParams.get("panel");
    if (isPanelType(param) && param !== activePanel) setPanel(param);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Keep the URL in sync so the browser back button and sharing work.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("panel") !== activePanel) {
      url.searchParams.set("panel", activePanel);
      window.history.replaceState(null, "", url.toString());
    }
  }, [activePanel]);

  const Panel = PANELS[activePanel] ?? PANELS.hub;
  if (!ready) return <PanelSkeleton />;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={activePanel}
        initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        <Panel />
      </motion.div>
    </AnimatePresence>
  );
}

export default function DashboardPage() {
  const language = useTerminalStore(selectLanguage);
  const isAr = language === "ar";

  return (
    <div
      className={`flex h-[100dvh] bg-ink-1 text-fg overflow-hidden ${isAr ? "font-arabic" : "font-sans"}`}
      dir={isAr ? "rtl" : "ltr"}
    >
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="aurora aurora--dashboard" aria-hidden="true" />
        <TopBar />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8 pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-8 bg-ink-1/80 grain relative">
          <div className="relative max-w-[1600px] mx-auto">
            <Suspense fallback={<PanelSkeleton />}>
              <PanelContent />
            </Suspense>
          </div>
        </main>
        <StatusBar />
        <MobileNav />
      </div>
      <Toasts />
    </div>
  );
}

