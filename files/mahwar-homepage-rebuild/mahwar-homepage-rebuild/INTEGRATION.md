# INTEGRATION.md — merging the Mahwar homepage rebuild

Addressed to the coding agent (Antigravity) integrating this package into the live Mahwar
Next.js repository. Follow the steps in order. Do not skip step 8.

## 0. What this package is

A complete replacement for the marketing homepage (`app/page.tsx`) built to the locked brief:
light theme, single emerald accent, Source Serif 4 / Inter / IBM Plex Mono, Framer Motion 12,
Recharts, Next.js 15 App Router, React 19, strict TypeScript. It was compiled and built
(`tsc --noEmit` and `next build`) against Next 15.5, React 19.3, framer-motion 12.43,
recharts 3.10 and Tailwind 3.4 before packaging.

```
mahwar-homepage-rebuild/
  app/
    page.tsx                 ← replaces the existing app/page.tsx
    fonts.ts                 ← next/font definitions; merge into app/layout.tsx (step 3)
  components/
    homepage/
      Hero.tsx               ← contains the SPLINE_HERO_VISUAL_PLACEHOLDER slot (step 4)
      WorkbenchPreview.tsx
      TickerStrip.tsx
      ToolShowcase.tsx
      ToolCard.tsx
      ToolVisuals.tsx        ← the 21 mini-visuals (Recharts + inline SVG)
      ComparisonStrip.tsx
      NewsPreview.tsx
      Footer.tsx
    ui/
      Button.tsx  Panel.tsx  Tag.tsx  SectionHeader.tsx  Container.tsx  CountUp.tsx
  lib/
    tokens.ts                ← single source of truth for every design value
    motion.ts                ← durations, easing, variants, reduced-motion hook
    format.ts                ← number / currency formatting
    tools.ts                 ← the 21-tool registry (copy, visual key, panel key)
    sample-data.ts           ← tickers, headlines, comparison rows, footer nav
    cn.ts                    ← class joiner (no clsx dependency)
  styles/
    tokens.md                ← human-readable token summary
    tailwind.tokens.ts       ← Tailwind v3 theme.extend fragment
    tokens.css               ← Tailwind v4 @theme block (use one or the other)
  INTEGRATION.md
```

## 1. Dependencies — nothing new to install

The package uses only what Section 1 of the brief already lists:
`next`, `react`, `react-dom`, `framer-motion`, `recharts`, `tailwindcss`, `typescript`.
No `clsx`, no `tailwind-merge`, no `zustand` (the homepage is presentational and needs no
store), no icon library.

Version checks before proceeding:

- `framer-motion` must be **≥ 12.0** (imports `useReducedMotion`, `useMotionValueEvent`,
  `animate` from `"framer-motion"`). If the repo has migrated to the `motion` package
  instead, change every `from "framer-motion"` to `from "motion/react"` — the API is identical.
- `recharts` must be **≥ 2.15** for React 19 peer support; **3.x** is what this was built
  against. If the project is on 2.x, the code still compiles (no 3.x-only APIs are used).
- `next` **≥ 15.0**, `react` **≥ 19.0**.

Run `npm ls framer-motion recharts next react` and confirm.

## 2. Copy files

1. Copy `components/homepage/*` and `components/ui/*` into the project's `components/`
   directory. If the project already has `components/ui/Button.tsx` (or Panel/Tag/Container),
   **do not overwrite it** — rename the incoming file with an `Mw` prefix (e.g. `MwButton.tsx`)
   and update the imports inside `components/homepage/*` and `app/page.tsx` accordingly.
2. Copy `lib/*` into the project's `lib/` directory. Same collision rule: if `lib/tokens.ts`,
   `lib/motion.ts`, `lib/format.ts`, `lib/tools.ts` or `lib/cn.ts` already exist, prefix the
   incoming ones with `mw-` and fix imports.
3. Copy `styles/tailwind.tokens.ts` and `styles/tokens.css` into a `styles/` directory (create
   it if absent). `styles/tokens.md` is documentation; keep it or drop it.
4. Replace `app/page.tsx` with the incoming `app/page.tsx`. Keep a copy of the old file until
   step 8 passes.

All imports in this package are **relative** (`../../lib/tokens`). If the project uses the
`@/` alias, you may convert them, but relative imports work as-is provided the folder
structure above is preserved.

## 3. Fonts — merge `app/fonts.ts` into `app/layout.tsx`

`app/fonts.ts` exports three `next/font/google` instances that set the CSS variables the
Tailwind font tokens read (`--font-serif`, `--font-sans`, `--font-mono`).

1. Copy `app/fonts.ts` next to `app/layout.tsx`.
2. In `app/layout.tsx`, import `fontClassNames` and add it to the `<html>` (or `<body>`)
   `className`:

   ```tsx
   import { fontClassNames } from "./fonts";
   // ...
   <html lang="en" className={`${fontClassNames} ${existingClassNames ?? ""}`}>
   ```

3. If the layout already loads Inter / IBM Plex Mono / Source Serif 4 via `next/font`, keep
   the existing instances and just make sure their `variable` options are exactly
   `--font-sans`, `--font-mono` and `--font-serif`. Do not load a font twice.
