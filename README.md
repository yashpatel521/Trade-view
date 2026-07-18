# Trade View - Premium Next.js Trading Dashboard & Community Leaderboard

A state-of-the-art SaaS-style portfolio tracker and community trading platform built with Next.js 15, Zustand, Drizzle ORM, SQLite (via LibSQL), Tailwind CSS, and Recharts.

Designed with a premium Wealthsimple-inspired dark gray aesthetic (`#0a0a0a`), this platform allows traders to track stock holdings with live scraped Google Finance prices, manage cash balances, analyze asset allocations, view day-by-day profit/loss metrics, and explore public community portfolios.

---

## ✨ Features

- **🎨 Wealthsimple-Inspired Dark Gray UI**: Minimalist, high-end dark design system built with custom neutral gray palettes (`#0a0a0a`, `#141414`, `#222`), sleek card containers, smooth micro-animations, and glowing role badges.
- **⚡ Live Google Finance Scraper**: Scrapes real-time stock prices and USD/CAD exchange rates directly from Google Finance with fallback symbol matching across NASDAQ, NYSE, and TSE. Includes a 5-minute in-memory cache for sub-second performance.
- **💱 Dynamic USD / CAD Currency Switching**: Global client-side state managed via **Zustand**. Switch currencies instantly in the top header without dropping page routes or waiting for server re-renders.
- **👥 Multi-Profile Quick Login**: Remembers authenticated accounts in `localStorage`. Displays interactive profile cards on the login screen for instant 1-click switching between multiple accounts.
- **🏆 Community Leaderboard & Portfolio Explorer**:
  - `/dashboard/portfolios`: Ranked list of traders by total net worth (cash + stock assets), featuring search filters. Automatically excludes the logged-in user from their own list.
  - `/dashboard/portfolios/[userId]`: Detailed public portfolio page displaying a trader's stock holdings, cost basis, market value, and returns.
- **🔒 Privacy Settings**: Dedicated toggle under `/dashboard/settings` allowing traders to set their portfolio visibility to Public or Private (`isPublic`).
- **💰 Available Cash & Funds Manager**: Manage available cash, make deposits, or set absolute balances under `/dashboard/settings`.
- **🛡️ Role-Based Auth & Auto-Seeding**: Automatic seeder creates a default `ADMIN` account on app startup. Top header displays glowing role badges (`ADMIN` / `USER`).

---

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router & React 19)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) (Client-side global currency view state)
- **Database ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Database**: SQLite (via `@libsql/client` - supports local file database for dev and serverless Turso Database for production)
- **Styling**: Tailwind CSS & Lucide Icons
- **Charts**: Recharts (P&L area trend graphs & Asset Allocation pie charts)
- **Authentication**: JWT Cookies using `jose` and `bcryptjs`
- **Scraping Engine**: Custom WIZ-array regex parser for Google Finance HTML data

---

## 📂 Project Structure

```
src/
├── app/                      # Next.js App Router pages & layouts
│   ├── (auth)/               # Route grouping for login & registration
│   │   ├── login/            # Multi-profile quick login page
│   │   └── register/         # User registration page
│   ├── dashboard/            # Dashboard views
│   │   ├── add/              # Trade & journal log entry forms
│   │   ├── portfolios/       # Community leaderboard & user portfolio details ([userId])
│   │   ├── settings/         # Funds management & portfolio privacy toggle
│   │   └── DashboardClient.tsx# Client-side currency conversion wrapper
│   └── globals.css           # Neutral dark gray color variables & styles
├── components/               # UI & Layout components
│   ├── ui/                   # Base design elements (Button, Input, Card)
│   ├── layout/               # Client Sidebar & Header with currency toggle
│   └── dashboard/            # P&L trend charts & asset allocation
├── db/                       # Database layer
│   ├── index.ts              # LibSQL/Drizzle client & auto-seeder
│   └── schema.ts             # Users, Holdings, Trades, and Daily Logs tables
├── lib/                      # Business logic & Server Actions
│   ├── store.ts              # Zustand store for currency state (CAD/USD)
│   ├── auth.ts               # bcryptjs password hashing
│   ├── session.ts            # jose JWT cookie management
│   └── actions/              # Next.js Server Actions (trading, scrapers, funds, privacy)
└── types/                    # TypeScript interfaces & types
```

---

## 📈 Portfolio Calculations & Logic

1. **Live Google Valuation**:
   $$\text{Current Value} = \text{Shares} \times \text{Live Scraped Price (converted via Google USD/CAD FX Rate)}$$
2. **Average Purchase Price**:
   $$\text{Avg Price} = \frac{\sum (\text{shares} \times \text{purchase price})}{\sum \text{shares}}$$
3. **Unrealized Return**:
   $$\text{Unrealized P&L} = \text{Current Market Value} - \text{Total Cost Basis}$$
4. **Instant Client-Side Currency View**:
   Values stored in base CAD are dynamically converted in the browser via Zustand:
   $$\text{Displayed Value (USD)} = \text{Value (CAD)} \times \frac{1}{\text{scraped FX Rate}}$$

---

## ⚙️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
JWT_SECRET=your_super_secret_jwt_key
DATABASE_URL=file:local.db
```

### 3. Initialize & Sync Database
Sync Drizzle schemas with your local SQLite database:
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
