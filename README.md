# محور — Mahwar Financial Intelligence Terminal

> **Developed by Muhammad Sarmad Nadeem | Supply Chain Planning Professional**
>
> **طُوِّر بواسطة محمد سرمد نديم | متخصص في تخطيط سلاسل الإمداد**

---

## 🌐 Overview | نظرة عامة

**EN:** Mahwar (محور — meaning "Axis" or "Pivot") is a Bloomberg-grade, bilingual (English/Arabic) financial intelligence terminal purpose-built for GCC capital markets. It combines institutional-level financial modelling, AI-powered equity research, real-time market data, and Shariah-compliance screening — all within a single, dark-luxury web application.

**AR:** محور هو منصة استخباراتية مالية متكاملة على مستوى بلومبرج، تدعم اللغتين العربية والإنجليزية، وصُممت خصيصاً لأسواق رأس المال في منطقة الخليج العربي. تجمع المنصة بين النمذجة المالية المؤسسية، والبحث في الأسهم المدعوم بالذكاء الاصطناعي، وبيانات السوق الآنية، وفحص الامتثال الشرعي — كل ذلك ضمن تطبيق ويب فاخر وموحد.

---

## 👨‍💻 Developer | المطوّر

| Field | Details |
|-------|---------|
| **Name** | Muhammad Sarmad Nadeem |
| **الاسم** | محمد سرمد نديم |
| **Role** | Supply Chain Planning Professional |
| **الدور** | متخصص في تخطيط سلاسل الإمداد |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Custom CSS Variables |
| Animations | Framer Motion |
| Charts | Recharts |
| AI Engine | Google Gemini 2.0 Flash API |
| Market Data | EODHD Financial Data API |
| State | Zustand (`useTerminalStore`) |
| i18n | Custom EN/AR translation layer with RTL |
| Fonts | Cormorant Garamond · DM Sans · IBM Plex Mono · Cairo |

---

## ✨ Features | المميزات

### 🌍 Landing Page (Home)

The public-facing marketing site, built with scroll-triggered Framer Motion animations and cinematic visuals.

| Section | Description |
|---------|-------------|
| **Navigation** | Fixed, glassmorphism top bar with EN/AR language toggle and "Enter Platform" CTA |
| **Hero Section** | Full-screen animated opener with headline, subtext, and primary call-to-action |
| **Ticker Strip** | Auto-scrolling live market ticker strip displaying GCC/Tadawul symbols |
| **Problem Section** | Narrative on the gap in institutional-grade tools for GCC investors |
| **Shift Section** | Transitional section bridging problem to solution |
| **Solution Section** | Feature highlights of the Mahwar terminal with visual callouts |
| **Intelligence Section** | Deep-dive into AI research and analytical capabilities |
| **GCC Section** | Regional context — Saudi Vision 2030, Gulf markets, IFRS/GAAP/Zakat |
| **Technology Section** | Stack and infrastructure overview |
| **Testimonials Section** | Institutional social proof |
| **CTA Section** | Final conversion section with platform entry |
| **Full RTL Support** | Entire page mirrors to right-to-left layout when Arabic is selected |

---

### ⚙️ Terminal / Dashboard (`/dashboard`)

A Bloomberg-style shell with a persistent sidebar, sticky top bar, and swappable full-screen panels.

#### Shell Layout
- **Sidebar (220px):** Logo, grouped navigation (Platform / Research / Models), live Tadawul status indicator
- **Top Bar:** Panel title (bilingual), global ticker search (press Enter to load), live price/change for active ticker, TASI index pill, EN↔AR toggle

---

#### 📊 Intelligence Hub (Default Panel)

The command centre of the terminal, showing a complete market overview at a glance.

- **Market Summary Cards** — 4 clickable cards for TASI Index, Saudi Aramco (2222.SR), Al Rajhi Bank (1120.SR), and SNB (1180.SR). Clicking a card sets the global active ticker across all panels.
- **Performance Alpha Chart** — Animated 54-bar chart visualising the selected ticker's performance vs TASI benchmark. Supports 1D / 1W / 1M / 3Y time-frame tabs.
- **Feature Portal Cards** — Quick-launch entry cards for DCF Engine, LBO Builder, and 3-Statement Model.
- **Research Banners** — Clickable tiles linking to AI Research, Shariah Screening, and Market Screener panels.
- **Institutional Order Flow Table** — Simulated live order tape showing BUY/SELL orders for the active ticker with price, quantity, total value, and Executed/Pending status badges.

---

#### 🧮 DCF Engine

> *Sovereign Discounted Cash Flow Model*

A professional-grade DCF valuation tool designed for GCC equities.

- Customisable revenue growth, EBITDA margins, and capex assumptions
- Automated WACC calculation (cost of equity + cost of debt + capital structure)
- Multi-year Free Cash Flow projection table
- Terminal value computation (Gordon Growth Model)
- Intrinsic value per share output with upside/downside vs current market price
- Sensitivity analysis matrix (WACC vs Terminal Growth Rate)

