'use client';

import React, { useState } from 'react';
import { useCurrencyStore } from '@/lib/store';
import { PublicPortfolio } from '@/types/trading';
import { Card } from '@/components/ui/Card';
import { Globe, Search, TrendingUp, User } from 'lucide-react';

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
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-[#1a1a1a] pb-4">
        <Globe className="h-5 w-5 text-neutral-400" />
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Leaderboard</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Explore portfolios of other traders in the community</p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md w-full">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
          <Search className="h-4 w-4" />
        </span>
        <input
          type="text"
          placeholder="Search traders by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-805 rounded-lg text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-700 transition duration-150"
        />
      </div>

      {/* Leaderboard Table */}
      <Card>
        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle px-6">
            <table className="min-w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#222] text-neutral-500 font-medium uppercase tracking-wider">
                  <th className="py-3 px-2 text-center w-12">Rank</th>
                  <th className="py-3 px-2">Trader</th>
                  <th className="py-3 px-2">Assets</th>
                  <th className="py-3 px-2">Holdings Summary</th>
                  <th className="py-3 px-2 text-right">Total Balance</th>
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
                    <td colSpan={5} className="py-12 text-center text-neutral-550 text-xs">
                      No portfolios matching search parameters.
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
