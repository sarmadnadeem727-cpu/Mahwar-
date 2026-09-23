# Mahwar (محور) — Finance & Supply Chain Intelligence Terminal

> Built by **Muhammad Sarmad Nadeem** · طُوِّر بواسطة محمد سرمد نديم

Mahwar is a bilingual (EN / AR, full RTL) Bloomberg-style terminal for GCC markets. It joins **20 financial engines** (DCF, LBO, DDM, WACC, Monte Carlo, M&A, 3-statement, sukuk, debt schedules, break-even, comps, Altman Z, ratio analysis, 13-week cash, FX hedging, capital rationing, …) with **22 supply-chain & operations engines** (EOQ, quantity discounts, newsvendor, bullwhip, transport modes, corridor planner, safety stock, ABC/XYZ, demand forecasting, S&OP, MRP, SCOR scorecard, flow / OEE, warehouse sizing, make-vs-buy, supplier risk, landed cost, TCO, supplier scorecard, gravity location, cash-conversion cycle, working-capital financing) and **2 research engines** (AAOIFI screening, BI report) behind one command line and one console.

Every engine computes in the browser. There are **no accounts**: analyses live in the browser's local storage on that device, can be exported / imported as JSON, and are never synced to a server. The only network request the app makes is for public headlines (`/api/news`).

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
  ui/                GulfMap · FlowTraces · CommandPalette · Toasts · LoadingScreen · MahwarLogo · MarketClock
  engines/           EngineShell + every engine built on it (incl. ConsolePanel)
  features/ models/  financial engines UI
  operations/        supply-chain engines UI
lib/
  constants.ts       version (from package.json), Zakat rate, AAOIFI threshold — the numbers the UI quotes
  registry.ts        THE module list (+ ENGINES, FLAGSHIPS, enginesByCluster)
  landing/previews.ts the six flagship demos, computed from the engine libraries
  commands.ts        the command grammar (GO line + console)
  signals.ts         cross-engine flags for the session board
  finance/ operations/ pure calculation libraries (audited formula traces)
  security/          rate limiter · headers/CSP
  chartTheme.ts motion.ts anime.ts i18n.ts useSessionSave.ts session.ts
store/useTerminalStore.ts   zustand + persist; exports CURRENCIES and LANGUAGES
```

## Adding a module

1. Build the panel component.
2. Add one entry to `TOOLS` in `lib/registry.ts` (pick a short `code` and a `cluster`).
3. Add the `PanelType` to the store union and the lazy import in `app/dashboard/page.tsx`.

It then appears in the sidebar, palette, hubs, GO line, the ENGINES chapter and the footer — and every engine count on the site updates by itself.
