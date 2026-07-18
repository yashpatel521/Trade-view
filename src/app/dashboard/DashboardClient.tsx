'use client';

import React from 'react';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import { Card } from '@/components/ui/Card';
import { ArrowUpRight, ArrowDownRight, Trash2 } from 'lucide-react';
import { DashboardData } from '@/types/trading';
import { useCurrencyStore } from '@/lib/store';
import { deleteDailyLogAction } from '@/lib/actions/trading';

interface DashboardClientProps {
  data: DashboardData;
}

export default function DashboardClient({ data }: DashboardClientProps) {
  const { currency } = useCurrencyStore();
  const { stats, holdings, dailyLogs, chartData, allocationData, trades } = data;

  const isUSD = currency === 'USD';
  const fxRate = stats.fxRate || 1.40;
  const factor = isUSD ? (1 / fxRate) : 1;

  async function handleDeleteLog(id: number) {
    await deleteDailyLogAction(id);
  }

  const fmt = (val: number) =>
    new Intl.NumberFormat(currency === 'CAD' ? 'en-CA' : 'en-US', {
      style: 'currency',
      currency: currency,
    }).format(val * factor);

  const pct = (val: number) => `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;

  // Pre-process chart data based on currency view
  const convertedChartData = chartData.map((d) => ({
    ...d,
    profitLoss: d.profitLoss * factor,
    cumulativeProfit: d.cumulativeProfit * factor,
  }));

  // Pre-process allocation data based on currency view
  const convertedAllocationData = allocationData.map((d) => ({
    ...d,
    value: d.value * factor,
  }));

  return (
    <div className="flex flex-col gap-8 max-w-7xl">

      {/* Portfolio Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-neutral-500 uppercase tracking-wider font-medium mb-1">Total portfolio value</p>
          <div className="flex items-end gap-4">
            <h2 className="text-4xl font-bold text-white tracking-tight">
              {fmt(stats.totalPortfolioValue)}
            </h2>
            <div className={`flex items-center gap-1 text-sm font-medium mb-1 ${stats.unrealizedPL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {stats.unrealizedPL >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              <span>{fmt(Math.abs(stats.unrealizedPL))}</span>
              <span className="text-neutral-500 ml-1">({pct(stats.unrealizedPLPercent)})</span>
            </div>
          </div>
        </div>

        {/* Cash Balance Display */}
        <div className="bg-[#141414] border border-[#222] rounded-xl px-5 py-3.5 flex flex-col justify-center min-w-44 self-start sm:self-auto">
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium mb-0.5">Available Cash</p>
          <p className="text-lg font-bold text-white">{fmt(stats.cashBalance)}</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#141414] border border-[#222] rounded-xl p-5">
          <p className="text-xs text-neutral-500 font-medium mb-2">Cost Basis</p>
          <p className="text-lg font-semibold text-white">{fmt(stats.totalCost)}</p>
        </div>
        <div className="bg-[#141414] border border-[#222] rounded-xl p-5">
          <p className="text-xs text-neutral-500 font-medium mb-2">Win Rate</p>
          <p className="text-lg font-semibold text-white">{stats.winRate.toFixed(1)}%</p>
          <p className="text-[10px] text-neutral-600 mt-1">{stats.profitableDaysCount} of {stats.totalDaysCount} days</p>
        </div>
        <div className="bg-[#141414] border border-[#222] rounded-xl p-5">
          <p className="text-xs text-neutral-500 font-medium mb-2">Unrealized P&L</p>
          <p className={`text-lg font-semibold ${stats.unrealizedPL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {fmt(stats.unrealizedPL)}
          </p>
        </div>
        <div className="bg-[#141414] border border-[#222] rounded-xl p-5">
          <p className="text-xs text-neutral-500 font-medium mb-2">Last Daily P&L</p>
          <p className={`text-lg font-semibold ${stats.recentPLChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {fmt(stats.recentPLChange)}
          </p>
        </div>
      </div>

      {/* Charts */}
      <DashboardCharts chartData={convertedChartData} allocationData={convertedAllocationData} />

      {/* Holdings */}
      <Card>
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-white">Holdings</h3>
          <p className="text-xs text-neutral-500 mt-0.5">Your current stock positions</p>
        </div>

        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle px-6">
            <table className="min-w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#222] text-neutral-500 font-medium uppercase tracking-wider">
                  <th className="py-3 px-2">Ticker</th>
                  <th className="py-3 px-2">Shares</th>
                  <th className="py-3 px-2">Avg Cost</th>
                  <th className="py-3 px-2">Price</th>
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
                    <td colSpan={7} className="py-10 text-center text-neutral-500 text-xs">
                      No holdings yet. Add a trade below.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Journal & Transactions */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Journal */}
        <Card>
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white">Daily P&L Journal</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Your daily trading results</p>
          </div>

          <div className="max-h-80 overflow-y-auto pr-1 flex flex-col gap-2">
            {dailyLogs.length > 0 ? (
              dailyLogs.map((log) => {
                const deleteAction = handleDeleteLog.bind(null, log.id);
                return (
                  <div key={log.id} className="py-3 px-3 rounded-lg bg-[#1a1a1a] flex items-center justify-between text-xs hover:bg-[#1f1f1f] transition-colors">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-neutral-300">{log.date}</span>
                        {log.note && (
                          <span className="text-[10px] text-neutral-600 truncate max-w-30" title={log.note}>
                            · {log.note}
                          </span>
                        )}
                      </div>
                      <span className={`font-semibold ${log.profitLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {log.profitLoss >= 0 ? '+' : ''}{fmt(log.profitLoss)}
                      </span>
                    </div>

                    <form action={deleteAction}>
                      <button
                        type="submit"
                        className="h-7 w-7 rounded hover:bg-neutral-800 text-neutral-600 hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-neutral-600 py-8 text-xs">No entries yet.</p>
            )}
          </div>
        </Card>

        {/* Transactions */}
        <Card>
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white">Recent Transactions</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Last 10 trades</p>
          </div>

          <div className="max-h-80 overflow-y-auto pr-1 flex flex-col gap-2">
            {trades.length > 0 ? (
              trades.map((t) => (
                <div key={t.id} className="py-3 px-3 rounded-lg bg-[#1a1a1a] flex items-center justify-between text-xs hover:bg-[#1f1f1f] transition-colors">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-px rounded text-[9px] font-bold uppercase tracking-wide ${
                        t.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {t.type}
                      </span>
                      <span className="font-medium text-white">{t.ticker}</span>
                    </div>
                    <span className="text-neutral-600">{t.date}</span>
                  </div>
                  <div className="text-right flex flex-col gap-0.5">
                    <span className="font-medium text-neutral-200">{t.shares.toLocaleString()} shares</span>
                    <span className="text-neutral-600">@ {fmt(t.price)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-neutral-600 py-8 text-xs">No transactions yet.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
