'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { DashboardData, Holding } from '@/types/trading';
import { useCurrencyStore } from '@/lib/store';
import { Search, Plus, PieChart, TrendingDown } from 'lucide-react';
import SellModal from '@/components/dashboard/SellModal';

interface StocksClientProps {
  data: DashboardData;
}

export default function StocksClient({ data }: StocksClientProps) {
  const { currency } = useCurrencyStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sellingHolding, setSellingHolding] = useState<Holding | null>(null);

  const { stats, holdings } = data;
  const isUSD = currency === 'USD';
  const fxRate = stats.fxRate || 1.40;
  const factor = isUSD ? 1 / fxRate : 1;

  const fmtNative = (val: number, cur: 'USD' | 'CAD' = 'USD') =>
    new Intl.NumberFormat(cur === 'CAD' ? 'en-CA' : 'en-US', {
      style: 'currency',
      currency: cur,
    }).format(val);

  const pct = (val: number) => `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;

  // Filter holdings based on search term
  const filteredHoldings = holdings.filter((h) =>
    h.ticker.toUpperCase().includes(searchTerm.toUpperCase().trim())
  );

  // Compute total stock market value in CAD base currency for allocation weights
  const totalStockMarketValueCAD = holdings.reduce((sum, h) => sum + (h.currentValue || 0), 0);

  // Sort holdings by valuation descending to calculate top 3 and others
  const sortedHoldings = [...holdings].sort((a, b) => (b.currentValue || 0) - (a.currentValue || 0));

  const top1 = sortedHoldings[0];
  const top2 = sortedHoldings[1];
  const top3 = sortedHoldings[2];

  const othersHoldings = sortedHoldings.slice(3);
  const othersValueCAD = othersHoldings.reduce((sum, h) => sum + (h.currentValue || 0), 0);

  const getNativeCurrency = (h?: Holding) => {
    if (!h) return 'USD';
    if (h.nativeCurrency) return h.nativeCurrency;
    const tickerUpper = h.ticker.toUpperCase();
    return tickerUpper.endsWith('.TO') || tickerUpper.endsWith('.V') || tickerUpper.endsWith('.CN') ? 'CAD' : 'USD';
  };

  const topAllocationCards = [
    {
      title: '#1 Top Allocation',
      ticker: top1 ? top1.ticker : '—',
      valStr: top1 ? fmtNative(top1.nativeCurrentValue ?? (top1.currentValue || 0), getNativeCurrency(top1)) : '$0.00',
      weightPct: (top1 && totalStockMarketValueCAD > 0) ? ((top1.currentValue || 0) / totalStockMarketValueCAD) * 100 : 0,
    },
    {
      title: '#2 Top Allocation',
      ticker: top2 ? top2.ticker : '—',
      valStr: top2 ? fmtNative(top2.nativeCurrentValue ?? (top2.currentValue || 0), getNativeCurrency(top2)) : '$0.00',
      weightPct: (top2 && totalStockMarketValueCAD > 0) ? ((top2.currentValue || 0) / totalStockMarketValueCAD) * 100 : 0,
    },
    {
      title: '#3 Top Allocation',
      ticker: top3 ? top3.ticker : '—',
      valStr: top3 ? fmtNative(top3.nativeCurrentValue ?? (top3.currentValue || 0), getNativeCurrency(top3)) : '$0.00',
      weightPct: (top3 && totalStockMarketValueCAD > 0) ? ((top3.currentValue || 0) / totalStockMarketValueCAD) * 100 : 0,
    },
    {
      title: 'Others',
      ticker: othersHoldings.length > 0 ? `${othersHoldings.length} Assets` : 'Others',
      valStr: fmtNative(isUSD ? othersValueCAD / fxRate : othersValueCAD, isUSD ? 'USD' : 'CAD'),
      weightPct: totalStockMarketValueCAD > 0 ? (othersValueCAD / totalStockMarketValueCAD) * 100 : 0,
    },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-7xl">
      {/* Stock Allocation Weight - Top 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {topAllocationCards.map((card, idx) => (
          <div key={idx} className="bg-[#141414] border border-[#222] rounded-xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider">{card.title}</span>
              <PieChart className="h-4 w-4 text-emerald-400" />
            </div>

            <div className="my-1">
              <span className="text-2xl font-bold text-white tracking-tight">{card.ticker}</span>
              <p className="text-xs text-neutral-400 font-medium mt-0.5">{card.valStr}</p>
            </div>

            <div className="mt-3">
              <div className="flex justify-between items-center text-[10px] text-neutral-400 font-medium mb-1">
                <span>Allocation Weight</span>
                <span className="text-white font-semibold">{card.weightPct.toFixed(1)}%</span>
              </div>
              <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(card.weightPct, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Holdings Table */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-sm font-semibold text-white">Current Holdings</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Live values & cost bases for active positions</p>
          </div>

          {/* Search Bar + Add Trade Button */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
              <input
                type="text"
                placeholder="Search ticker (e.g. AAPL)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none transition-colors"
              />
            </div>

            <Link
              href="/dashboard/add"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white text-black font-semibold text-xs rounded-lg hover:bg-neutral-200 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Trade
            </Link>
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
                  <th className="py-3 px-2">Live Price</th>
                  <th className="py-3 px-2">Cost Basis</th>
                  <th className="py-3 px-2">Market Value</th>
                  <th className="py-3 px-2">Allocation</th>
                  <th className="py-3 px-2">P&L Return</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {filteredHoldings.length > 0 ? (
                  filteredHoldings.map((h) => {
                    const nativeCur = getNativeCurrency(h);
                    const avgPrice = h.nativeAveragePrice ?? h.averagePrice;
                    const currPrice = h.nativeCurrentPrice ?? h.currentPrice ?? 0;
                    const totalCost = h.nativeTotalCost ?? h.totalCost ?? 0;
                    const currVal = h.nativeCurrentValue ?? h.currentValue ?? 0;
                    const unrealPL = h.nativeUnrealizedPL ?? h.unrealizedPL ?? 0;
                    const weightPct = totalStockMarketValueCAD > 0 ? ((h.currentValue || 0) / totalStockMarketValueCAD) * 100 : 0;

                    return (
                      <tr key={h.id} className="hover:bg-[#1a1a1a] transition-colors text-neutral-300">
                        <td className="py-3.5 px-2">
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/dashboard/stocks/${encodeURIComponent(h.ticker)}`}
                              className="font-bold text-white bg-neutral-800/80 hover:bg-neutral-700 px-2 py-1 rounded border border-neutral-700/50 transition-colors"
                            >
                              {h.ticker}
                            </Link>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                              nativeCur === 'USD' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {nativeCur === 'USD' ? '🇺🇸 USD' : '🇨🇦 CAD'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-2 font-medium">{h.shares.toLocaleString()}</td>
                        <td className="py-3.5 px-2">{fmtNative(avgPrice, nativeCur)}</td>
                        <td className="py-3.5 px-2 font-medium text-white">{fmtNative(currPrice, nativeCur)}</td>
                        <td className="py-3.5 px-2 text-neutral-400">{fmtNative(totalCost, nativeCur)}</td>
                        <td className="py-3.5 px-2 font-semibold text-white">{fmtNative(currVal, nativeCur)}</td>
                        <td className="py-3.5 px-2 font-medium text-neutral-300">{weightPct.toFixed(1)}%</td>
                        <td className={`py-3.5 px-2 font-semibold ${unrealPL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {fmtNative(unrealPL, nativeCur)}
                          <span className="block text-[10px] font-normal text-neutral-500">
                            {pct(h.unrealizedPLPercent || 0)}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 text-right">
                          <button
                            onClick={() => setSellingHolding(h)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-md transition-colors cursor-pointer"
                          >
                            <TrendingDown className="h-3 w-3" />
                            Sell
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-neutral-500 text-xs">
                      {searchTerm ? (
                        <span>No positions matching &quot;{searchTerm}&quot;.</span>
                      ) : (
                        <span>No stock positions in your portfolio yet.</span>
                      )}
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
