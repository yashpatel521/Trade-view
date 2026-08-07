# Trade View - Premium Next.js Trading Dashboard & Stock Analysis Platform

A state-of-the-art SaaS portfolio tracker, interactive stock analysis workspace, quantitative AI scanner, and community trading platform built with **Next.js 15**, **Zustand**, **Drizzle ORM**, multi-database drivers (**SQLite** and **PostgreSQL**), **Tailwind CSS**, and **Recharts**.

Designed with a premium Wealthsimple-inspired dark gray aesthetic (`#0a0a0a`), this platform allows traders to track stock holdings with multi-tier real-time API feeds (Yahoo Finance v8 API, Finnhub, and Google Finance TSX scraper), bulk import portfolio CSV exports, execute live AI market scans, manage CAD/USD cash balances, view day-by-day P&L analytics, inspect detailed stock charts with intraday 1D/1W ranges, and explore public community portfolios.

---

## ✨ Key Features & Capabilities

- **🎨 Spatial Glassmorphism & Wealthsimple Dark System**: Minimalist, high-end dark design system built with custom neutral gray palettes (`#0a0a0a`, `#141414`, `#222`), sleek card containers, smooth micro-animations, and glowing role badges.
- **🖥️ 100% Full View Width Layout**: Edge-to-edge full view width (`w-full max-w-none`) across all dashboard views without artificial container boundaries, opening directly into core charts, tables, and asset analytics.
- **📥 Wealthsimple & Broker Portfolio CSV Importer (`/dashboard/import`)**:
  - Native support for **Wealthsimple Holdings Export CSVs** (`holdings-report.csv`) and standard trade logs.
  - Automatically parses stock symbols, quantities, position directions (`LONG` &rarr; `BUY`), market prices, and book value average costs.
  - Dual import modes: **Append Mode** (merges trades without wiping) vs **Reset & Overwrite Mode** (clears old records & sets clean portfolio state).
  - Live CSV validation & preview table showing parsed rows, computed totals, valid status, and errors prior to database update.
  - Downloadable pre-formatted sample templates (`Wealthsimple CSV Sample` & `Standard CSV Sample`).
- **🤖 Institutional Weekly Stock Report AI Scanner (`/dashboard/weekly-report`)**:
  - Powered by **Gemini 2.5 Flash** with Wall Street Chief Quantitative Strategist prompt logic.
  - **Real-Time Live Price Anchoring**: Fetches live market quotes for scanned tickers (`NVDA`, `AAPL`, `TSLA`, `RY.TO`, etc.) and anchors day/week target prices down to the cent.
  - **In-Table Interactive Loading**: Clicking **Run Scan** renders animated pulsing skeleton rows directly inside the table body (`<tbody>`) with multi-step status feedback.
  - **1-Click Watchlist Action Column**: Interactive `Bookmark` button on every stock row for 1-click pinning/unpinning to your watchlist.
- **🎯 Portfolio Dividend Tracker & Income Calendar (`/dashboard/dividends`)**:
  - Calculates estimated annual dividend income, monthly average cash flow, and weighted portfolio dividend yield %.
  - 12-Month Projected Income Recharts bar graph visualizing expected monthly distributions (Jan - Dec) across CAD & USD holdings.
  - Interactive Holdings Dividend Ledger listing ticker, shares, price, annual div/share, yield %, payout frequency (`Monthly`/`Quarterly`), and ex-dividend target dates.
- **🖼️ Multi-Tier Stock Logo Engine (`StockLogo.tsx`)**:
  - 4-tier image fetching fallback pipeline: Tier 1 Parqet Symbol PNG, Tier 2 Financial Modeling Prep, Tier 3 Clearbit Favicon, and Tier 4 Dynamic HSL gradient SVG badge.