---

#### 🏦 LBO Builder

> *Leveraged Buyout Analytics — Multi-Tranche*

An institutional LBO model for private equity-style transaction analysis.

- Entry assumptions: purchase price, entry EBITDA multiple
- Multi-tranche debt structuring (Senior Secured, Mezzanine, PIK)
- Hold period (3–7 year) exit scenario modelling
- IRR and MOIC (Multiple on Invested Capital) computation
- Equity waterfall and returns visualisation

---

#### 📑 Three-Statement Model

> *Integrated IS · Balance Sheet · Cash Flow — IFRS / GAAP / Saudi Zakat*

A fully linked three-statement financial model with Saudi-specific accounting treatments.

- Income Statement with revenue drivers, COGS, and operating expenses
- Balance Sheet with working capital, fixed assets, and financing lines
- Cash Flow Statement (Operating, Investing, Financing activities) auto-derived from IS and BS
- Saudi GAAP / IFRS toggle
- Zakat provision calculation built into the model
- **Table / Charts toggle** — switch between spreadsheet view and interactive Recharts visualisations (Revenue, EBITDA, Net Income bar charts; FCF waterfall)

---

#### 🤖 AI Research

> *Gemini 2.0 Flash — Institutional Equity Memo Generator*

- Enter any stock ticker and generate a full institutional-grade equity research report
- Powered by Google Gemini 2.0 Flash API with streaming output
- Report includes: company overview, financial summary, key risks, ESG notes, Vision 2030 relevance, and investment thesis
- Bilingual output support (EN/AR)

---

#### 🕌 Shariah Screening

> *AAOIFI-Standard Compliance Engine*

- Screens equities against AAOIFI (Accounting and Auditing Organisation for Islamic Financial Institutions) standards
- Business activity screening (prohibited sectors: alcohol, tobacco, conventional banking, weapons)
- Financial ratio screening: debt-to-assets, interest income ratio, receivables ratio
- Purification income calculation for non-compliant revenue portions
- Compliance verdict: Compliant / Non-Compliant / Under Review

---

#### 📈 Market Screener

> *Multi-Dimensional Tadawul Stock Filter*

- Screens across ~30 Tadawul (Saudi Stock Exchange) listed symbols
- Filters: sector, market cap, P/E ratio, dividend yield, 52-week range, momentum
- Heatmap view — colour-coded grid showing relative performance
- Sort and filter columns interactively
- Bilingual column headers and labels

---

#### 📡 Live KSA Market

> *Auto-Refreshing Saudi Market Feed*

- Live price feed for Saudi-listed equities via EODHD API
- Auto-refreshes every 30 seconds
- Displays: price, change, % change, volume, 52-week high/low
- Colour-coded positive/negative indicators

---

## 🌐 Bilingual Support | دعم ثنائي اللغة

The entire platform — both the landing page and the terminal — supports full English and Arabic localisation:

- Global language toggle (EN / AR) on both the navbar and the terminal top bar
- Complete RTL (Right-to-Left) layout mirroring for Arabic mode
- Arabic typography using Cairo font
- All section headings, labels, buttons, table headers, and financial terms translated
- Language state persisted via Zustand global store

---

## 🚀 Getting Started

### Required Environment Variables

To run the terminal features and AI analysis, you must configure the following keys in a `.env` or `.env.local` file in the root directory:

* `GOOGLE_API_KEY`: API key for Google Gemini (required for AI Research and memo generation). Obtain it from [Google AI Studio](https://aistudio.google.com/).
* `EODHD_API_KEY`: API key for EODHD (required for live KSA market feeds and performance data). Obtain it from [EOD Historical Data](https://eodhistoricaldata.com/).

### Installation & Run

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build
```

---

## 📁 Project Structure

```
app/
├── app/
│   ├── page.tsx              # Landing page
│   ├── dashboard/page.tsx    # Terminal shell + all panels
│   └── api/                  # Backend API routes
├── components/
│   ├── features/             # AIResearch, LiveMarket, MarketScreener, ShariahScreening
│   ├── models/               # DCFModel, LBOModel, ThreeStatementModel, StatementCharts
│   ├── sections/             # Landing page sections
│   ├── layout/               # Navigation, Footer
│   └── ui/                   # TickerStrip, shared UI primitives
├── hooks/                    # Custom React hooks (useTerminalData, etc.)
├── lib/                      # motion.ts, i18n.ts, utils
└── store/                    # Zustand store (useTerminalStore)
```

---

## 📜 License

This project is proprietary software developed by **Muhammad Sarmad Nadeem**.
All rights reserved © 2026.

---

*Built with precision for the GCC institutional investor. محور — المحطة المالية الذكية.*