4. Do not add `<link>` tags to Google Fonts; `next/font` self-hosts.

## 4. Tailwind — MERGE the tokens, do not overwrite the config

Determine the Tailwind major version first: `npm ls tailwindcss`.

### Tailwind v3 (there is a `tailwind.config.ts` / `.js`)

```ts
import type { Config } from "tailwindcss";
import { mahwarTheme } from "./styles/tailwind.tokens";

const config: Config = {
  content: [
    // keep the existing globs, and make sure these are covered:
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // keep everything already here …
      ...existingExtend,
      // …then add Mahwar tokens. If a key (colors, fontSize, boxShadow, borderRadius,
      // keyframes, animation, fontFamily, maxWidth) already exists, deep-merge that key:
      colors: { ...existingExtend.colors, ...mahwarTheme.colors },
      fontSize: { ...existingExtend.fontSize, ...mahwarTheme.fontSize },
      // …and so on for each key present in mahwarTheme
    },
  },
};
export default config;
```

Rules:
- **Never** replace `theme.extend` wholesale; unrelated existing tokens must survive.
- If the project already defines `fontFamily.sans/serif/mono`, the Mahwar values must win
  (they reference the CSS variables set in step 3).
- If a colour name collides (e.g. an existing `accent` scale), rename the Mahwar scale in
  `styles/tailwind.tokens.ts` **and** search-replace the utility prefix across
  `components/homepage`, `components/ui` and `lib` (e.g. `accent-` → `mw-accent-`).
- Confirm `globals.css` still contains `@tailwind base; @tailwind components; @tailwind utilities;`.

### Tailwind v4 (globals.css starts with `@import "tailwindcss";`)

Paste the `@theme { … }` block from `styles/tokens.css` into `globals.css` **after** the
import line and **alongside** any existing `@theme` block (merge the two blocks; do not delete
existing custom properties). Delete `styles/tailwind.tokens.ts` in that case.

Utilities used that must resolve after the merge (spot-check with a grep):
`bg-surface-0/1/2`, `text-ink-900/700/500/300`, `border-line`, `border-line-strong`,
`bg-accent-50/100/500/600/700`, `text-neg-500`, `bg-neg-100`, `text-warn-500`,
`text-display-xl/lg/md`, `text-heading`, `text-title`, `text-body`, `text-body-sm`,
`text-caption`, `text-mono-xl/lg/md/sm/xs`, `shadow-e1/e2`, `rounded-panel`, `rounded-ui`,
`max-w-page`, `max-w-prose`, `animate-mw-marquee`, `animate-mw-pulse`.

## 5. Spline hero visual — placeholder slot

`components/homepage/Hero.tsx` contains a clearly marked slot:

```tsx
{/* SPLINE_HERO_VISUAL_PLACEHOLDER … */}
<div id="spline-hero-visual" data-slot="SPLINE_HERO_VISUAL_PLACEHOLDER" className="absolute inset-0 …">
  <AxisGrid />
  <span …>3D visual mounts here</span>
</div>
```

The slot is the full visual column: `aspect-[4/3]` on mobile, `36rem` tall on `lg+`, with the
workbench preview overlapping its bottom-start corner on desktop. When the Spline scene
arrives:

1. Install the Spline runtime the design team specifies (e.g. `@splinetool/react-spline`) —
   this is the **only** dependency addition expected, and it is theirs, not this package's.
2. Render the scene inside `#spline-hero-visual` with `className="absolute inset-0 h-full w-full"`.
   Load it with `next/dynamic` and `ssr: false`.
3. Remove `<AxisGrid />`, the `AxisGrid` function, and the "3D visual mounts here" span.
4. Keep the `motion.div` wrapper — it fades the slot in at `stage.heroVisual` and is part of
   the page-load choreography.
5. Ensure the scene does not capture touch scroll on mobile (`pointer-events-none` on small
   screens is acceptable).

## 6. Wire the placeholder links to real routes

Every `href="#"` in this package is a placeholder. The live product routes tools through
`/dashboard?panel=<key>`. Wire them mechanically:

### Financial Engine Suite (`lib/tools.ts` → `financialTools[].href`)

| tool id | panel key | href |
|---|---|---|
| dcf | `DCF` | `/dashboard?panel=DCF` |
| lbo | `LBO` | `/dashboard?panel=LBO` |
| shariah | `shariah` | `/dashboard?panel=shariah` |
| fs | `FS` | `/dashboard?panel=FS` |
| auto-statements | `auto_statements` | `/dashboard?panel=auto_statements` |
| custom-model | `custom_model` | `/dashboard?panel=custom_model` |
| monte-carlo | `monte_carlo` | `/dashboard?panel=monte_carlo` |
| acquisition-cost | `acquisition_cost` | `/dashboard?panel=acquisition_cost` |
| wacc | **look up** | the WACC & CAPM Builder key from the project's panel registry |
| bi-report | `bi_report` | `/dashboard?panel=bi_report` |

