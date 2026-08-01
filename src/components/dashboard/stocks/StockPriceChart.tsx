"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  ReferenceLine,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { StockLogo } from "@/components/ui/StockLogo";
import {
  getStockCandlesAction,
  getStockMarketDetailsAction,
  getWatchlistAction,
  addTradeAction,
  getDashboardDataAction,
} from "@/lib/actions/trading";
import {
  TrendingUp,
  TrendingDown,
  Loader2,
  Maximize2,
  Minimize2,
  X,
  Star,
  ChevronDown,
  ArrowLeft,
  Settings,
  Sun,
  Moon,
  Clock,
  LayoutGrid,
  Check,
} from "lucide-react";

interface StockPriceChartProps {
  ticker: string;
  nativeCurrency?: "USD" | "CAD";
  className?: string;
}

type RangeType = "1h" | "1d" | "1w" | "1mo" | "3mo" | "ytd" | "1y" | "10y";

interface WatchlistItemDisplay {
  ticker: string;
  name: string;
  price: string;
  change: string;
  isUp: boolean;
  currency: "USD" | "CAD";
}

function computeEMA(prices: number[], period: number): (number | null)[] {
  if (prices.length < period) return new Array(prices.length).fill(null);
  const k = 2 / (period + 1);
  const result: (number | null)[] = new Array(period - 1).fill(null);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  result.push(ema);

  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
    result.push(ema);
  }
  return result;
}

function computeRSI(prices: number[], period = 14): (number | null)[] {
  if (prices.length <= period) return new Array(prices.length).fill(null);
  const result: (number | null)[] = new Array(period).fill(null);
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;
  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  result.push(100 - 100 / (1 + rs));

  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    const gain = diff >= 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result.push(100 - 100 / (1 + rs));
  }
  return result;
}

