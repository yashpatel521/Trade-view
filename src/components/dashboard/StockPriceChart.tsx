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
  ReferenceLine,
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
  const [range, setRange] = useState<RangeType>('1d');
  const [dataPoints, setDataPoints] = useState<{ date: string; price: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isWebSocketActive, setIsWebSocketActive] = useState(false);

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

  // Finnhub Live WebSocket Stream for 1D Intraday chart
  useEffect(() => {
    if (range !== '1d') {
      setIsWebSocketActive(false);
      return;
    }

    const cleanTicker = ticker.toUpperCase().trim().replace(/\.(TO|V|CN)$/i, '');
    const apiKey = 'd8q0q89r01qr03nct970d8q0q89r01qr03nct97g';
    let socket: WebSocket | null = null;

    try {
      socket = new WebSocket(`wss://ws.finnhub.io?token=${apiKey}`);

      socket.onopen = () => {
        socket?.send(JSON.stringify({ type: 'subscribe', symbol: cleanTicker }));
        setIsWebSocketActive(true);
      };

      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg && msg.type === 'trade' && Array.isArray(msg.data) && msg.data.length > 0) {
            const lastTrade = msg.data[msg.data.length - 1];
            if (typeof lastTrade.p === 'number' && lastTrade.p > 0) {
              const livePrice = parseFloat(lastTrade.p.toFixed(2));
              const liveTime = new Date(lastTrade.t || Date.now()).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              setDataPoints((prev) => {
                if (prev.length === 0) return [{ date: liveTime, price: livePrice }];
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                if (updated[lastIdx].date === liveTime) {
                  updated[lastIdx] = { date: liveTime, price: livePrice };
                } else {
                  updated.push({ date: liveTime, price: livePrice });
                }
                return updated;
              });
            }
          }
        } catch (e) {
          console.error('Error parsing Finnhub WebSocket trade message:', e);
        }
      };

      socket.onerror = (err) => {
        console.error('Finnhub WebSocket error:', err);
        setIsWebSocketActive(false);
      };

      socket.onclose = () => {
        setIsWebSocketActive(false);
      };
    } catch (err) {
      console.error('Failed to open Finnhub WebSocket:', err);
    }

    return () => {
      if (socket) {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'unsubscribe', symbol: cleanTicker }));
        }
        socket.close();
      }
      setIsWebSocketActive(false);
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

  const avgPrice = maxPoint && minPoint ? (maxPoint.price + minPoint.price) / 2 : null;

  // Compute chart display data: For 1D mode, pad timeline up to market close (4:00 PM) with null prices
  let displayData: { date: string; price: number | null }[] = dataPoints;

  if (range === '1d' && dataPoints.length > 0) {
    displayData = [...dataPoints];
    const lastDate = dataPoints[dataPoints.length - 1].date;
    const marketCloseMin = 16 * 60; // 4:00 PM = 960 mins
    
    let lastMin = 9 * 60 + 30; // 09:30 AM
    try {
      const match = lastDate.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (match) {
        let hrs = parseInt(match[1], 10);
        const mins = parseInt(match[2], 10);
        const ampm = match[3]?.toUpperCase();
        if (ampm === 'PM' && hrs < 12) hrs += 12;
        if (ampm === 'AM' && hrs === 12) hrs = 0;
        lastMin = hrs * 60 + mins;
      }
    } catch (e) {}

    for (let m = lastMin + 15; m <= marketCloseMin; m += 15) {
      const h = Math.floor(m / 60);
      const mins = m % 60;
      const d = new Date();
      d.setHours(h, mins, 0, 0);
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      displayData.push({ date: timeStr, price: null });
    }
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

            {range === '1d' && isWebSocketActive && (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live WebSocket
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
        ) : displayData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayData} margin={{ top: 25, right: 20, left: -10, bottom: 10 }}>
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
                  if (range === '1d') return val;
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
                formatter={(val: any) => [val !== null && val !== undefined ? fmt(Number(val) || 0) : '—', 'Price']}
                labelFormatter={(label) => range === '1d' ? `Time: ${label}` : `Date: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="price"
                connectNulls={false}
                stroke={strokeColor}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#${gradientId})`}
              />

              {/* Continuous Dotted High Price Reference Line */}
              {maxPoint && (
                <ReferenceLine
                  y={maxPoint.price}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                />
              )}

              {/* Continuous Dotted Low Price Reference Line */}
              {minPoint && minPoint !== maxPoint && (
                <ReferenceLine
                  y={minPoint.price}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                />
              )}

              {/* 3rd Continuous Dotted Midpoint / Average Reference Line */}
              {avgPrice !== null && (
                <ReferenceLine
                  y={avgPrice}
                  stroke="#3b82f6"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: `Avg (Mid): ${fmt(avgPrice)}`,
                    fill: '#3b82f6',
                    fontSize: 10,
                    fontWeight: 'bold',
                    position: 'right',
                  }}
                />
              )}

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
