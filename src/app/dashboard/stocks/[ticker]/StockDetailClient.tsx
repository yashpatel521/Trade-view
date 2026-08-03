'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Holding, Trade } from '@/types/trading';
import { toggleWatchlistAction, isInWatchlistAction } from '@/lib/actions/trading';
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  TrendingDown,
  DollarSign,
  TrendingUp,
  History,
  Bookmark,
  Loader2,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import SellModal from '@/components/dashboard/stocks/SellModal';
import StockPriceChart from '@/components/dashboard/stocks/StockPriceChart';
import MarketDetailsCard from '@/components/dashboard/stocks/MarketDetailsCard';
import StockNewsCard from '@/components/dashboard/stocks/StockNewsCard';
import StrategyForecastCard from '@/components/dashboard/stocks/StrategyForecastCard';
import StrategyComparisonTable from '@/components/dashboard/stocks/StrategyComparisonTable';
import { StockLogo } from '@/components/ui/StockLogo';

interface StockDetailClientProps {
  ticker: string;
  holding: Holding | null;
  trades: Trade[];
  fxRate: number;
  isAdmin?: boolean;
}

export default function StockDetailClient({
  ticker,
  holding,
  trades,
  fxRate,
  isAdmin = false,
}: StockDetailClientProps) {
  const [sellingHolding, setSellingHolding] = useState<Holding | null>(null);
  const [isPinned, setIsPinned] = useState(false);
  const [isTogglingWatchlist, setIsTogglingWatchlist] = useState(false);

  const tickerUpper = ticker.toUpperCase().trim();

  useEffect(() => {
    isInWatchlistAction(tickerUpper).then(setIsPinned);
  }, [tickerUpper]);

  const handleToggleWatchlist = async () => {
    setIsTogglingWatchlist(true);
    const res = await toggleWatchlistAction(tickerUpper);
    setIsPinned(res.inWatchlist);
    setIsTogglingWatchlist(false);
  };

  const isCADStock =
    tickerUpper.endsWith('.TO') ||
    tickerUpper.endsWith('.V') ||
    tickerUpper.endsWith('.CN');
  const nativeCur: 'USD' | 'CAD' = isCADStock ? 'CAD' : 'USD';

  const fmtNative = (val: number) =>
    new Intl.NumberFormat(nativeCur === 'CAD' ? 'en-CA' : 'en-US', {
      style: 'currency',
      currency: nativeCur,
    }).format(val);

  const pct = (val: number) => `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;

  // Dynamic Position metrics
  const shares = holding?.shares ?? 0;
  const avgCost = holding?.nativeAveragePrice ?? holding?.averagePrice ?? 0;
  const displayPrice = holding?.nativeCurrentPrice ?? holding?.currentPrice ?? 0;
  const totalCost = holding?.nativeTotalCost ?? shares * avgCost;
  const currentValue =
    shares > 0 ? shares * displayPrice : holding?.nativeCurrentValue ?? 0;
  const unrealizedPL =
    shares > 0 ? currentValue - totalCost : holding?.nativeUnrealizedPL ?? 0;
  const unrealizedPLPct = totalCost > 0 ? (unrealizedPL / totalCost) * 100 : 0;
  const isUp = unrealizedPL >= 0;

  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full max-w-none font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* ── Compact Header Bar ── */}
      <div className="flex flex-col gap-4 border-b border-neutral-800 pb-5">
        <Link
          href="/dashboard/stocks"
          className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-emerald-400 transition-colors w-fit group"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Stock Market Overview</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <StockLogo ticker={tickerUpper} size={44} />
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
                  {tickerUpper}
                </h1>
                <span
                  className={`text-xs font-black font-mono px-2.5 py-0.5 rounded-lg border ${
                    nativeCur === 'USD'
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {nativeCur === 'USD' ? '🇺🇸 USD' : '🇨🇦 CAD'}
                </span>
              </div>
              {displayPrice > 0 && (
                <div className="flex items-center gap-2 mt-1 font-mono">
                  <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Live Quote:</span>
                  <span className="text-base font-extrabold text-white">{fmtNative(displayPrice)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleToggleWatchlist}
              disabled={isTogglingWatchlist}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-extrabold rounded-xl transition-all border cursor-pointer ${
                isPinned
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-emerald-500/40 hover:text-white'
              }`}
            >
              {isTogglingWatchlist ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
              ) : (
                <Bookmark className={`h-3.5 w-3.5 ${isPinned ? 'fill-emerald-400 text-emerald-400' : ''}`} />
              )}
              <span>{isPinned ? 'Watchlisted' : 'Add Watchlist'}</span>
            </button>

            <Link
              href="/dashboard/add"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs sm:text-sm rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Buy Position</span>
            </Link>

            {holding && (
              <button
                type="button"
                onClick={() => setSellingHolding(holding)}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
              >
                <TrendingDown className="h-3.5 w-3.5" />
                <span>Sell Position</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Position Metric Cards Grid (When user owns shares) ── */}
      {holding && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          {/* Shares Owned */}
          <div className="bg-[#0c0c0c]/90 border border-neutral-800 hover:border-emerald-500/40 rounded-3xl p-5 flex flex-col justify-between transition-all group shadow-xl">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest font-sans">Shares Owned</span>
              <DollarSign className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-black text-white">{shares.toLocaleString()}</p>
            <p className="text-xs text-neutral-400 mt-1 font-sans">Avg Cost: {fmtNative(avgCost)}</p>
          </div>

          {/* Cost Basis */}
          <div className="bg-[#0c0c0c]/90 border border-neutral-800 hover:border-emerald-500/40 rounded-3xl p-5 flex flex-col justify-between transition-all group shadow-xl">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest font-sans">Cost Basis</span>
              <TrendingUp className="h-4 w-4 text-neutral-400" />
            </div>
            <p className="text-3xl font-black text-white">{fmtNative(totalCost)}</p>
            <p className="text-xs text-neutral-400 mt-1 font-sans">Total capital invested</p>
          </div>

          {/* Market Value */}
          <div className="bg-[#0c0c0c]/90 border border-neutral-800 hover:border-emerald-500/40 rounded-3xl p-5 flex flex-col justify-between transition-all group shadow-xl">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest font-sans">Market Value</span>
              <DollarSign className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-black text-white">{fmtNative(currentValue)}</p>
            <p className="text-xs text-neutral-400 mt-1 font-sans">Live position evaluation</p>
          </div>

          {/* Unrealized P&L */}
          <div className="bg-[#0c0c0c]/90 border border-neutral-800 hover:border-emerald-500/40 rounded-3xl p-5 flex flex-col justify-between transition-all group shadow-xl">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest font-sans">Unrealized P&amp;L</span>
              {isUp ? (
                <ArrowUpRight className="h-4 w-4 text-emerald-400" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-400" />
              )}
            </div>
            <p className={`text-3xl font-black ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
              {fmtNative(unrealizedPL)}
            </p>
            <p className="text-xs text-neutral-400 mt-1 font-sans">
              Return P&amp;L:{' '}
              <span className={isUp ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                {pct(unrealizedPLPct)}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* ── Rule 4 Layout: 75% Interactive Chart & 25% Market Details Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch w-full">
        <div className="lg:col-span-3 w-full">
          <StockPriceChart ticker={tickerUpper} nativeCurrency={nativeCur} className="h-full" />
        </div>
        <div className="lg:col-span-1 w-full">
          <MarketDetailsCard ticker={tickerUpper} nativeCurrency={nativeCur} className="h-full" />
        </div>
      </div>

      {/* ── Multi-Model Strategy Forecasts ── */}
      <StrategyForecastCard ticker={tickerUpper} isAdmin={isAdmin} />

      {/* ── Strategy Comparison Matrix ── */}
      <StrategyComparisonTable ticker={tickerUpper} nativeCurrency={nativeCur} />

      {/* ── Stock Company News Stream ── */}
      <StockNewsCard ticker={tickerUpper} />

      {/* ── Executed Trade History Table ── */}
      <Card className="p-0 overflow-hidden border border-neutral-800 rounded-3xl bg-[#0c0c0c]/90 backdrop-blur-2xl shadow-2xl">
        <div className="px-6 py-4.5 border-b border-neutral-800 bg-[#080808]/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <History className="h-4 w-4 text-purple-400" />
            <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">
              {tickerUpper} Executed Trade History
            </h3>
          </div>
          {trades.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-800 text-neutral-300 border border-neutral-700 font-mono">
              {trades.length} Orders
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 font-bold uppercase tracking-wider bg-[#080808]/50">
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-4">Action Type</th>
                <th className="py-3.5 px-4">Shares</th>
                <th className="py-3.5 px-4">Execution Price</th>
                <th className="py-3.5 px-6 text-right">Total Trade Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono">
              {trades.length > 0 ? (
                trades.map((t) => {
                  const tradeTotal = t.shares * t.price;
                  return (
                    <tr key={t.id} className="hover:bg-neutral-900/60 transition-colors">
                      <td className="py-4 px-6 font-bold text-white">{t.date}</td>
                      <td className="py-4 px-4 font-sans">
                        <span
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                            t.type === 'BUY'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/10 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {t.type}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-white font-bold">{t.shares.toLocaleString()}</td>
                      <td className="py-4 px-4 text-neutral-300">{fmtNative(t.price)}</td>
                      <td className="py-4 px-6 text-right font-extrabold text-white">{fmtNative(tradeTotal)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-500 text-xs font-sans">
                    No trade history recorded for {tickerUpper}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Sell Modal */}
      <SellModal holding={sellingHolding} onClose={() => setSellingHolding(null)} />
    </div>
  );
}
