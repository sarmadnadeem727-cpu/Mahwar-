import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Currency = "SAR" | "AED" | "KWD" | "BHD" | "OMR" | "QAR" | "USD";
export type Language = "en" | "ar";
export type PanelType =
  | "hub"
  | "news"
  | "console"
  | "shariah"
  | "custom_model"
  | "monte_carlo"
  | "acquisition_cost"
  | "auto_statements"
  | "bi_report"
  | "DCF"
  | "LBO"
  | "FS"
  | "ddm"
  | "npv_irr"
  | "merger_analysis"
  | "wacc"
  // Operations & supply chain
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
  // v3.1 / v4 engines
  | "sukuk"
  | "debt_schedule"
  | "breakeven"
  | "newsvendor"
  | "bullwhip"
  | "transport_mode"
  | "network_map"
  // v5 finance
  | "comps"
  | "zscore"
  | "ratios"
  | "cash13"
  | "fx_hedge"
  | "capital_rationing"
  // v5 operations
  | "mrp"
  | "scor_kpi"
  | "flow"
  | "warehouse"
  | "make_buy"
  | "supplier_risk"
  | "quantity_discount";

export interface CustomModelRow {
  id: string;
  name: string;
  nameAr?: string;
  isFormula: boolean;
  formulaOrValue: string;
  values: number[];
}

export interface CustomModelSaved {
  id: string;
  name: string;
  rows: CustomModelRow[];
  computedAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SavedAnalysis = { inputs: any; outputs: any; computedAt: string };

export interface SessionAnalyses {
  dcf?: SavedAnalysis;
  lbo?: SavedAnalysis;
  threeStatement?: SavedAnalysis;
  shariah?: SavedAnalysis;
  customModel?: { models: CustomModelSaved[]; activeModelId: string; computedAt: string };
  monteCarlo?: SavedAnalysis;
  acquisitionCost?: SavedAnalysis;
  autoStatements?: SavedAnalysis;
  ccc?: SavedAnalysis;
  wcFinancing?: SavedAnalysis;
  eoq?: SavedAnalysis;
  safetyStock?: SavedAnalysis;
  abcXyz?: SavedAnalysis;
  demandForecast?: SavedAnalysis;
  sopWorksheet?: SavedAnalysis;
  landedCost?: SavedAnalysis;
  tco?: SavedAnalysis;
  supplierScorecard?: SavedAnalysis;
  facilityLocation?: SavedAnalysis;
  sukuk?: SavedAnalysis;
  debtSchedule?: SavedAnalysis;
  breakeven?: SavedAnalysis;
  newsvendor?: SavedAnalysis;
  bullwhip?: SavedAnalysis;
  transportMode?: SavedAnalysis;
  corridor?: SavedAnalysis;
  // v5
  comps?: SavedAnalysis;
  zscore?: SavedAnalysis;
  ratios?: SavedAnalysis;
  cash13?: SavedAnalysis;
  fxHedge?: SavedAnalysis;
  capitalRationing?: SavedAnalysis;
  mrp?: SavedAnalysis;
  scorKpi?: SavedAnalysis;
  flow?: SavedAnalysis;
  warehouse?: SavedAnalysis;
  makeBuy?: SavedAnalysis;
  supplierRisk?: SavedAnalysis;
  quantityDiscount?: SavedAnalysis;
}

export interface Toast { id: number; text: string; tone?: "ok" | "warn" | "err" }

export interface SessionFile {
  app: "mahwar";
  version: number;
  exportedAt: string;
  currency: Currency;
  language: Language;
  analyses: SessionAnalyses;
}

interface TerminalState {
  activePanel: PanelType;
  isLoading: boolean;
  globalError: string | null;

  language: Language;
  currency: Currency;
  searchQuery: string;
  isMobileMenuOpen: boolean;
  /** Most recently opened panels (newest first). */
  recentPanels: PanelType[];
  /** Command-line history (newest last), persisted. */
  commandHistory: string[];
  /** Console transcript for the CLI panel (not persisted). */
  consoleLog: { at: string; cmd: string; out: string; ok: boolean }[];
  sessionStartedAt: string;
  hasHydrated: boolean;
  toasts: Toast[];

  sessionAnalyses: SessionAnalyses;
  updateSessionAnalysis: <K extends keyof SessionAnalyses>(key: K, data: SessionAnalyses[K]) => void;
  removeSessionAnalysis: (key: keyof SessionAnalyses) => void;
  clearSessionAnalyses: () => void;
  exportSession: () => SessionFile;
  importSession: (file: SessionFile, mode?: "merge" | "replace") => number;

