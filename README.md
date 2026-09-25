# Mahwar (محور) — Finance & Supply Chain Intelligence Terminal

> Built by **Muhammad Sarmad Nadeem** · طُوِّر بواسطة محمد سرمد نديم

Mahwar is a bilingual (EN / AR, full RTL) Bloomberg-style terminal for GCC markets. It joins **21 financial engines** (including a live GCC stock screener) (DCF, LBO, DDM, WACC, Monte Carlo, M&A, 3-statement, sukuk, debt schedules, break-even, comps, Altman Z, ratio analysis, 13-week cash, FX hedging, capital rationing, …) with **22 supply-chain & operations engines** (EOQ, quantity discounts, newsvendor, bullwhip, transport modes, corridor planner, safety stock, ABC/XYZ, demand forecasting, S&OP, MRP, SCOR scorecard, flow / OEE, warehouse sizing, make-vs-buy, supplier risk, landed cost, TCO, supplier scorecard, gravity location, cash-conversion cycle, working-capital financing) and **2 research engines** (AAOIFI screening, BI report) behind one command line and one console.

Every engine computes in the browser. There are **no accounts**: analyses live in the browser's local storage on that device, can be exported / imported as JSON, and are never synced to a server. The only network requests the app makes are for public headlines (`/api/news`) and, if a key is configured, stock quotes (`/api/quotes`).

## v7 — what changed

**The logo theme, live.** Light is now the default and is drawn from the brand mark: mint blueprint paper, navy ink, the teal ring as the live-signal colour, gold for the Gulf nodes. A `.dark` token set (navy ink at night) sits beside it, and `next-themes` flips between them — light / dark / system — from the navbar, the mobile menu and the terminal top bar with no reload. Every colour in the app is a CSS variable (`app/globals.css`), so charts (`lib/chartTheme.ts`), the hero canvas, hairlines and PDF/PNG exports all follow the toggle. Night scenes (the Gulf skyline) are locked dark with `.section-dark`. `MahwarLogo.tsx` was redrawn from the real logo.

**Type for both scripts.** IBM Plex Sans Arabic for body and UI (one face carrying Latin and Arabic, so switching language changes direction, not typeface), Readex Pro for headlines in both scripts, IBM Plex Mono for every number. Old `font-serif` / `font-cairo` classes alias to the new faces.

**GCC stock screener** (`SCR`, Finance › Markets & screening). 38 names across Tadawul, DFM, ADX, QSE, Boursa Kuwait, Bahrain Bourse and Muscat. Filters: exchange, sector, market cap (USD), P/E, P/B, dividend yield, ROE, revenue growth, debt/assets, day change, indicative Shariah activity; five ready-made screens; sortable grid; detail drawer with 52-week position, a 0–100 composite score (value + quality + income + growth, audited in the formula trail) and one-click hand-off to DCF, Comps, DDM and the AAOIFI screen. Exports to PDF / Excel like every engine.

*Live data.* `/api/quotes` is a server-side proxy (rate-limited, 15 s cache, keys never reach the browser). **Out of the box it uses TradingView's public scanner — free, no key** — which returns price, change, volume and fundamentals (market cap, P/E, P/B, yield, ROE, revenue growth, 52-week range) for all 38 names in one POST (`lib/market/quotes.ts` → `fetchTradingView`). Prices are real-time or 15-minute delayed depending on the exchange (the `update_mode` column says which). The endpoint is undocumented and subject to TradingView's terms, so it is a development / personal-use feed; for production set one of the keyed providers below and it takes over automatically (`MARKET_DATA_PROVIDER=tradingview` forces the free feed, `=none` disables live data).

