'use client';

import React, { useState } from 'react';
import { useCurrencyStore } from '@/lib/store';
import { PublicPortfolio } from '@/types/trading';
import { Card } from '@/components/ui/Card';
import { Search, TrendingUp, User } from 'lucide-react';

import Link from 'next/link';

interface PortfoliosClientProps {
  portfolios: PublicPortfolio[];
  fxRate: number;
}

export default function PortfoliosClient({ portfolios, fxRate }: PortfoliosClientProps) {
  const { currency } = useCurrencyStore();
  const [searchTerm, setSearchTerm] = useState('');

  const isUSD = currency === 'USD';
  const factor = isUSD ? 1 / fxRate : 1;

  const fmt = (val: number) =>
    new Intl.NumberFormat(currency === 'CAD' ? 'en-CA' : 'en-US', {
      style: 'currency',
      currency: currency,
    }).format(val * factor);

  const filteredPortfolios = portfolios.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 max-w-7xl">
      {/* Leaderboard Table Card */}
      <Card className="p-0 overflow-hidden">
        {/* Table Toolbar Header with Integrated Search Bar */}
        <div className="p-4 border-b border-[#222] bg-[#141414] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Trader Portfolios</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-neutral-400 border border-neutral-700">
              {filteredPortfolios.length} Active
            </span>
          </div>

          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
              <Search className="h-3.5 w-3.5" />
            </span>
            <input
              type="text"
              placeholder="Search traders by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#0a0a0a] border border-[#262626] rounded-lg text-xs placeholder-neutral-500 focus:outline-none transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#222] text-neutral-400 font-semibold uppercase tracking-wider bg-[#141414]">
                <th className="py-3.5 px-4 text-center w-12 font-bold text-white">Rank</th>
                <th className="py-3.5 px-4 font-bold text-white">Trader</th>
                <th className="py-3.5 px-4">Assets</th>
                <th className="py-3.5 px-4">Holdings Summary</th>
                <th className="py-3.5 px-4 text-right font-bold text-white">Total Balance ({currency})</th>
              </tr>
            </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {filteredPortfolios.length > 0 ? (
                  filteredPortfolios.map((p, index) => (
                    <tr key={p.userId} className="hover:bg-[#1a1a1a] transition-colors text-neutral-300">
                      {/* Rank */}
                      <td className="py-4 px-2 text-center font-bold text-neutral-500">
                        {index === 0 ? (
                          <span className="text-amber-400 text-sm">🥇</span>
                        ) : index === 1 ? (
                          <span className="text-neutral-400 text-sm">🥈</span>
                        ) : index === 2 ? (
                          <span className="text-amber-600 text-sm">🥉</span>
                        ) : (
                          `#${index + 1}`
                        )}
                      </td>
                      {/* User Info */}
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700 text-neutral-400 shrink-0">
                            <User className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex flex-col">
                            <Link href={`/dashboard/portfolios/${p.userId}`} className="font-semibold text-white hover:underline hover:text-neutral-200 cursor-pointer">
                              {p.name}
                            </Link>
                            <span className="text-[10px] text-neutral-500 mt-0.5">{p.email}</span>
                          </div>
                        </div>
                      </td>
                      {/* Assets Count */}
                      <td className="py-4 px-2 font-medium">
                        {p.holdingsCount} stock{p.holdingsCount === 1 ? '' : 's'}
                      </td>
                      {/* Holdings Tickers */}
                      <td className="py-4 px-2">
                        <div className="flex flex-wrap gap-1">
                          {p.holdingsSummary.length > 0 ? (
                            p.holdingsSummary.map((t) => (
                              <span
                                key={t}
                                className="px-1.5 py-0.5 bg-neutral-800/80 border border-neutral-750 text-[9px] font-bold text-neutral-300 rounded uppercase tracking-wider"
                              >
                                {t}
                              </span>
                            ))
                          ) : (
                            <span className="text-neutral-600 text-[10px]">No holdings</span>
                          )}
                        </div>
                      </td>
                      {/* Total Value */}
                      <td className="py-4 px-2 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <span className="font-bold text-white text-sm">{fmt(p.totalPortfolioValue)}</span>
                          <Link
                            href={`/dashboard/portfolios/${p.userId}`}
                            className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-medium text-[10px] transition-colors cursor-pointer"
                          >
                            View →
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-neutral-500 text-xs">
                      No portfolios matching search parameters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
      </Card>
    </div>
  );
}
