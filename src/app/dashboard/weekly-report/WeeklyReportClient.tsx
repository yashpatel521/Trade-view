'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { WeeklyReportStock } from '@/types/trading';
import { generateNewWeeklyReportAction } from '@/lib/actions/trading';
import { FileText, RotateCw, ExternalLink, ShieldCheck, Clock, TrendingUp, Copy, Check, Download, Database } from 'lucide-react';

interface WeeklyReportClientProps {
  initialReport: WeeklyReportStock[];
  initialCreatedAt?: string;
}

export default function WeeklyReportClient({ initialReport, initialCreatedAt }: WeeklyReportClientProps) {
  const [report, setReport] = useState<WeeklyReportStock[]>(initialReport);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lastScanned, setLastScanned] = useState<string>(initialCreatedAt || 'Saved in DB');

  const handleRefreshScan = async () => {
    setIsLoading(true);
    try {
      const { report: newReport, createdAt } = await generateNewWeeklyReportAction();
      setReport(newReport);
      setLastScanned(createdAt);
    } catch (err) {
      console.error('Failed to execute Gemini AI market scan:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPrompt = () => {
    const promptText = `/stockreport - Research the current market and identify the 5 best bullish stock opportunities today. Return ONLY the 9-column completed table.`;
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    const headers = ['Rank', 'Stock', 'Bias', 'Expected Day High', 'Expected Day Low', 'Expected Week High', 'Expected Week Low', 'Wait Until', 'Confidence'];
    const rows = report.map(r => [
      r.rank, r.stock, r.bias, `"${r.expectedDayHigh}"`, `"${r.expectedDayLow}"`, `"${r.expectedWeekHigh}"`, `"${r.expectedWeekLow}"`, `"${r.waitUntil}"`, `"${r.confidence}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Weekly_Stock_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#141414] border border-[#222] relative overflow-hidden">
        <div className="flex items-start gap-4 z-10">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-white tracking-tight">Weekly Stock Report</h1>
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wide">
                <Database className="h-3 w-3" /> Saved in Database
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Institutional market research scan identifying the 5 best high-conviction bullish stock opportunities evaluated across macro, news sentiment, technical structure, options flow, and fundamental momentum.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 z-10 shrink-0">
          <button
            onClick={handleCopyPrompt}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-300 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-neutral-700 hover:text-white transition cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-neutral-400" />}
            <span>{copied ? 'Copied' : 'Prompt'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-300 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-neutral-700 hover:text-white transition cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-neutral-400" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleRefreshScan}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-black bg-white rounded-lg hover:bg-neutral-200 transition disabled:opacity-50 cursor-pointer"
            title="Click to execute live Gemini AI market scan and save new report to database"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Scanning Gemini AI...' : 'Run Scan'}</span>
          </button>
        </div>
      </div>

      {/* Main Report Table Container */}
      <Card className="flex flex-col gap-4">
        {/* Table Title & Status Subheader */}
        <div className="flex items-center justify-between border-b border-[#222] pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Top 5 Bullish Stock Opportunities</h3>
          </div>
          {lastScanned && (
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
              <Clock className="h-3.5 w-3.5" />
              <span>DB Record: {lastScanned}</span>
            </div>
          )}
        </div>

        {/* 9-Column Institutional Report Table */}
        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle px-6">
            <table className="min-w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#222] text-neutral-400 font-semibold uppercase tracking-wider bg-[#141414]">
                  <th className="py-3.5 px-3 w-14 text-center">Rank</th>
                  <th className="py-3.5 px-3 font-bold text-white">Stock</th>
                  <th className="py-3.5 px-3">Bias</th>
                  <th className="py-3.5 px-3 text-emerald-400">Expected Day High</th>
                  <th className="py-3.5 px-3 text-red-400">Expected Day Low</th>
                  <th className="py-3.5 px-3 text-emerald-400">Expected Week High</th>
                  <th className="py-3.5 px-3 text-red-400">Expected Week Low</th>
                  <th className="py-3.5 px-3 text-right">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f1f]">
                {report.map((item) => (
                  <tr
                    key={item.stock}
                    className="hover:bg-[#1a1a1a] transition-colors group text-neutral-200"
                  >
                    {/* Rank Badge */}
                    <td className="py-4 px-3 text-center font-bold">
                      <span
                        className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-extrabold ${
                          item.rank === 1
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : item.rank === 2
                            ? 'bg-neutral-300/20 text-neutral-200 border border-neutral-400/40'
                            : item.rank === 3
                            ? 'bg-amber-700/20 text-amber-500 border border-amber-700/40'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {item.rank}
                      </span>
                    </td>

                    {/* Stock Ticker Link */}
                    <td className="py-4 px-3 font-bold text-white">
                      <Link
                        href={`/dashboard/stocks/${item.stock}`}
                        className="inline-flex items-center gap-1.5 text-sm hover:text-emerald-400 transition-colors"
                      >
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                        <span>{item.stock}</span>
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-neutral-500" />
                      </Link>
                    </td>

                    {/* Bias */}
                    <td className="py-4 px-3">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {item.bias}
                      </span>
                    </td>

                    {/* Expected Day High */}
                    <td className="py-4 px-3 font-semibold text-emerald-400">
                      {item.expectedDayHigh}
                    </td>

                    {/* Expected Day Low */}
                    <td className="py-4 px-3 font-medium text-red-400/90">
                      {item.expectedDayLow}
                    </td>

                    {/* Expected Week High */}
                    <td className="py-4 px-3 font-semibold text-emerald-400">
                      {item.expectedWeekHigh}
                    </td>

                    {/* Expected Week Low */}
                    <td className="py-4 px-3 font-medium text-red-400/90">
                      {item.expectedWeekLow}
                    </td>

                    {/* Confidence Score */}
                    <td className="py-4 px-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{String(item.confidence)}</span>
                        <div className="w-12 bg-neutral-800 h-1.5 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{
                              width: `${Math.min(100, Math.max(0, parseInt(String(item.confidence).replace(/[^0-9]/g, ''), 10) || 85))}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Prompt Reference Box */}
      <div className="p-5 rounded-xl bg-[#141414] border border-[#222] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Database Persistence & Gemini AI Policy
          </span>
          <span className="text-[11px] text-emerald-400 font-medium">On-Demand API Calls Only</span>
        </div>
        <p className="text-xs text-neutral-500 leading-relaxed">
          The weekly stock report is loaded directly from the database table <code className="text-neutral-300">weekly_reports</code> without invoking the Gemini AI API automatically. Clicking <strong>Run Scan</strong> triggers a live market scan, updates the database, and refreshes the report.
        </p>
      </div>
    </div>
  );
}
