# Mahwar (محور) — Finance & Supply Chain Intelligence Terminal

> Built by **Muhammad Sarmad Nadeem** · طُوِّر بواسطة محمد سرمد نديم

Mahwar is a bilingual (EN / AR, full RTL) Bloomberg-style terminal for GCC markets. It joins **22 financial engines** (DCF, LBO, DDM, WACC, Monte Carlo, M&A, 3-statement, sukuk, debt schedules, break-even, comps, Altman Z, ratio analysis, 13-week cash, FX hedging, capital rationing, …) with **21 supply-chain & operations engines** (EOQ, quantity discounts, newsvendor, bullwhip, transport modes, corridor planner, safety stock, ABC/XYZ, demand forecasting, S&OP, MRP, SCOR scorecard, flow / OEE, warehouse sizing, make-vs-buy, supplier risk, landed cost, TCO, supplier scorecard, gravity location, cash-conversion cycle, working-capital financing) behind one command line and one console.

Every engine computes in the browser. Sessions persist locally and can be exported / imported as JSON. Google sign-in is optional — leave the auth keys empty and the terminal runs in guest mode.

## v5 — what changed

**Google sign-in + a protection layer.** Auth.js v5 (`auth.ts`, `app/api/auth/[...nextauth]`) with Google as the provider, JWT sessions, optional Workspace-domain allow-list, a cinematic `/login`. `middleware.ts` guards `/dashboard` and `/api/session` when auth is configured and applies a strict Content-Security-Policy, HSTS, `X-Frame-Options: DENY`, referrer and permissions policies to every response. `/api/dcf` validates its body with zod; `/api/dcf` and `/api/news` are rate-limited per client (`lib/security/rateLimit.ts`). Nothing about the terminal needs a database.

**Thirteen new engines.** Finance: trading comps (`COMPS`), Altman Z-score (`Z`), 20-ratio analysis with DuPont and a health score (`RATIO`), 13-week cash forecast with revolver logic (`C13`), FX forward / money-market hedge (`FX`), capital rationing with exhaustive search (`CAPB`). Operations: MRP / BOM explosion (`MRP`), SCOR KPI scorecard (`KPI`), flow analytics — Little's law, takt, OEE (`FLOW`), warehouse sizing (`WHSE`), make-vs-buy (`MVB`), supplier concentration risk / HHI (`RISK`), quantity-discount EOQ (`QD`).

**The terminal, properly.** A real command grammar (`lib/commands.ts`) shared by the GO line and the new full-screen console (`CLI`): `<CODE> [GO]`, `HELP`, `HOME`, `OPS`, `FIN`, `AR`/`EN`, `CUR SAR` or just `AED`, `SAVE`, `RPT`, `CLEAR`, `WHOAMI`, `VER`, `EXIT`, `RESET CONFIRM`. Autocomplete, ↑/↓ history (persisted), ok / error flashes, a transcript.

**Session board.** Cross-engine signals (long CCC, Z in distress, unfunded cash gap, OEE < 60 %, concentrated supplier spend, bullwhip > 2×, idle capital budget, expensive hedges…) surface on the hub and link to the engine. Export / import the whole session as JSON; remove one analysis at a time.

**Frontend fixes.** Every layout component now subscribes to store slices (`useShallow` / selectors) instead of the whole store, so typing in one engine no longer re-renders the sidebar, top bar and status bar. Engines write their session entry through a debounced hook (`lib/useSessionSave.ts`) instead of on every keystroke. Heavy panels, charts and PDF code load lazily. The new `exportRowsToPdf` produces a branded vector PDF (searchable, small) rather than a screenshot.

**Mobile.** Engine inputs collapse into a drawer under `xl`, a bottom navigation bar (Hub / Finance / Ops / Wire / CLI), safe-area padding, 16 px inputs (no iOS zoom), scrollable tables, `100dvh` layout, icon-only header buttons on phones.

**Cinematic pass.** Aurora layer on the hero, login and dashboard, grain, blur-in panel transitions, toasts, account menu with avatar, live boot lines that report the real engine count.

## v3.1 — what changed

- **Six new engines.** Finance: Sukuk pricer (`SUK`), Debt & murabaha schedule (`AMORT`), Break-even & operating leverage (`CVP`). Supply chain: Newsvendor (`NV`), Bullwhip simulator (`WHIP`), Transport mode comparison (`MODE`). All built on `components/engines/EngineShell.tsx` — registry-driven header, audit trail, Excel/PDF export.
- **Wire with two lanes.** `/api/news` now fetches finance *and* supply-chain headlines in parallel (`?lane=finance|supply_chain`), tags each with a category (ports & shipping, logistics, procurement, industry / Saudi, GCC, Islamic finance, macro). The news panel filters by lane and category and auto-refreshes every 5 minutes.
- **Realistic map.** `scripts/generate-gcc-dots.mjs` samples real coastlines from `world-atlas` into `lib/geo/gccDots.json` (6.5k dots). The landing map draws them on canvas with a shimmer, Mercator-projected hubs (11, incl. NEOM/Oxagon and Salalah), animated sea / road / capital corridors, sea labels, and a hub card with exchange, currency, port and corridor count. Still zero runtime requests.
- **Gulf scene.** New parallax section: skyline, dunes, port cranes, a container ship and tanker crossing, moving at five scroll speeds.
- Hero terminal now also demos `SUK GO` and `NV GO`. Sidebar shows clusters for the finance suite too.

