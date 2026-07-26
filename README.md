# Trade View - Premium Next.js Trading Dashboard & Stock Analysis Platform

A state-of-the-art SaaS portfolio tracker, interactive stock analysis workspace, and community trading platform built with Next.js 15, Zustand, Drizzle ORM, multi-database drivers (**SQLite** and **PostgreSQL**), Tailwind CSS, and Recharts.

Designed with a premium Wealthsimple-inspired dark gray aesthetic (`#0a0a0a`), this platform allows traders to track stock holdings with multi-tier real-time API feeds (Yahoo Finance v8 API, Finnhub, and Google Finance TSX scraper), manage cash balances, view day-by-day P&L analytics, inspect detailed stock charts with intraday 1D/1W ranges, and explore public community portfolios.

---

## ✨ Key Features

- **🎨 Wealthsimple-Inspired Dark Gray UI**: Minimalist, high-end dark design system built with custom neutral gray palettes (`#0a0a0a`, `#141414`, `#222`), sleek card containers, smooth micro-animations, and glowing role badges.
- **🗄️ Native Multi-Database Architecture**: Supports **SQLite** (LibSQL / Turso) and **PostgreSQL** (Neon / Supabase / Vercel Postgres / Railway) dynamically via `DATABASE_DRIVER` (`sqlite` | `postgres`) and `DATABASE_URL` in `.env`.
- **📈 Dedicated Stock Portfolio & Dynamic Stock Detail Pages**:
  - **/dashboard/stocks**: Dedicated stock holdings view featuring top 4 **Stock Allocation Weight** cards (#1 Allocation, #2 Allocation, #3 Allocation, Others), search bar, and 1-click Sell buttons.
  - **/dashboard/stocks/[ticker]**: In-depth stock detail workspace featuring:
    - **75% / 25% Split Layout**: 75% width for the interactive price trend chart and 25% width for the Market Details & Financials panel.
    - **Interactive Price Chart**: Supports **1D** (5-minute intraday), **1W** (30-minute), **1M**, **3M**, and **1Y** time range selectors.
    - **Always-Visible High & Low Dots**: Permanent Recharts `<ReferenceDot>` markers indicating the exact peak (`High`) and trough (`Low`) prices for the active range.
    - **Market Details & Financials Grid**: 2-column grid displaying Open, Close, Bid, Ask, Last sale, High, Low, Volume, Avg volume, 52W High/Low, Exchange, Margin req (30%), Market cap, Shares outstanding, and P/E ratio.
    - **Trade History Table**: Full log of historical BUY and SELL transactions executed for that specific stock.
- **⚡ Multi-Tier Live Market Engine**:
  - Primary real-time quotes and price candle history via **Yahoo Finance v8 Chart API**.
  - Fallback integration with **Finnhub Stock API**.
  - Cleaned TSX scraper for Canadian stocks (`RY.TO`, `SHOP.TO`).
- **💱 Multi-Currency USD & CAD Trading Engine**:
  - Stored base account cash balance in **CAD**.
  - Automatically calculates live USD/CAD FX rate for US stock purchases and sales (`AAPL`, `NVDA`, `MSFT`).
  - Displays native currency badges (`🇺🇸 USD` vs `🇨🇦 CAD`) across holdings and detail pages.
  - Global client-side currency view switching via **Zustand**.
- **💳 Available Cash Header Display**: Real-time **Available Cash** balance badge rendered beside the CAD/USD toggle switch in the top header.
- **📉 Quick 1-Click Sell Modal (`SellModal`)**: Modal popup allowing traders to execute partial or full sell orders directly from holdings tables.
- **🏆 Community Leaderboard & Portfolio Explorer**:
  - `/dashboard/portfolios`: Ranked list of traders by total net worth (cash + stock assets), with search filters.
  - `/dashboard/portfolios/[userId]`: Public portfolio page displaying a trader's stock holdings, cost basis, market value, and returns.
- **🔒 Privacy Settings & Funds Manager**: Toggle portfolio visibility between Public and Private under `/dashboard/settings`, and manage cash deposits.

---

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router & React 19)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) (Client-side global currency view state)
- **Database ORM & Drivers**:
  - [Drizzle ORM](https://orm.drizzle.team/)
  - **SQLite** (`@libsql/client`)
  - **PostgreSQL** (`pg` / `node-postgres`)
- **Market Data**: Finnhub API & Yahoo Finance v8 Real-Time Chart API
- **Styling**: Tailwind CSS & Lucide Icons
- **Charts**: Recharts (Intraday & historical stock trend area graphs & Asset Allocation pie charts)
- **Authentication**: JWT Cookies using `jose` and `bcryptjs`

---

## 📂 Project Structure

```
src/
├── app/                      # Next.js App Router pages & layouts
├── dashboard/
│   ├── add/                  # Trade & journal log entry forms
│   ├── stocks/               # Dedicated stocks holdings page
│   │   └── [ticker]/         # Dynamic stock detail page (/dashboard/stocks/[ticker])
│   ├── portfolios/           # Community leaderboard & user portfolio details ([userId])
│   ├── settings/             # Funds management & portfolio privacy toggle
│   └── DashboardClient.tsx   # Dashboard main client view
├── components/               # UI & Layout components
│   ├── ui/                   # Base design elements (Button, Input, Card)
│   ├── layout/               # Client Sidebar & Header with Available Cash badge & currency toggle
│   └── dashboard/            # StockPriceChart, MarketDetailsCard, SellModal, DashboardCharts
├── db/                       # Database layer
│   ├── index.ts              # LibSQL/Postgres client factory & auto-seeder
│   ├── schema.ts             # SQLite tables
│   └── schema.postgres.ts    # PostgreSQL tables
├── lib/                      # Business logic & Server Actions
│   ├── store.ts              # Zustand store for currency state (CAD/USD)
│   ├── auth.ts               # bcryptjs password hashing
│   ├── session.ts            # jose JWT cookie management
│   └── actions/              # Next.js Server Actions (trading, market APIs, candles, funds)
└── types/                    # TypeScript interfaces & types
```

---

## ⚙️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory (see `.env.example`):
```env
# Database Driver Selection: 'sqlite' | 'postgres'
DATABASE_DRIVER=sqlite
DATABASE_URL=file:local.db

# API Keys & Auth Secrets
FINNHUB_API_KEY=your_finnhub_api_key
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
