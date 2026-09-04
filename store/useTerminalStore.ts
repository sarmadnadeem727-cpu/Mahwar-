import { create } from "zustand";

export type Currency = 'SAR' | 'AED' | 'KWD' | 'BHD' | 'OMR' | 'QAR' | 'USD';
export type Language = 'en' | 'ar';
export type PanelType = 
  | "hub" 
  | "news"
  | "shariah" 
  | "screener" // Company Comparator Matrix
  | "custom_model" // Excel-Style Custom Model Builder
  | "monte_carlo" // Monte Carlo Valuation Simulation Engine
  | "acquisition_cost" // M&A Acquisition Cost Calculator
  | "auto_statements" // Guided Auto-Generated Financial Statements
  | "bi_report"
  | "DCF" 
  | "LBO" 
  | "FS";

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
  comparator?: { rows: any[]; computedAt: string };
  customModel?: { models: CustomModelSaved[]; activeModelId: string; computedAt: string };
  monteCarlo?: { inputs: any; outputs: any; computedAt: string };
  acquisitionCost?: { inputs: any; outputs: any; computedAt: string };
  autoStatements?: { inputs: any; outputs: any; computedAt: string };
}

interface TerminalState {
  activePanel: PanelType;
  isLoading: boolean;
  globalError: string | null;
  
  language: Language;
  currency: Currency;
  searchQuery: string;

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
}

export const useTerminalStore = create<TerminalState>((set) => ({
  activePanel: "hub",
  isLoading: false,
  globalError: null,
  
  language: "en",
  currency: "SAR",
  searchQuery: "",

  sessionAnalyses: {},
  updateSessionAnalysis: (key, data) => 
    set((state) => ({
      sessionAnalyses: {
        ...state.sessionAnalyses,
        [key]: data
      }
    })),
  clearSessionAnalyses: () => set({ sessionAnalyses: {} }),
  
  setPanel: (activePanel) => set({ activePanel }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (globalError) => set({ globalError }),
  setLanguage: (language) => set({ language }),
  setCurrency: (currency) => set({ currency }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));

