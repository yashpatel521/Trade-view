'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { SavedWeeklyReportRecord } from '@/types/trading';
import { History, Calendar, Clock, TrendingUp, ExternalLink, ShieldCheck, Download, Sparkles, Eye, X, FileText } from 'lucide-react';

interface ReportHistoryClientProps {
  initialReports: SavedWeeklyReportRecord[];
}

export default function ReportHistoryClient({ initialReports }: ReportHistoryClientProps) {
  const [activeModalRecord, setActiveModalRecord] = useState<SavedWeeklyReportRecord | null>(null);

  // Close modal on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveModalRecord(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleExportCSV = (record: SavedWeeklyReportRecord) => {
    if (!record || !record.report || record.report.length === 0) return;
    const headers = ['Rank', 'Stock', 'Bias', 'Expected Day High', 'Expected Day Low', 'Expected Week High', 'Expected Week Low', 'Wait Until', 'Confidence'];
    const rows = record.report.map(r => [
      r.rank, r.stock, r.bias, `"${r.expectedDayHigh}"`, `"${r.expectedDayLow}"`, `"${r.expectedWeekHigh}"`, `"${r.expectedWeekLow}"`, `"${r.waitUntil}"`, `"${r.confidence}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Historical_Stock_Report_Scan_${record.id}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#141414] border border-[#222] relative overflow-hidden">
        <div className="flex items-start gap-4 z-10">
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
            <History className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-white tracking-tight">Report History & Archive</h1>
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-wide">
                {initialReports.length} {initialReports.length === 1 ? 'Scan' : 'Scans'} Saved
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Complete database archive of all previous market scans. Click <strong className="text-white">View</strong> on any row to open the full 9-column report in a modal window.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 z-10 shrink-0">
          <Link
            href="/dashboard/weekly-report"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-black bg-white rounded-lg hover:bg-neutral-200 transition cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Latest Report</span>
          </Link>
        </div>
      </div>

      {/* Main Historical Reports Table View */}
      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#222] pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">All Saved Report Scans</h3>
          </div>
          <span className="text-xs text-neutral-500 font-medium">
            Total Archives: {initialReports.length}
          </span>
        </div>

        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle px-6">
            <table className="min-w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#222] text-neutral-400 font-semibold uppercase tracking-wider bg-[#141414]">
                  <th className="py-3.5 px-4 w-24">Scan ID</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Top #1 Recommendation</th>
                  <th className="py-3.5 px-4">Bias</th>
                  <th className="py-3.5 px-4">Confidence</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f1f]">
                {initialReports.map((rec, index) => {
                  const topStock = rec.report?.[0]?.stock || 'NVDA';
                  const topBias = rec.report?.[0]?.bias || 'Bullish';
                  const topConfidence = rec.report?.[0]?.confidence || '95%';

                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-[#1a1a1a] transition-colors group text-neutral-200"
                    >
                      {/* Scan ID Badge */}
                      <td className="py-4 px-4 font-bold text-white">
                        <span className="px-2 py-1 rounded bg-neutral-800 border border-neutral-700 text-xs">
                          Scan #{initialReports.length - index}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="py-4 px-4 text-neutral-300 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-neutral-500" />
                          <span>{rec.createdAt}</span>
                        </div>
                      </td>

                      {/* Top Stock Recommendation */}
                      <td className="py-4 px-4 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-xs">
                            {topStock}
                          </span>
                          <span className="text-neutral-400 font-normal text-xs">
                            (Top Opportunity)
                          </span>
                        </div>
                      </td>

                      {/* Bias */}
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {topBias}
                        </span>
                      </td>

                      {/* Confidence */}
                      <td className="py-4 px-4 font-bold text-neutral-200">
                        {topConfidence}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setActiveModalRecord(rec)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 text-emerald-400" />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => handleExportCSV(rec)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 rounded-lg hover:border-neutral-700 transition cursor-pointer"
                            title="Export CSV"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* FULL-SCREEN REPORT MODAL */}
      {activeModalRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-6xl max-h-[90vh] bg-[#141414] border border-[#2b2b2b] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#222] bg-[#0d0d0d]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Weekly Stock Report — Scan #{activeModalRecord.id}
                  </h2>
                  <p className="text-xs text-neutral-400 flex items-center gap-1.5 mt-0.5">
                    <Clock className="h-3 w-3 text-neutral-500" /> Saved on {activeModalRecord.createdAt}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveModalRecord(null)}
                className="h-8 w-8 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body: 9-Column Institutional Report Table */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="overflow-x-auto border border-[#222] rounded-xl">
                <table className="min-w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#222] text-neutral-400 font-semibold uppercase tracking-wider bg-[#1a1a1a]">
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
                    {activeModalRecord.report.map((item) => (
                      <tr
                        key={item.stock + item.rank}
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

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#222] bg-[#0d0d0d]">
              <button
                onClick={() => handleExportCSV(activeModalRecord)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-300 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-neutral-700 hover:text-white transition cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-neutral-400" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => setActiveModalRecord(null)}
                className="px-5 py-2 text-xs font-semibold bg-white text-black rounded-lg hover:bg-neutral-200 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
