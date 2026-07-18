'use client';

import React from 'react';
import { useCurrencyStore } from '@/lib/store';
import { PublicPortfolioDetails } from '@/types/trading';
import { Card } from '@/components/ui/Card';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, User, Briefcase } from 'lucide-react';
import Link from 'next/link';

interface PublicPortfolioClientProps {
  data: PublicPortfolioDetails;
}

export default function PublicPortfolioClient({ data }: PublicPortfolioClientProps) {
  const { currency } = useCurrencyStore();
  const { user, stats, holdings } = data;

  const isUSD = currency === 'USD';
  const fxRate = stats.fxRate || 1.40;
  const factor = isUSD ? 1 / fxRate : 1;

  const fmt = (val: number) =>
    new Intl.NumberFormat(currency === 'CAD' ? 'en-CA' : 'en-US', {
      style: 'currency',
      currency: currency,
    }).format(val * factor);

  const pct = (val: number) => `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;

  return (
    <div className="flex flex-col gap-6 max-w-7xl">
      {/* Back navigation */}
      <div>
        <Link
          href="/dashboard/portfolios"
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Leaderboard</span>
        </Link>
      </div>

      {/* User profile header card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1a1a1a] pb-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-neutral-850 flex items-center justify-center border border-neutral-750 text-neutral-300 shrink-0">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">{user.name}&apos;s Portfolio</h2>
            <p className="text-xs text-neutral-500 mt-0.5">{user.email} · Public profile</p>
          </div>
        </div>

        {/* Total portfolio net worth */}
        <div className="bg-[#141414] border border-[#222] rounded-xl px-5 py-3 flex flex-col justify-center min-w-44 self-start sm:self-auto">
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold mb-0.5">Total Value</p>
          <p className="text-xl font-bold text-white">{fmt(stats.totalPortfolioValue)}</p>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#141414] border border-[#222] rounded-xl p-5">
          <p className="text-xs text-neutral-500 font-medium mb-1.5">Cash Balance</p>
          <p className="text-lg font-semibold text-white">{fmt(stats.cashBalance)}</p>
        </div>
        <div className="bg-[#141414] border border-[#222] rounded-xl p-5">
          <p className="text-xs text-neutral-500 font-medium mb-1.5">Cost Basis</p>
          <p className="text-lg font-semibold text-white">{fmt(stats.totalCost)}</p>
        </div>
        <div className="bg-[#141414] border border-[#222] rounded-xl p-5">
          <p className="text-xs text-neutral-500 font-medium mb-1.5">Unrealized P&L</p>
          <div className={`flex items-center gap-1 text-lg font-semibold ${stats.unrealizedPL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            <span>{fmt(stats.unrealizedPL)}</span>
          </div>
        </div>
        <div className="bg-[#141414] border border-[#222] rounded-xl p-5">
          <p className="text-xs text-neutral-500 font-medium mb-1.5">Total Returns</p>
          <span className={`text-lg font-semibold ${stats.unrealizedPL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {pct(stats.unrealizedPLPercent)}
          </span>
        </div>
      </div>

      {/* Holdings widget */}
      <Card>
        <div className="mb-5 flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-neutral-400" />
          <div>
            <h3 className="text-sm font-semibold text-white">Stock Holdings</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Asset allocations and position entries</p>
          </div>
        </div>

        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle px-6">
            <table className="min-w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#222] text-neutral-500 font-medium uppercase tracking-wider">
                  <th className="py-3 px-2">Ticker</th>
                  <th className="py-3 px-2">Shares</th>
                  <th className="py-3 px-2">Avg Cost</th>
                  <th className="py-3 px-2">Market Price</th>
                  <th className="py-3 px-2">Cost Basis</th>
                  <th className="py-3 px-2">Market Value</th>
                  <th className="py-3 px-2 text-right">Return</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {holdings.length > 0 ? (
                  holdings.map((h) => {
                    const pl = h.unrealizedPL || 0;
                    return (
                      <tr key={h.id} className="hover:bg-[#1a1a1a] transition-colors text-neutral-300">
                        <td className="py-3.5 px-2 font-semibold text-white">{h.ticker}</td>
                        <td className="py-3.5 px-2">{h.shares.toLocaleString()}</td>
                        <td className="py-3.5 px-2">{fmt(h.averagePrice)}</td>
                        <td className="py-3.5 px-2">{fmt(h.currentPrice || 0)}</td>
                        <td className="py-3.5 px-2">{fmt(h.totalCost || 0)}</td>
                        <td className="py-3.5 px-2">{fmt(h.currentValue || 0)}</td>
                        <td className={`py-3.5 px-2 text-right font-medium ${pl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {fmt(pl)} <span className="text-neutral-500">({pct(h.unrealizedPLPercent || 0)})</span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-neutral-550 text-xs">
                      No stock holdings reported for this trader.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}
