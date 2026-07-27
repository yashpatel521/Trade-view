'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { StrategyPrediction, StrategyMetric } from '@/types/trading';
import { getStrategyPredictionsAction, rescanStockStrategyAction } from '@/lib/actions/trading';
import { BrainCircuit, TrendingUp, TrendingDown, Minus, Target, ShieldAlert, Clock, Loader2, Sparkles, Activity, RotateCw, Database } from 'lucide-react';

interface StrategyForecastCardProps {
  ticker: string;
  isAdmin?: boolean;
  className?: string;
}

export const StrategyForecastCard: React.FC<StrategyForecastCardProps> = ({ ticker, isAdmin = false, className = '' }) => {
  const [predictions, setPredictions] = useState<StrategyPrediction[]>([]);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('gemini-ai');
  const [isLoading, setIsLoading] = useState(true);
  const [isRescanning, setIsRescanning] = useState(false);

  useEffect(() => {
    let isSubscribed = true;
    async function loadPredictions() {
      setIsLoading(true);
      const res = await getStrategyPredictionsAction(ticker);
      if (isSubscribed) {
        setPredictions(res);
        if (res.length > 0) {
          setSelectedStrategyId(res[0].id);
        }
        setIsLoading(false);
      }
    }
    loadPredictions();
    return () => {
      isSubscribed = false;
    };
  }, [ticker]);

  const handleRescan = async () => {
    setIsRescanning(true);
    try {
      const res = await rescanStockStrategyAction(ticker);
      setPredictions(res);
    } catch (err) {
      console.error('Failed to rescan stock strategy:', err);
    } finally {
      setIsRescanning(false);
    }
  };

  const activePrediction = predictions.find((p) => p.id === selectedStrategyId) || predictions[0];

  return (
    <Card className={`flex flex-col gap-4 ${className}`}>
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <BrainCircuit className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Strategy Forecast ({ticker.toUpperCase()})</h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wide">
                <Database className="h-3 w-3" /> Saved in DB
              </span>
            </div>
            <p className="text-xs text-neutral-400">Quantitative trend indicators & price targets</p>
          </div>
        </div>

        {/* Strategy Selector Tabs & Rescan Button */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {!isLoading && predictions.length > 0 && (
            <div className="flex items-center gap-1.5">
              {predictions.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedStrategyId(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    selectedStrategyId === p.id
                      ? 'bg-neutral-800 text-white border border-neutral-700 shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}

          {isAdmin && (
            <button
              onClick={handleRescan}
              disabled={isRescanning || isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition disabled:opacity-50 cursor-pointer shrink-0"
              title="Click to execute live Gemini AI scan and save new forecast to database"
            >
              <RotateCw className={`h-3.5 w-3.5 ${isRescanning ? 'animate-spin text-emerald-400' : 'text-neutral-400'}`} />
              <span>{isRescanning ? 'Scanning...' : 'Rescan AI'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-xs text-neutral-400">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
          Running quantitative strategy calculations for {ticker}...
        </div>
      ) : activePrediction ? (
        <div className="flex flex-col gap-4">
          {/* Main Prediction & Key Metrics Header Box */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-neutral-900/90 border border-neutral-800">
            {/* Signal Badge */}
            <div className="flex flex-col justify-between p-3.5 rounded-lg bg-neutral-950/80 border border-neutral-800/80">
              <span className="text-[11px] text-neutral-400 font-medium">Model Direction</span>
              <div className="mt-2 flex items-center gap-2">
                {activePrediction.signal === 'BULLISH' ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    Bullish Trend
                  </div>
                ) : activePrediction.signal === 'BEARISH' ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold uppercase tracking-wider">
                    <TrendingDown className="h-4 w-4 text-red-400" />
                    Bearish Trend
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold uppercase tracking-wider">
                    <Minus className="h-4 w-4 text-amber-400" />
                    Neutral Range
                  </div>
                )}
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-medium">
                  <span>Model Confidence</span>
                  <span className="text-white font-semibold">{activePrediction.confidence}%</span>
                </div>
                <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      activePrediction.signal === 'BULLISH'
                        ? 'bg-emerald-500'
                        : activePrediction.signal === 'BEARISH'
                        ? 'bg-red-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${activePrediction.confidence}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Target Price */}
            <div className="flex flex-col justify-between p-3.5 rounded-lg bg-neutral-950/80 border border-neutral-800/80">
              <div className="flex items-center justify-between text-[11px] text-neutral-400 font-medium">
                <span>Target Price</span>
                <Target className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div className="mt-2 text-lg font-bold text-white tracking-tight">
                ${activePrediction.targetPrice.toFixed(2)}
              </div>
              <span className="text-[11px] text-emerald-400 font-medium mt-1">
                Projected Strategy Exit
              </span>
            </div>

            {/* Stop Loss / Risk Boundary */}
            <div className="flex flex-col justify-between p-3.5 rounded-lg bg-neutral-950/80 border border-neutral-800/80">
              <div className="flex items-center justify-between text-[11px] text-neutral-400 font-medium">
                <span>Stop Loss / Risk Boundary</span>
                <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <div className="mt-2 text-lg font-bold text-neutral-200 tracking-tight">
                ${activePrediction.stopLoss.toFixed(2)}
              </div>
              <span className="text-[11px] text-neutral-400 font-medium mt-1">
                Support Cutoff Level
              </span>
            </div>

            {/* Expected Time Horizon */}
            <div className="flex flex-col justify-between p-3.5 rounded-lg bg-neutral-950/80 border border-neutral-800/80">
              <div className="flex items-center justify-between text-[11px] text-neutral-400 font-medium">
                <span>Forecast Horizon</span>
                <Clock className="h-3.5 w-3.5 text-blue-400" />
              </div>
              <div className="mt-2 text-lg font-bold text-white tracking-tight">
                {activePrediction.expectedHorizon}
              </div>
              <span className="text-[11px] text-neutral-400 font-medium mt-1">
                Estimated Duration
              </span>
            </div>
          </div>

          {/* Strategy Model Technical Explanation */}
          <div className="p-3.5 rounded-xl bg-neutral-900/50 border border-neutral-800/80 flex items-start gap-3">
            <Activity className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-semibold text-white mb-1">Model Synthesis & Technical Rationale</h4>
              <p className="text-xs text-neutral-300 leading-relaxed">{activePrediction.summary}</p>
            </div>
          </div>

          {/* Technical Indicator Metrics Grid */}
          <div>
            <h4 className="text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">
              Technical Indicator Breakdown
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {activePrediction.metrics.map((m, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800/80">
                  <div className="text-[11px] text-neutral-400 font-medium">{m.label}</div>
                  <div
                    className={`text-sm font-bold mt-1 ${
                      m.status === 'positive'
                        ? 'text-emerald-400'
                        : m.status === 'negative'
                        ? 'text-red-400'
                        : 'text-neutral-200'
                    }`}
                  >
                    {m.value}
                  </div>
                  {m.description && (
                    <div className="text-[10px] text-neutral-400 mt-1 line-clamp-1">{m.description}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-neutral-500">
          No strategy predictions available for {ticker}.
        </div>
      )}
    </Card>
  );
};

export default StrategyForecastCard;
