'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { DashboardData, Holding } from '@/types/trading';
import { Search, Plus, PieChart, TrendingDown, TrendingUp, Layers, ArrowRight, X, Sparkles, ShieldCheck } from 'lucide-react';
import SellModal from '@/components/dashboard/stocks/SellModal';
import { StockLogo } from '@/components/ui/StockLogo';

interface StocksClientProps {
  data: DashboardData;
}

export default function StocksClient({ data }: StocksClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sellingHolding, setSellingHolding] = useState<Holding | null>(null);

  const { holdings } = data;

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
    const tickerUpper = h.ticker.toUpperCase();
    return tickerUpper.endsWith('.TO') || tickerUpper.endsWith('.V') || tickerUpper.endsWith('.CN') ? 'CAD' : 'USD';
  };

  const topAllocationCards = [
    {
      title: '#1 Top Position',
      holding: top1,
      ticker: top1 ? top1.ticker : '—',
      valStr: top1 ? fmtNative(top1.nativeCurrentValue ?? (top1.currentValue || 0), getNativeCurrency(top1)) : '$0.00',
      weightPct: (top1 && totalStockMarketValueCAD > 0) ? ((top1.currentValue || 0) / totalStockMarketValueCAD) * 100 : 0,
      color: 'from-emerald-500/20 via-emerald-500/10 to-transparent border-emerald-500/30',
    },
    {
      title: '#2 Top Position',
      holding: top2,
      ticker: top2 ? top2.ticker : '—',
      valStr: top2 ? fmtNative(top2.nativeCurrentValue ?? (top2.currentValue || 0), getNativeCurrency(top2)) : '$0.00',
      weightPct: (top2 && totalStockMarketValueCAD > 0) ? ((top2.currentValue || 0) / totalStockMarketValueCAD) * 100 : 0,
      color: 'from-blue-500/20 via-blue-500/10 to-transparent border-blue-500/30',
    },
    {
      title: '#3 Top Position',
      holding: top3,
      ticker: top3 ? top3.ticker : '—',
      valStr: top3 ? fmtNative(top3.nativeCurrentValue ?? (top3.currentValue || 0), getNativeCurrency(top3)) : '$0.00',
      weightPct: (top3 && totalStockMarketValueCAD > 0) ? ((top3.currentValue || 0) / totalStockMarketValueCAD) * 100 : 0,
      color: 'from-purple-500/20 via-purple-500/10 to-transparent border-purple-500/30',
    },
    {
      title: 'Remaining Basket',
      holding: null,
      ticker: othersHoldings.length > 0 ? `${othersHoldings.length} Assets` : 'Others',
      valStr: fmtNative(othersValueCAD, 'CAD'),
      weightPct: totalStockMarketValueCAD > 0 ? (othersValueCAD / totalStockMarketValueCAD) * 100 : 0,
      color: 'from-amber-500/20 via-amber-500/10 to-transparent border-amber-500/30',
    },
  ];

  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full max-w-none font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* ── Top 4 Asset Allocation Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {topAllocationCards.map((card, idx) => (
          <div
            key={idx}
            className={`bg-linear-to-br ${card.color} bg-[#0c0c0c]/90 border rounded-3xl p-5 flex flex-col justify-between shadow-xl backdrop-blur-2xl transition-all group hover:scale-[1.02]`}
          >
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest">{card.title}</span>
              <PieChart className="h-4 w-4 text-emerald-400" />
            </div>

            <div className="my-2 flex items-center gap-3">
              {card.holding && <StockLogo ticker={card.holding.ticker} size={32} />}
              <div>
                <span className="text-2xl font-black text-white tracking-tight block">{card.ticker}</span>
                <p className="text-xs font-mono font-bold text-neutral-300 mt-0.5">{card.valStr}</p>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex justify-between items-center text-[10px] text-neutral-400 font-mono font-bold mb-1.5">
                <span>Allocation Weight</span>
                <span className="text-emerald-400 font-extrabold">{card.weightPct.toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_10px_#10b981]"
                  style={{ width: `${Math.min(card.weightPct, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Active Positions Table ── */}
      <Card className="p-0 overflow-hidden border border-neutral-800 rounded-3xl bg-[#0c0c0c]/90 backdrop-blur-2xl shadow-2xl">
        <div className="px-6 py-4.5 border-b border-neutral-800 bg-[#080808]/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Layers className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">Active Position Ledger</h3>
          </div>

          {/* Search Ticker Filter Bar */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
            <input
              type="text"
              placeholder="Filter ticker (e.g. AAPL, NVDA)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition font-mono uppercase"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-neutral-500 hover:text-white rounded-lg"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 font-bold uppercase tracking-wider bg-[#080808]/50">
                <th className="py-3.5 px-6">Ticker</th>
                <th className="py-3.5 px-4">Shares</th>
                <th className="py-3.5 px-4">Avg Cost</th>
                <th className="py-3.5 px-4">Live Price</th>
                <th className="py-3.5 px-4">Cost Basis</th>
                <th className="py-3.5 px-4">Market Value</th>
                <th className="py-3.5 px-4">Allocation</th>
                <th className="py-3.5 px-4">Return P&amp;L</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredHoldings.length > 0 ? (
                filteredHoldings.map((h) => {
                  const nativeCur = getNativeCurrency(h);
                  const avgPrice = h.nativeAveragePrice ?? h.averagePrice;
                  const currPrice = h.nativeCurrentPrice ?? h.currentPrice ?? 0;
                  const totalCost = h.nativeTotalCost ?? h.totalCost ?? 0;
                  const currVal = h.nativeCurrentValue ?? h.currentValue ?? 0;
                  const unrealPL = h.nativeUnrealizedPL ?? h.unrealizedPL ?? 0;
                  const weightPct = totalStockMarketValueCAD > 0 ? ((h.currentValue || 0) / totalStockMarketValueCAD) * 100 : 0;
                  const isPositive = unrealPL >= 0;

                  return (
                    <tr key={h.id} className="hover:bg-neutral-900/60 transition-colors group">
                      {/* Ticker Symbol */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <StockLogo ticker={h.ticker} size={34} />
                          <div>
                            <Link
                              href={`/dashboard/stocks/${encodeURIComponent(h.ticker)}`}
                              className="font-extrabold text-white hover:text-emerald-400 transition-colors text-sm flex items-center gap-1"
                            >
                              <span>{h.ticker}</span>
                              <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
                            </Link>
                            <span className="block text-[10px] font-bold text-neutral-400 mt-0.5 font-mono">
                              {nativeCur === 'USD' ? '🇺🇸 USD' : '🇨🇦 CAD'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-white font-bold font-mono">{h.shares.toLocaleString()}</td>
                      <td className="py-4 px-4 text-neutral-300 font-mono">{fmtNative(avgPrice, nativeCur)}</td>
                      <td className="py-4 px-4 text-white font-extrabold font-mono">{fmtNative(currPrice, nativeCur)}</td>
                      <td className="py-4 px-4 text-neutral-300 font-mono">{fmtNative(totalCost, nativeCur)}</td>
                      <td className="py-4 px-4 text-white font-extrabold font-mono text-sm">{fmtNative(currVal, nativeCur)}</td>
                      <td className="py-4 px-4 font-mono font-bold text-emerald-400">{weightPct.toFixed(1)}%</td>
                      <td className="py-4 px-4 font-mono">
                        <div className={`inline-flex flex-col ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                          <span className="font-extrabold text-sm">{fmtNative(unrealPL, nativeCur)}</span>
                          <span className="text-[10px] font-bold opacity-80">{pct(h.unrealizedPLPercent || 0)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => setSellingHolding(h)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                            isPositive
                              ? 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/30'
                              : 'bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30'
                          }`}
                        >
                          {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                          <span>Sell Position</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-neutral-400 text-xs">
                    {searchTerm ? (
                      <span>No stock positions matching &quot;{searchTerm}&quot;.</span>
                    ) : (
                      <span>No active stock positions in portfolio yet.</span>
                    )}
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
