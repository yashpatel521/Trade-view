// Navigation routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
} as const;

// Mock price database for calculating current value of holdings
// If a ticker is not in this list, we fall back to a random stable price based on avg price
export const MOCK_STOCK_PRICES: Record<string, number> = {
  AAPL: 185.50,
  MSFT: 420.25,
  TSLA: 175.80,
  NVDA: 900.10,
  AMZN: 180.40,
  GOOGL: 175.20,
  META: 475.30,
  NFLX: 610.15,
  BTC: 65000.00,
  ETH: 3450.00,
};

// Styling settings
export const APP_THEME = {
  NAME: 'Trade View',
  DARK_BG: 'bg-slate-950',
  CARD_BG: 'bg-slate-900/50 backdrop-blur-md border border-slate-800/80',
  BORDER_COLOR: 'border-slate-800',
  TEXT_MUTED: 'text-slate-400',
  TEXT_PRIMARY: 'text-slate-100',
  GLOW_GREEN: 'shadow-[0_0_15px_rgba(16,185,129,0.15)] border-emerald-500/20',
  GLOW_RED: 'shadow-[0_0_15px_rgba(239,68,68,0.15)] border-rose-500/20',
};
