/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './index.html',
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Sovereign Tactical Dark CAD Engine Palette
        terminal: {
          bg: "#0B0E14",
          surface: "#121721",
          panel: "#161C28",
          hover: "#1C2433",
          subtle: "#18202E",
          border: "#1E293B",
          "border-strong": "#334155",
          "border-emerald": "rgba(0, 255, 157, 0.4)",
          text: "#F8FAFC",
          "text-secondary": "#94A3B8",
          muted: "#64748B",
          emerald: "#00FF9D",
          "emerald-light": "#33FFB0",
          "emerald-dim": "rgba(0, 255, 157, 0.12)",
          positive: "#00FF9D",
          negative: "#FF4D4D",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        arabic: ['var(--font-cairo)', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'terminal-display': ['32px', { lineHeight: '1.15', fontWeight: '700', letterSpacing: '-0.02em' }],
        'terminal-h1': ['24px', { lineHeight: '1.25', fontWeight: '700', letterSpacing: '-0.01em' }],
        'terminal-h2': ['18px', { lineHeight: '1.3', fontWeight: '650' }],
        'terminal-h3': ['14px', { lineHeight: '1.4', fontWeight: '600' }],
        'terminal-body': ['13px', { lineHeight: '1.5' }],
        'terminal-mono': ['12px', { lineHeight: '1.4', letterSpacing: '0.02em' }],
        'terminal-caption': ['10px', { lineHeight: '1.4', letterSpacing: '0.08em', fontWeight: '700' }],
      },
      spacing: {
        'panel': '1.5rem',
        'section': '2.5rem',
      },
      boxShadow: {
        'terminal-card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.03)',
        'terminal-hover': '0 4px 20px -2px rgba(14, 124, 105, 0.12), 0 2px 6px -1px rgba(0, 0, 0, 0.06)',
        'terminal-focus': '0 0 0 2px rgba(14, 124, 105, 0.25)',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography")
  ],
}
