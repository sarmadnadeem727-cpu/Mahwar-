/**
 * Tailwind v3 theme fragment — typed against Tailwind's own Config so it
 * spreads cleanly into `theme.extend`.
 *
 * MERGE (do not overwrite) into the existing `tailwind.config.ts`:
 *
 *   import { mahwarTheme } from "./styles/tailwind.tokens";
 *   export default {
 *     theme: { extend: { ...existingExtend, ...mahwarTheme } },
 *   }
 *
 * If the existing config already extends `colors`, `fontSize`, etc., spread
 * per key: `colors: { ...existing.colors, ...mahwarTheme.colors }`.
 *
 * Tailwind v4 users: use `styles/tokens.css` instead.
 */
import type { Config } from "tailwindcss";
import { color, shadow, radius, fontSize, fontFamily, layout } from "../lib/tokens";

type ThemeExtend = NonNullable<NonNullable<Config["theme"]>["extend"]>;

type FontSizeEntry = [string, Partial<{ lineHeight: string; letterSpacing: string; fontWeight: string | number }>];

const fontSizeScale: Record<string, FontSizeEntry> = Object.fromEntries(
  Object.entries(fontSize).map(([name, [size, opts]]): [string, FontSizeEntry] => [name, [size, { ...opts }]]),
);

export const mahwarTheme: ThemeExtend = {
  colors: {
    surface: { 0: color.surface0, 1: color.surface1, 2: color.surface2 },
    ink: { 900: color.ink900, 700: color.ink700, 500: color.ink500, 300: color.ink300 },
    line: { DEFAULT: color.line, strong: color.lineStrong },
    accent: {
      50: color.accent50,
      100: color.accent100,
      500: color.accent500,
      600: color.accent600,
      700: color.accent700,
    },
    neg: { 100: color.neg100, 500: color.neg500 },
    warn: { 500: color.warn500 },
  },
  fontFamily: {
    serif: [...fontFamily.serif],
    sans: [...fontFamily.sans],
    mono: [...fontFamily.mono],
  },
  fontSize: fontSizeScale,
  boxShadow: { e1: shadow.e1, e2: shadow.e2, e3: shadow.e3 },
  borderRadius: { none: radius.none, panel: radius.panel, ui: radius.ui },
  maxWidth: { page: layout.page, prose: layout.prose },
  width: { workbench: layout.workbench },
  height: { "hero-visual": layout.heroVisual },
  keyframes: {
    "mw-marquee": {
      from: { transform: "translateX(0)" },
      to: { transform: "translateX(-50%)" },
    },
    "mw-pulse": {
      "0%, 100%": { opacity: "1" },
      "50%": { opacity: "0.35" },
    },
  },
  animation: {
    "mw-marquee": "mw-marquee var(--mw-marquee-duration, 70s) linear infinite",
    "mw-pulse": "mw-pulse 2.4s ease-in-out infinite",
  },
};
