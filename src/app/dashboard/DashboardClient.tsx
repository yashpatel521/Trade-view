'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import JournalCalendar from '@/components/dashboard/JournalCalendar';
import { Card } from '@/components/ui/Card';
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  TrendingUp,
  BarChart3,
  Wallet,
  Target,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { DashboardData, Holding } from '@/types/trading';
import { useCurrencyStore } from '@/lib/store';
import SellModal from '@/components/dashboard/SellModal';

interface DashboardClientProps {
  data: DashboardData;
}

export default function DashboardClient({ data }: DashboardClientProps) {
  const { currency } = useCurrencyStore();
  const [sellingHolding, setSellingHolding] = useState<Holding | null>(null);
  const { stats, holdings, dailyLogs, chartData, allocationData, trades } = data;

  const isUSD = currency === 'USD';
  const fxRate = stats.fxRate || 1.40;
  const factor = isUSD ? (1 / fxRate) : 1;


  const fmt = (val: number) =>
    new Intl.NumberFormat(currency === 'CAD' ? 'en-CA' : 'en-US', {
      style: 'currency',
      currency: currency,
    }).format(val * factor);

  const pct = (val: number) => `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;

  const convertedChartData = chartData.map((d) => ({
    ...d,
    profitLoss: d.profitLoss * factor,
    cumulativeProfit: d.cumulativeProfit * factor,
  }));

  const convertedAllocationData = allocationData.map((d) => ({
    ...d,
    value: d.value * factor,
  }));

  const isUp = stats.unrealizedPL >= 0;
  const isRecentUp = stats.recentPLChange >= 0;

  return (
    <div className="flex flex-col gap-6 max-w-7xl">

      {/* ── Hero: Total Portfolio Value ── */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#141414] via-[#141414] to-[#1a1a1a] border border-[#222] px-7 py-6">
        {/* Decorative glow */}
        <div className={`absolute -top-12 -right-12 h-48 w-48 rounded-full blur-3xl opacity-10 pointer-events-none ${isUp ? 'bg-emerald-400' : 'bg-red-400'}`} />
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
            {/* Left – main value */}
            <div>
              <p className="text-[11px] text-neutral-500 uppercase tracking-widest font-semibold mb-2">
                Total Portfolio Value · {currency}
              </p>
              <div className="flex items-end gap-4 flex-wrap">
                <h2 className="text-5xl font-black text-white tracking-tight leading-none">
                  {fmt(stats.totalPortfolioValue)}
                </h2>
                <div className={`flex items-center gap-1.5 mb-1 px-3 py-1 rounded-full text-sm font-bold ${isUp ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {isUp ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  <span>{fmt(Math.abs(stats.unrealizedPL))}</span>
                  <span className="opacity-60">({pct(stats.unrealizedPLPercent)})</span>
                </div>
              </div>
              <p className="text-xs text-neutral-600 mt-2">Unrealized P&L on open positions</p>
            </div>

            {/* Right – cash + quick stats */}
            <div className="flex gap-3 flex-wrap sm:flex-nowrap">
              <div className="flex flex-col justify-between bg-[#0a0a0a] border border-[#222] rounded-xl px-4 py-3 min-w-32.5">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="h-3.5 w-3.5 text-neutral-500" />
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Available Cash</span>
                </div>
                <p className="text-lg font-bold text-white">{fmt(stats.cashBalance)}</p>
              </div>
              <div className="flex flex-col justify-between bg-[#0a0a0a] border border-[#222] rounded-xl px-4 py-3 min-w-32.5">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-3.5 w-3.5 text-neutral-500" />
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Cost Basis</span>
                </div>
                <p className="text-lg font-bold text-white">{fmt(stats.totalCost)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Win Rate */}
        <div className="bg-[#141414] border border-[#222] rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Win Rate</p>
            <Target className="h-3.5 w-3.5 text-neutral-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats.winRate.toFixed(1)}%</p>
            <p className="text-[10px] text-neutral-500 mt-1">{stats.profitableDaysCount}/{stats.totalDaysCount} profitable days</p>
          </div>
        </div>

        {/* Unrealized P&L */}
        <div className="bg-[#141414] border border-[#222] rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Unrealized P&L</p>
            {isUp ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> : <TrendingDown className="h-3.5 w-3.5 text-red-500" />}
          </div>
          <div>
            <p className={`text-2xl font-bold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(stats.unrealizedPL)}</p>
            <p className="text-[10px] text-neutral-500 mt-1">{pct(stats.unrealizedPLPercent)} all time</p>
          </div>
        </div>

        {/* Last Daily P&L */}
        <div className="bg-[#141414] border border-[#222] rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Last Daily P&L</p>
            <Activity className="h-3.5 w-3.5 text-neutral-600" />
          </div>
          <div>
            <p className={`text-2xl font-bold ${isRecentUp ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(stats.recentPLChange)}</p>
            <p className="text-[10px] text-neutral-500 mt-1">Most recent session</p>
          </div>
        </div>

        {/* Holdings Count */}
        <div className="bg-[#141414] border border-[#222] rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Open Positions</p>
            <BarChart3 className="h-3.5 w-3.5 text-neutral-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{holdings.length}</p>
            <p className="text-[10px] text-neutral-500 mt-1">Stocks in portfolio</p>
          </div>
        </div>
      </div>

      {/* ── Holdings Table ── */}
      <Card className="p-0 overflow-hidden">
        {/* Table Header Toolbar */}
        <div className="px-5 py-4 border-b border-[#1a1a1a] bg-[#141414] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Holdings</span>
            {holdings.length > 0 && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-neutral-400 border border-neutral-700">
                {holdings.length} Position{holdings.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <Link
            href="/dashboard/add"
            className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            <span>Add Trade</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1a1a1a] text-neutral-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-5">Ticker</th>
                <th className="py-3 px-4">Shares</th>
                <th className="py-3 px-4">Avg Cost</th>
                <th className="py-3 px-4">Current</th>
                <th className="py-3 px-4">Cost Basis</th>
                <th className="py-3 px-4">Market Value</th>
                <th className="py-3 px-4">Return</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#111]">
              {holdings.length > 0 ? (
                holdings.map((h) => {
                  const pl = h.unrealizedPL || 0;
                  const plPct = h.unrealizedPLPercent || 0;
                  const isPositive = pl >= 0;
                  const isCad = h.nativeCurrency === 'CAD';

                  return (
                    <tr key={h.id} className="hover:bg-[#141414] transition-colors group">
                      {/* Ticker */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                            {h.ticker.replace('.TO', '').replace('.V', '').slice(0, 3)}
                          </div>
                          <div>
                            <Link
                              href={`/dashboard/stocks/${encodeURIComponent(h.ticker)}`}
                              className="font-bold text-white hover:text-emerald-400 transition-colors text-sm"
                            >
                              {h.ticker}
                            </Link>
                            <span className="block text-[10px] text-neutral-600">
                              {isCad ? '🇨🇦 CAD' : '🇺🇸 USD'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-neutral-300 font-medium">{h.shares.toLocaleString()}</td>
                      <td className="py-4 px-4 text-neutral-400">{fmt(h.averagePrice)}</td>
                      <td className="py-4 px-4 text-white font-medium">{fmt(h.currentPrice || 0)}</td>
                      <td className="py-4 px-4 text-neutral-400">{fmt(h.totalCost || 0)}</td>
                      <td className="py-4 px-4 text-white font-semibold">{fmt(h.currentValue || 0)}</td>
                      <td className="py-4 px-4">
                        <div className={`inline-flex flex-col ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                          <span className="font-bold text-sm">{fmt(pl)}</span>
                          <span className="text-[10px] opacity-70">{pct(plPct)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => setSellingHolding(h)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold bg-red-500/8 hover:bg-red-500/15 text-red-400 border border-red-500/20 rounded-lg transition-all cursor-pointer opacity-0 group-hover:opacity-100"
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
                  <td colSpan={8} className="py-14 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <BarChart3 className="h-8 w-8 text-neutral-700" />
                      <div>
                        <p className="text-sm font-semibold text-neutral-400">No holdings yet</p>
                        <p className="text-xs text-neutral-600 mt-1">Add your first trade to get started</p>
                      </div>
                      <Link
                        href="/dashboard/add"
                        className="mt-1 px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-neutral-200 transition-colors"
                      >
                        Add Trade →
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Charts ── */}
      <DashboardCharts chartData={convertedChartData} allocationData={convertedAllocationData} />

      {/* ── Quick Sell Modal ── */}
      <SellModal
        holding={sellingHolding}
        onClose={() => setSellingHolding(null)}
      />

      {/* ── Journal & Transactions ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* P&L Calendar */}
        <Card className="p-0 overflow-hidden">
          <JournalCalendar dailyLogs={dailyLogs} fmt={fmt} />
        </Card>

        {/* Recent Transactions */}
        <Card className="p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1a1a1a] bg-[#141414] flex items-center gap-2.5">
            <Activity className="h-4 w-4 text-purple-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Recent Transactions</span>
            {trades.length > 0 && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-neutral-400 border border-neutral-700 ml-auto">
                Last {Math.min(trades.length, 10)}
              </span>
            )}
          </div>
          <div className="p-4 max-h-80 overflow-y-auto flex flex-col gap-2">
            {trades.length > 0 ? (
              trades.map((t) => (
                <div key={t.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#111] border border-[#1a1a1a] hover:border-[#222] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${t.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {t.type === 'BUY' ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{t.ticker}</span>
                        <span className={`px-1.5 py-px rounded text-[9px] font-black uppercase tracking-wide ${t.type === 'BUY' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {t.type}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-600">{t.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-neutral-200">{t.shares.toLocaleString()} shares</p>
                    <p className="text-[10px] text-neutral-500">@ {fmt(t.price)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center flex flex-col items-center gap-2">
                <Activity className="h-6 w-6 text-neutral-700" />
                <p className="text-xs text-neutral-600">No transactions yet</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
