import { TradingStrategy, StrategyInput } from './types';
import { StrategyPrediction, SignalType } from '@/types/trading';

function calculateEMA(prices: number[], period: number): number[] {
  if (prices.length < period) return prices;
  const k = 2 / (period + 1);
  const ema: number[] = [];

  // Simple moving average for initial EMA value
  let sum = 0;
  for (let i = 0; i < period; i++) sum += prices[i];
  ema[period - 1] = sum / period;

  for (let i = period; i < prices.length; i++) {
    ema[i] = prices[i] * k + ema[i - 1] * (1 - k);
  }

  return ema;
}

function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length <= period) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = prices.length - period; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return Math.round(100 - 100 / (1 + rs));
}

export const trendFollowingStrategy: TradingStrategy = {
  id: 'trend-following',
  name: 'Trend Following Strategy',
  description: 'Identifies directional momentum using 20-day vs 50-day EMA crossovers, RSI momentum, and 20-period Donchian breakout channels.',

  calculateSignal(input: StrategyInput): StrategyPrediction {
    const { ticker, prices, currentPrice } = input;
    const cleanPrices = prices && prices.length >= 10 ? prices : [currentPrice * 0.9, currentPrice * 0.95, currentPrice];

    const period20 = Math.min(20, cleanPrices.length);
    const period50 = Math.min(50, cleanPrices.length);

    const ema20Arr = calculateEMA(cleanPrices, period20);
    const ema50Arr = calculateEMA(cleanPrices, period50);

    const latestEMA20 = ema20Arr[ema20Arr.length - 1] || currentPrice;
    const latestEMA50 = ema50Arr[ema50Arr.length - 1] || currentPrice * 0.98;

    const rsi14 = calculateRSI(cleanPrices, 14);

    const recentPrices = cleanPrices.slice(-20);
    const high20 = Math.max(...recentPrices);
    const low20 = Math.min(...recentPrices);

    let signal: SignalType = 'NEUTRAL';
    let confidence = 60;
    let targetPrice = currentPrice * 1.03;
    let stopLoss = currentPrice * 0.96;
    let summary = `${ticker.toUpperCase()} is currently in a neutral consolidation range between $${low20.toFixed(2)} and $${high20.toFixed(2)}.`;

    // Trend Evaluation Rules
    const isEmaBullish = latestEMA20 > latestEMA50;
    const isPriceAboveEma = currentPrice >= latestEMA20;
    const isBreakoutHigh = currentPrice >= high20 * 0.98;

    if (isEmaBullish && isPriceAboveEma) {
      signal = 'BULLISH';
      confidence = Math.min(92, 75 + (rsi14 > 50 ? 10 : 0) + (isBreakoutHigh ? 7 : 0));
      targetPrice = Number((currentPrice * 1.085).toFixed(2));
      stopLoss = Number((Math.min(latestEMA50, currentPrice * 0.95)).toFixed(2));
      summary = `${ticker.toUpperCase()} is exhibiting a strong bullish momentum structure. The 20-day EMA ($${latestEMA20.toFixed(2)}) is trending above the 50-day EMA ($${latestEMA50.toFixed(2)}), signalling persistent upside continuation.`;
    } else if (!isEmaBullish && !isPriceAboveEma) {
      signal = 'BEARISH';
      confidence = Math.min(90, 72 + (rsi14 < 45 ? 12 : 0));
      targetPrice = Number((currentPrice * 0.915).toFixed(2));
      stopLoss = Number((Math.max(latestEMA20, currentPrice * 1.04)).toFixed(2));
      summary = `${ticker.toUpperCase()} is trading below its key moving averages in a bearish downward channel. The 20-day EMA ($${latestEMA20.toFixed(2)}) remains under the 50-day EMA ($${latestEMA50.toFixed(2)}).`;
    }

    return {
      id: 'trend-following',
      name: 'Trend Following Strategy',
      description: 'Identifies directional momentum using 20-day vs 50-day EMA crossovers, RSI momentum, and 20-period Donchian breakout channels.',
      signal,
      confidence,
      targetPrice,
      stopLoss,
      expectedHorizon: '2 - 4 Weeks',
      summary,
      metrics: [
        {
          label: '20-Day EMA',
          value: `$${latestEMA20.toFixed(2)}`,
          status: isPriceAboveEma ? 'positive' : 'negative',
          description: isPriceAboveEma ? 'Price Above EMA20 (Bullish)' : 'Price Below EMA20 (Bearish)',
        },
        {
          label: '50-Day EMA',
          value: `$${latestEMA50.toFixed(2)}`,
          status: isEmaBullish ? 'positive' : 'negative',
          description: isEmaBullish ? 'Golden Cross Structure' : 'Death Cross Structure',
        },
        {
          label: 'RSI (14)',
          value: `${rsi14}`,
          status: rsi14 >= 70 ? 'negative' : rsi14 <= 30 ? 'positive' : 'neutral',
          description: rsi14 >= 70 ? 'Overbought (>70)' : rsi14 <= 30 ? 'Oversold (<30)' : 'Neutral Momentum',
        },
        {
          label: '20D High Channel',
          value: `$${high20.toFixed(2)}`,
          status: isBreakoutHigh ? 'positive' : 'neutral',
          description: 'Breakout Resistance Level',
        },
      ],
    };
  },
};
