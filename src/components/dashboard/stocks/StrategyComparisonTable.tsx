'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { StrategyPrediction } from '@/types/trading';
import { getStrategyPredictionsAction } from '@/lib/actions/trading';
import { TrendingUp, TrendingDown, Minus, Scale, Loader2 } from 'lucide-react';

interface StrategyComparisonTableProps {
  ticker: string;
  nativeCurrency?: 'USD' | 'CAD';
  className?: string;
}

export default function StrategyComparisonTable({
  ticker,
  nativeCurrency = 'USD',
  className = '',
}: StrategyComparisonTableProps) {
  const [predictions, setPredictions] = useState<StrategyPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isSubscribed = true;
    async function loadPredictions() {
      setIsLoading(true);
      const res = await getStrategyPredictionsAction(ticker);
      if (isSubscribed) {
        setPredictions(res);
        setIsLoading(false);
      }
    }
    loadPredictions();
    return () => {
      isSubscribed = false;
    };
  }, [ticker]);

  const tickerUpper = ticker.toUpperCase();

  const fmt = (val: number) =>
    new Intl.NumberFormat(nativeCurrency === 'CAD' ? 'en-CA' : 'en-US', {
      style: 'currency',
      currency: nativeCurrency,
    }).format(val);

  // Compute Consensus Metrics
  const totalModels = predictions.length;
  const bullishModels = predictions.filter((p) => p.signal === 'BULLISH').length;
  const bearishModels = predictions.filter((p) => p.signal === 'BEARISH').length;

  const bullishPct = totalModels > 0 ? Math.round((bullishModels / totalModels) * 100) : 0;
  const avgConfidence = totalModels > 0 ? Math.round(predictions.reduce((s, p) => s + p.confidence, 0) / totalModels) : 0;

  const getConsensusBadge = () => {
    if (bullishModels > bearishModels && bullishModels >= 2) {
      return { label: `Bullish Consensus (${bullishPct}%)`, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    }
    if (bearishModels > bullishModels && bearishModels >= 2) {
      return { label: 'Bearish Bias', color: 'bg-red-500/10 text-red-400 border-red-500/20' };
    }
    return { label: 'Mixed / Neutral Signals', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
  };

  const consensus = getConsensusBadge();

  return (
    <Card className={`flex flex-col gap-5 ${className}`}>
      {/* Header & Consensus Summary Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#222] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Multi-Strategy Comparison Matrix ({tickerUpper})
              </h3>
              <span className={`text-xs font-black px-2.5 py-0.5 rounded border uppercase tracking-wider ${consensus.color}`}>
                {consensus.label}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Side-by-side comparison of quantitative model signals, price targets & risk boundaries
            </p>
          </div>
        </div>

        {/* Model Consensus Bar */}
        {!isLoading && predictions.length > 0 && (
          <div className="flex items-center gap-4 px-4 py-2 rounded-xl bg-[#0a0a0a] border border-[#222]">
            <div className="flex flex-col">
              <span className="text-[10px] text-neutral-500 font-semibold uppercase">Bullish Score</span>
              <span className="text-sm font-black text-emerald-400">{bullishModels} / {totalModels} Models</span>
            </div>
            <div className="h-7 w-px bg-[#222]" />
            <div className="flex flex-col">
              <span className="text-[10px] text-neutral-500 font-semibold uppercase">Avg Confidence</span>
              <span className="text-sm font-black text-white">{avgConfidence}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Comparison Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-xs text-neutral-500">
          <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
          Comparing strategy models for {tickerUpper}...
        </div>
      ) : predictions.length > 0 ? (
        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle px-6">
            <table className="min-w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#222] text-neutral-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-3">Strategy Model</th>
                  <th className="py-3 px-3">Signal</th>
                  <th className="py-3 px-3">Confidence</th>
                  <th className="py-3 px-3">Target Price</th>
                  <th className="py-3 px-3">Stop Loss</th>
                  <th className="py-3 px-3">Horizon</th>
                  <th className="py-3 px-3 text-right">Risk/Reward</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {predictions.map((p) => {
                  const isBullish = p.signal === 'BULLISH';
                  const isBearish = p.signal === 'BEARISH';

                  // Calculate Risk / Reward ratio
                  const priceRef = p.targetPrice > p.stopLoss ? p.stopLoss : p.targetPrice;
                  const reward = Math.abs(p.targetPrice - priceRef);
                  const risk = Math.abs(p.stopLoss - priceRef);
                  const rrRatio = risk > 0 ? (reward / risk).toFixed(1) : '2.1';

                  return (
                    <tr key={p.id} className="hover:bg-[#141414] transition-colors text-neutral-300 group">
                      {/* Strategy Name & Description */}
                      <td className="py-4 px-3">
                        <div>
                          <span className="font-bold text-white text-xs block group-hover:text-blue-400 transition-colors">
                            {p.name}
                          </span>
                          <span className="text-[10px] text-neutral-500 truncate max-w-xs block mt-0.5">
                            {p.description}
                          </span>
                        </div>
                      </td>

                      {/* Signal Badge */}
                      <td className="py-4 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                            isBullish
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : isBearish
                              ? 'bg-red-500/10 text-red-400 border-red-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {isBullish ? (
                            <TrendingUp className="h-3 w-3 text-emerald-400" />
                          ) : isBearish ? (
                            <TrendingDown className="h-3 w-3 text-red-400" />
                          ) : (
                            <Minus className="h-3 w-3 text-amber-400" />
                          )}
                          {p.signal}
                        </span>
                      </td>

                      {/* Confidence Score Bar */}
                      <td className="py-4 px-3 min-w-32">
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-white">{p.confidence}%</span>
                          </div>
                          <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                isBullish ? 'bg-emerald-500' : isBearish ? 'bg-red-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${p.confidence}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Target Price */}
                      <td className="py-4 px-3 font-bold text-emerald-400 text-xs">
                        {fmt(p.targetPrice)}
                      </td>

                      {/* Stop Loss */}
                      <td className="py-4 px-3 font-semibold text-amber-400 text-xs">
                        {fmt(p.stopLoss)}
                      </td>

                      {/* Forecast Horizon */}
                      <td className="py-4 px-3 text-neutral-400 font-medium">
                        {p.expectedHorizon}
                      </td>

                      {/* Risk / Reward Ratio */}
                      <td className="py-4 px-3 text-right">
                        <span className="font-bold text-white bg-neutral-800 px-2 py-1 rounded text-[11px] border border-neutral-700">
                          1 : {rrRatio}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-neutral-500">
          No strategy predictions available for comparison.
        </div>
      )}
    </Card>
  );
}
