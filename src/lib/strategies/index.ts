import { TradingStrategy, StrategyInput } from './types';
import { geminiAIStrategy } from './geminiAI';
import { trendFollowingStrategy } from './trendFollowing';
import { emaRsiStrategy } from './emaRsi';
import { chartPatternStrategy } from './chartPattern';
import { StrategyPrediction } from '@/types/trading';

export const registeredStrategies: TradingStrategy[] = [
  geminiAIStrategy,
  trendFollowingStrategy,
  emaRsiStrategy,
  chartPatternStrategy,
];

export function calculateStrategyPredictions(input: StrategyInput): StrategyPrediction[] {
  return registeredStrategies.map((strategy) => strategy.calculateSignal(input));
}

export * from './types';
export * from './geminiAI';
export * from './trendFollowing';
export * from './emaRsi';
export * from './chartPattern';
