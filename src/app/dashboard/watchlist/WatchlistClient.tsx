'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { WatchlistItem } from '@/types/trading';
import { useCurrencyStore } from '@/lib/store';
import { addToWatchlistAction, removeFromWatchlistAction } from '@/lib/actions/trading';
import { Bookmark, Trash2, TrendingUp, TrendingDown, ExternalLink, Loader2, ArrowRight, Sparkles, Search } from 'lucide-react';
import { StockSearchAutocomplete } from '@/components/layout/StockSearchAutocomplete';
import { StockLogo } from '@/components/ui/StockLogo';

interface WatchlistClientProps {
  initialItems: WatchlistItem[];
  liveFxRate: number;
}

export function WatchlistClient({ initialItems, liveFxRate }: WatchlistClientProps) {
  const { currency: activeCurrency } = useCurrencyStore();
  const [items, setItems] = useState<WatchlistItem[]>(initialItems);
  const [removingTicker, setRemovingTicker] = useState<string | null>(null);

  const handleAddSymbol = async (tickerToAdd: string) => {
    const cleanTicker = tickerToAdd.toUpperCase().trim();
    if (!cleanTicker) return;

    const res = await addToWatchlistAction(cleanTicker);
    if (res.success && res.item) {
      const newItem = res.item;
      setItems((prev) => [newItem, ...prev.filter((i) => i.ticker !== cleanTicker)]);
    } else if (!res.success) {
      alert(res.error || 'Could not add ticker to watchlist.');
    }
  };

  const handleRemoveTicker = async (tickerToRemove: string) => {
    setRemovingTicker(tickerToRemove);
    const res = await removeFromWatchlistAction(tickerToRemove);
    if (res.success) {
      setItems((prev) => prev.filter((item) => item.ticker !== tickerToRemove));
    } else {
      alert(res.error || 'Could not remove ticker from watchlist.');
    }
    setRemovingTicker(null);
  };

  const formatPrice = (nativePrice: number, nativeCurrency: 'USD' | 'CAD', ticker?: string) => {
    const formatted = nativePrice.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const isCad = Boolean(ticker && (ticker.toUpperCase().endsWith('.TO') || ticker.toUpperCase().endsWith('.V') || ticker.toUpperCase().endsWith('.CN')));

    if (isCad) {
      return `$${formatted} CAD`;
    }
    return `$${formatted} USD`;
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full max-w-none font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* ── Top Pinned Quick Cards Grid ── */}
      {items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.slice(0, 4).map((item) => {
            const isPositive = item.dayChange >= 0;
            const isCad = item.ticker.toUpperCase().endsWith('.TO') || item.ticker.toUpperCase().endsWith('.V') || item.ticker.toUpperCase().endsWith('.CN');
            return (
              <div
                key={item.ticker}
                className="bg-[#0c0c0c]/90 border border-neutral-800 hover:border-emerald-500/40 rounded-3xl p-5 flex flex-col justify-between shadow-xl backdrop-blur-2xl transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <StockLogo ticker={item.ticker} size={32} />
                    <div>
                      <Link
                        href={`/dashboard/stocks/${item.ticker}`}
                        className="text-base font-black text-white hover:text-emerald-400 transition-colors flex items-center gap-1"
                      >
                        <span>{item.ticker}</span>
                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
                      </Link>
                      <span className="text-[10px] font-bold text-neutral-400 font-mono">
                        {isCad ? '🇨🇦 CAD' : '🇺🇸 USD'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTicker(item.ticker)}
                    disabled={removingTicker === item.ticker}
                    className="p-1.5 text-neutral-500 hover:text-red-400 rounded-xl hover:bg-red-500/10 transition cursor-pointer"
                    title="Remove from Watchlist"
                  >
                    {removingTicker === item.ticker ? (
                      <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <div className="mt-3 flex items-baseline justify-between font-mono">
                  <span className="text-xl font-black text-white">
                    {formatPrice(item.nativeCurrentPrice, item.nativeCurrency, item.ticker)}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isPositive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/10 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {item.dayChangePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Main Watchlist Table Card ── */}
      <Card className="p-0 overflow-hidden border border-neutral-800 rounded-3xl bg-[#0c0c0c]/90 backdrop-blur-2xl shadow-2xl">
        <div className="px-6 py-4.5 border-b border-neutral-800 bg-[#080808]/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Bookmark className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">Pinned Equity Watchlist</h3>
          </div>

          <div className="w-full sm:w-72 shrink-0">
            <StockSearchAutocomplete
              placeholder="Search & add ticker (e.g. NVDA, AAPL)..."
              onSelectSymbol={handleAddSymbol}
              inputClassName="py-2 text-xs bg-neutral-950 border-neutral-800 rounded-xl font-mono uppercase"
            />
          </div>
        </div>

        {items.length === 0 ? (
          <div className="py-20 px-4 text-center flex flex-col items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-600">
              <Bookmark className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Your Watchlist is Empty</h3>
              <p className="text-xs text-neutral-400 max-w-md mx-auto mt-1">
                Search any stock ticker in the search bar above to pin equities to your watchlist for real-time tracking.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 font-bold uppercase tracking-wider bg-[#080808]/50">
                  <th className="py-3.5 px-6">Equity Symbol</th>
                  <th className="py-3.5 px-4">Live Market Price</th>
                  <th className="py-3.5 px-4">24h Day Change</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono">
                {items.map((item) => {
                  const isPositive = item.dayChange >= 0;
                  const absChange = Math.abs(item.dayChange);
                  const absPct = Math.abs(item.dayChangePercent);
                  const isCad = item.ticker.toUpperCase().endsWith('.TO') || item.ticker.toUpperCase().endsWith('.V') || item.ticker.toUpperCase().endsWith('.CN');

                  return (
                    <tr
                      key={item.ticker}
                      className="hover:bg-neutral-900/60 transition-colors group"
                    >
                      {/* Stock Symbol */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <StockLogo ticker={item.ticker} size={34} />
                          <div>
                            <Link
                              href={`/dashboard/stocks/${item.ticker}`}
                              className="font-extrabold text-white hover:text-emerald-400 transition-colors text-sm flex items-center gap-1"
                            >
                              <span>{item.ticker}</span>
                              <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
                            </Link>
                            <span className="block text-[10px] font-bold text-neutral-400 mt-0.5">
                              {isCad ? '🇨🇦 CAD' : '🇺🇸 USD'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Live Market Price */}
                      <td className="py-4 px-4 font-extrabold text-sm text-white">
                        {formatPrice(item.nativeCurrentPrice, item.nativeCurrency, item.ticker)}
                      </td>

                      {/* 24h Day Change */}
                      <td className="py-4 px-4 font-bold">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs ${
                            isPositive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/10 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                          <span>
                            {isPositive ? '+' : '-'}${absChange.toFixed(2)} ({isPositive ? '+' : '-'}{absPct.toFixed(2)}%)
                          </span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right font-sans">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/dashboard/stocks/${item.ticker}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 hover:border-emerald-500/40 transition cursor-pointer"
                          >
                            <span>Analyze Chart</span>
                            <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleRemoveTicker(item.ticker)}
                            disabled={removingTicker === item.ticker}
                            className="p-2 rounded-xl text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition border border-transparent hover:border-red-500/30 cursor-pointer disabled:opacity-50"
                            title="Remove from Watchlist"
                          >
                            {removingTicker === item.ticker ? (
                              <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
