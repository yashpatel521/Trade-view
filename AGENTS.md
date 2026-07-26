<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Trade-View Repository Guidelines & Rules

## 1. Multi-Database Architecture (`src/db/`)
- **Driver Factory**: The application uses a dynamic database factory (`src/db/index.ts`) supporting **SQLite** (LibSQL) and **PostgreSQL** configured via `DATABASE_DRIVER` (`sqlite` | `postgres`) and `DATABASE_URL` in `.env`.
- **Schema Modifications**:
  - SQLite schema is defined in `src/db/schema.ts`.
  - PostgreSQL schema is defined in `src/db/schema.postgres.ts`.
- **Database Import Rule**: Always import `db` from `@/db` in server actions and API routes. Never query driver-specific clients directly inside feature components.

---

## 2. Currency & FX Trade Logic (`src/lib/actions/trading.ts`)
- **Base Balance Currency**: `users.cashBalance` in the database is stored in base **CAD**.
- **US Stock Trade Conversion**:
  - For US stocks (tickers not ending in `.TO`, `.V`, `.CN`), `Trade Total (USD) = shares * price`.
  - `Trade Total (CAD) = Trade Total (USD) * liveFxRate`.
  - Verify `users.cashBalance >= Trade Total (CAD)` on BUY orders before deducting.
  - Credit `Trade Total (CAD)` back to `users.cashBalance` on SELL orders.
- **Client Currency Switching**:
  - Active display currency (`CAD` or `USD`) is managed client-side via **Zustand** (`src/lib/store.ts`).
  - Header displays a real-time **Available Cash** badge that converts to the active selected currency automatically.

---

## 3. Real-Time Market Data Engine
- **Multi-Tier Fallback**:
  1. Primary: Yahoo Finance v8 real-time chart API (`query1.finance.yahoo.com/v8/finance/chart/`).
  2. Secondary: Finnhub API (`finnhub.io/api/v1/`).
  3. Tertiary: Cleaned Google Finance scraper (`RY:TSE`).
- **Candle Ranges**: Supports `1D` (5m intraday), `1W` (30m weekly), `1M`, `3M`, and `1Y` ranges.

---

## 4. Stock Detail Page Layout (`/dashboard/stocks/[ticker]`)
- **75% / 25% Grid**: 4-column responsive grid (`grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch`).
  - Left 3 columns (`lg:col-span-3` - 75%): Interactive `StockPriceChart` with equal height `h-full`.
  - Right 1 column (`lg:col-span-1` - 25%): `MarketDetailsCard` with equal height `h-full`.
- **Chart High/Low Markers**: Always display permanent `<ReferenceDot>` markers and labels for peak (`High`) and trough (`Low`) prices. If peak/trough occurs at Open (`dataPoints[0]`), format label position as `right` to prevent clipping.
- **Market Details Grid**: Render Market Details and Financials key-value pairs in a 2-column grid (`grid grid-cols-2 gap-x-4 gap-y-3.5`).

---

## 5. Design Aesthetics
- **Wealthsimple Dark System**: Use `#0a0a0a` background, `#141414` card backgrounds, and `#222` borders.
- **Native Currency Badges**: Display `🇺🇸 USD` or `🇨🇦 CAD` badges alongside stock tickers in holdings tables and detail headers.
