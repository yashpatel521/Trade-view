'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { WeeklyReportStock } from '@/types/trading';
import {
  generateNewWeeklyReportAction,
  toggleWatchlistAction,
  getWatchlistAction,
} from '@/lib/actions/trading';
import {
  FileText,
  RotateCw,
  ExternalLink,
  ShieldCheck,
  Clock,
  TrendingUp,
  Copy,
  Check,
  Download,
  Database,
  Loader2,
  Bookmark,
  Zap,
} from 'lucide-react';
import { StockLogo } from '@/components/ui/StockLogo';

interface WeeklyReportClientProps {
  initialReport: WeeklyReportStock[];
  initialCreatedAt?: string;
}

export default function WeeklyReportClient({
  initialReport,
  initialCreatedAt,
}: WeeklyReportClientProps) {
  const [report, setReport] = useState<WeeklyReportStock[]>(initialReport);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lastScanned, setLastScanned] = useState<string>(
    initialCreatedAt || 'Saved in DB'
  );
  const [scanStep, setScanStep] = useState<string>(
    'Executing Quant Market Scan...'
  );

  // Watchlist state per ticker
  const [watchlistSet, setWatchlistSet] = useState<Set<string>>(new Set());
  const [togglingTicker, setTogglingTicker] = useState<string | null>(null);

  useEffect(() => {
    getWatchlistAction().then((items) => {
      if (items) {
        setWatchlistSet(new Set(items.map((i) => i.ticker.toUpperCase())));
      }
    });
  }, []);

  const handleToggleWatchlist = async (ticker: string) => {
    const clean = ticker.toUpperCase().trim();
    setTogglingTicker(clean);
    try {
      const res = await toggleWatchlistAction(clean);
      setWatchlistSet((prev) => {
        const next = new Set(prev);
        if (res.inWatchlist) {
          next.add(clean);
        } else {
          next.delete(clean);
        }
        return next;
      });
    } catch (err) {
      console.error(`Failed to toggle watchlist for ${clean}:`, err);
    } finally {
      setTogglingTicker(null);
    }
  };

  const handleRefreshScan = async () => {
    setIsLoading(true);
    setScanStep('Connecting to Gemini AI Quantitative Engine...');

    const stepTimer = setInterval(() => {
      setScanStep((prev) => {
        if (prev.includes('Connecting')) return 'Evaluating 13F Institutional Accumulation...';
        if (prev.includes('Evaluating')) return 'Computing ATR Volatility Bounds & Day Ranges...';
        if (prev.includes('Computing')) return 'Synthesizing Bullish Confidence Scores...';
        return 'Finalizing Weekly Report Database Record...';
      });
    }, 1800);

    try {
      const res = await generateNewWeeklyReportAction();
      if (res?.report) {
        setReport(res.report);
        setLastScanned(new Date().toLocaleString());
      }
    } catch (err) {
      console.error('Failed to execute Gemini AI market scan:', err);
    } finally {
      clearInterval(stepTimer);
      setIsLoading(false);
    }
  };

  const handleCopyPrompt = () => {
    const promptText = `Lead Quantitative Research Director & Chief Technical Strategist scan identifying the 5 best high-conviction bullish stock opportunities evaluated across macro, news sentiment, technical structure, options flow, and fundamental momentum.`;
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    const headers = [
      'Rank',
      'Stock',
      'Bias',
      'Expected Day High',
      'Expected Day Low',
      'Expected Week High',
      'Expected Week Low',
      'Confidence',
    ];
    const rows = report.map((r) => [
      r.rank,
      r.stock,
      r.bias,
      `"${r.expectedDayHigh}"`,
      `"${r.expectedDayLow}"`,
      `"${r.expectedWeekHigh}"`,
      `"${r.expectedWeekLow}"`,
      `"${r.confidence}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Weekly_Stock_Report_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full max-w-none font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* ── Main Report Card with Toolbar ── */}
      <Card className="p-0 overflow-hidden border border-neutral-800 rounded-3xl bg-[#0c0c0c]/90 backdrop-blur-2xl shadow-2xl relative">
        
        {/* Table Header Toolbar */}
        <div className="px-6 py-5 border-b border-neutral-800 bg-[#080808]/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                  <span>Weekly Stock Opportunities Report</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                    Institutional Quant Engine
                  </span>
                </h2>
                {lastScanned && (
                  <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono mt-0.5">
                    <Clock className="h-3 w-3 text-emerald-400" />
                    <span>Database Record: {lastScanned}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleCopyPrompt}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-neutral-300 bg-neutral-950 border border-neutral-800 rounded-xl hover:border-emerald-500/40 hover:text-white transition cursor-pointer"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-neutral-400" />
              )}
              <span>{copied ? 'Copied' : 'Prompt'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-neutral-300 bg-neutral-950 border border-neutral-800 rounded-xl hover:border-emerald-500/40 hover:text-white transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-neutral-400" />
              <span>Export CSV</span>
            </button>

            {/* Run Scan Button with On-Click Loading */}
            <button
              type="button"
              onClick={handleRefreshScan}
              disabled={isLoading}
              className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-lg ${
                isLoading
                  ? 'bg-neutral-800 text-emerald-400 border border-emerald-500/40 cursor-wait'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.35)]'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                  <span>Scanning Gemini AI...</span>
                </>
              ) : (
                <>
                  <RotateCw className="h-4 w-4 stroke-[2.5]" />
                  <span>Run Scan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Scanning Loading Overlay Banner ── */}
        {isLoading && (
          <div className="p-4 bg-emerald-500/10 border-b border-emerald-500/30 flex items-center justify-between gap-4 font-mono text-xs animate-pulse">
            <div className="flex items-center gap-3">
              <Zap className="h-4 w-4 text-emerald-400 animate-spin" />
              <span className="text-emerald-300 font-bold">{scanStep}</span>
            </div>
            <span className="text-[10px] text-emerald-400 uppercase font-black tracking-widest hidden sm:inline">
              Real-Time AI Market Scan Active
            </span>
          </div>
        )}

        {/* Institutional 9-Column Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 font-bold uppercase tracking-wider text-[10px] bg-[#080808]/70">
                <th className="py-3 px-3 w-12 text-center">Rank</th>
                <th className="py-3 px-4 font-bold text-white">Stock Ticker</th>
                <th className="py-3 px-3">Bias</th>
                <th className="py-3 px-3 text-emerald-400">Expected Day High</th>
                <th className="py-3 px-3 text-red-400">Expected Day Low</th>
                <th className="py-3 px-3 text-emerald-400">Expected Week High</th>
                <th className="py-3 px-3 text-red-400">Expected Week Low</th>
                <th className="py-3 px-3">Confidence</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono text-xs">
              {isLoading ? (
                [1, 2, 3, 4, 5].map((rowIdx) => (
                  <tr key={`skeleton-${rowIdx}`} className="animate-pulse bg-[#090909]/60">
                    <td className="py-3.5 px-3 text-center">
                      <div className="h-6 w-6 rounded-full bg-neutral-800 mx-auto" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-6 w-6 rounded-full bg-neutral-800 shrink-0" />
                        <div className="h-3.5 w-16 bg-neutral-800 rounded" />
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="h-4 w-12 bg-emerald-500/20 rounded-md" />
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="h-3.5 w-24 bg-emerald-500/20 rounded" />
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="h-3.5 w-24 bg-red-500/20 rounded" />
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="h-3.5 w-24 bg-emerald-500/20 rounded" />
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="h-3.5 w-24 bg-red-500/20 rounded" />
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="h-3.5 w-12 bg-neutral-800 rounded" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="h-6 w-20 bg-neutral-900 border border-neutral-800 rounded-lg ml-auto" />
                    </td>
                  </tr>
                ))
              ) : (
                report.map((item) => {
                  const cleanTicker = item.stock.toUpperCase().trim();
                  const isPinned = watchlistSet.has(cleanTicker);
                  const isToggling = togglingTicker === cleanTicker;

                  return (
                    <tr
                      key={item.stock}
                      className="hover:bg-neutral-900/60 transition-colors group"
                    >
                      {/* Rank Badge */}
                      <td className="py-3 px-3 text-center font-bold">
                        <span
                          className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-[10px] font-black shadow-sm ${
                            item.rank === 1
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : item.rank === 2
                              ? 'bg-neutral-300/20 text-neutral-200 border border-neutral-400/40'
                              : item.rank === 3
                              ? 'bg-amber-700/20 text-amber-500 border border-amber-700/40'
                              : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                          }`}
                        >
                          #{item.rank}
                        </span>
                      </td>

                      {/* Stock Symbol */}
                      <td className="py-3 px-4 font-bold text-white">
                        <div className="flex items-center gap-2.5">
                          <StockLogo ticker={item.stock} size={26} />
                          <Link
                            href={`/dashboard/stocks/${item.stock}`}
                            className="text-xs font-extrabold hover:text-emerald-400 transition-colors flex items-center gap-1"
                          >
                            <span>{item.stock}</span>
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
                          </Link>
                        </div>
                      </td>

                      {/* Bias */}
                      <td className="py-3 px-3 font-sans">
                        <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {item.bias}
                        </span>
                      </td>

                      {/* Expected Day High */}
                      <td className="py-3 px-3 font-semibold text-xs text-emerald-400">
                        {item.expectedDayHigh}
                      </td>

                      {/* Expected Day Low */}
                      <td className="py-3 px-3 font-semibold text-xs text-red-400/90">
                        {item.expectedDayLow}
                      </td>

                      {/* Expected Week High */}
                      <td className="py-3 px-3 font-semibold text-xs text-emerald-400">
                        {item.expectedWeekHigh}
                      </td>

                      {/* Expected Week Low */}
                      <td className="py-3 px-3 font-semibold text-xs text-red-400/90">
                        {item.expectedWeekLow}
                      </td>

                      {/* Confidence Score */}
                      <td className="py-3 px-3">
                        <div className="inline-flex items-center gap-2">
                          <span className="font-extrabold text-xs text-white">
                            {String(item.confidence)}
                          </span>
                          <div className="w-10 bg-neutral-900 h-1.5 rounded-full overflow-hidden border border-neutral-800 hidden sm:block">
                            <div
                              className="bg-emerald-500 h-full rounded-full"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    parseInt(
                                      String(item.confidence).replace(/[^0-9]/g, ''),
                                      10
                                    ) || 85
                                  )
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Watchlist Action Button */}
                      <td className="py-3 px-4 text-right font-sans">
                        <button
                          type="button"
                          onClick={() => handleToggleWatchlist(item.stock)}
                          disabled={isToggling}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all border cursor-pointer ${
                            isPinned
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-emerald-500/40 hover:text-white'
                          }`}
                          title={isPinned ? 'Remove from Watchlist' : 'Add to Watchlist'}
                        >
                          {isToggling ? (
                            <Loader2 className="h-3 w-3 animate-spin text-emerald-400" />
                          ) : (
                            <Bookmark
                              className={`h-3 w-3 ${
                                isPinned ? 'fill-emerald-400 text-emerald-400' : ''
                              }`}
                            />
                          )}
                          <span>{isPinned ? 'Watchlisted' : 'Add Watchlist'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
