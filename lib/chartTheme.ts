/**
 * Unified Recharts theme for the dark terminal. Values mirror the CSS tokens
 * in app/globals.css (Recharts needs literal colours for SVG fills).
 */
export const TERMINAL_CHART_THEME = {
  colors: {
    emerald: "#17a88a",
    emeraldLight: "#3ddbb4",
    emeraldDim: "rgba(23, 168, 138, 0.18)",
    emeraldGlow: "rgba(23, 168, 138, 0.35)",
    gold: "#d9b36e",
    goldDim: "rgba(217, 179, 110, 0.2)",

    charcoal: "#e8f1ed",
    charcoalLight: "#a7b9b2",

    slate: "#a7b9b2",
    slateLight: "#6d817a",
    slateDim: "rgba(158, 190, 180, 0.12)",
    grid: "rgba(158, 190, 180, 0.08)",

    positive: "#2ed08a",
    positiveDim: "rgba(46, 208, 138, 0.18)",
    negative: "#ff6b6b",
    negativeDim: "rgba(255, 107, 107, 0.18)",
    neutral: "#6d817a",

    sponsor: "#17a88a",
    management: "#d9b36e",
    debt: "#ff6b6b",
  },
  /** Ordered series palette for multi-line charts. */
  series: ["#17a88a", "#d9b36e", "#5ec8ff", "#c792ea", "#ff6b6b", "#3ddbb4"],
  axis: {
    stroke: "#6d817a",
    fontSize: 10,
    fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
    tickLine: false,
    axisLine: false,
  },
  grid: {
    strokeDasharray: "3 3",
    stroke: "rgba(158, 190, 180, 0.08)",
    vertical: false,
  },
  tooltipStyle: {
    backgroundColor: "#131e23",
    borderColor: "rgba(158, 190, 180, 0.26)",
    borderRadius: "6px",
    boxShadow: "0 20px 50px -20px rgba(0,0,0,0.9)",
    padding: "8px 12px",
    fontSize: "11px",
    fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
    color: "#e8f1ed",
  },
  tooltipLabelStyle: { color: "#a7b9b2", marginBottom: 4 },
  tooltipItemStyle: { color: "#e8f1ed" },
};

