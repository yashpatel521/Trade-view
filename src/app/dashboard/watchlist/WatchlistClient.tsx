'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { WatchlistItem } from '@/types/trading';
import { useCurrencyStore } from '@/lib/store';
import { addToWatchlistAction, removeFromWatchlistAction } from '@/lib/actions/trading';
import { Bookmark, Trash2, TrendingUp, TrendingDown, ExternalLink, Loader2, ArrowRight } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Header & Quick Add */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Bookmark className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Stock Watchlist</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
              {items.length} Pinned
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Track your favorite equities with real-time price updates and active FX conversion ({activeCurrency}).
          </p>
        </div>

        {/* Add Ticker Finnhub Debounced Search */}
        <div className="w-64 sm:w-80">
          <StockSearchAutocomplete
            placeholder="Search stock to add (e.g. NVDA, AAPL)..."
            onSelectSymbol={handleAddSymbol}
            inputClassName="py-2.5 text-xs bg-[#141414]"
          />
        </div>
      </div>

      {/* Main Watchlist Card */}
      <Card className="p-0 overflow-hidden">
        {items.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <Bookmark className="h-10 w-10 text-neutral-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white">Your Watchlist is Empty</h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto mt-1 mb-4">
              Search any ticker above to add stocks to your personal watchlist for real-time tracking.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#222] text-neutral-400 font-semibold uppercase tracking-wider bg-[#141414]">
                  <th className="py-3.5 px-4 font-bold text-white">Stock</th>
                  <th className="py-3.5 px-4">Live Market Price</th>
                  <th className="py-3.5 px-4">24h Day Change</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f1f]">
                {items.map((item) => {
                  const isPositive = item.dayChange >= 0;
                  return (
                    <tr
                      key={item.ticker}
                      className="hover:bg-[#1a1a1a] transition-colors group text-neutral-200"
                    >
                      {/* Stock Ticker */}
                      <td className="py-4 px-4 font-bold text-white">
                        <Link
                          href={`/dashboard/stocks/${item.ticker}`}
                          className="inline-flex items-center gap-2 text-sm hover:text-emerald-400 transition-colors"
                        >
                          <StockLogo ticker={item.ticker} size={28} />
                          <span className="text-base font-extrabold tracking-wide">{item.ticker}</span>
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-neutral-500" />
                        </Link>
                      </td>

                      {/* Live Price Converted */}
                      <td className="py-4 px-4 font-bold text-sm text-white">
                        {formatPrice(item.nativeCurrentPrice, item.nativeCurrency, item.ticker)}
                      </td>

                      {/* 24h Day Change */}
                      <td className="py-4 px-4 font-semibold">
                        {(() => {
                          const absChange = Math.abs(item.dayChange);
                          const absPct = Math.abs(item.dayChangePercent);
                          return (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${
                                isPositive
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}
                            >
                              {isPositive ? (
                                <TrendingUp className="h-3.5 w-3.5" />
                              ) : (
                                <TrendingDown className="h-3.5 w-3.5" />
                              )}
                              <span>
                                {isPositive ? '+' : '-'}${absChange.toFixed(2)} ({isPositive ? '+' : '-'}{absPct.toFixed(2)}%)
                              </span>
                            </span>
                          );
                        })()}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/dashboard/stocks/${item.ticker}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-white transition border border-neutral-700"
                          >
                            <span>Analyze</span>
                            <ArrowRight className="h-3 w-3 text-neutral-400" />
                          </Link>

                          <button
                            onClick={() => handleRemoveTicker(item.ticker)}
                            disabled={removingTicker === item.ticker}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition border border-transparent hover:border-red-500/20 cursor-pointer disabled:opacity-50"
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
