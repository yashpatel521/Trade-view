'use client';

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot } from 'recharts';
import { StrategyPrediction } from '@/types/trading';
import { getStockCandlesAction } from '@/lib/actions/trading';
import { X, Activity, Sparkles, Layers, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface PatternVisualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticker: string;
  prediction: StrategyPrediction;
  nativeCurrency?: 'USD' | 'CAD';
}

type RangeType = '1d' | '1w' | '1mo' | '1y';

export default function PatternVisualizerModal({
  isOpen,
  onClose,
  ticker,
  prediction,
  nativeCurrency = 'USD',
}: PatternVisualizerModalProps) {
  const [range, setRange] = useState<RangeType>('1mo');
  const [candles, setCandles] = useState<{ date: string; price: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    let isSubscribed = true;
    async function loadChartData() {
      setIsLoading(true);
      const points = await getStockCandlesAction(ticker, range);
      if (isSubscribed) {
        setCandles(points);
        setIsLoading(false);
      }
    }
    loadChartData();
    return () => {
      isSubscribed = false;
    };
  }, [isOpen, ticker, range]);

  if (!isOpen) return null;

  const isBullish = prediction.signal === 'BULLISH';
  const isBearish = prediction.signal === 'BEARISH';
  const strokeColor = isBullish ? '#10b981' : isBearish ? '#ef4444' : '#f59e0b';
  const tickerUpper = ticker.toUpperCase();

  const fmt = (val: number) =>
    new Intl.NumberFormat(nativeCurrency === 'CAD' ? 'en-CA' : 'en-US', {
      style: 'currency',
      currency: nativeCurrency,
    }).format(val);

  // Pattern High & Low metrics for current timeframe
  let highVal = 0;
  let lowVal = 0;
  let maxPoint = candles[0];
  let minPoint = candles[0];

  if (candles.length > 0) {
    highVal = Math.max(...candles.map((c) => c.price));
    lowVal = Math.min(...candles.map((c) => c.price));
    candles.forEach((c) => {
      if (!maxPoint || c.price > maxPoint.price) maxPoint = c;
      if (!minPoint || c.price < minPoint.price) minPoint = c;
    });
  }

  // Combine historical candles with Gemini AI projected trajectory path
  const chartDataWithProjection: { date: string; price: number | null; projected: number | null }[] = candles.map((c) => ({
    date: c.date,
    price: c.price,
    projected: null,
  }));

  if (candles.length > 0) {
    const lastCandle = candles[candles.length - 1];
    const targetPrice = prediction.targetPrice;
    const currentPrice = lastCandle.price;

    if (chartDataWithProjection.length > 0) {
      chartDataWithProjection[chartDataWithProjection.length - 1].projected = currentPrice;
    }

    const stepCount = 4;
    for (let i = 1; i <= stepCount; i++) {
      const stepPrice = currentPrice + (targetPrice - currentPrice) * (i / stepCount);
      chartDataWithProjection.push({
        date: `T+${i} Projected`,
        price: null,
        projected: Number(stepPrice.toFixed(2)),
      });
    }
  }

  // Extract pattern title from summary e.g. [Pattern Identified: Double Bottom Reversal]
  const patternMatch = prediction.summary.match(/\[Pattern Identified:\s*([^\]]+)\]/i);
  const patternTitle = patternMatch ? patternMatch[1] : 'Technical Chart Formation';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#141414] border border-[#262626] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222] bg-[#0d0d0d]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-tight">{patternTitle}</h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                  {tickerUpper}
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded border ${
                    isBullish
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : isBearish
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}
                >
                  {prediction.signal} ({prediction.confidence}%)
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">Interactive Pattern Overlay & Quantitative Projection</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6">
          {/* Chart Container */}
          <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-4 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Visual Pattern Chart ({range.toUpperCase()})</span>
              </div>

              {/* Timeframe Selector Buttons */}
              <div className="flex items-center gap-3">
                <div className="inline-flex rounded-lg p-0.5 bg-neutral-900 border border-neutral-800 text-[11px] select-none">
                  <button
                    type="button"
                    onClick={() => setRange('1d')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      range === '1d' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    1D
                  </button>
                  <button
                    type="button"
                    onClick={() => setRange('1w')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      range === '1w' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    1W
                  </button>
                  <button
                    type="button"
                    onClick={() => setRange('1mo')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      range === '1mo' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    1M
                  </button>
                  <button
                    type="button"
                    onClick={() => setRange('1y')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      range === '1y' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    1Y
                  </button>
                </div>
              </div>
            </div>

            {/* Pattern Legend Strip */}
            <div className="flex items-center gap-4 text-[10px] font-semibold text-neutral-400 pt-1 border-t border-[#1a1a1a] flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Resistance (${highVal.toFixed(2)})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500" /> Support (${lowVal.toFixed(2)})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500" /> Target (${prediction.targetPrice.toFixed(2)})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-400 border border-white" /> Gemini AI Trajectory
              </span>
            </div>

            <div className="h-72 w-full relative flex items-center justify-center">
              {isLoading ? (
                <div className="text-xs text-neutral-500 flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-400 border-t-transparent" />
                  Generating pattern overlay chart...
                </div>
              ) : chartDataWithProjection.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartDataWithProjection} margin={{ top: 25, right: 25, left: -10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="modalPatternGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#666"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => {
                        if (range === '1d') return val;
                        const parts = val.split('-');
                        return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : val;
                      }}
                    />
                    <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#141414', borderColor: '#222', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                      formatter={(val: any, name: any) => [
                        val !== null && val !== undefined ? fmt(Number(val) || 0) : '—',
                        name === 'projected' ? 'Gemini AI Projected Path' : 'Price',
                      ]}
                      labelFormatter={(label) => range === '1d' ? `Time: ${label}` : `Date: ${label}`}
                    />
                    <Area type="monotone" dataKey="price" stroke={strokeColor} strokeWidth={2.5} fillOpacity={1} fill="url(#modalPatternGrad)" />

                    {/* Gemini AI Projected Pattern Trajectory Line */}
                    <Line
                      type="monotone"
                      dataKey="projected"
                      stroke="#3b82f6"
                      strokeDasharray="5 5"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 1.5 }}
                      activeDot={{ r: 6, fill: '#60a5fa' }}
                    />

                    {/* Horizontal Pattern Reference Lines */}
                    {highVal > 0 && (
                      <ReferenceLine y={highVal} stroke="#10b981" strokeDasharray="4 4" label={{ value: `Resistance: $${highVal.toFixed(2)}`, fill: '#10b981', fontSize: 10, position: 'top' }} />
                    )}
                    {lowVal > 0 && (
                      <ReferenceLine y={lowVal} stroke="#ef4444" strokeDasharray="4 4" label={{ value: `Support: $${lowVal.toFixed(2)}`, fill: '#ef4444', fontSize: 10, position: 'bottom' }} />
                    )}
                    {prediction.targetPrice > 0 && (
                      <ReferenceLine y={prediction.targetPrice} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: `Target: $${prediction.targetPrice.toFixed(2)}`, fill: '#3b82f6', fontSize: 10, position: 'right' }} />
                    )}
                    {prediction.stopLoss > 0 && (
                      <ReferenceLine y={prediction.stopLoss} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: `Stop Loss: $${prediction.stopLoss.toFixed(2)}`, fill: '#f59e0b', fontSize: 10, position: 'right' }} />
                    )}

                    {/* Key Pattern Dots */}
                    {maxPoint && <ReferenceDot x={maxPoint.date} y={maxPoint.price} r={5} fill="#10b981" stroke="#fff" strokeWidth={2} />}
                    {minPoint && <ReferenceDot x={minPoint.date} y={minPoint.price} r={5} fill="#ef4444" stroke="#fff" strokeWidth={2} />}
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-neutral-600">No chart data available.</p>
              )}
            </div>
          </div>

          {/* Pattern Breakdown & Synthesis */}
          <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 flex flex-col gap-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              Pattern Analysis Breakdown
            </h4>
            <p className="text-xs text-neutral-300 leading-relaxed">{prediction.summary}</p>
          </div>

          {/* Key Trade Parameters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[#0a0a0a] border border-[#222]">
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Target Exit</span>
              <p className="text-lg font-bold text-blue-400 mt-1">${prediction.targetPrice.toFixed(2)}</p>
              <span className="text-[10px] text-neutral-500">Projected target</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0a0a0a] border border-[#222]">
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Stop Loss</span>
              <p className="text-lg font-bold text-amber-400 mt-1">${prediction.stopLoss.toFixed(2)}</p>
              <span className="text-[10px] text-neutral-500">Risk boundary</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0a0a0a] border border-[#222]">
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Confidence</span>
              <p className="text-lg font-bold text-emerald-400 mt-1">{prediction.confidence}%</p>
              <span className="text-[10px] text-neutral-500">Model score</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0a0a0a] border border-[#222]">
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Duration</span>
              <p className="text-lg font-bold text-white mt-1">{prediction.expectedHorizon}</p>
              <span className="text-[10px] text-neutral-500">Target timeframe</span>
            </div>
          </div>

          {/* Action Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#222]">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white rounded-lg transition cursor-pointer"
            >
              Close
            </button>
            <Link
              href="/dashboard/add"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-neutral-200 transition cursor-pointer shadow-sm"
            >
              <span>Execute Trade</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
