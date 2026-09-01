/**
 * Mahwar Sovereign Financial Terminal - Unified Chart Design System
 * Institutional color mapping, axis formatting, and tooltip design for Recharts.
 */

export const TERMINAL_CHART_THEME = {
  colors: {
    emerald: "#0E7C69",
    emeraldLight: "#12A189",
    emeraldDim: "rgba(14, 124, 105, 0.12)",
    emeraldGlow: "rgba(14, 124, 105, 0.25)",
    
    charcoal: "#171717",
    charcoalLight: "#262626",
    
    slate: "#64748B",
    slateLight: "#94A3B8",
    slateDim: "#E2E8F0",
    grid: "rgba(0, 0, 0, 0.06)",
    
    positive: "#16A34A",
    positiveDim: "rgba(22, 163, 74, 0.12)",
    negative: "#DC2626",
    negativeDim: "rgba(220, 38, 38, 0.12)",
    neutral: "#64748B",
    
    sponsor: "#0E7C69",
    management: "#64748B",
    debt: "#DC2626",
  },
  axis: {
    stroke: "#94A3B8",
    fontSize: 10,
    fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
    tickLine: false,
    axisLine: false,
  },
  grid: {
    strokeDasharray: "3 3",
    stroke: "rgba(0, 0, 0, 0.06)",
    vertical: false,
  },
  tooltipStyle: {
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(0, 0, 0, 0.12)",
    borderRadius: "8px",
    boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.08)",
    padding: "8px 12px",
    fontSize: "11px",
    fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
    color: "#171717",
  }
};
