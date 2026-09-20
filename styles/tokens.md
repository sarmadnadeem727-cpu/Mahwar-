# Mahwar homepage — design tokens

Every value below is defined once in `lib/tokens.ts` and exposed to Tailwind through
`styles/tailwind.tokens.ts` (Tailwind v3) or `styles/tokens.css` (Tailwind v4).
No component in this package hardcodes a hex, px or rem value; the only inline styles are
data-driven percentages (bar widths, chart segment sizes).

## Colour (light theme only)

| Token | Tailwind utility | Value | Role |
|---|---|---|---|
| surface-0 | `bg-surface-0` | `#FFFFFF` | Page base, cards, panels |
| surface-1 | `bg-surface-1` | `#FAFAF8` | Off-white bands (Operations suite, footer), panel headers, filler cells |
| surface-2 | `bg-surface-2` | `#F2F3F0` | Recessed wells, bell-curve fill |
| ink-900 | `text-ink-900` | `#111815` | Primary text, strong marks |
| ink-700 | `text-ink-700` | `#3A453F` | Secondary text, descriptions |
| ink-500 | `text-ink-500` | `#6E7873` | Captions, mono meta, table headers |
| ink-300 | `text-ink-300` | `#AEB5B0` | Tertiary marks, disabled, "no" marks, neutral chart bars |
| line | `border-line` | `#E3E6E2` | Every hairline |
| line-strong | `border-line-strong` | `#C6CCC7` | Secondary button border, second-tone chart bars |
| accent-50 | `bg-accent-50` | `#EEF8F3` | Formula cells, positive tag fill |
| accent-100 | `bg-accent-100` | `#D6F0E3` | Chart area fills, positive tag border |
| accent-500 | `bg-accent-500` | `#159A6C` | Chart strokes, status dots, emphasised bars |
| accent-600 | `bg-accent-600` | `#0F7F58` | Primary button |
| accent-700 | `text-accent-700` | `#0B6446` | Positive numbers, tertiary link text, primary button hover |
| neg-100 | `bg-neg-100` | `#F6E9E5` | Negative tag fill, DPO offset bar |
| neg-500 | `text-neg-500` | `#B4573F` | Negative price changes, reorder-point line |
| warn-500 | `text-warn-500` | `#A8842B` | "Partial" in the comparison table only |

Rule: emerald is functional only — active state, positive value, primary action, chart emphasis.
It is never used as a wash, gradient or decorative background.

## Typography

| Family | CSS variable | Tailwind | Used for |
|---|---|---|---|
| Source Serif 4 (400/500) | `--font-serif` | `font-serif` | Hero H1 and section H2s only; footer wordmark |
| Inter | `--font-sans` | `font-sans` | Body, descriptions, H3 card titles, buttons |
| IBM Plex Mono (400/500) | `--font-mono` | `font-mono` | Every number, ticker, tag, timestamp, metric, status, section index |

Type scale (size / line-height / letter-spacing):

| Token | Size | LH | Tracking | Where |
|---|---|---|---|---|
| display-xl | 3.5rem | 1.04 | −0.025em | Hero H1 ≥ lg |
| display-lg | 2.75rem | 1.06 | −0.022em | Hero H1 < lg |
| display-md | 2rem | 1.12 | −0.018em | Section H2 |
| heading | 1.25rem | 1.3 | −0.012em | Featured card H3, footer wordmark |
| title | 1rem | 1.4 | −0.006em | Compact card H3 |
| body | 1rem | 1.6 | — | Hero subhead |
| body-sm | 0.875rem | 1.55 | — | Descriptions, table cells, headlines |
| caption | 0.75rem | 1.45 | — | Compact descriptions, footer links |
| mono-xl | 2rem | 1.1 | −0.02em | LBO IRR figure |
| mono-lg | 1.375rem | 1.2 | −0.01em | Workbench figures |
| mono-md | 0.8125rem | 1.5 | — | reserved |
| mono-sm | 0.75rem | 1.5 | — | Ticker, section index, tertiary buttons |
| mono-xs | 0.6875rem | 1.45 | +0.02em | Tags, metrics, annotations, timestamps |

## Spacing

Tailwind's 4px scale, restricted to these steps: **1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 20, 24**
(4 px → 96 px). Section rhythm: `py-20 lg:py-24`. Card padding: featured `p-6`, compact `p-5`,
panel rows `px-3 py-3` / `px-4 py-3`. Grid gaps: `gap-4` between cards, `gap-px` inside
hairline grids.

Layout: `max-w-page` = 80rem (1280 px), page gutter `px-6 lg:px-8`, prose measure
`max-w-prose` = 36rem, hero visual slot `h-hero-visual` = 36rem (lg+), workbench panel
`w-workbench` = 24rem (lg+).

## Elevation

| Token | Tailwind | Value | Use |
|---|---|---|---|
| e1 | `shadow-e1` | `0 1px 2px rgba(17,24,21,.06)` | Primary button, featured cards |
| e2 | `shadow-e2` | `0 4px 14px -2px rgba(17,24,21,.08), 0 1px 2px rgba(17,24,21,.05)` | Floating panels (workbench, news) |
| e3 | `shadow-e3` | `0 18px 44px -14px rgba(17,24,21,.18)` | Reserved for overlays; unused on the homepage |

Compact tool grids, tables and the ticker carry no shadow — hairlines only.

## Radius convention

| Token | Tailwind | Value | Use |
|---|---|---|---|
| none | `rounded-none` | 0 | Data panels, tables, hairline grids, chart bars |
| panel | `rounded-panel` | 2px | Outer shell of floating panels and featured cards |
| ui | `rounded-ui` | 4px | Every interactive element: buttons, tags, focus rings |

## Motion

| Token | Value |
|---|---|
| duration.fast / base / slow | 0.16 s / 0.24 s / 0.36 s (no single animation exceeds 0.4 s) |
| easing | `cubic-bezier(0.2, 0, 0, 1)` |
| cascade | 0.09 s between siblings |
| stage.* | Page-load start offsets, see `lib/motion.ts` |
| `animate-mw-marquee` | `translateX(0 → −50%)`, linear, duration via `--mw-marquee-duration` |
| `animate-mw-pulse` | 2.4 s opacity pulse on live-status dots (motion-safe only) |

`prefers-reduced-motion: reduce` disables every staged reveal, count-up and loop; the finished
state renders immediately.
