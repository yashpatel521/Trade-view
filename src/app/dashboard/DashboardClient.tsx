"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardCharts from "@/components/dashboard/overview/DashboardCharts";
import JournalCalendar from "@/components/dashboard/journal/JournalCalendar";
import { Card } from "@/components/ui/Card";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  TrendingUp,
  BarChart3,
  Wallet,
  Target,
  Activity,
  Plus,
  Sparkles,
  ShieldCheck,
  Clock,
  ArrowRight,
} from "lucide-react";
import { DashboardData, Holding } from "@/types/trading";
import { useCurrencyStore } from "@/lib/store";
import SellModal from "@/components/dashboard/stocks/SellModal";
import { StockLogo } from "@/components/ui/StockLogo";

interface DashboardClientProps {
  data: DashboardData;
}

export default function DashboardClient({ data }: DashboardClientProps) {
  const { currency } = useCurrencyStore();
  const [sellingHolding, setSellingHolding] = useState<Holding | null>(null);
  const { stats, holdings, dailyLogs, chartData, allocationData, trades } =
    data;

  const isUSD = currency === "USD";
  const fxRate = stats.fxRate || 1.4;
  const factor = isUSD ? 1 / fxRate : 1;

  const fmt = (val: number) =>
    new Intl.NumberFormat(currency === "CAD" ? "en-CA" : "en-US", {
      style: "currency",
      currency: currency,
    }).format(val * factor);

  const fmtNative = (val: number, isCad: boolean) =>
    new Intl.NumberFormat(isCad ? "en-CA" : "en-US", {
      style: "currency",
      currency: isCad ? "CAD" : "USD",
    }).format(val);

  const pct = (val: number) => `${val >= 0 ? "+" : ""}${val.toFixed(2)}%`;

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

  // Structured JSON-LD Schema for Dashboard WebApplication
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Pro Trading Dashboard - Trade View',
    description: 'Personalized trading dashboard with real-time portfolio tracking, multi-currency cash balance, and journal logs.',
    url: 'https://trade-view.app/dashboard',
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-7xl mx-auto font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Structured SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── 1. Spatial Hero: Total Portfolio Value Deck ── */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#0c0c0c] via-[#101914] to-[#0c0c0c] border border-emerald-500/30 p-6 sm:p-8 2xl:p-10 shadow-[0_25px_80px_rgba(0,0,0,0.95)] backdrop-blur-2xl transition-all">
        {/* Ambient Emerald Mesh Glow */}
        <div
          className={`absolute -top-20 -right-20 h-64 w-64 rounded-full blur-[140px] opacity-25 pointer-events-none ${isUp ? "bg-emerald-400" : "bg-red-400"}`}
        />
        <div className="absolute top-1/2 -left-20 h-64 w-64 rounded-full blur-[160px] opacity-15 bg-teal-500 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Left Main Portfolio Balance */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xs 2xl:text-sm font-extrabold uppercase tracking-widest text-emerald-400 font-mono">
                Total Portfolio Value · {currency}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                <Sparkles className="h-3 w-3" />
                <span>Live Feed</span>
              </span>
            </div>

            <div className="flex items-baseline gap-4 flex-wrap">
              <h1 className="text-4xl sm:text-5xl 2xl:text-6xl font-black text-white tracking-tight leading-none">
                {fmt(stats.totalPortfolioValue)}
              </h1>
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs sm:text-sm font-bold ${isUp ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.2)]" : "bg-red-500/20 text-red-300 border border-red-500/40"}`}
              >
                {isUp ? (
                  <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 stroke-[2.5]" />
                )}
                <span>{fmt(Math.abs(stats.unrealizedPL))}</span>
                <span className="opacity-75 font-mono">
                  ({pct(stats.unrealizedPLPercent)})
                </span>
              </div>
            </div>

            <p className="text-xs text-neutral-400 flex items-center gap-2 pt-0.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>
                Unrealized P&amp;L across {holdings.length} active positions in
                portfolio
              </span>
            </p>
          </div>

          {/* Right Action CTAs & Dual-Currency Cash Badges */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 shrink-0">
            {/* Dual Available Cash Badge */}
            <div className="flex flex-col justify-between bg-[#080808]/90 border border-neutral-800 rounded-2xl p-3.5 min-w-52 shadow-lg">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Wallet className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold">
                    Available Cash
                  </span>
                </div>
                <span className="text-[9px] font-mono text-neutral-500 font-bold">
                  1.40 FX
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 text-xs font-bold font-mono">
                <span
                  className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20"
                  title="CAD Cash Balance"
                >
                  🇨🇦 $
                  {(stats.cashBalanceCad ?? 0).toLocaleString("en-CA", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span
                  className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20"
                  title="USD Cash Balance"
                >
                  🇺🇸 $
                  {(stats.cashBalanceUsd ?? 0).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            {/* Primary Add Trade Action */}
            <Link
              href="/dashboard/add"
              id="dash-add-trade-btn"
              className="px-5 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs sm:text-sm rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Add New Trade</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. Stat Cards Grid (4 Columns) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Win Rate */}
        <div className="bg-[#0c0c0c]/90 border border-neutral-800 hover:border-emerald-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all group shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
              Win Rate
            </span>
            <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-white">
              {stats.winRate.toFixed(1)}%
            </p>
            <p className="text-xs text-neutral-400 mt-1 font-medium">
              <span className="text-emerald-400 font-bold">
                {stats.profitableDaysCount}
              </span>{" "}
              / {stats.totalDaysCount} profitable trading sessions
            </p>
          </div>
        </div>

        {/* Unrealized P&L */}
        <div className="bg-[#0c0c0c]/90 border border-neutral-800 hover:border-emerald-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all group shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
              Unrealized P&amp;L
            </span>
            <div
              className={`p-1.5 rounded-xl ${isUp ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-red-500/10 text-red-400 border border-red-500/30"}`}
            >
              {isUp ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
            </div>
          </div>
          <div>
            <p
              className={`text-3xl font-black ${isUp ? "text-emerald-400" : "text-red-400"}`}
            >
              {fmt(stats.unrealizedPL)}
            </p>
            <p className="text-xs text-neutral-400 mt-1 font-medium">
              {pct(stats.unrealizedPLPercent)} total portfolio return
            </p>
          </div>
        </div>

        {/* Last Daily P&L */}
        <div className="bg-[#0c0c0c]/90 border border-neutral-800 hover:border-emerald-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all group shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
              Last Session P&amp;L
            </span>
            <div
              className={`p-1.5 rounded-xl ${isRecentUp ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-red-500/10 text-red-400 border border-red-500/30"}`}
            >
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div>
            <p
              className={`text-3xl font-black ${isRecentUp ? "text-emerald-400" : "text-red-400"}`}
            >
              {fmt(stats.recentPLChange)}
            </p>
            <p className="text-xs text-neutral-400 mt-1 font-medium flex items-center gap-1">
              <Clock className="h-3 w-3 text-neutral-500" />
              <span>5:00 PM auto-logged close</span>
            </p>
          </div>
        </div>

        {/* Open Positions */}
        <div className="bg-[#0c0c0c]/90 border border-neutral-800 hover:border-emerald-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all group shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
              Open Positions
            </span>
            <div className="p-1.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30">
              <BarChart3 className="h-4 w-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-white">{holdings.length}</p>
            <p className="text-xs text-neutral-400 mt-1 font-medium">
              Cost basis: {fmt(stats.totalCost)}
            </p>
          </div>
        </div>
      </div>

      {/* ── 3. Active Holdings Table ── */}
      <Card className="p-0 overflow-hidden border border-neutral-800 rounded-3xl shadow-2xl bg-[#0c0c0c]/90 backdrop-blur-2xl">
        {/* Table Header Toolbar */}
        <div className="px-6 py-4 border-b border-neutral-800 bg-[#080808]/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">
              Active Portfolio Holdings
            </h3>
            {holdings.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {holdings.length} Position{holdings.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <Link
            href="/dashboard/add"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Add Position</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 font-bold uppercase tracking-wider bg-[#080808]/50">
                <th className="py-3.5 px-6">Ticker</th>
                <th className="py-3.5 px-4">Shares</th>
                <th className="py-3.5 px-4">Avg Cost</th>
                <th className="py-3.5 px-4">Current Price</th>
                <th className="py-3.5 px-4">Cost Basis</th>
                <th className="py-3.5 px-4">Market Value</th>
                <th className="py-3.5 px-4">Return P&amp;L</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {holdings.length > 0 ? (
                holdings.map((h) => {
                  const tickerUpper = h.ticker.toUpperCase();
                  const isCad =
                    tickerUpper.endsWith(".TO") ||
                    tickerUpper.endsWith(".V") ||
                    tickerUpper.endsWith(".CN");
                  const avgPrice = h.nativeAveragePrice ?? h.averagePrice;
                  const currPrice = h.nativeCurrentPrice ?? h.currentPrice ?? 0;
                  const totalCost = h.nativeTotalCost ?? h.shares * avgPrice;
                  const currVal = h.nativeCurrentValue ?? h.shares * currPrice;
                  const pl = h.nativeUnrealizedPL ?? currVal - totalCost;
                  const plPct = totalCost > 0 ? (pl / totalCost) * 100 : 0;
                  const isPositive = pl >= 0;

                  return (
                    <tr
                      key={h.id}
                      className="hover:bg-neutral-900/60 transition-colors group"
                    >
                      {/* Ticker */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <StockLogo ticker={h.ticker} size={34} />
                          <div>
                            <Link
                              href={`/dashboard/stocks/${encodeURIComponent(h.ticker)}`}
                              className="font-extrabold text-white hover:text-emerald-400 transition-colors text-sm flex items-center gap-1.5"
                            >
                              <span>{h.ticker}</span>
                              <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
                            </Link>
                            <span className="block text-[10px] font-bold text-neutral-400 mt-0.5">
                              {isCad ? "🇨🇦 CAD" : "🇺🇸 USD"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-white font-bold font-mono">
                        {h.shares.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-neutral-300 font-mono">
                        {fmtNative(avgPrice, isCad)}
                      </td>
                      <td className="py-4 px-4 text-white font-bold font-mono">
                        {fmtNative(currPrice, isCad)}
                      </td>
                      <td className="py-4 px-4 text-neutral-300 font-mono">
                        {fmtNative(totalCost, isCad)}
                      </td>
                      <td className="py-4 px-4 text-white font-extrabold font-mono text-sm">
                        {fmtNative(currVal, isCad)}
                      </td>
                      <td className="py-4 px-4 font-mono">
                        <div
                          className={`inline-flex flex-col ${isPositive ? "text-emerald-400" : "text-red-400"}`}
                        >
                          <span className="font-extrabold text-sm">
                            {fmtNative(pl, isCad)}
                          </span>
                          <span className="text-[10px] font-bold opacity-80">
                            {pct(plPct)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => setSellingHolding(h)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                            isPositive
                              ? "bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/30"
                              : "bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30"
                          }`}
                        >
                          {isPositive ? (
                            <TrendingUp className="h-3.5 w-3.5" />
                          ) : (
                            <TrendingDown className="h-3.5 w-3.5" />
                          )}
                          <span>Sell Position</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <BarChart3 className="h-10 w-10 text-neutral-700" />
                      <div>
                        <p className="text-base font-extrabold text-white">
                          No active holdings in portfolio
                        </p>
                        <p className="text-xs text-neutral-400 mt-1">
                          Add your first trade position to start tracking live
                          P&amp;L
                        </p>
                      </div>
                      <Link
                        href="/dashboard/add"
                        className="mt-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2"
                      >
                        <span>Add First Trade</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── 4. Performance & Allocation Charts ── */}
      <DashboardCharts
        chartData={convertedChartData}
        allocationData={convertedAllocationData}
      />

      {/* ── Quick Sell Modal ── */}
      <SellModal
        holding={sellingHolding}
        onClose={() => setSellingHolding(null)}
      />

      {/* ── 5. Journal Calendar & Recent Transactions Deck ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* P&L Calendar */}
        <Card className="p-0 overflow-hidden border border-neutral-800 rounded-3xl bg-[#0c0c0c]/90 shadow-2xl">
          <JournalCalendar dailyLogs={dailyLogs} fmt={fmt} />
        </Card>

        {/* Recent Executed Transactions */}
        <Card className="p-0 overflow-hidden border border-neutral-800 rounded-3xl bg-[#0c0c0c]/90 shadow-2xl">
          <div className="px-6 py-4 border-b border-neutral-800 bg-[#080808]/90 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Activity className="h-4 w-4 text-purple-400" />
              <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">
                Executed Transactions Log
              </h3>
            </div>
            {trades.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
                Last {Math.min(trades.length, 10)} Orders
              </span>
            )}
          </div>
          <div className="p-4 sm:p-6 max-h-96 overflow-y-auto flex flex-col gap-2.5">
            {trades.length > 0 ? (
              trades.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 hover:border-emerald-500/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${t.type === "BUY" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-red-500/10 text-red-400 border border-red-500/30"}`}
                    >
                      {t.type === "BUY" ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-white">
                          {t.ticker}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wide ${t.type === "BUY" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}
                        >
                          {t.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        {t.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <p className="text-xs font-bold text-white">
                      {t.shares.toLocaleString()} shares
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      @ {fmt(t.price)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center flex flex-col items-center gap-2">
                <Activity className="h-8 w-8 text-neutral-700" />
                <p className="text-xs text-neutral-400">
                  No executed transactions found
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
