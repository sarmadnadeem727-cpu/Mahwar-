/** @type {import('tailwindcss').Config} */
/**
 * Mahwar design tokens — the logo theme: mint blueprint paper, navy ink, teal ring, gold nodes.
 * Light is the default; `.dark` on <html> (next-themes) swaps every token live.
 * Every colour below maps to a CSS variable declared in app/globals.css so the
 * whole platform can be re-skinned from one place (no hex values in components).
 */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          0: "var(--ink-0)",
          1: "var(--ink-1)",
          2: "var(--ink-2)",
          3: "var(--ink-3)",
          4: "var(--ink-4)",
          5: "var(--ink-5)",
        },
        line: {
          DEFAULT: "var(--line)",
          strong: "var(--line-strong)",
        },
        fg: {
          DEFAULT: "var(--fg-1)",
          2: "var(--fg-2)",
          3: "var(--fg-3)",
          4: "var(--fg-4)",
        },
        emerald: {
          DEFAULT: "var(--emerald)",
          light: "var(--emerald-light)",
          deep: "var(--emerald-deep)",
          dark: "var(--emerald-deep)",
          dim: "var(--emerald-dim)",
          border: "var(--emerald-border)",
        },
        gold: {
          DEFAULT: "var(--gold)",
          dim: "var(--gold-dim)",
        },
        navy: {
          DEFAULT: "var(--navy)",
          deep: "var(--navy-deep)",
        },
        pos: "var(--pos)",
        neg: "var(--neg)",
        warn: "var(--warn)",
        // Legacy aliases kept so untouched components resolve to the theme.
        surface: {
          canvas: "var(--ink-1)",
          subtle: "var(--ink-3)",
          card: "var(--ink-2)",
          hover: "var(--ink-4)",
          border: "var(--line)",
          "border-strong": "var(--line-strong)",
        },
        slate: {
          heading: "var(--fg-1)",
          body: "var(--fg-2)",
          muted: "var(--fg-3)",
          subtle: "var(--fg-4)",
        },
        terminal: {
          bg: "var(--ink-1)",
          surface: "var(--ink-2)",
          panel: "var(--ink-2)",
          hover: "var(--ink-4)",
          subtle: "var(--ink-3)",
          border: "var(--line)",
          "border-strong": "var(--line-strong)",
          "border-emerald": "var(--emerald-border)",
          text: "var(--fg-1)",
          "text-secondary": "var(--fg-2)",
          muted: "var(--fg-3)",
          emerald: "var(--emerald)",
          "emerald-light": "var(--emerald-light)",
          "emerald-dim": "var(--emerald-dim)",
          positive: "var(--pos)",
          negative: "var(--neg)",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Text"',
          '"SF Pro"',
          "var(--font-sans)",
          "system-ui",
          "sans-serif",
        ],
        serif: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"SF Pro"',
          "var(--font-display)",
          "system-ui",
          "sans-serif",
        ],
        display: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"SF Pro"',
          "var(--font-display)",
          "system-ui",
          "sans-serif",
        ],
        arabic: [
          '"SF Arabic"',
          "-apple-system",
          "BlinkMacSystemFont",
          "var(--font-sans)",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          '"SF Mono"',
          "SFMono-Regular",
          "ui-monospace",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      fontSize: {
        "display-xl": ["clamp(2.6rem, 5.6vw, 5rem)", { lineHeight: "1.04", fontWeight: "500", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(1.9rem, 3.8vw, 3.25rem)", { lineHeight: "1.1", fontWeight: "500", letterSpacing: "-0.015em" }],
        "heading-md": ["1.5rem", { lineHeight: "1.25", fontWeight: "600" }],
        "heading-sm": ["1.125rem", { lineHeight: "1.3", fontWeight: "600" }],
        "body-md": ["1rem", { lineHeight: "1.6" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5" }],
        "mono-data": ["0.875rem", { lineHeight: "1.4", letterSpacing: "0.02em" }],
        "mono-caption": ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.05em", fontWeight: "600" }],
      },
      boxShadow: {
        "terminal-card": "var(--shadow-card)",
        "terminal-hover": "var(--shadow-elevated)",
        "terminal-focus": "0 0 0 2px var(--emerald-border)",
        glow: "0 0 40px -8px var(--emerald-border)",
      },
      keyframes: {
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        "marquee-rtl": { from: { transform: "translateX(0)" }, to: { transform: "translateX(50%)" } },
        scan: { from: { transform: "translateY(-100%)" }, to: { transform: "translateY(100vh)" } },
        blink: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0" } },
        "pulse-ring": { "0%": { transform: "scale(0.8)", opacity: "0.8" }, "100%": { transform: "scale(2.2)", opacity: "0" } },
      },
      animation: {
        marquee: "marquee 60s linear infinite",
        "marquee-rtl": "marquee-rtl 60s linear infinite",
        scan: "scan 9s linear infinite",
        blink: "blink 1.1s steps(2, start) infinite",
        "pulse-ring": "pulse-ring 1.8s cubic-bezier(0.16,1,0.3,1) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};