export const StockPriceChart: React.FC<StockPriceChartProps> = ({
  ticker,
  nativeCurrency = "USD",
  className = "",
}) => {
  const [currentTicker, setCurrentTicker] = useState<string>(ticker);
  const [range, setRange] = useState<RangeType>("1d");
  const [dataPoints, setDataPoints] = useState<
    { date: string; price: number }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Dynamic watchlist state
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItemDisplay[]>([]);
  const [mini1dDataPoints, setMini1dDataPoints] = useState<{ date: string; price: number }[]>([]);
  const [userHoldings, setUserHoldings] = useState<any[]>([]);

  // Fullview state
  const [activeTab, setActiveTab] = useState<
    "pending" | "holdings" | "history"
  >("pending");
  const [showIndicatorsMenu, setShowIndicatorsMenu] = useState(false);
  const [showEMA20, setShowEMA20] = useState(true);
  const [showEMA50, setShowEMA50] = useState(false);
  const [showRSI, setShowRSI] = useState(false);
  const [showRefLines, setShowRefLines] = useState(true);
  const [intervalOption, setIntervalOption] = useState("1m");
  const [marketDetails, setMarketDetails] = useState<any>(null);

  // Quick Buy/Sell Modal State inside Full View
  const [tradeModalType, setTradeModalType] = useState<"BUY" | "SELL" | null>(
    null,
  );
  const [tradeShares, setTradeShares] = useState<string>("1");
  const [tradeStatus, setTradeStatus] = useState<{
    error?: string;
    success?: boolean;
  } | null>(null);
  const [isTrading, setIsTrading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch dynamic watchlist items on mount / fullview
  useEffect(() => {
    async function loadWatchlist() {
      const items = await getWatchlistAction();
      if (items && items.length > 0) {
        const mapped: WatchlistItemDisplay[] = items.map((item) => ({
          ticker: item.ticker,
          name: item.ticker,
          price: item.nativeCurrentPrice
            ? `$${item.nativeCurrentPrice.toFixed(2)}`
            : "—",
          change:
            typeof item.dayChangePercent === "number"
              ? `${item.dayChangePercent >= 0 ? "+" : ""}${item.dayChangePercent.toFixed(2)}%`
              : "0.00%",
          isUp: (item.dayChangePercent ?? 0) >= 0,
          currency:
            item.nativeCurrency ||
            (item.ticker.endsWith(".TO") ||
            item.ticker.endsWith(".V") ||
            item.ticker.endsWith(".CN")
              ? "CAD"
              : "USD"),
        }));
        setWatchlistItems(mapped);
      }
    }
    if (isFullscreen) {
      loadWatchlist();
    }
  }, [isFullscreen]);

  // Update chart when active ticker or range changes
  useEffect(() => {
    let isSubscribed = true;
    async function loadCandles() {
      setIsLoading(true);
      const mappedRange =
        range === "1h" || range === "1d"
          ? "1d"
          : range === "1w"
            ? "1w"
            : range === "1mo"
              ? "1mo"
              : range === "3mo"
                ? "3mo"
                : "1y";
      const points = await getStockCandlesAction(currentTicker, mappedRange);
      if (isSubscribed) {
        setDataPoints(points);
        setIsLoading(false);
      }
    }
    loadCandles();
    return () => {
      isSubscribed = false;
    };
  }, [currentTicker, range]);

  // Fetch market details & holdings for active ticker
  useEffect(() => {
    if (isFullscreen) {
      getStockMarketDetailsAction(currentTicker).then(setMarketDetails);
      getStockCandlesAction(currentTicker, '1d').then((points) => {
        if (points && points.length > 0) {
          setMini1dDataPoints(points);
        }
      });
      getDashboardDataAction().then((data) => {
        if (data && data.holdings) setUserHoldings(data.holdings);
      });
    }
  }, [currentTicker, isFullscreen]);

  const activeCurrency: "USD" | "CAD" =
    currentTicker.endsWith(".TO") ||
    currentTicker.endsWith(".V") ||
    currentTicker.endsWith(".CN")
      ? "CAD"
      : "USD";

  const fmt = (val: number) =>
    new Intl.NumberFormat(activeCurrency === "CAD" ? "en-CA" : "en-US", {
      style: "currency",
      currency: activeCurrency,
    }).format(val);

  const rawPrices = useMemo(() => dataPoints.map((p) => p.price), [dataPoints]);
  const ema20Values = useMemo(() => computeEMA(rawPrices, 20), [rawPrices]);
  const ema50Values = useMemo(() => computeEMA(rawPrices, 50), [rawPrices]);
  const rsiValues = useMemo(() => computeRSI(rawPrices, 14), [rawPrices]);

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

  const avgPrice =
    maxPoint && minPoint ? (maxPoint.price + minPoint.price) / 2 : null;

  // Compute padded timeline data for 1D chart view up to 4:00 PM
  const enrichedDisplayData = useMemo(() => {
    if (dataPoints.length === 0) return [];

    let base = dataPoints.map((p, idx) => ({
      date: p.date,
      price: p.price as number | null,
      ema20: ema20Values[idx] ?? null,
      ema50: ema50Values[idx] ?? null,
      rsi: rsiValues[idx] ?? null,
    }));

    if ((range === "1d" || range === "1h") && dataPoints.length > 0) {
      const lastDate = dataPoints[dataPoints.length - 1].date;
      const marketCloseMin = 16 * 60; // 4:00 PM
      let lastMin = 9 * 60 + 30; // 09:30 AM
      try {
        const match = lastDate.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (match) {
          let hrs = parseInt(match[1], 10);
          const mins = parseInt(match[2], 10);
          const ampm = match[3]?.toUpperCase();
          if (ampm === "PM" && hrs < 12) hrs += 12;
          if (ampm === "AM" && hrs === 12) hrs = 0;
          lastMin = hrs * 60 + mins;
        }
      } catch (e) {}

      for (let m = lastMin + 15; m <= marketCloseMin; m += 15) {
        const h = Math.floor(m / 60);
        const mins = m % 60;
        const d = new Date();
        d.setHours(h, mins, 0, 0);
        const timeStr = d.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        base.push({
          date: timeStr,
          price: null,
          ema20: null,
          ema50: null,
          rsi: null,
        });
      }
    }
    return base;
  }, [dataPoints, range, ema20Values, ema50Values, rsiValues]);

  const strokeColor = "#10b981";
  const gradientId = `stockColorGrad_${currentTicker.replace(/[^a-zA-Z0-9]/g, "")}`;

  const handleExecuteTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradeModalType) return;
    setIsTrading(true);
    setTradeStatus(null);

    const formData = new FormData();
    formData.append("ticker", currentTicker);
    formData.append("type", tradeModalType);
    formData.append("shares", tradeShares);
    formData.append("price", String(lastPrice));
    formData.append("date", new Date().toISOString().slice(0, 10));
    formData.append("currency", activeCurrency);

    const res = await addTradeAction(null, formData);
    setIsTrading(false);
    if (res?.error) {
      setTradeStatus({ error: res.error });
    } else {
      setTradeStatus({ success: true });
      setTimeout(() => setTradeModalType(null), 1200);
    }
  };

  const currentTimeStr = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const renderStandardChart = () => (
    <div className="w-full relative flex items-center justify-center flex-1 min-h-80">
      {isLoading || !mounted ? (
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
          Loading price chart...
        </div>
      ) : enrichedDisplayData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={enrichedDisplayData}
            margin={{ top: 40, right: 35, left: -10, bottom: 35 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#222"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke="#666"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => {
                if (range === "1d" || range === "1h") return val;
                const parts = val.split("-");
                return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : val;
              }}
            />
            <YAxis
              stroke="#666"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={["auto", "auto"]}
              tickFormatter={(val) => `$${val}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#141414",
                borderColor: "#222",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#fff",
              }}
              formatter={(val: any) => [
                val !== null && val !== undefined ? fmt(Number(val) || 0) : "—",
                "Price",
              ]}
              labelFormatter={(label) =>
                range === "1d" || range === "1h"
                  ? `Time: ${label}`
                  : `Date: ${label}`
              }
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

            {maxPoint && (
              <ReferenceLine
                y={maxPoint.price}
                stroke="#10b981"
                strokeDasharray="4 4"
                strokeWidth={1.5}
              />
            )}
            {minPoint && minPoint !== maxPoint && (
              <ReferenceLine
                y={minPoint.price}
                stroke="#ef4444"
                strokeDasharray="4 4"
                strokeWidth={1.5}
              />
            )}
            {avgPrice !== null && (
              <ReferenceLine
                y={avgPrice}
                stroke="#3b82f6"
                strokeDasharray="4 4"
                strokeWidth={1.5}
              />
            )}
            {maxPoint && (
              <ReferenceDot
                x={maxPoint.date}
                y={maxPoint.price}
                r={6}
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth={2}
                label={{
                  value: `High: ${fmt(maxPoint.price)}`,
                  fill: "#10b981",
                  fontSize: 11,
                  fontWeight: "bold",
                  position: "top",
                }}
              />
            )}
            {minPoint && minPoint !== maxPoint && (
              <ReferenceDot
                x={minPoint.date}
                y={minPoint.price}
                r={6}
                fill="#ef4444"
                stroke="#ffffff"
                strokeWidth={2}
                label={{
                  value: `Low: ${fmt(minPoint.price)}`,
                  fill: "#ef4444",
                  fontSize: 11,
                  fontWeight: "bold",
                  position: "bottom",
                }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-xs text-neutral-600">
          No chart data available for {currentTicker}.
        </p>
      )}
    </div>
  );

  return (
    <>
      {/* Standard Dashboard Card Chart */}
      <Card
        className={`flex flex-col justify-between gap-4 h-full ${className}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">
                Price History ({currentTicker})
              </h3>
              {!isLoading && dataPoints.length > 0 && (
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded ${
                    isUp
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}
                >
                  {isUp ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {isUp ? "+" : ""}
                  {priceChangePct.toFixed(2)}% ({range.toUpperCase()})
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Live stock price trend chart
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="inline-flex rounded-lg p-0.5 bg-neutral-900 border border-neutral-800 text-xs select-none">
              {(["1d", "1w", "1mo", "3mo", "1y"] as RangeType[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    range === r
                      ? "bg-neutral-800 text-white"
                      : "text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors cursor-pointer"
              title="Open Trade-View Pro Full Terminal"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Full View</span>
            </button>
          </div>
        </div>

        {renderStandardChart()}
      </Card>

      {/* Trade-View Terminal Full Screen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 w-screen h-screen z-50 bg-[#0a0a0a] text-white flex flex-row overflow-hidden font-sans select-none animate-in fade-in duration-150">
          {/* ========================================================= */}
          {/* LEFT COLUMN: Watchlist Sidebar (~20% Width)              */}
          {/* ========================================================= */}
          <div className="w-64 border-r border-[#191919] bg-[#0d0d0d] flex flex-col justify-between shrink-0">
            <div>
              {/* Watchlist Header */}
              <div className="h-14 border-b border-[#191919] px-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Watchlist
                </h3>
                <button
                  type="button"
                  className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                  title="Watchlist Options"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>

              {/* Scrollable Watchlist Tickers List */}
              <div className="overflow-y-auto max-h-[calc(100vh-7rem)] divide-y divide-[#151515]">
                {watchlistItems.length > 0 ? (
                  watchlistItems.map((item) => {
                    const isSelected =
                      item.ticker.toUpperCase() === currentTicker.toUpperCase();
                    return (
                      <button
                        key={item.ticker}
                        type="button"
                        onClick={() => setCurrentTicker(item.ticker)}
                        className={`w-full px-4 py-3 flex items-center justify-between transition-colors cursor-pointer text-left ${
                          isSelected
                            ? "bg-neutral-800/80 border-l-2 border-emerald-400"
                            : "hover:bg-[#141414]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <StockLogo ticker={item.ticker} size={28} />
                          <span className="text-xs font-bold text-white truncate">
                            {item.ticker}
                          </span>
                        </div>

                        <div className="flex flex-col items-end text-right">
                          <span className="text-xs font-bold text-white leading-tight">
                            {item.price}{" "}
                            <span className="text-[9px] text-neutral-500 font-normal">
                              {item.currency}
                            </span>
                          </span>
                          <span
                            className={`text-[10px] font-semibold mt-0.5 ${item.isUp ? "text-emerald-400" : "text-red-400"}`}
                          >
                            {item.change}
                          </span>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-4 text-xs text-neutral-500 text-center">
                    No pinned items in watchlist. Click pinned star to add
                    items.
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Footer Back Button */}
            <div className="p-3 border-t border-[#191919] bg-[#0a0a0a]">
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-xs font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Home</span>
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* CENTER COLUMN: Main Chart Terminal & Tabs (~55% Width)     */}
          {/* ========================================================= */}
          <div className="flex-1 flex flex-col border-r border-[#191919] bg-[#0a0a0a] overflow-hidden min-w-0">
            {/* Top Bar: Symbol Summary + OHLC + Action Pills */}
            <div className="px-5 py-3 border-b border-[#191919] flex flex-col gap-3 shrink-0">
              {/* Ticker Header Line */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <StockLogo ticker={currentTicker} size={32} />
                  <h2 className="text-base font-extrabold text-white tracking-tight">
                    {currentTicker}
                  </h2>
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400 cursor-pointer" />

                  {/* Price & Change Badge */}
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-base font-extrabold text-white">
                      {fmt(lastPrice)}
                    </span>
                    <span className="text-xs text-neutral-400 font-semibold">
                      {activeCurrency}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${isUp ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"}`}
                    >
                      {isUp ? "+" : ""}
                      {priceChange.toFixed(2)} ({isUp ? "+" : ""}
                      {priceChangePct.toFixed(2)}%) at close
                    </span>
                  </div>

                  {/* OHLC Ticker Metrics */}
                  <div className="hidden xl:flex items-center gap-3 text-xs text-neutral-400 ml-4 font-mono">
                    <span>
                      O{" "}
                      <strong className="text-white">
                        ${firstPrice.toFixed(2)}
                      </strong>
                    </span>
                    <span>
                      H{" "}
                      <strong className="text-white">
                        ${maxPoint?.price.toFixed(2) ?? "—"}
                      </strong>
                    </span>
                    <span>
                      L{" "}
                      <strong className="text-white">
                        ${minPoint?.price.toFixed(2) ?? "—"}
                      </strong>
                    </span>
                    <span>
                      C{" "}
                      <strong className="text-white">
                        ${lastPrice.toFixed(2)}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Right Settings Icons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFullscreen(false)}
                    className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    title="Exit Full View"
                  >
                    <Minimize2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Action Pills Bar: Buy / Sell / Indicators Dropdown */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setTradeModalType("BUY")}
                    className="px-5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
                  >
                    Buy
                  </button>
                  <button
                    type="button"
                    onClick={() => setTradeModalType("SELL")}
                    className="px-5 py-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Sell
                  </button>

                  {/* Indicators Dropdown Toggle */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowIndicatorsMenu(!showIndicatorsMenu)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <span>Indicators</span>
                      <ChevronDown className="h-3 w-3" />
                    </button>

                    {showIndicatorsMenu && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-[#141414] border border-neutral-800 rounded-xl p-2 z-30 shadow-xl flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => setShowEMA20(!showEMA20)}
                          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-neutral-300 hover:bg-neutral-800 cursor-pointer"
                        >
                          <span>EMA 20 Overlay</span>
                          {showEMA20 && (
                            <Check className="h-3.5 w-3.5 text-blue-400" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowEMA50(!showEMA50)}
                          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-neutral-300 hover:bg-neutral-800 cursor-pointer"
                        >
                          <span>EMA 50 Overlay</span>
                          {showEMA50 && (
                            <Check className="h-3.5 w-3.5 text-purple-400" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowRSI(!showRSI)}
                          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-neutral-300 hover:bg-neutral-800 cursor-pointer"
                        >
                          <span>RSI (14) Oscillator</span>
                          {showRSI && (
                            <Check className="h-3.5 w-3.5 text-amber-400" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowRefLines(!showRefLines)}
                          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-neutral-300 hover:bg-neutral-800 cursor-pointer"
                        >
                          <span>High/Low/Mid Lines</span>
                          {showRefLines && (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Interactive Chart Center Area */}
            <div className="flex-1 h-full min-h-0 w-full relative p-4 flex items-center justify-center">
              {isLoading || !mounted ? (
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                  Loading interactive chart...
                </div>
              ) : enrichedDisplayData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={enrichedDisplayData}
                    margin={{ top: 40, right: 45, left: -10, bottom: 35 }}
                  >
                    <defs>
                      <linearGradient
                        id={gradientId}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={strokeColor}
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="95%"
                          stopColor={strokeColor}
                          stopOpacity={0.0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="2 2"
                      stroke="#161616"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      stroke="#555"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => {
                        if (range === "1d" || range === "1h") return val;
                        const parts = val.split("-");
                        return parts.length >= 3
                          ? `${parts[1]}/${parts[2]}`
                          : val;
                      }}
                    />
                    <YAxis
                      orientation="right"
                      stroke="#555"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      domain={["auto", "auto"]}
                      tickFormatter={(val) => val.toFixed(2)}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#141414",
                        borderColor: "#262626",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#fff",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                      }}
                      formatter={(val: any) => [
                        val !== null && val !== undefined
                          ? fmt(Number(val) || 0)
                          : "—",
                        "Price",
                      ]}
                      labelFormatter={(label) =>
                        range === "1d" || range === "1h"
                          ? `Time: ${label}`
                          : `Date: ${label}`
                      }
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

                    {/* EMA 20 Overlay Line */}
                    {showEMA20 && (
                      <Line
                        type="monotone"
                        dataKey="ema20"
                        stroke="#3b82f6"
                        strokeWidth={1.5}
                        dot={false}
                        isAnimationActive={false}
                      />
                    )}

                    {/* EMA 50 Overlay Line */}
                    {showEMA50 && (
                      <Line
                        type="monotone"
                        dataKey="ema50"
                        stroke="#a855f7"
                        strokeWidth={1.5}
                        dot={false}
                        isAnimationActive={false}
                      />
                    )}

                    {/* Dotted Reference Line at Current Price */}
                    <ReferenceLine
                      y={lastPrice}
                      stroke="#10b981"
                      strokeDasharray="3 3"
                      strokeWidth={1.5}
                    />

                    {/* Continuous Dotted High/Low/Mid Lines */}
                    {showRefLines && maxPoint && (
                      <ReferenceLine
                        y={maxPoint.price}
                        stroke="#10b981"
                        strokeDasharray="4 4"
                        strokeWidth={1}
                      />
                    )}
                    {showRefLines && minPoint && minPoint !== maxPoint && (
                      <ReferenceLine
                        y={minPoint.price}
                        stroke="#ef4444"
                        strokeDasharray="4 4"
                        strokeWidth={1}
                      />
                    )}
                    {showRefLines && avgPrice !== null && (
                      <ReferenceLine
                        y={avgPrice}
                        stroke="#3b82f6"
                        strokeDasharray="4 4"
                        strokeWidth={1}
                      />
                    )}

                    {/* Always-visible Highest Price Dot & Label */}
                    {maxPoint && (
                      <ReferenceDot
                        x={maxPoint.date}
                        y={maxPoint.price}
                        r={5}
                        fill="#10b981"
                        stroke="#ffffff"
                        strokeWidth={2}
                        label={{
                          value: `High: ${fmt(maxPoint.price)}`,
                          fill: "#10b981",
                          fontSize: 11,
                          fontWeight: "bold",
                          position: maxPoint.date === dataPoints[0]?.date ? "right" : "top",
                        }}
                      />
                    )}

                    {/* Always-visible Lowest Price Dot & Label */}
                    {minPoint && minPoint !== maxPoint && (
                      <ReferenceDot
                        x={minPoint.date}
                        y={minPoint.price}
                        r={5}
                        fill="#ef4444"
                        stroke="#ffffff"
                        strokeWidth={2}
                        label={{
                          value: `Low: ${fmt(minPoint.price)}`,
                          fill: "#ef4444",
                          fontSize: 11,
                          fontWeight: "bold",
                          position: minPoint.date === dataPoints[0]?.date ? "right" : "bottom",
                        }}
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-neutral-600">
                  No chart data available for {currentTicker}.
                </p>
              )}
            </div>

            {/* Bottom Chart Range Toolbar */}
            <div className="px-5 py-2 border-t border-b border-[#191919] bg-[#0a0a0a] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                {(
                  [
                    "1h",
                    "1d",
                    "1w",
                    "1mo",
                    "3mo",
                    "ytd",
                    "1y",
                    "10y",
                  ] as RangeType[]
                ).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRange(r)}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                      range === r
                        ? "bg-neutral-800 text-white"
                        : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    {r.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="font-semibold">Interval:</span>
                <select
                  value={intervalOption}
                  onChange={(e) => setIntervalOption(e.target.value)}
                  className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-xs text-neutral-200 focus:outline-none cursor-pointer"
                >
                  <option value="1m">1m</option>
                  <option value="5m">5m</option>
                  <option value="15m">15m</option>
                  <option value="1h">1h</option>
                </select>
              </div>
            </div>

            {/* Bottom Tabs Panel (Pending Orders | Holdings | Order History) */}
            <div className="h-44 border-t border-[#191919] bg-[#0d0d0d] flex flex-col shrink-0">
              {/* Tab Navigation */}
              <div className="flex items-center gap-6 px-5 border-b border-[#191919] text-xs font-bold select-none">
                <button
                  type="button"
                  onClick={() => setActiveTab("pending")}
                  className={`py-2.5 border-b-2 transition-colors cursor-pointer ${
                    activeTab === "pending"
                      ? "border-white text-white"
                      : "border-transparent text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  Pending orders
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("holdings")}
                  className={`py-2.5 border-b-2 transition-colors cursor-pointer ${
                    activeTab === "holdings"
                      ? "border-white text-white"
                      : "border-transparent text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  Holdings
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("history")}
                  className={`py-2.5 border-b-2 transition-colors cursor-pointer ${
                    activeTab === "history"
                      ? "border-white text-white"
                      : "border-transparent text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  Order history
                </button>
              </div>

              {/* Tab Content Area */}
              <div className="flex-1 p-4 overflow-y-auto text-xs text-neutral-400">
                {activeTab === "pending" && (
                  <div className="h-full flex items-center justify-center text-neutral-500">
                    No pending orders
                  </div>
                )}
                {activeTab === "holdings" && (() => {
                  const activeHolding = userHoldings.find(
                    (h) => h.ticker.toUpperCase() === currentTicker.toUpperCase()
                  );
                  if (activeHolding) {
                    const avg = activeHolding.nativeAveragePrice ?? activeHolding.averagePrice;
                    const val = activeHolding.nativeCurrentValue ?? activeHolding.currentValue ?? 0;
                    return (
                      <div className="h-full flex flex-col justify-center gap-1.5 text-neutral-300">
                        <p className="font-bold text-white text-sm">Active Position for {currentTicker}</p>
                        <p className="text-xs text-neutral-400">
                          <strong className="text-white">{activeHolding.shares.toLocaleString()}</strong> shares @ Avg Cost <strong className="text-white">{fmt(avg)}</strong> | Market Value: <strong className="text-emerald-400">{fmt(val)}</strong>
                        </p>
                      </div>
                    );
                  }
                  return (
                    <div className="h-full flex items-center justify-center text-xs text-neutral-400 font-medium">
                      You currently do not hold an active position in <span className="font-bold text-white ml-1">{currentTicker}</span>.
                    </div>
                  );
                })()}
                {activeTab === "history" && (
                  <div className="h-full flex items-center justify-center text-neutral-500">
                    No recent order history found
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Overview & Market Details Panel (~25% Width) */}
          {/* ========================================================= */}
          <div className="w-80 border-l border-[#191919] bg-[#0d0d0d] p-5 flex flex-col justify-between overflow-y-auto shrink-0 gap-6">
            <div>
              {/* Asset Full Title Card */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-neutral-400 font-semibold tracking-wide">
                    {currentTicker} •{" "}
                    {marketDetails?.exchange ||
                      (activeCurrency === "CAD" ? "TSX" : "NASDAQ")}
                  </span>
                  <LayoutGrid className="h-3.5 w-3.5 text-neutral-500" />
                </div>
                <h3 className="text-xl font-extrabold text-white mt-1 leading-tight">
                  {fmt(lastPrice)}{" "}
                  <span className="text-xs font-normal text-neutral-400">
                    {activeCurrency}
                  </span>
                </h3>
                <p
                  className={`text-xs font-semibold mt-0.5 ${isUp ? "text-emerald-400" : "text-red-400"}`}
                >
                  {isUp ? "+" : ""}
                  {priceChange.toFixed(2)} ({isUp ? "+" : ""}
                  {priceChangePct.toFixed(2)}%) at close
                </p>
              </div>

              {/* Right Sidebar Mini Overview Chart (Stretched Wall-to-Wall) */}
              <div className="flex flex-col gap-2 mb-6">
                <div className="h-32 w-full bg-[#111111] border border-[#1e1e1e] rounded-xl p-1 relative overflow-hidden">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={mini1dDataPoints.length > 0 ? mini1dDataPoints : (enrichedDisplayData.filter(p => typeof p.price === 'number') as any)}
                      margin={{ top: 6, right: 0, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="miniChartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <YAxis domain={['auto', 'auto']} hide />
                      <XAxis dataKey="date" hide />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#miniChartGrad)"
                      />
                      {lastPrice > 0 && (
                        <ReferenceLine y={lastPrice} stroke="#333" strokeDasharray="2 2" />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Timeframe Buttons below Mini Chart */}
                <div className="flex items-center justify-between gap-1 text-[10px] select-none font-bold">
                  {['1H', '1D', '1W', '1M', '3M', 'YTD', '1Y', '10Y'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        const mapped = t === '1H' || t === '1D' ? '1d' : t === '1W' ? '1w' : t === '1M' ? '1mo' : t === '3M' ? '3mo' : '1y';
                        getStockCandlesAction(currentTicker, mapped).then((pts) => {
                          if (pts && pts.length > 0) setMini1dDataPoints(pts);
                        });
                      }}
                      className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                        t === '1D'
                          ? 'bg-neutral-800 text-white font-extrabold'
                          : 'text-neutral-500 hover:text-neutral-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Market Details Section */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 border-b border-[#191919] pb-1.5">
                  Market details
                </h4>
                <div className="grid grid-cols-3 gap-x-3 gap-y-3.5 text-xs">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-neutral-400 font-medium">
                      Bid
                    </span>
                    <span className="text-white font-semibold mt-0.5">
                      {marketDetails?.bid || "—"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-neutral-400 font-medium">
                      Ask
                    </span>
                    <span className="text-white font-semibold mt-0.5">
                      {marketDetails?.ask || "—"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-neutral-400 font-medium">
                      Last sale
                    </span>
                    <span className="text-white font-semibold mt-0.5">
                      {marketDetails?.lastSale ||
                        (lastPrice > 0 ? fmt(lastPrice) : "—")}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] text-neutral-400 font-medium">
                      Volume
                    </span>
                    <span className="text-white font-semibold mt-0.5">
                      {marketDetails?.volume || "—"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-neutral-400 font-medium">
                      Avg. vol
                    </span>
                    <span className="text-white font-semibold mt-0.5">
                      {marketDetails?.avgVolume || "—"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-neutral-400 font-medium">
                      Margin req.
                    </span>
                    <span className="text-white font-semibold mt-0.5">
                      {marketDetails?.marginReq || "—"}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] text-neutral-400 font-medium">
                      52W high
                    </span>
                    <span className="text-emerald-400 font-semibold mt-0.5">
                      {marketDetails?.fiftyTwoWeekHigh || "—"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-neutral-400 font-medium">
                      52W low
                    </span>
                    <span className="text-red-400 font-semibold mt-0.5">
                      {marketDetails?.fiftyTwoWeekLow || "—"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-neutral-400 font-medium">
                      Exchange
                    </span>
                    <span className="text-white font-semibold mt-0.5">
                      {marketDetails?.exchange ||
                        (activeCurrency === "CAD" ? "TSX" : "NASDAQ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financials Section */}
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 border-b border-[#191919] pb-1.5">
                  Financials
                </h4>
                <div className="grid grid-cols-3 gap-x-3 gap-y-3 text-xs">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-neutral-400 font-medium">
                      Market cap
                    </span>
                    <span className="text-white font-semibold mt-0.5">
                      {marketDetails?.marketCap || "—"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-neutral-400 font-medium">
                      P/E ratio
                    </span>
                    <span className="text-white font-semibold mt-0.5">
                      {marketDetails?.peRatio || "—"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-neutral-400 font-medium">
                      Shares out.
                    </span>
                    <span className="text-white font-semibold mt-0.5">
                      {marketDetails?.sharesOutstanding || "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Right Clock & Status Icons */}
            <div className="pt-3 border-t border-[#191919] flex items-center justify-between text-neutral-500 text-xs">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{currentTimeStr}</span>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="h-3.5 w-3.5 cursor-pointer hover:text-white" />
                <Moon className="h-3.5 w-3.5 cursor-pointer hover:text-white" />
                <Settings className="h-3.5 w-3.5 cursor-pointer hover:text-white" />
              </div>
            </div>
          </div>

          {/* Quick Buy/Sell Trade Modal Overlay */}
          {tradeModalType && (
            <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-sm bg-[#141414] border border-neutral-800 rounded-2xl p-5 shadow-2xl">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800">
                  <h3 className="text-sm font-bold text-white">
                    {tradeModalType} {currentTicker} ({activeCurrency})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setTradeModalType(null)}
                    className="p-1 text-neutral-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form
                  onSubmit={handleExecuteTrade}
                  className="flex flex-col gap-4"
                >
                  <div className="flex justify-between text-xs text-neutral-400 bg-neutral-900 p-3 rounded-lg border border-neutral-800">
                    <span>Market Price:</span>
                    <span className="font-bold text-white">
                      {fmt(lastPrice)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-neutral-400 font-semibold uppercase">
                      Shares
                    </label>
                    <input
                      type="number"
                      min="0.0001"
                      step="any"
                      required
                      value={tradeShares}
                      onChange={(e) => setTradeShares(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-neutral-600"
                    />
                  </div>

                  <div className="flex justify-between text-xs text-neutral-400">
                    <span>Estimated Total:</span>
                    <span className="font-bold text-white">
                      {fmt((parseFloat(tradeShares) || 0) * lastPrice)}
                    </span>
                  </div>

                  {tradeStatus?.error && (
                    <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">
                      {tradeStatus.error}
                    </p>
                  )}
                  {tradeStatus?.success && (
                    <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg">
                      Trade executed successfully!
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isTrading}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                      tradeModalType === "BUY"
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                        : "bg-red-600 hover:bg-red-500 text-white"
                    }`}
                  >
                    {isTrading
                      ? "Executing..."
                      : `Confirm ${tradeModalType} ${currentTicker}`}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default StockPriceChart;
