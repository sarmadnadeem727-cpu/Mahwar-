/**
 * Mahwar design tokens — the ONLY place raw colour / size values live.
 *
 * Tailwind reads these via `styles/tailwind.tokens.ts` (v3) or
 * `styles/tokens.css` (v4). Components never hardcode hex or px; they use
 * Tailwind utilities generated from these tokens, or import `tokens` for
 * places Tailwind cannot reach (Recharts stroke/fill props, inline SVG).
 */

export const color = {
  // Surfaces — light theme only
  surface0: "#FFFFFF", // page base
  surface1: "#FAFAF8", // off-white bands, panel headers
  surface2: "#F2F3F0", // recessed wells, table stripes, placeholder fills

  // Ink — text and iconography
  ink900: "#111815", // primary text
  ink700: "#3A453F", // secondary text
  ink500: "#6E7873", // muted text, captions
  ink300: "#AEB5B0", // disabled / tertiary marks

  // Hairlines
  line: "#E3E6E2",
  lineStrong: "#C6CCC7",

  // Emerald accent — functional only (active, positive, primary action)
  accent50: "#EEF8F3",
  accent100: "#D6F0E3",
  accent500: "#159A6C",
  accent600: "#0F7F58",
  accent700: "#0B6446",

  // Negative — restrained, red-adjacent; never alarm-red
  neg100: "#F6E9E5",
  neg500: "#B4573F",

  // Caution — used only for "review" / borderline states
  warn500: "#A8842B",
} as const;

export const shadow = {
  /** Hairline lift — interactive elements at rest */
  e1: "0 1px 2px rgba(17, 24, 21, 0.06)",
  /** Floating panel — the workbench preview, news card */
  e2: "0 4px 14px -2px rgba(17, 24, 21, 0.08), 0 1px 2px rgba(17, 24, 21, 0.05)",
  /** Overlay — menus, popovers (reserved; unused on the homepage) */
  e3: "0 18px 44px -14px rgba(17, 24, 21, 0.18)",
} as const;

export const radius = {
  /** Data panels, tables, charts — sharp by convention */
  none: "0px",
  /** Data panel outer shell — near-sharp, softens hairline corners */
  panel: "2px",
  /** Every interactive element: buttons, links-as-buttons, tags */
  ui: "4px",
} as const;

/** Type scale (rem / line-height / letter-spacing). */
export const fontSize = {
  "display-xl": ["3.5rem", { lineHeight: "1.04", letterSpacing: "-0.025em" }],
  "display-lg": ["2.75rem", { lineHeight: "1.06", letterSpacing: "-0.022em" }],
  "display-md": ["2rem", { lineHeight: "1.12", letterSpacing: "-0.018em" }],
  heading: ["1.25rem", { lineHeight: "1.3", letterSpacing: "-0.012em" }],
  title: ["1rem", { lineHeight: "1.4", letterSpacing: "-0.006em" }],
  body: ["1rem", { lineHeight: "1.6" }],
  "body-sm": ["0.875rem", { lineHeight: "1.55" }],
  caption: ["0.75rem", { lineHeight: "1.45" }],
  "mono-xl": ["2rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
  "mono-lg": ["1.375rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
  "mono-md": ["0.8125rem", { lineHeight: "1.5" }],
  "mono-sm": ["0.75rem", { lineHeight: "1.5" }],
  "mono-xs": ["0.6875rem", { lineHeight: "1.45", letterSpacing: "0.02em" }],
} as const;

export const fontFamily = {
  serif: ["var(--font-serif)", "Georgia", "Times New Roman", "serif"],
  sans: ["var(--font-sans)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
  mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
} as const;

/** Layout constants. */
export const layout = {
  /** Page content max width */
  page: "80rem", // 1280px
  /** Measure for prose (subheads, descriptions) */
  prose: "36rem",
  /** Hero visual slot height on lg+ (the Spline scene fills this box) */
  heroVisual: "36rem",
  /** Width of the floating workbench preview on lg+ */
  workbench: "24rem",
} as const;

/** Motion durations in seconds — every single animation stays under 0.4s. */
export const duration = {
  fast: 0.16,
  base: 0.24,
  slow: 0.36,
} as const;

/** Single easing curve used across the page (Linear-style ease-out). */
export const easing: [number, number, number, number] = [0.2, 0, 0, 1];

export const tokens = { color, shadow, radius, fontSize, fontFamily, layout, duration, easing };
export type Tokens = typeof tokens;
