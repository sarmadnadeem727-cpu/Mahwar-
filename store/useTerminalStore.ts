import { create } from "zustand";

export type Currency = 'SAR' | 'AED' | 'KWD' | 'BHD' | 'OMR' | 'QAR' | 'USD';
export type Language = 'en' | 'ar';
export type PanelType = 
  | "hub" 
  | "research" 
  | "shariah" 
  | "screener" // renamed/repurposed as Company Comparator
  | "bi_report"
  | "DCF" 
  | "LBO" 
  | "FS";

export interface SessionAnalyses {
  dcf?: { inputs: any; outputs: any; computedAt: string };
  lbo?: { inputs: any; outputs: any; computedAt: string };
  threeStatement?: { inputs: any; outputs: any; computedAt: string };
  shariah?: { inputs: any; outputs: any; computedAt: string };
  comparator?: { rows: any[]; computedAt: string };
  researchMemo?: { content: string; companyName: string; computedAt: string };
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