- **🗄️ Native Multi-Database Architecture**: Supports **SQLite** (LibSQL / Turso) and **PostgreSQL** (Supabase / Neon / Vercel Postgres / Railway) dynamically configured via `DATABASE_DRIVER` (`sqlite` | `postgres`) and `DATABASE_URL` in `.env`.
- **📈 Dedicated Stock Portfolio & Dynamic Stock Detail Pages**:
  - **/dashboard/stocks**: Dedicated stock holdings view featuring top 4 **Stock Allocation Weight** cards (#1 Allocation, #2 Allocation, #3 Allocation, Others), search bar, and 1-click Sell buttons.
  - **/dashboard/stocks/[ticker]**: In-depth stock detail workspace featuring:
    - **75% / 25% Split Grid**: 75% width for the interactive price trend chart and 25% width for Market Details & Financials.
    - **Interactive Price Chart**: Supports **1D** (5-minute intraday), **1W** (30-minute), **1M**, **3M**, and **1Y** time range selectors.
    - **Always-Visible Peak & Trough Markers**: Permanent Recharts `<ReferenceDot>` markers indicating the exact peak (`High`) and trough (`Low`) prices for the active range.
    - **Market Details Grid**: 2-column key-value grid displaying Open, Close, Bid, Ask, High, Low, Volume, Avg volume, 52W High/Low, Exchange, Margin req (30%), Market cap, Shares outstanding, and P/E ratio.
- **⚡ Multi-Tier Live Market Data Engine**:
  - Primary real-time quotes and price candle history via **Yahoo Finance v8 Chart API**.
  - Secondary fallback with **Finnhub Stock API**.
  - Tertiary Google Finance scraper for Canadian TSX stocks (`RY.TO`, `SHOP.TO`).
- **💱 Multi-Currency USD & CAD Trading Engine**:
  - Base account balance stored in **CAD**.
  - Automatically calculates live USD/CAD FX rate for US stock purchases and sales (`AAPL`, `NVDA`, `MSFT`).
  - Native currency badges (`🇺🇸 USD` vs `🇨🇦 CAD`) across holdings and detail headers.
  - Global client-side currency view switching via **Zustand**.
- **🔒 Privacy Settings, Funds Manager & Admin Reset**:
  - Toggle public/private leaderboard visibility under `/dashboard/settings`.
  - **Admin-Only Emergency Portfolio Reset**: Dedicated danger zone panel allowing Administrators to set cash balance to **$0.00 CAD** and permanently wipe trade history, stock holdings, and P&L daily journal logs.

---

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router & React 19)
- **AI Scanning**: [Google Gemini 2.5 Flash API](https://ai.google.dev/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) (Client-side global currency view state)
- **Database ORM & Drivers**:
  - [Drizzle ORM](https://orm.drizzle.team/)
  - **SQLite** (`@libsql/client`)
  - **PostgreSQL** (`pg` / `node-postgres`)
- **Market Data**: Yahoo Finance v8 API, Finnhub API & Google Finance TSX Scraper
- **Styling & UI**: Tailwind CSS v4, Lucide Icons & Spatial Glassmorphism
- **Charts**: Recharts (Intraday area graphs & Asset Allocation weight graphs)
- **Authentication**: JWT Cookies using `jose` and `bcryptjs`

---

## 📂 Project Structure

```
src/
├── app/                      # Next.js App Router pages & layouts
│   ├── dashboard/
│   │   ├── add/              # Manual trade & daily P&L log entry terminal
│   │   ├── import/           # Portfolio CSV Import page (Wealthsimple & standard)
│   │   ├── journal/          # Trading P&L Journal & calendar
│   │   ├── portfolios/       # Community leaderboard & user portfolio details ([userId])
│   │   ├── settings/         # Cash deposit, privacy settings & Admin emergency reset
│   │   ├── stocks/           # Dedicated stock market holdings & [ticker] detail workspace
│   │   ├── watchlist/        # Watchlist page & search autocomplete
│   │   ├── weekly-report/    # Gemini AI Weekly Stock Report & scanner
│   │   └── DashboardClient.tsx # Main dashboard client view
├── components/               # UI & Layout components
│   ├── ui/                   # Base elements (StockLogo, Card, Button, Input)
│   ├── layout/               # Sidebar & Header with Available Cash badge & currency toggle
│   └── dashboard/            # StockPriceChart, MarketDetailsCard, SellModal, DashboardCharts
├── db/                       # Database layer
│   ├── index.ts              # Multi-driver database factory (LibSQL & Postgres)
│   ├── schema.ts             # SQLite database tables
│   └── schema.postgres.ts    # PostgreSQL database tables
├── lib/                      # Business logic & Server Actions
│   ├── store.ts              # Zustand store for currency state (CAD/USD)
│   ├── auth.ts               # bcryptjs password hashing
│   ├── session.ts            # jose JWT cookie management
│   └── actions/              # Next.js Server Actions (trading, market APIs, CSV import, AI scan)
└── types/                    # TypeScript interfaces & types
```

---

## ⚙️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
# Database Driver Selection: 'sqlite' | 'postgres'
DATABASE_DRIVER=sqlite
DATABASE_URL=file:local.db

# API Keys & Auth Secrets
FINNHUB_API_KEY=your_finnhub_api_key
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_super_secret_jwt_key
```

### 3. Initialize & Sync Database
For SQLite:
```bash
npx drizzle-kit push --force
```

### 4. Run Locally
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👤 Default Admin Account

The database automatically seeds a default admin user on first run:
- **Email**: `admin@trading.com`
- **Password**: `admin`
- **Role**: `admin`
