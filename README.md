# Mahwar (محور) — Finance & Supply Chain Intelligence Terminal

> Built by **Muhammad Sarmad Nadeem** · طُوِّر بواسطة محمد سرمد نديم

Mahwar is a bilingual (EN / AR, full RTL) Bloomberg-style terminal for GCC markets. It joins **13 financial engines** (DCF, LBO, DDM, WACC, Monte Carlo, M&A, 3-statement, …) with **11 supply-chain engines** (EOQ, safety stock, ABC/XYZ, demand forecasting, S&OP, landed cost, TCO, supplier scorecard, gravity location, cash-conversion cycle, working-capital financing) behind one command line.

Everything computes in the browser. No account, no backend state.

## v3 — what changed

**Design.** Full move to the "Obsidian & Emerald" dark terminal theme: every colour is a CSS token in `app/globals.css`, mirrored in `tailwind.config.js`. No component carries a raw hex value. Brand fonts restored: Cormorant Garamond (display), DM Sans (UI), IBM Plex Mono (data), Cairo (Arabic).

**Landing page.** Cinematic hero with a canvas "capital + goods" flow network, anime.js headline choreography, and a live terminal window that runs the real EOQ / CCC / safety-stock / IRR engines — no fake KPIs. Function-code tape, Finance × Supply-chain thesis section, registry-driven module rail with computed previews, self-contained animated GCC corridor network (no external map fetch), commitments, live wire, CTA.

**Terminal.** `GO` command line in the top bar (type `EOQ` + Enter, Tab to complete, `/` to focus, `⌘K` palette), boot sequence shown once per session, registry-driven sidebar with session dots, session board on the hub, status bar with Riyadh clock and recent modules, deep links (`/dashboard?panel=eoq`) synced to the URL, and session persistence across refreshes (localStorage).

**One registry.** `lib/registry.ts` is the single list of modules (id, code, names, descriptions, icons, keywords, session key). Sidebar, palette, hubs, top bar, landing showcase and footer all read from it.

**Hardcoded data removed.** Mock news articles, fake hero numbers, synthetic comps / 52-week bands in the football-field chart, the TornadoChart bug that ignored live DCF inputs, duplicate tool lists, unused constants, 12 MB of stray media, `react-simple-maps` runtime fetch, dead dependencies.

**Build.** `next.config.mjs` now enforces type checking (`tsc --noEmit` is clean), `target: es2020`, package-import optimisation, no `three` transpile.

## Run

```bash
cp .env.example .env.local   # optional keys
npm install
npm run dev                  # http://localhost:3000
npm run build && npm start
npm run typecheck
```

`next/font` fetches Google Fonts at build time — the build machine needs outbound HTTPS.

## Environment

| Key | Purpose |
|---|---|
| `MARKETAUX_API_KEY` | Optional premium GCC news feed. Falls back to a public RSS search; if neither is reachable the wire says so instead of showing canned headlines. |
| `NEXT_PUBLIC_APP_URL` | Public URL for metadata. |
| `NEXT_PUBLIC_HERO_VIDEO` | Path to hero footage (`/bg-video.mp4` ships in `public/`). Set empty to drop the video layer. |

## Structure

```
app/                 layout, landing page, dashboard shell, /api/news, /api/dcf, /privacy, /terms
components/
  layout/            Navbar · Sidebar · TopBar (GO line) · StatusBar · Footer
  sections/          Hero · LiveTerminal · ThesisSection (+EngineTape) · ToolShowcase · GCCMapSection · CapabilitiesBento · NewsPreviewWidget · CTASection
  ui/                FlowField (canvas) · CommandPalette · LoadingScreen · MahwarLogo · FooterModal
  features/ models/  financial engines UI
  operations/        supply-chain engines UI
lib/
  registry.ts        THE module list
  finance/ operations/ pure calculation libraries (audited formula traces)
  chartTheme.ts motion.ts i18n.ts
store/useTerminalStore.ts   zustand + persist
```

## Adding a module

1. Build the panel component.
2. Add one entry to `TOOLS` in `lib/registry.ts` (pick a short `code`).
3. Add the `PanelType` to the store union and the lazy import in `app/dashboard/page.tsx`.

It then appears in the sidebar, palette, hubs, GO line, landing showcase and footer.

## Suggested next features

- **Split workspace** — two panels side by side (e.g. EOQ next to WC financing) with linked inputs.
- **Scenario compare** — save base / bull / bear per engine and diff them on the hub.
- **Live market adapter** — pluggable price provider (Tadawul, DFM, ADX) feeding DCF current price and the football-field 52-week band.
- **Control tower** — put the corridor network in the terminal with landed-cost and lead-time overlays per route.
- **Alerts** — thresholds on CCC, safety stock, or upside that flag on the status bar.
- **AI analyst** — a memo generator that reads the saved session (the store already holds structured inputs/outputs).
- **Sukuk & Islamic finance engines** — sukuk pricing, murabaha cost of funds, profit-rate sensitivity.
- **Shared sessions** — export/import a session as JSON, or sync via a lightweight backend.
- **Excel add-in** — the engines in `lib/` are pure functions and can back an Office add-in directly.

## License

Proprietary. © Muhammad Sarmad Nadeem. All rights reserved.
