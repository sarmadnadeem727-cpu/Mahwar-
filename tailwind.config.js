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
        // Institutional Light Design System Tokens
        surface: {
          canvas: "#FFFFFF",
          subtle: "#F8FAFC",
          card: "#FFFFFF",
          hover: "#F1F5F9",
          border: "#E2E8F0",
          "border-strong": "#CBD5E1",
        },
        emerald: {
          DEFAULT: "#0E7C69",
          light: "#12A189",
          dim: "rgba(14, 124, 105, 0.08)",
          border: "rgba(14, 124, 105, 0.25)",
        },
        slate: {
          heading: "#0F172A",
          body: "#334155",
          muted: "#64748B",
          subtle: "#94A3B8",
        },
        // Legacy compatibility mappings pointing to tokens
        terminal: {
          bg: "#FFFFFF",
          surface: "#F8FAFC",
          panel: "#FFFFFF",
          hover: "#F1F5F9",
          subtle: "#F8FAFC",
          border: "#E2E8F0",
          "border-strong": "#CBD5E1",
          "border-emerald": "rgba(14, 124, 105, 0.25)",
          text: "#0F172A",
          "text-secondary": "#64748B",
          muted: "#94A3B8",
          emerald: "#0E7C69",
          "emerald-light": "#12A189",
          "emerald-dim": "rgba(14, 124, 105, 0.08)",
          positive: "#0E7C69",
          negative: "#DC2626",
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
        'display-xl': ['3.5rem', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.02em' }],
        'display-lg': ['2.5rem', { lineHeight: '1.15', fontWeight: '700', letterSpacing: '-0.01em' }],
        'heading-md': ['1.5rem', { lineHeight: '1.25', fontWeight: '600' }],
        'heading-sm': ['1.125rem', { lineHeight: '1.3', fontWeight: '600' }],
        'body-md': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'mono-data': ['0.875rem', { lineHeight: '1.4', letterSpacing: '0.02em' }],
        'mono-caption': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.05em', fontWeight: '600' }],
      },
      spacing: {
        'panel': '1.5rem',
        'section': '3rem',
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
