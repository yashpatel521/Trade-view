import { StrategyPrediction } from '@/types/trading';

export interface StrategyInput {
  ticker: string;
  prices: number[]; // Historical closing prices (oldest to newest)
  dates: string[];  // Corresponding dates
  currentPrice: number;
}

export interface TradingStrategy {
  id: string;
  name: string;
  description: string;
  calculateSignal(input: StrategyInput): StrategyPrediction;
}