| Key | Provider | Why |
|---|---|---|
| `TWELVEDATA_API_KEY` | [Twelve Data](https://twelvedata.com) — **recommended** | One REST + WebSocket API that covers all seven GCC exchanges by MIC code (`2222:XSAU`, `EMAAR:XDFM`, `FAB:XADS`, `QNBK:DSMD`, `KFH:XKUW`, `ALBH:XBAH`, `BKMB:XMUS`). Free plan for development; GCC intraday / real-time needs a paid tier (EOD on the cheaper tiers). Batch `/quote` keeps credit use low; the WebSocket is the next step for tick-level updates. |
| `EODHD_API_KEY` | [EODHD](https://eodhd.com) | Strong fundamentals and screener endpoints; Tadawul via `.SR`. Other GCC suffixes must be verified against EODHD's exchange list before use (`lib/market/universe.ts`). |

Financial Modeling Prep has a screener endpoint but thin GCC coverage; Alpha Vantage, Finnhub and Polygon are US-centric. Reference fundamentals in `lib/market/universe.ts` are an illustrative snapshot (`REFERENCE_AS_OF`), overridden field-by-field when a provider is keyed.

**Two halves.** `/features` shows Finance and Supply chain side by side, meeting at the working-capital axis; `/features/finance` and `/features/supply-chain` list every engine by cluster with a "what comes next" roadmap for each half (`lib/divisions.ts`). Linked from the navbar, footer and landing page.

## Routes

`/` landing · `/features` · `/features/finance` · `/features/supply-chain` · `/dashboard?panel=<id>` the terminal · `/privacy` · `/terms` · `/api/news` · `/api/quotes` (server-side quote proxy).

## v6 — what changed

**Trust repair.** The version is read from `package.json` once (`lib/constants.ts` → `APP.version`) and nowhere else; the footer, navbar, sidebar, console and `VER` all agree. Every stat shown on the landing page is `.length` of a real array (`ENGINES`, `CURRENCIES`, `LANGUAGES`, `HUBS`, `ROUTES`, `EXCHANGES`) or a constant the engines actually compute with (`ZAKAT_RATE`, `AAOIFI_RECEIVABLES_MAX_PCT`). The Privacy and Terms pages now describe exactly what the software does; the footer only links to pages that exist.

**Auth removed.** Auth.js, `/login`, `/api/auth`, `/api/session`, the account menu, the `useUser` hook and the Google origins in the CSP are gone. `middleware.ts` only applies hardening headers. `EXIT` leaves the terminal; `WHOAMI` reports where the session lives. The unused `/api/dcf` route was removed as well.

**Chaptered landing page** (`components/sections/`). Seven scroll-driven chapters listed once in `chapters.ts`: `INTRO → ENGINES (light) → FLAGSHIP ×6 → NETWORK → TRUST (light) → WIRE → START`. `ChapterNav` is a sticky rail of chapter codes (a bottom dot strip on mobile) driven by one `IntersectionObserver`; it also shows which flagship engine is on screen. The full engine list appears exactly once, in ENGINES, as a dense categorised function list. Each FLAGSHIP chapter (DCF, LBO, Monte Carlo, EOQ, CCC, Altman Z) shows a live result computed by the same engine library the dashboard uses (`lib/landing/previews.ts`) and reveals itself on scroll — numbers count up, curves draw in — with a plain fade under `prefers-reduced-motion`. The three live elements on the page are the flagship demos, the Gulf map and the wire; the background video, marquee ticker, live terminal card, Gulf scene and thesis columns were removed.

**Monte Carlo library.** The simulation moved verbatim out of the panel into `lib/finance/monteCarlo.ts` (with a seeded RNG option) so the panel and the landing preview share one implementation.

**Dashboard sidebar.** A **Recent** section (last panels opened, Zustand state) sits on top; finance and operations clusters are collapsible, with only the cluster holding the open panel expanded by default. ⌘K lists Recent first when the query is empty.

**Palette.** The remaining off-brand Tailwind colours (`sky`, `indigo`, `purple`) in the LBO waterfall, football field, demand forecasting and scenario toggle now come from `lib/chartTheme.ts`. Typography is Source Serif 4 / Inter / IBM Plex Mono / Cairo.

**Map fix.** The Gulf map's bounding box was wound anticlockwise, which d3-geo reads as the *outside* of the box; `fitExtent` therefore shrank the Gulf to a thumbnail. The ring is now clockwise and the map fills its canvas.

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
| `TWELVEDATA_API_KEY` / `EODHD_API_KEY` | Live quotes for the stock screener (set one; see v7 notes). |
| `MARKETAUX_API_KEY` | Optional premium GCC news feed. Falls back to a public RSS search; if neither is reachable the wire says so instead of showing canned headlines. |
| `NEXT_PUBLIC_APP_URL` | Public URL for metadata. |
| `NEXT_PUBLIC_PRIVACY_CONTACT` | Address shown on `/privacy` for questions (optional; defaults to the GitHub repo). |

## Routes

`/` landing · `/dashboard?panel=<id>` the terminal · `/privacy` · `/terms` · `/api/news` (server-side headline proxy, rate-limited, no identity forwarded). Nothing else.

## Structure

```
app/                 layout, landing page, dashboard shell, /api/news, /privacy, /terms
middleware.ts        security headers (CSP, HSTS, no-frame, no-sniff …)
components/
  layout/            Navbar · Sidebar (Recent + collapsible clusters) · TopBar (GO line) · SessionMenu · StatusBar · MobileNav · Footer · LegalShell
  sections/          chapters.ts · ChapterNav · IntroChapter · EnginesChapter · FlagshipChapter · NetworkChapter · TrustChapter · WireChapter · StartChapter
  ui/                GulfMap · FlowTraces · CommandPalette · Toasts · LoadingScreen · MahwarLogo · MarketClock · ThemeProvider · ThemeToggle
  features-pages/    FeaturesHub · DivisionPage (/features)
  engines/           EngineShell + every engine built on it (incl. ConsolePanel)
  features/ models/  financial engines UI
  operations/        supply-chain engines UI
lib/
  constants.ts       version (from package.json), Zakat rate, AAOIFI threshold — the numbers the UI quotes
  registry.ts        THE module list (+ ENGINES, FLAGSHIPS, enginesByCluster)
  landing/previews.ts the six flagship demos, computed from the engine libraries
  commands.ts        the command grammar (GO line + console)
  signals.ts         cross-engine flags for the session board
  finance/ operations/ pure calculation libraries (audited formula traces); finance/screener.ts
  market/            universe.ts (GCC securities + reference snapshot) · quotes.ts (Twelve Data / EODHD adapters)
  divisions.ts       the two halves shown on /features
  security/          rate limiter · headers/CSP
  chartTheme.ts motion.ts anime.ts i18n.ts useSessionSave.ts session.ts
store/useTerminalStore.ts   zustand + persist; exports CURRENCIES and LANGUAGES
```

## Adding a module

1. Build the panel component.
2. Add one entry to `TOOLS` in `lib/registry.ts` (pick a short `code` and a `cluster`).
3. Add the `PanelType` to the store union and the lazy import in `app/dashboard/page.tsx`.

It then appears in the sidebar, palette, hubs, GO line, the ENGINES chapter and the footer — and every engine count on the site updates by itself.
