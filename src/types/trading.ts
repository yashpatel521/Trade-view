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