## v4 — what changed

**Real map.** `components/ui/GulfMap.tsx` draws true Natural Earth coastlines (`lib/geo/gulf.json`, 34 KB, generated by `scripts/generate-gulf-geo.mjs` — GCC states at 50 m resolution, neighbours at 110 m) through a d3-geo Mercator projection. Lit GCC states, graticule, real scale bar, hub markers, sea / road / capital corridors, and ships and trucks that ride the corridors with SVG `animateMotion`. No runtime fetch.

**Corridor planner (`MAP`).** New control-tower engine: choose origin, destination and mode; get great-circle and route distance, door-to-door days, freight plus in-transit carrying cost (links inventory to finance), CO₂, and a three-mode comparison. Click hubs on the map to reroute. All rates and factors are editable assumptions with a formula audit trail.

**Live market sessions.** `MarketClock` computes open / pre / closed for all seven GCC exchanges from their published hours and the real clock — on the landing page and the terminal status bar.

**Wire.** The news API now runs three finance and four supply-chain searches (ports, DP World / Mawani / Hamad, Red Sea / Suez / Hormuz, rail / NEOM / procurement), merged and de-duplicated, with lane and category filters in the terminal.

**Home.** Pointer-parallax terminal card with a slow-turning compass rose, scroll-progress line in the navbar, the parallax Gulf scene (dunes, port cranes, ships, skyline), and the map section with hub facts and the session board.

**Engines added in v3.1 / v4.** Sukuk pricer (`SUK`), debt schedule (`AMORT`), break-even / CVP (`CVP`), newsvendor (`NV`), bullwhip simulator (`WHIP`), transport-mode compare (`MODE`), corridor planner (`MAP`).

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

### Google sign-in (optional)

1. In [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services → Credentials → Create credentials → OAuth client ID** (Web application).
2. Add the authorised redirect URI `https://<your-domain>/api/auth/callback/google` (and `http://localhost:3000/api/auth/callback/google` for local work).
3. `npx auth secret` to generate `AUTH_SECRET`, then fill `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` in `.env.local` (or the Vercel project settings).
4. Optionally set `AUTH_ALLOWED_DOMAINS=yourcompany.com` to restrict access to a Workspace.

With those set, `/dashboard` requires a signed-in Google account and the navbar shows **Sign in**. Without them the terminal stays fully usable in guest mode.

## Environment

| Key | Purpose |
|---|---|
| `AUTH_SECRET` · `AUTH_GOOGLE_ID` · `AUTH_GOOGLE_SECRET` | Google sign-in. Leave empty for guest mode. |
| `AUTH_ALLOWED_DOMAINS` | Optional comma-separated Workspace domains allowed to sign in. |
| `AUTH_URL` | Canonical URL for Auth.js when not on Vercel. |
| `MARKETAUX_API_KEY` | Optional premium GCC news feed. Falls back to a public RSS search; if neither is reachable the wire says so instead of showing canned headlines. |
| `NEXT_PUBLIC_APP_URL` | Public URL for metadata. |
| `NEXT_PUBLIC_HERO_VIDEO` | Path to hero footage (`/bg-video.mp4` ships in `public/`). Set empty to drop the video layer. |

## Structure

```
app/                 layout, landing page, /login, dashboard shell, /api/{news,dcf,session,auth}, /privacy, /terms
auth.ts              Auth.js v5 config (Google)
middleware.ts        security headers + route protection
components/
  layout/            Navbar · Sidebar · TopBar (GO line) · StatusBar · MobileNav · AccountMenu · Footer
  sections/          Hero · LiveTerminal · ThesisSection (+EngineTape) · ToolShowcase · GCCMapSection · CapabilitiesBento · NewsPreviewWidget · CTASection
  ui/                FlowField (canvas) · CommandPalette · Toasts · LoadingScreen · MahwarLogo · FooterModal
  engines/           EngineShell + every engine built on it (incl. ConsolePanel)
  features/ models/  financial engines UI
  operations/        supply-chain engines UI
lib/
  registry.ts        THE module list
  commands.ts        the command grammar (GO line + console)
  signals.ts         cross-engine flags for the session board
  finance/ operations/ pure calculation libraries (audited formula traces)
  auth/ security/    useUser hook · rate limiter · headers/CSP
  chartTheme.ts motion.ts i18n.ts useSessionSave.ts session.ts
store/useTerminalStore.ts   zustand + persist (v5 key, migrates v3)
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
- **AI analyst** — a memo generator that reads the saved session (the store already holds structured inputs/outputs).
- **Shared sessions** — sync the JSON session through a lightweight backend keyed on the Google account.
- **Excel add-in** — the engines in `lib/` are pure functions and can back an Office add-in directly.

## License

Proprietary. © Muhammad Sarmad Nadeem. All rights reserved.