The simplest implementation: keep `panel` populated in `lib/tools.ts` and derive the href —
`href: tool.panel ? \`/dashboard?panel=${tool.panel}\` : "#"` — inside `ToolCard.tsx`, then
fill the `null` panel keys.

### Supply Chain & Operations Suite

All eleven `panel` values are `null` because the keys were not visible from the public route
list. Open the project's panel registry (the same place `DCF`, `LBO`, `shariah`, … are
defined — likely a `panels` map or enum used by `/dashboard`) and fill in the key for each:
Cash Conversion Cycle, WC Financing Cost, Economic Order Qty (EOQ), Safety Stock & ROP,
ABC / XYZ Classification, Demand Forecasting, S&OP Balancing Worksheet, Delivered Landed Cost,
Total Cost of Ownership, Supplier Scorecard, Facility Location (Gravity).
The "Open Operations Suite Hub" link in `ToolShowcase.tsx` goes to the Operations Suite Hub panel.

### Also-in-the-terminal note (financial grid, eighth cell)

The names listed there (Dividend Discount Model, NPV & IRR Calculator, Merger Accretion /
Dilution) are real terminal panels. If you want them linkable, wrap each in a `<Link>` to its
panel; otherwise leave as text. If tool #10 should be one of these instead of WACC & CAPM
Builder, swap the `wacc` entry in `lib/tools.ts` and reuse the `capital-structure` visual or
pick another `VisualKey`.

### Everything else

| Location | Link text | Route |
|---|---|---|
| `Hero.tsx` | Enter Terminal | `/dashboard` |
| `Hero.tsx` | Explore GCC Wire | `/dashboard?panel=news` |
| `NewsPreview.tsx` | View Full Wire | `/dashboard?panel=news` |
| `lib/sample-data.ts` → `footerNav` | Intelligence Hub | `/dashboard?panel=hub` |
| | GCC Wire | `/dashboard?panel=news` |
| | BI Report Engine | `/dashboard?panel=bi_report` |
| | Operations Suite | Operations Suite Hub panel |
| | DCF / LBO / 3-Statement / Custom Model Builder | `DCF` / `LBO` / `FS` / `custom_model` |
| | Shariah Screening (AAOIFI) | `/dashboard?panel=shariah` |
| | Monte Carlo Simulation | `/dashboard?panel=monte_carlo` |
| | Market Data, Documentation, About, Contact, Privacy, Terms | existing pages, or leave `#` |

After wiring, `grep -rn 'href="#"' components lib app` should return only links that are
intentionally unrouted.

## 7. Sample data → live data (optional, later)

- `lib/sample-data.ts` `tickers` and `headlines` are illustrative. To go live, keep the
  `Ticker` / `Headline` shapes and feed them from the project's market-data and news hooks;
  `TickerStrip` and `NewsPreview` take no props today — add a `data` prop when you connect them.
- `WorkbenchPreview.tsx` `sample` mirrors the product's demo model figures (Aramco sample).
  Leave as sample; it is labelled "Sample" in the UI.
- The word "Sample" appears as a `<Tag>` in the ticker, workbench and news panel. Remove those
  tags only once the component is on real data.

## 8. Verify

Run, in order, and fix anything that fails before committing:

```bash
npx tsc --noEmit          # strict; the package itself is clean
npx next lint             # if configured — CountUp.tsx has one intentional eslint-disable
npx next build
```

Then load `/` in a browser and confirm:

1. Light theme throughout; no dark section anywhere.
2. Page-load order: hero copy → workbench panel → figures count up → ticker slides in.
3. Ticker loops with no visible seam and pauses on hover.
4. Tool cards cascade in on scroll; comparison rows and headlines too.
5. With OS "reduce motion" on: everything renders in its finished state, ticker becomes a
   horizontally scrollable row, status dots stop pulsing.
6. Arabic headline renders right-to-left; with `<html dir="rtl">` the layout mirrors (all
   spacing uses logical `ps/pe/ms/me/start/end` utilities). Note: the ticker still scrolls
   leftward under RTL by design; flip `mw-marquee` to `translateX(50%)` with `flex-row-reverse`
   if the product team wants it mirrored.
7. Keyboard: every button and link shows the emerald focus ring.

Likely adjustments if the build complains:

- **"Cannot find module '../../lib/…'"** — folder depth differs from this package; fix the
  relative path or switch to the project's alias.
- **Unknown Tailwind class** — a token key was not merged (step 4); check the utility list there.
- **Recharts `ResponsiveContainer` warnings about width/height 0** — only occur in tests/SSR
  snapshots; every chart in `ToolVisuals.tsx` sits in a parent with an explicit height.
- **Duplicate `React` default import lint warnings** — this package never imports React
  default; if the project's lint requires it, add `import React from "react"` where flagged.

## 9. What was deliberately not included

- No tech-stack marketing section, no "built with" footer line (brief §4.6).
- No dark hero, no video background, no gradient blobs.
- No lorem ipsum: all copy and figures are finished sample content.
- No Zustand store — nothing on the page holds client state beyond Framer Motion values.
