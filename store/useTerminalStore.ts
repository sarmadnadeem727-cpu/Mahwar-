import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Currency = 'SAR' | 'AED' | 'KWD' | 'BHD' | 'OMR' | 'QAR' | 'USD';
export type Language = 'en' | 'ar';
export type PanelType = 
  | "hub" 
  | "news"
  | "shariah" 
  | "custom_model" // Excel-Style Custom Model Builder
  | "monte_carlo" // Monte Carlo Valuation Simulation Engine
  | "acquisition_cost" // M&A Acquisition Cost Calculator
  | "auto_statements" // Guided Auto-Generated Financial Statements
  | "bi_report"
  | "DCF" 
  | "LBO" 
  | "FS"
  | "ddm"
  | "npv_irr"
  | "merger_analysis"
  | "wacc"
  // Operations & Supply Chain Tools Suite
  | "operations_hub"
  | "ccc"
  | "wc_financing"
  | "eoq"
  | "safety_stock"
  | "abc_xyz"
  | "demand_forecast"
  | "sop_worksheet"
  | "landed_cost"
  | "tco"
  | "supplier_scorecard"
  | "facility_location"
  // v3.1 engines
  | "sukuk"
  | "debt_schedule"
  | "breakeven"
  | "newsvendor"
  | "bullwhip"
  | "transport_mode"
  | "network_map";

export interface CustomModelRow {
  id: string;
  name: string;
  nameAr?: string;
  isFormula: boolean;
  formulaOrValue: string; // e.g. "1200" or "=Revenue - COGS"
  values: number[]; // 5-year values [yr1, yr2, yr3, yr4, yr5]
}

export interface CustomModelSaved {
  id: string;
  name: string;
  rows: CustomModelRow[];
  computedAt: string;
}

export interface SessionAnalyses {
  dcf?: { inputs: any; outputs: any; computedAt: string };
  lbo?: { inputs: any; outputs: any; computedAt: string };
  threeStatement?: { inputs: any; outputs: any; computedAt: string };
  shariah?: { inputs: any; outputs: any; computedAt: string };
  customModel?: { models: CustomModelSaved[]; activeModelId: string; computedAt: string };
  monteCarlo?: { inputs: any; outputs: any; computedAt: string };
  acquisitionCost?: { inputs: any; outputs: any; computedAt: string };
  autoStatements?: { inputs: any; outputs: any; computedAt: string };
  // Operations Suite session analyses
  ccc?: { inputs: any; outputs: any; computedAt: string };
  wcFinancing?: { inputs: any; outputs: any; computedAt: string };
  eoq?: { inputs: any; outputs: any; computedAt: string };
  safetyStock?: { inputs: any; outputs: any; computedAt: string };
  abcXyz?: { inputs: any; outputs: any; computedAt: string };
  demandForecast?: { inputs: any; outputs: any; computedAt: string };
  sopWorksheet?: { inputs: any; outputs: any; computedAt: string };
  landedCost?: { inputs: any; outputs: any; computedAt: string };
  tco?: { inputs: any; outputs: any; computedAt: string };
  supplierScorecard?: { inputs: any; outputs: any; computedAt: string };
  facilityLocation?: { inputs: any; outputs: any; computedAt: string };
  // v3.1 engines
  sukuk?: { inputs: any; outputs: any; computedAt: string };
  debtSchedule?: { inputs: any; outputs: any; computedAt: string };
  breakeven?: { inputs: any; outputs: any; computedAt: string };
  newsvendor?: { inputs: any; outputs: any; computedAt: string };
  bullwhip?: { inputs: any; outputs: any; computedAt: string };
  transportMode?: { inputs: any; outputs: any; computedAt: string };
  corridor?: { inputs: any; outputs: any; computedAt: string };
}

interface TerminalState {
  activePanel: PanelType;
  isLoading: boolean;
  globalError: string | null;
  
  language: Language;
  currency: Currency;
  searchQuery: string;
  isMobileMenuOpen: boolean;
  /** Most recently opened panels (newest first) — drives the hub activity strip. */
  recentPanels: PanelType[];
  sessionStartedAt: string;
  hasHydrated: boolean;

  // Session analyses store
  sessionAnalyses: SessionAnalyses;
  updateSessionAnalysis: <K extends keyof SessionAnalyses>(key: K, data: SessionAnalyses[K]) => void;
  clearSessionAnalyses: () => void;

  setPanel: (panel: PanelType) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLanguage: (lang: Language) => void;
  setCurrency: (currency: Currency) => void;
  setSearchQuery: (query: string) => void;
  setMobileMenuOpen: (isOpen: boolean) => void;
  setHasHydrated: (value: boolean) => void;
}

const STORAGE_KEY = "mahwar-terminal-v3";

export const useTerminalStore = create<TerminalState>()(
  persist(
    (set) => ({
      activePanel: "hub",
      isLoading: false,
      globalError: null,

      language: "en",
      currency: "SAR",
      searchQuery: "",
      isMobileMenuOpen: false,
      recentPanels: [],
      sessionStartedAt: new Date().toISOString(),
      hasHydrated: false,

      sessionAnalyses: {},
      updateSessionAnalysis: (key, data) =>
        set((state) => ({
          sessionAnalyses: { ...state.sessionAnalyses, [key]: data },
        })),
      clearSessionAnalyses: () => set({ sessionAnalyses: {}, sessionStartedAt: new Date().toISOString() }),

      setPanel: (activePanel) =>
        set((state) => ({
          activePanel,
          recentPanels: [activePanel, ...state.recentPanels.filter((p) => p !== activePanel)].slice(0, 8),
        })),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (globalError) => set({ globalError }),
      setLanguage: (language) => set({ language }),
      setCurrency: (currency) => set({ currency }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setMobileMenuOpen: (isMobileMenuOpen) => set({ isMobileMenuOpen }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Only durable workspace state is persisted; UI flags stay per-tab.
      partialize: (state) => ({
        language: state.language,
        currency: state.currency,
        sessionAnalyses: state.sessionAnalyses,
        recentPanels: state.recentPanels,
        sessionStartedAt: state.sessionStartedAt,
      }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    }
  )
);


