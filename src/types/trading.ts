export interface Trade {
  id: number;
  userId: number;
  ticker: string;
  type: 'BUY' | 'SELL';
  shares: number;
  price: number;
  date: string; // YYYY-MM-DD
  createdAt: Date;
}

export interface Holding {
  id: number;
  userId: number;
  ticker: string;
  shares: number;
  averagePrice: number;
  updatedAt: Date;
  // Computed client-side / after database query
  currentPrice?: number;
  currentValue?: number;
  totalCost?: number;
  unrealizedPL?: number;
  unrealizedPLPercent?: number;
  nativeCurrency?: 'USD' | 'CAD';
  nativeAveragePrice?: number;
  nativeCurrentPrice?: number;
  nativeTotalCost?: number;
  nativeCurrentValue?: number;
  nativeUnrealizedPL?: number;
}

export interface DailyLog {
  id: number;
  userId: number;
  date: string; // YYYY-MM-DD
  profitLoss: number;
  note?: string | null;
  createdAt: Date;
}

export interface DashboardStats {
  totalPortfolioValue: number;
  cashBalance: number;
  totalCost: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  winRate: number; // percentage of profitable logs
  profitableDaysCount: number;
  totalDaysCount: number;
  recentPLChange: number; // last P&L entry value
  currency: 'CAD' | 'USD';
  fxRate: number;
  isPublic: boolean;
}

export interface ChartDataPoint {
  date: string;
  profitLoss: number;
  cumulativeProfit: number;
}

export interface AllocationData {
  name: string; // ticker
  value: number; // currentValue
  percentage: number;
}

export interface DashboardData {
  stats: DashboardStats;
  holdings: Holding[];
  dailyLogs: DailyLog[];
  chartData: ChartDataPoint[];
  allocationData: AllocationData[];
  trades: Trade[];
}

export interface PublicPortfolio {
  userId: number;
  name: string;
  email: string;
  totalPortfolioValue: number;
  cashBalance: number;
  holdingsCount: number;
  holdingsSummary: string[];
}

export interface PublicPortfolioDetails {
  user: {
    id: number;
    name: string;
    email: string;
    isPublic: boolean;
  };
  stats: {
    totalPortfolioValue: number;
    cashBalance: number;
    totalCost: number;
    unrealizedPL: number;
    unrealizedPLPercent: number;
    fxRate: number;
  };
  holdings: Holding[];
}

export interface StockNewsItem {
  id: string | number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  image?: string;
  datetime: number;
  timeAgo?: string;
}

export type SignalType = 'BULLISH' | 'BEARISH' | 'NEUTRAL';

export interface StrategyMetric {
  label: string;
  value: string;
  status: 'positive' | 'negative' | 'neutral';
  description?: string;
}

export interface StrategyPrediction {
  id: string;
  name: string;
  description: string;
  signal: SignalType;
  confidence: number;
  targetPrice: number;
  stopLoss: number;
  expectedHorizon: string;
  summary: string;
  metrics: StrategyMetric[];
}

export interface WeeklyReportStock {
  rank: number;
  stock: string;
  bias: string;
  expectedDayHigh: string;
  expectedDayLow: string;
  expectedWeekHigh: string;
  expectedWeekLow: string;
  waitUntil?: string;
  confidence: string;
}

export interface SavedWeeklyReportRecord {
  id: number;
  createdAt: string;
  report: WeeklyReportStock[];
}

export interface WatchlistItem {
  id: number;
  ticker: string;
  nativeCurrency: 'USD' | 'CAD';
  nativeCurrentPrice: number;
  dayChange: number;
  dayChangePercent: number;
  addedAt: string;
}

export interface StockSearchResult {
  symbol: string;
  description: string;
  type: string;
}
