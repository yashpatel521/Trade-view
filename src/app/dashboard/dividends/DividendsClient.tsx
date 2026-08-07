'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { DividendTrackerData } from '@/types/trading';
import { getDividendTrackerDataAction } from '@/lib/actions/trading';
import { useCurrencyStore } from '@/lib/store';
import { StockLogo } from '@/components/ui/StockLogo';
import {
  Coins,
  DollarSign,
  Calendar,
  TrendingUp,
  Percent,
  Clock,
  ExternalLink,
  ShieldCheck,
  ArrowUpRight,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface DividendsClientProps {
  initialData: DividendTrackerData | null;
}

export default function DividendsClient({ initialData }: DividendsClientProps) {
  const [data, setData] = useState<DividendTrackerData | null>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const { currency } = useCurrencyStore();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await getDividendTrackerDataAction();
      setData(res);
    } catch (err) {
      console.error('Failed to load dividend tracker data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!data) {
      loadData();
    }
  }, []);

  const fxRate = data?.fxRate || 1.4;

  // Format currency helpers
  const formatCurrency = (amount: number, nativeCurr: 'CAD' | 'USD' = 'CAD') => {
    if (currency === 'CAD') {
      const valCad = nativeCurr === 'USD' ? amount * fxRate : amount;
      return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(valCad);
    } else {
      const valUsd = nativeCurr === 'CAD' ? amount / fxRate : amount;
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(valUsd);
    }
  };

  // Annual Income calculations
  const totalAnnualIncome =
    currency === 'CAD'
      ? (data?.annualIncomeCad || 0) + (data?.annualIncomeUsd || 0) * fxRate
      : (data?.annualIncomeCad || 0) / fxRate + (data?.annualIncomeUsd || 0);

  const totalMonthlyIncome = totalAnnualIncome / 12;

  // Monthly distributions chart data in selected display currency
  const chartData = (data?.monthlyDistributions || []).map((m) => {
    const val =
      currency === 'CAD'
        ? m.amountCad + m.amountUsd * fxRate
        : m.amountCad / fxRate + m.amountUsd;
    return {
      month: m.month,
      income: parseFloat(val.toFixed(2)),
    };
  });

  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full max-w-none font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* ── Top Header Toolbar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0c0c0c]/90 border border-neutral-800 backdrop-blur-2xl shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Coins className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Dividend Tracker &amp; Income Calendar</span>
              <span className="px-3 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold">
                Cash Flow Engine
              </span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Track passive dividend cash flow, ex-dividend target dates, payout frequencies, and projected 12-month distributions across your CAD &amp; USD holdings.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-neutral-200 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-amber-500/40 hover:text-white transition cursor-pointer shrink-0 shadow-md disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 text-amber-400 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Rates</span>
        </button>
      </div>

      {/* ── 4 Top Summary KPI Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* KPI 1: Est. Annual Dividend Income */}
        <div className="bg-[#0c0c0c]/90 border border-emerald-500/30 rounded-3xl p-6 flex flex-col justify-between shadow-xl backdrop-blur-2xl transition-all hover:border-emerald-500/50 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
              Est. Annual Income
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              {formatCurrency(totalAnnualIncome, currency)}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1 font-medium">
              Total projected 12-month payout
            </p>
          </div>
        </div>

        {/* KPI 2: Est. Monthly Cash Flow */}
        <div className="bg-[#0c0c0c]/90 border border-amber-500/30 rounded-3xl p-6 flex flex-col justify-between shadow-xl backdrop-blur-2xl transition-all hover:border-amber-500/50 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
              Est. Monthly Average
            </span>
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
              {formatCurrency(totalMonthlyIncome, currency)}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1 font-medium">
              Average passive monthly income
            </p>
          </div>
        </div>

        {/* KPI 3: Weighted Dividend Yield */}
        <div className="bg-[#0c0c0c]/90 border border-blue-500/30 rounded-3xl p-6 flex flex-col justify-between shadow-xl backdrop-blur-2xl transition-all hover:border-blue-500/50 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
              Portfolio Weighted Yield
            </span>
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Percent className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-black text-blue-400 font-mono">
              {(data?.weightedYieldPercent || 0).toFixed(2)}%
            </p>
            <p className="text-[11px] text-neutral-400 mt-1 font-medium">
              Weighted average yield on asset cost
            </p>
          </div>
        </div>

        {/* KPI 4: Next Ex-Dividend Target Date */}
        <div className="bg-[#0c0c0c]/90 border border-purple-500/30 rounded-3xl p-6 flex flex-col justify-between shadow-xl backdrop-blur-2xl transition-all hover:border-purple-500/50 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
              Upcoming Ex-Date
            </span>
            <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            {data?.upcomingExDate ? (
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-black text-purple-400 font-mono">
                    {data.upcomingExDate.ticker}
                  </p>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold border border-purple-500/30">
                    In {data.upcomingExDate.daysLeft} Days
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1 font-medium font-mono">
                  Ex-Date: {data.upcomingExDate.date}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-2xl font-black text-neutral-400 font-mono">N/A</p>
                <p className="text-[11px] text-neutral-500 mt-1 font-medium">No pending ex-dates</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Projected 12-Month Dividend Income Bar Graph ── */}
      <Card className="p-0 overflow-hidden border border-neutral-800 rounded-3xl bg-[#0c0c0c]/90 backdrop-blur-2xl shadow-2xl">
        <div className="px-6 py-4.5 border-b border-neutral-800 bg-[#080808]/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">
                12-Month Projected Income Calendar
              </h3>
              <p className="text-[10px] text-neutral-400 font-medium">
                Visual monthly distribution breakdown across your portfolio ({currency})
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="#666"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#222' }}
              />
              <YAxis
                stroke="#666"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#141414',
                  borderColor: '#333',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#fff',
                }}
                formatter={(val: any) => [
                  `${currency === 'CAD' ? 'CA$' : '$'}${Number(val).toFixed(2)}`,
                  'Projected Dividend',
                ]}
              />
              <Bar dataKey="income" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={45} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* ── Holdings Dividend Ledger Table ── */}
      <Card className="p-0 overflow-hidden border border-neutral-800 rounded-3xl bg-[#0c0c0c]/90 backdrop-blur-2xl shadow-2xl">
        <div className="px-6 py-4.5 border-b border-neutral-800 bg-[#080808]/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">
                Holdings Dividend Payout Ledger
              </h3>
              <p className="text-[10px] text-neutral-400 font-medium">
                Detailed dividend yield and ex-date information per stock holding
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-neutral-900 text-neutral-400 border border-neutral-800">
            {data?.holdings.length || 0} Dividend Assets
          </span>
        </div>

        {!data || data.holdings.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <Coins className="h-12 w-12 text-neutral-700" />
            <p className="text-xs font-bold text-neutral-400">No stock holdings found</p>
            <p className="text-[11px] text-neutral-500 max-w-sm leading-relaxed">
              Add stock holdings under <Link href="/dashboard/add" className="text-emerald-400 underline">Add Record</Link> or <Link href="/dashboard/import" className="text-emerald-400 underline">Import CSV</Link> to track dividend income.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 font-bold uppercase tracking-wider text-[10px] bg-[#080808]/70">
                  <th className="py-3 px-6 font-bold text-white">Stock Ticker</th>
                  <th className="py-3 px-4 text-right">Shares</th>
                  <th className="py-3 px-4 text-right">Stock Price</th>
                  <th className="py-3 px-4 text-right">Annual Div / Share</th>
                  <th className="py-3 px-4 text-center">Dividend Yield</th>
                  <th className="py-3 px-4 text-center">Frequency</th>
                  <th className="py-3 px-4 text-center">Ex-Dividend Date</th>
                  <th className="py-3 px-6 text-right">Est. Annual Income</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono text-xs">
                {data.holdings.map((h) => {
                  return (
                    <tr key={h.ticker} className="hover:bg-neutral-900/60 transition-colors group">
                      {/* Stock Symbol */}
                      <td className="py-4 px-6 font-bold text-white">
                        <div className="flex items-center gap-3">
                          <StockLogo ticker={h.ticker} size={28} />
                          <Link
                            href={`/dashboard/stocks/${h.ticker}`}
                            className="text-xs font-extrabold hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                          >
                            <span>{h.ticker}</span>
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
                          </Link>
                        </div>
                      </td>

                      {/* Shares */}
                      <td className="py-4 px-4 text-right font-bold text-white">
                        {h.shares.toLocaleString()}
                      </td>

                      {/* Stock Price */}
                      <td className="py-4 px-4 text-right font-bold text-neutral-300">
                        {h.currency === 'CAD' ? 'CA$' : '$'}{h.currentPrice.toFixed(2)}
                      </td>

                      {/* Annual Dividend Per Share */}
                      <td className="py-4 px-4 text-right font-bold text-amber-400">
                        {h.currency === 'CAD' ? 'CA$' : '$'}{h.annualDividendPerShare.toFixed(2)}
                      </td>

                      {/* Dividend Yield % */}
                      <td className="py-4 px-4 text-center font-sans">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black font-mono border ${
                          h.dividendYield > 3
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : h.dividendYield > 0
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-neutral-900 text-neutral-500 border-neutral-800'
                        }`}>
                          {h.dividendYield.toFixed(2)}%
                        </span>
                      </td>

                      {/* Payout Frequency */}
                      <td className="py-4 px-4 text-center font-sans">
                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-neutral-900 text-neutral-300 border border-neutral-800 uppercase tracking-wide">
                          {h.payoutFrequency}
                        </span>
                      </td>

                      {/* Ex-Dividend Date */}
                      <td className="py-4 px-4 text-center font-mono text-neutral-400">
                        {h.exDividendDate || 'N/A'}
                      </td>

                      {/* Est. Annual Income */}
                      <td className="py-4 px-6 text-right font-bold text-emerald-400 text-sm">
                        {formatCurrency(h.estimatedAnnualIncome, h.currency)}
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
