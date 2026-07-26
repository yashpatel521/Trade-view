# CLAUDE.md - Trade-View Development & Architecture Guide

This guide provides instructions, build/test commands, and architectural guidelines for developing in the Trade-View repository.

---

## 🛠️ Build, Development & Test Commands

- **Start Local Dev Server**: `npm run dev` (Runs Next.js dev server on http://localhost:3000)
- **Type Check**: `node node_modules/typescript/bin/tsc --noEmit`
- **Build Production Bundle**: `npm run build`
- **Start Production Server**: `npm run start`
- **Sync Drizzle Schema (SQLite)**: `npx drizzle-kit push --force`

---

## 🏗️ Architecture Overview

### 1. Multi-Database Layer (`src/db/`)
- **Driver Factory**: Dynamic database factory (`src/db/index.ts`) supports **SQLite** (LibSQL), **PostgreSQL**, and **MongoDB** configured via `DATABASE_DRIVER` (`sqlite` | `postgres` | `mongodb`) and `DATABASE_URL` in `.env`.
- **Schemas**:
  - `src/db/schema.ts` (SQLite table definitions)
  - `src/db/schema.postgres.ts` (PostgreSQL table definitions)
  - `src/db/mongo.adapter.ts` (MongoDB adapter delivering Drizzle-compatible query methods)
- **Rule**: Always import `db` from `@/db` in server actions and API routes. Never query driver-specific clients directly inside feature components.

---

### 2. Multi-Currency Engine (`src/lib/actions/trading.ts`)
- **Base Balance Currency**: `users.cashBalance` is stored in base **CAD**.
- **US Stock Trade Conversion**:
  - US stock purchases/sales convert trade totals (`shares * price`) to **CAD** using real-time FX rates.
  - Verifies `user.cashBalance >= Trade Total (CAD)` before deducting on **BUY** orders.
  - Credits `Trade Total (CAD)` to `user.cashBalance` on **SELL** orders.
- **Client Currency Switching**:
  - Global currency view (`CAD` / `USD`) managed via **Zustand** (`src/lib/store.ts`).
  - Top layout header (`Header.tsx`) features an **Available Cash** badge that converts in real-time.

---

### 3. Real-Time Market Data Engine
- **Multi-Tier Fallback**:
  1. Primary: Yahoo Finance v8 real-time chart API (`query1.finance.yahoo.com/v8/finance/chart/`).
  2. Secondary: Finnhub API (`finnhub.io/api/v1/`).
  3. Tertiary: Cleaned Google Finance scraper (`RY:TSE`).
- **Candle Ranges**: Supports `1D` (5m intraday), `1W` (30m weekly), `1M`, `3M`, and `1Y` ranges.

---

### 4. Stock Detail Workspace Layout (`/dashboard/stocks/[ticker]`)
- **75% / 25% Grid**: 4-column responsive grid (`grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch`).
  - Left 3 columns (`lg:col-span-3` - 75%): Interactive `StockPriceChart` with equal height `h-full`.
  - Right 1 column (`lg:col-span-1` - 25%): `MarketDetailsCard` with equal height `h-full`.
- **Chart High/Low Markers**: Always display permanent `<ReferenceDot>` markers and labels for peak (`High`) and trough (`Low`) prices. If peak/trough occurs at Open (`dataPoints[0]`), format label position as `right` to prevent clipping.
- **Market Details Grid**: Render Market Details and Financials key-value pairs in a 2-column grid (`grid grid-cols-2 gap-x-4 gap-y-3.5`).

---

### 5. UI Design Aesthetics
- **Wealthsimple Dark System**: `#0a0a0a` background, `#141414` card backgrounds, and `#222` borders.
- **Native Currency Badges**: Display `🇺🇸 USD` or `🇨🇦 CAD` badges alongside stock tickers in holdings tables and detail headers.
