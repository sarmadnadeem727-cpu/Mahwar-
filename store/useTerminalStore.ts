import { create } from "zustand";

export type Currency = 'SAR' | 'AED' | 'KWD' | 'BHD' | 'OMR' | 'QAR' | 'USD';
export type Language = 'en' | 'ar';
export type PanelType = 
  | "hub" 
  | "live_market"
  | "technical"
  | "research" 
  | "shariah" 
  | "screener"
  | "dividends" 
  | "ownership" 
  | "calendar" 
  | "bi_report"
  | "DCF" 
  | "LBO" 
  | "FS"
  | "gcc_map";

interface TerminalState {
  activeTicker: string;
  activePanel: PanelType;
  isLoading: boolean;
  globalError: string | null;
  
  language: Language;
  currency: Currency;
  searchQuery: string;

  setTicker: (ticker: string) => void;
  setPanel: (panel: PanelType) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLanguage: (lang: Language) => void;
  setCurrency: (currency: Currency) => void;
  setSearchQuery: (query: string) => void;
}

export const useTerminalStore = create<TerminalState>((set) => ({
  activeTicker: "2222.SR", // Default Saudi Aramco
  activePanel: "hub",
  isLoading: false,
  globalError: null,
  
  language: "en",
  currency: "SAR",
  searchQuery: "",

  setTicker: (ticker) => {
    if (!ticker) return;
    let formatted = ticker.toUpperCase().trim();
    if (/^\d{4}$/.test(formatted)) {
      formatted = `${formatted}.SR`;
    }
    set({ activeTicker: formatted, globalError: null });
  },
  
  setPanel: (activePanel) => set({ activePanel }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (globalError) => set({ globalError }),
  setLanguage: (language) => set({ language }),
  setCurrency: (currency) => set({ currency }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
