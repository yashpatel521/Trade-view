'use client';

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { getStockCandlesAction } from '@/lib/actions/trading';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

interface StockPriceChartProps {
  ticker: string;
  nativeCurrency?: 'USD' | 'CAD';
  className?: string;
}

type RangeType = '1d' | '1w' | '1mo' | '3mo' | '1y';

export const StockPriceChart: React.FC<StockPriceChartProps> = ({
  ticker,
  nativeCurrency = 'USD',
  className = '',
}) => {
  const [range, setRange] = useState<RangeType>('1mo');
  const [dataPoints, setDataPoints] = useState<{ date: string; price: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let isSubscribed = true;
    async function loadCandles() {
      setIsLoading(true);
      const points = await getStockCandlesAction(ticker, range);
      if (isSubscribed) {
        setDataPoints(points);
        setIsLoading(false);
      }
    }
    loadCandles();
    return () => {
      isSubscribed = false;
    };
  }, [ticker, range]);

  const fmt = (val: number) =>
    new Intl.NumberFormat(nativeCurrency === 'CAD' ? 'en-CA' : 'en-US', {
      style: 'currency',
      currency: nativeCurrency,
    }).format(val);

  const firstPrice = dataPoints[0]?.price ?? 0;
  const lastPrice = dataPoints[dataPoints.length - 1]?.price ?? 0;
  const priceChange = lastPrice - firstPrice;
  const priceChangePct = firstPrice > 0 ? (priceChange / firstPrice) * 100 : 0;
  const isUp = priceChange >= 0;

  let maxPoint = dataPoints.length > 0 ? dataPoints[0] : null;
  let minPoint = dataPoints.length > 0 ? dataPoints[0] : null;

  if (dataPoints.length > 0) {
    dataPoints.forEach((p) => {
      if (!maxPoint || p.price > maxPoint.price) maxPoint = p;
      if (!minPoint || p.price < minPoint.price) minPoint = p;
    });
  }

  const strokeColor = isUp ? '#10b981' : '#ef4444';
  const gradientId = `stockColorGrad_${ticker.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <Card className={`flex flex-col justify-between gap-4 h-full ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">Price History ({ticker})</h3>
            {!isLoading && dataPoints.length > 0 && (
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded ${
                  isUp
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
              >
                {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {isUp ? '+' : ''}
                {priceChangePct.toFixed(2)}% ({range.toUpperCase()})
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">Live stock price trend chart</p>
        </div>

        {/* Range Selector Buttons */}
        <div className="inline-flex rounded-lg p-0.5 bg-neutral-900 border border-neutral-800 text-xs select-none self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setRange('1d')}
            className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
              range === '1d'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            1D
          </button>
          <button
            type="button"
            onClick={() => setRange('1w')}
            className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
              range === '1w'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            1W
          </button>
          <button
            type="button"
            onClick={() => setRange('1mo')}
            className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
              range === '1mo'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            1M
          </button>
          <button
            type="button"
            onClick={() => setRange('3mo')}
            className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
              range === '3mo'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            3M
          </button>
          <button
            type="button"
            onClick={() => setRange('1y')}
            className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
              range === '1y'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            1Y
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 min-h-80 w-full relative flex items-center justify-center">
        {isLoading || !mounted ? (
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
            Loading price chart...
          </div>
        ) : dataPoints.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dataPoints} margin={{ top: 25, right: 20, left: -10, bottom: 10 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
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
                  const parts = val.split('-');
                  return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : val;
                }}
              />
              <YAxis
                stroke="#666"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                domain={['auto', 'auto']}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#141414',
                  borderColor: '#222',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#fff',
                }}
                formatter={(val: any) => [fmt(Number(val) || 0), 'Price']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={strokeColor}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#${gradientId})`}
              />

              {/* Always-visible Highest Price Dot */}
              {maxPoint && (
                <ReferenceDot
                  x={maxPoint.date}
                  y={maxPoint.price}
                  r={6}
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth={2}
                  label={{
                    value: maxPoint.date === dataPoints[0]?.date ? `High (Open): ${fmt(maxPoint.price)}` : `High: ${fmt(maxPoint.price)}`,
                    fill: '#10b981',
                    fontSize: 11,
                    fontWeight: 'bold',
                    position: maxPoint.date === dataPoints[0]?.date ? 'right' : 'top',
                  }}
                />
              )}

              {/* Always-visible Lowest Price Dot */}
              {minPoint && minPoint !== maxPoint && (
                <ReferenceDot
                  x={minPoint.date}
                  y={minPoint.price}
                  r={6}
                  fill="#ef4444"
                  stroke="#ffffff"
                  strokeWidth={2}
                  label={{
                    value: minPoint.date === dataPoints[0]?.date ? `Low (Open): ${fmt(minPoint.price)}` : `Low: ${fmt(minPoint.price)}`,
                    fill: '#ef4444',
                    fontSize: 11,
                    fontWeight: 'bold',
                    position: minPoint.date === dataPoints[0]?.date ? 'right' : 'bottom',
                  }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-xs text-neutral-600">No chart data available for {ticker}.</p>
        )}
      </div>
    </Card>
  );
};

export default StockPriceChart;
