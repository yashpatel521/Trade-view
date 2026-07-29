import { TradingStrategy, StrategyInput } from './types';
import { StrategyPrediction, SignalType } from '@/types/trading';

function calculateEMA(prices: number[], period: number): number[] {
  if (prices.length < period) return prices;
  const k = 2 / (period + 1);
  const ema: number[] = [];

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

export const emaRsiStrategy: TradingStrategy = {
  id: 'ema-rsi-strategy',
  name: 'EMA & RSI Momentum Strategy',
  description: 'Dual quantitative indicator system evaluating 9-period fast EMA vs 21-period slow EMA crossovers combined with 14-period Relative Strength Index (RSI) momentum signals.',

  calculateSignal(input: StrategyInput): StrategyPrediction {
    const { ticker, prices, currentPrice } = input;
    const cleanPrices = prices && prices.length >= 10 ? prices : [currentPrice * 0.92, currentPrice * 0.96, currentPrice];

    const period9 = Math.min(9, cleanPrices.length);
    const period21 = Math.min(21, cleanPrices.length);

    const ema9Arr = calculateEMA(cleanPrices, period9);
    const ema21Arr = calculateEMA(cleanPrices, period21);

    const latestEMA9 = ema9Arr[ema9Arr.length - 1] || currentPrice;
    const latestEMA21 = ema21Arr[ema21Arr.length - 1] || currentPrice * 0.98;

    const rsi14 = calculateRSI(cleanPrices, 14);

    const isEmaBullish = latestEMA9 > latestEMA21;
    const isPriceAboveEma9 = currentPrice >= latestEMA9;
    const isRsiBullish = rsi14 >= 50 && rsi14 < 70;
    const isRsiOverbought = rsi14 >= 70;
    const isRsiOversold = rsi14 <= 30;

    let signal: SignalType = 'NEUTRAL';
    let confidence = 65;
    let targetPrice = currentPrice * 1.04;
    let stopLoss = currentPrice * 0.97;
    let summary = `${ticker.toUpperCase()} is consolidating in a neutral momentum range. RSI (14) is at ${rsi14} with 9 EMA ($${latestEMA9.toFixed(2)}) near 21 EMA ($${latestEMA21.toFixed(2)}).`;

    if (isEmaBullish && (isRsiBullish || (rsi14 > 45 && isPriceAboveEma9))) {
      signal = 'BULLISH';
      confidence = Math.min(94, 75 + (rsi14 > 55 ? 12 : 5) + (isPriceAboveEma9 ? 7 : 0));
      targetPrice = Number((currentPrice * 1.075).toFixed(2));
      stopLoss = Number((Math.min(latestEMA21, currentPrice * 0.955)).toFixed(2));
      summary = `${ticker.toUpperCase()} displays a strong bullish EMA crossover structure. The 9-period EMA ($${latestEMA9.toFixed(2)}) is leading above the 21-period EMA ($${latestEMA21.toFixed(2)}), supported by positive RSI momentum at ${rsi14}.`;
    } else if (!isEmaBullish && (rsi14 < 50 || !isPriceAboveEma9)) {
      signal = 'BEARISH';
      confidence = Math.min(92, 72 + (rsi14 < 40 ? 12 : 5));
      targetPrice = Number((currentPrice * 0.925).toFixed(2));
      stopLoss = Number((Math.max(latestEMA9, currentPrice * 1.045)).toFixed(2));
      summary = `${ticker.toUpperCase()} shows bearish downside pressure. The 9-period EMA ($${latestEMA9.toFixed(2)}) has crossed below the 21-period EMA ($${latestEMA21.toFixed(2)}) with RSI weakening at ${rsi14}.`;
    } else if (isRsiOverbought) {
      signal = 'NEUTRAL';
      confidence = 70;
      summary = `${ticker.toUpperCase()} is in an overbought condition (RSI: ${rsi14}). Expect potential short-term pullbacks or consolidation before continuing trend.`;
    } else if (isRsiOversold) {
      signal = 'BULLISH';
      confidence = 68;
      targetPrice = Number((currentPrice * 1.06).toFixed(2));
      summary = `${ticker.toUpperCase()} is deeply oversold (RSI: ${rsi14}). A mean-reversion technical bounce towards 21 EMA ($${latestEMA21.toFixed(2)}) is likely.`;
    }

    return {
      id: 'ema-rsi-strategy',
      name: 'EMA & RSI Strategy',
      description: 'Dual quantitative indicator system evaluating 9-period fast EMA vs 21-period slow EMA crossovers combined with 14-period Relative Strength Index (RSI) momentum signals.',
      signal,
      confidence,
      targetPrice,
      stopLoss,
      expectedHorizon: '1 - 3 Weeks',
      summary,
      metrics: [
        {
          label: '9-Period EMA',
          value: `$${latestEMA9.toFixed(2)}`,
          status: isPriceAboveEma9 ? 'positive' : 'negative',
          description: isPriceAboveEma9 ? 'Price Above Fast EMA (Bullish)' : 'Price Below Fast EMA (Bearish)',
        },
        {
          label: '21-Period EMA',
          value: `$${latestEMA21.toFixed(2)}`,
          status: isEmaBullish ? 'positive' : 'negative',
          description: isEmaBullish ? 'Bullish Fast/Slow Crossover' : 'Bearish Crossover Structure',
        },
        {
          label: 'RSI (14)',
          value: `${rsi14}`,
          status: rsi14 >= 70 ? 'negative' : rsi14 <= 30 ? 'positive' : rsi14 >= 50 ? 'positive' : 'negative',
          description: isRsiOverbought ? 'Overbought (>70)' : isRsiOversold ? 'Oversold (<30)' : rsi14 >= 50 ? 'Bullish Zone (50-70)' : 'Bearish Zone (<50)',
        },
        {
          label: 'EMA Trend State',
          value: isEmaBullish ? 'BULLISH CROSS' : 'BEARISH CROSS',
          status: isEmaBullish ? 'positive' : 'negative',
          description: isEmaBullish ? '9 EMA > 21 EMA' : '9 EMA < 21 EMA',
        },
      ],
    };
  },
};
