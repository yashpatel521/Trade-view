'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Holding, Trade } from '@/types/trading';
import { useCurrencyStore } from '@/lib/store';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Plus, TrendingDown, DollarSign, TrendingUp, History } from 'lucide-react';
import SellModal from '@/components/dashboard/SellModal';
import StockPriceChart from '@/components/dashboard/StockPriceChart';
import MarketDetailsCard from '@/components/dashboard/MarketDetailsCard';

interface StockDetailClientProps {
  ticker: string;
  holding: Holding | null;
  trades: Trade[];
  fxRate: number;
}

export default function StockDetailClient({ ticker, holding, trades, fxRate }: StockDetailClientProps) {
  const { currency } = useCurrencyStore();
  const [sellingHolding, setSellingHolding] = useState<Holding | null>(null);

  const tickerUpper = ticker.toUpperCase().trim();
  const isCADStock = tickerUpper.endsWith('.TO') || tickerUpper.endsWith('.V') || tickerUpper.endsWith('.CN');
  const nativeCur: 'USD' | 'CAD' = holding?.nativeCurrency || (isCADStock ? 'CAD' : 'USD');

  const fmtNative = (val: number) =>
    new Intl.NumberFormat(nativeCur === 'CAD' ? 'en-CA' : 'en-US', {
      style: 'currency',
      currency: nativeCur,
    }).format(val);

  const pct = (val: number) => `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;

  // Native position metrics
  const shares = holding?.shares ?? 0;
  const avgCost = holding?.nativeAveragePrice ?? holding?.averagePrice ?? 0;
  const livePrice = holding?.nativeCurrentPrice ?? holding?.currentPrice ?? 0;
  const totalCost = holding?.nativeTotalCost ?? (shares * avgCost);
  const currentValue = holding?.nativeCurrentValue ?? (shares * livePrice);
  const unrealizedPL = holding?.nativeUnrealizedPL ?? (currentValue - totalCost);
  const unrealizedPLPct = totalCost > 0 ? (unrealizedPL / totalCost) * 100 : 0;

  return (
    <div className="flex flex-col gap-8 max-w-7xl">
      {/* Header Banner */}
      <div className="flex flex-col gap-3 border-b border-[#1a1a1a] pb-6">
        <div>
          <Link
            href="/dashboard/stocks"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Stocks
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-black text-white bg-neutral-800 px-3.5 py-1.5 rounded-xl border border-neutral-700">
              {tickerUpper}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">{tickerUpper}</h2>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                  nativeCur === 'USD' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {nativeCur === 'USD' ? '🇺🇸 USD' : '🇨🇦 CAD'}
                </span>
              </div>
              {livePrice > 0 && (
                <p className="text-sm font-semibold text-neutral-300 mt-0.5">
                  Live Price: <span className="text-white font-bold">{fmtNative(livePrice)}</span>
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/dashboard/add"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-black font-semibold text-xs rounded-lg hover:bg-neutral-200 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Buy More
            </Link>

            {holding && (
              <button
                onClick={() => setSellingHolding(holding)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                <TrendingDown className="h-3.5 w-3.5" />
                Sell Position
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Position Metrics Cards Grid */}
      {holding ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Shares Owned */}
          <div className="bg-[#141414] border border-[#222] rounded-xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Shares Owned</span>
              <DollarSign className="h-4 w-4 text-neutral-400" />
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">{shares.toLocaleString()} shares</p>
            <p className="text-[10px] text-neutral-500 mt-2">Avg Cost: {fmtNative(avgCost)}</p>
          </div>

          {/* Total Cost Basis */}
          <div className="bg-[#141414] border border-[#222] rounded-xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Cost Basis</span>
              <TrendingUp className="h-4 w-4 text-neutral-400" />
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">{fmtNative(totalCost)}</p>
            <p className="text-[10px] text-neutral-500 mt-2">Capital invested</p>
          </div>

          {/* Market Value */}
          <div className="bg-[#141414] border border-[#222] rounded-xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Market Value</span>
              <DollarSign className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">{fmtNative(currentValue)}</p>
            <p className="text-[10px] text-neutral-500 mt-2">Live position evaluation</p>
          </div>

          {/* Unrealized P&L */}
          <div className="bg-[#141414] border border-[#222] rounded-xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Unrealized P&L</span>
              {unrealizedPL >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-emerald-400" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-400" />
              )}
            </div>
            <p className={`text-2xl font-bold tracking-tight ${unrealizedPL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {fmtNative(unrealizedPL)}
            </p>
            <p className="text-[10px] text-neutral-500 mt-2">
              Return: <span className={unrealizedPL >= 0 ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
                {pct(unrealizedPLPct)}
              </span>
            </p>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-xl bg-[#141414] border border-[#222] text-center text-xs text-neutral-500">
          You currently do not hold an active position in <span className="font-semibold text-white">{tickerUpper}</span>.
        </div>
      )}

      {/* 75% Chart & 25% Market Details Grid with Equal Heights */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
        <div className="lg:col-span-3">
          <StockPriceChart ticker={tickerUpper} nativeCurrency={nativeCur} className="h-full" />
        </div>
        <div className="lg:col-span-1">
          <MarketDetailsCard ticker={tickerUpper} nativeCurrency={nativeCur} className="h-full" />
        </div>
      </div>

      {/* Trade History for this Ticker */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <History className="h-4 w-4 text-neutral-400" />
          <h3 className="text-sm font-semibold text-white">Trade History ({tickerUpper})</h3>
        </div>

        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle px-6">
            <table className="min-w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#222] text-neutral-500 font-medium uppercase tracking-wider">
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2">Type</th>
                  <th className="py-3 px-2">Shares</th>
                  <th className="py-3 px-2">Exec Price</th>
                  <th className="py-3 px-2 text-right">Total Trade Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {trades.length > 0 ? (
                  trades.map((t) => {
                    const tradeTotal = t.shares * t.price;
                    return (
                      <tr key={t.id} className="hover:bg-[#1a1a1a] transition-colors text-neutral-300">
                        <td className="py-3.5 px-2 font-medium text-white">{t.date}</td>
                        <td className="py-3.5 px-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                            t.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {t.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 font-medium">{t.shares.toLocaleString()}</td>
                        <td className="py-3.5 px-2 font-medium text-white">
                          {fmtNative(t.price)}
                        </td>
                        <td className="py-3.5 px-2 text-right font-semibold text-white">
                          {fmtNative(tradeTotal)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-neutral-500 text-xs">
                      No trade history recorded for {tickerUpper}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Quick Sell Modal */}
      <SellModal
        holding={sellingHolding}
        onClose={() => setSellingHolding(null)}
      />
    </div>
  );
}