  setPanel: (panel: PanelType) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLanguage: (lang: Language) => void;
  setCurrency: (currency: Currency) => void;
  setSearchQuery: (query: string) => void;
  setMobileMenuOpen: (isOpen: boolean) => void;
  setHasHydrated: (value: boolean) => void;
  pushCommand: (cmd: string) => void;
  logConsole: (cmd: string, out: string, ok: boolean) => void;
  clearConsole: () => void;
  toast: (text: string, tone?: Toast["tone"]) => void;
  dismissToast: (id: number) => void;
}

const STORAGE_KEY = "mahwar-terminal-v5";
const LEGACY_KEYS = ["mahwar-terminal-v3"];
let toastSeq = 1;

export const useTerminalStore = create<TerminalState>()(
  persist(
    (set, get) => ({
      activePanel: "hub",
      isLoading: false,
      globalError: null,

      language: "en",
      currency: "SAR",
      searchQuery: "",
      isMobileMenuOpen: false,
      recentPanels: [],
      commandHistory: [],
      consoleLog: [],
      sessionStartedAt: new Date().toISOString(),
      hasHydrated: false,
      toasts: [],

      sessionAnalyses: {},
      updateSessionAnalysis: (key, data) =>
        set((state) => ({ sessionAnalyses: { ...state.sessionAnalyses, [key]: data } })),
      removeSessionAnalysis: (key) =>
        set((state) => {
          const next = { ...state.sessionAnalyses };
          delete next[key];
          return { sessionAnalyses: next };
        }),
      clearSessionAnalyses: () => set({ sessionAnalyses: {}, sessionStartedAt: new Date().toISOString() }),
      exportSession: () => {
        const s = get();
        return { app: "mahwar", version: 5, exportedAt: new Date().toISOString(), currency: s.currency, language: s.language, analyses: s.sessionAnalyses };
      },
      importSession: (file, mode = "merge") => {
        if (!file || file.app !== "mahwar" || typeof file.analyses !== "object") return 0;
        const incoming = file.analyses ?? {};
        set((state) => ({
          sessionAnalyses: mode === "replace" ? incoming : { ...state.sessionAnalyses, ...incoming },
          currency: file.currency ?? state.currency,
        }));
        return Object.keys(incoming).length;
      },

      setPanel: (activePanel) =>
        set((state) => ({
          activePanel,
          isMobileMenuOpen: false,
          recentPanels: [activePanel, ...state.recentPanels.filter((p) => p !== activePanel)].slice(0, 8),
        })),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (globalError) => set({ globalError }),
      setLanguage: (language) => set({ language }),
      setCurrency: (currency) => set({ currency }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setMobileMenuOpen: (isMobileMenuOpen) => set({ isMobileMenuOpen }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      pushCommand: (cmd) =>
        set((state) => ({ commandHistory: [...state.commandHistory.filter((c) => c !== cmd), cmd].slice(-50) })),
      logConsole: (cmd, out, ok) =>
        set((state) => ({ consoleLog: [...state.consoleLog, { at: new Date().toISOString(), cmd, out, ok }].slice(-200) })),
      clearConsole: () => set({ consoleLog: [] }),
      toast: (text, tone = "ok") => {
        const id = toastSeq++;
        set((state) => ({ toasts: [...state.toasts, { id, text, tone }].slice(-4) }));
        if (typeof window !== "undefined") window.setTimeout(() => get().dismissToast(id), 3200);
      },
      dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        language: state.language,
        currency: state.currency,
        sessionAnalyses: state.sessionAnalyses,
        recentPanels: state.recentPanels,
        commandHistory: state.commandHistory,
        sessionStartedAt: state.sessionStartedAt,
      }),
      // Pull a v3 session forward once, then forget it.
      migrate: (persisted) => persisted as TerminalState,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        try {
          if (state && Object.keys(state.sessionAnalyses).length === 0) {
            for (const key of LEGACY_KEYS) {
              const raw = localStorage.getItem(key);
              if (!raw) continue;
              const parsed = JSON.parse(raw) as { state?: Partial<TerminalState> };
              if (parsed.state?.sessionAnalyses) {
                useTerminalStore.setState({
                  sessionAnalyses: parsed.state.sessionAnalyses,
                  currency: parsed.state.currency ?? state.currency,
                  language: parsed.state.language ?? state.language,
                });
              }
              localStorage.removeItem(key);
            }
          }
        } catch { /* ignore corrupt legacy state */ }
      },
    }
  )
);

/** Narrow, stable selectors — use these in layout chrome to avoid re-rendering on every keystroke. */
export const selectLanguage = (s: TerminalState) => s.language;
export const selectCurrency = (s: TerminalState) => s.currency;
export const selectActivePanel = (s: TerminalState) => s.activePanel;
export const selectSetPanel = (s: TerminalState) => s.setPanel;
export const selectSavedCount = (s: TerminalState) => Object.keys(s.sessionAnalyses).length;
