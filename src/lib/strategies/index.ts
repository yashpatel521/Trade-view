import { TradingStrategy, StrategyInput } from './types';
import { geminiAIStrategy, getGeminiAIPrediction } from './geminiAI';
import { trendFollowingStrategy } from './trendFollowing';
import { StrategyPrediction } from '@/types/trading';

export const registeredStrategies: TradingStrategy[] = [
  geminiAIStrategy,
  trendFollowingStrategy,
];

export function calculateStrategyPredictions(input: StrategyInput): StrategyPrediction[] {
  return registeredStrategies.map((strategy) => strategy.calculateSignal(input));
}

export * from './types';
export * from './geminiAI';
export * from './trendFollowing';
