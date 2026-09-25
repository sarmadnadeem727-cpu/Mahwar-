/**
 * Unified Recharts theme — follows the live theme.
 *
 * Every colour is a CSS variable declared in app/globals.css, so charts switch
 * with the light / dark toggle without re-rendering. SVG accepts `var(--x)`
 * for fill / stroke / stop-color, and inline tooltip styles are plain CSS.
 *
 * Only `cssToken()` resolves a variable to a literal — html2canvas needs real
 * colours for its `backgroundColor` option, so the three export sites call it
 * at click time and get the colour of whichever theme is on screen.
 *
 * The categorical palette deliberately contains no red: "negative" is a
 * meaning, not a category.
 */
export const TERMINAL_CHART_THEME = {
  colors: {
    emerald: "var(--emerald)",
    emeraldLight: "var(--emerald-light)",
    emeraldDeep: "var(--emerald-deep)",
    emeraldDim: "var(--emerald-dim)",
    emeraldGlow: "var(--emerald-border)",
    gold: "var(--gold)",
    goldDim: "var(--gold-dim)",
    navy: "var(--navy)",

    /** Surfaces — for tooltip backgrounds, chart cursors. */
    canvas: "var(--ink-1)",
    surface: "var(--ink-2)",
    surfaceRaised: "var(--ink-3)",

    /** Foreground text, brightest to dimmest. */
    fg: "var(--fg-1)",
    charcoal: "var(--fg-1)",
    charcoalLight: "var(--fg-2)",

    slate: "var(--fg-2)",
    slateLight: "var(--fg-3)",
    slateDim: "var(--line)",
    grid: "var(--line)",

    positive: "var(--pos)",
    positiveDim: "var(--pos-bg)",
    negative: "var(--neg)",
    negativeDim: "var(--neg-bg)",
    neutral: "var(--fg-3)",

    sponsor: "var(--emerald)",
    management: "var(--gold)",
    debt: "var(--neg)",
  },
  /** Ordered categorical palette: teal, gold, navy, teal-deep, warn, slate. */
  series: ["var(--emerald)", "var(--gold)", "var(--navy)", "var(--emerald-deep)", "var(--warn)", "var(--fg-3)"],
  axis: {
    stroke: "var(--fg-3)",
    fontSize: 10,
    fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
    tickLine: false,
    axisLine: false,
  },
  grid: {
    strokeDasharray: "3 3",
    stroke: "var(--line)",
    vertical: false,
  },
  tooltipStyle: {
    backgroundColor: "var(--ink-3)",
    borderColor: "var(--line-strong)",
    borderRadius: "6px",
    boxShadow: "var(--shadow-modal)",
    padding: "8px 12px",
    fontSize: "11px",
    fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
    color: "var(--fg-1)",
  },
  tooltipLabelStyle: { color: "var(--fg-2)", marginBottom: 4 },
  tooltipItemStyle: { color: "var(--fg-1)" },
};

/** Cycle the categorical palette for any number of series. */
export const seriesColor = (i: number) => TERMINAL_CHART_THEME.series[i % TERMINAL_CHART_THEME.series.length];

/**
 * Resolve a token (`"--ink-2"` or `"var(--ink-2)"`) to the literal colour
 * currently on screen. Browser only; returns `fallback` during SSR.
 */
export function cssToken(token: string, fallback = "#ffffff"): string {
  if (typeof window === "undefined") return fallback;
  const name = token.startsWith("var(") ? token.slice(4, -1).trim() : token;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}
