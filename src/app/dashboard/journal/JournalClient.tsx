'use client';

import React, { useState, useActionState } from 'react';
import { DailyLog } from '@/types/trading';
import { Card } from '@/components/ui/Card';
import {
  TrendingUp,
  TrendingDown,
  Trash2,
  Plus,
  Calendar as CalendarIcon,
  FileText,
  AlertCircle,
  Loader2,
  PencilLine,
  X,
  BookOpen,
  List,
  Sparkles,
  Zap,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { addDailyLogAction, deleteDailyLogAction } from '@/lib/actions/trading';
import { useFormStatus } from 'react-dom';
import JournalCalendar from '@/components/dashboard/journal/JournalCalendar';

interface JournalClientProps {
  initialLogs: DailyLog[];
  todayAutoPL?: number;
  todayAutoNote?: string;
}

function SubmitBtn({ label = 'Add to Journal', disabled = false }: { label?: string; disabled?: boolean }) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;
  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={`flex items-center justify-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer ${
        isDisabled ? 'cursor-not-allowed opacity-40' : ''
      }`}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 stroke-[2.5]" />}
      {pending ? 'Saving…' : label}
    </button>
  );
}

export default function JournalClient({
  initialLogs,
  todayAutoPL = 0,
  todayAutoNote = '',
}: JournalClientProps) {
  const [logs, setLogs] = useState<DailyLog[]>(initialLogs);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const [inlineDate, setInlineDate] = useState(today);
  const [modalDate, setModalDate] = useState(today);

  const isWeekend = (dateStr: string) => {
    if (!dateStr) return false;
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  const isInlineWeekend = isWeekend(inlineDate);
  const isModalWeekend = isWeekend(modalDate);

  const [formState, formAction] = useActionState(
    async (prevState: any, formData: FormData) => {
      const res = await addDailyLogAction(prevState, formData);
      if (res?.success) {
        setShowAddModal(false);
        window.location.reload();
      }
      return res;
    },
    null
  );

  // Today's P&L calculation
  const todayLog = logs.find((l) => l.date === today);
  const todayPL = todayLog ? todayLog.profitLoss : 0;
  const hasTodayLog = Boolean(todayLog);

  // Summary stats
  const totalDays = logs.length;
  const profitDays = logs.filter((l) => l.profitLoss > 0).length;
  const lossDays = logs.filter((l) => l.profitLoss < 0).length;
  const totalProfit = logs.filter((l) => l.profitLoss > 0).reduce((sum, l) => sum + l.profitLoss, 0);
  const totalLoss = logs.filter((l) => l.profitLoss < 0).reduce((sum, l) => sum + l.profitLoss, 0);
  const netPL = logs.reduce((sum, l) => sum + l.profitLoss, 0);
  const winRate = totalDays > 0 ? ((profitDays / totalDays) * 100).toFixed(1) : '0.0';

  const fmt = (val: number) =>
    new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(val);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    await deleteDailyLogAction(id);
    setLogs((prev) => prev.filter((l) => l.id !== id));
    setDeletingId(null);
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full max-w-none font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* ── Summary Stat Cards (5 Columns) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        {/* Today's P&L Card */}
        <div className="bg-[#0c0c0c]/90 border border-neutral-800 hover:border-emerald-500/40 rounded-2xl p-4.5 flex flex-col justify-between transition-all group shadow-xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Today&apos;s P&amp;L</span>
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
              {today}
            </span>
          </div>
          <p className={`text-2xl font-black font-mono mt-1 ${
            !hasTodayLog && todayAutoPL === 0
              ? 'text-neutral-400'
              : (hasTodayLog ? todayPL : todayAutoPL) >= 0
              ? 'text-emerald-400'
              : 'text-red-400'
          }`}>
            {hasTodayLog
              ? (todayPL >= 0 ? `+${fmt(todayPL)}` : fmt(todayPL))
              : todayAutoPL !== 0
              ? (todayAutoPL >= 0 ? `+${fmt(todayAutoPL)}` : fmt(todayAutoPL))
              : '$0.00'}
          </p>
          <p className="text-[10px] text-neutral-400 mt-1 truncate font-medium">
            {hasTodayLog
              ? (todayPL >= 0 ? 'Profit recorded today' : 'Loss recorded today')
              : todayAutoPL !== 0
              ? '⚡ Calculated from live holdings'
              : 'No entry logged today'}
          </p>
        </div>

        {/* Net P&L Card */}
        <div className="bg-[#0c0c0c]/90 border border-neutral-800 hover:border-emerald-500/40 rounded-2xl p-4.5 flex flex-col justify-between transition-all group shadow-xl">
          <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-1">Net P&amp;L</span>
          <p className={`text-2xl font-black font-mono ${netPL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(netPL)}</p>
          <p className="text-[10px] text-neutral-400 mt-1 font-medium">Cumulative journal result</p>
        </div>

        {/* Total Profit Card */}
        <div className="bg-[#0c0c0c]/90 border border-neutral-800 hover:border-emerald-500/40 rounded-2xl p-4.5 flex flex-col justify-between transition-all group shadow-xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Total Profit</span>
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <p className="text-2xl font-black font-mono text-emerald-400">+{fmt(totalProfit)}</p>
          <p className="text-[10px] text-neutral-400 mt-1 font-medium">{profitDays} winning sessions</p>
        </div>

        {/* Total Loss Card */}
        <div className="bg-[#0c0c0c]/90 border border-neutral-800 hover:border-emerald-500/40 rounded-2xl p-4.5 flex flex-col justify-between transition-all group shadow-xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Total Loss</span>
            <TrendingDown className="h-3.5 w-3.5 text-red-400" />
          </div>
          <p className="text-2xl font-black font-mono text-red-400">{fmt(totalLoss)}</p>
          <p className="text-[10px] text-neutral-400 mt-1 font-medium">{lossDays} red sessions</p>
        </div>

        {/* Win Rate Card */}
        <div className="bg-[#0c0c0c]/90 border border-neutral-800 hover:border-emerald-500/40 rounded-2xl p-4.5 flex flex-col justify-between col-span-2 sm:col-span-1 transition-all group shadow-xl">
          <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-1">Win Rate</span>
          <p className="text-2xl font-black font-mono text-white">{winRate}%</p>
          <p className="text-[10px] text-neutral-400 mt-1 font-medium">{profitDays}/{totalDays} profitable days</p>
        </div>
      </div>

      {/* ── Inline Quick Entry Card Form ── */}
      <Card className="p-0 overflow-hidden border border-neutral-800 rounded-3xl bg-[#0c0c0c]/90 backdrop-blur-2xl shadow-2xl">
        <div className="px-6 py-4 border-b border-neutral-800 bg-[#080808]/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <PencilLine className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">Log Trading Session Result</h3>
          </div>
          {isInlineWeekend ? (
            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Weekend (Markets Closed)
            </span>
          ) : todayAutoPL !== 0 ? (
            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              ⚡ Auto-Filled Live Positions
            </span>
          ) : null}
        </div>

        <form action={formAction} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            {/* Date Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Session Date</label>
              <input
                type="date"
                name="date"
                value={inlineDate}
                onChange={(e) => setInlineDate(e.target.value)}
                required
                className="px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition w-full"
              />
            </div>

            {/* P&L Amount */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Profit / Loss (CAD)</label>
              <input
                type="number"
                name="profitLoss"
                key={`inline-pnl-${inlineDate}`}
                defaultValue={isInlineWeekend ? '' : (hasTodayLog ? todayLog?.profitLoss : (todayAutoPL !== 0 ? todayAutoPL : ''))}
                disabled={isInlineWeekend}
                placeholder={isInlineWeekend ? 'Market Closed' : 'e.g. +250.00 or -120.50'}
                step="0.01"
                required={!isInlineWeekend}
                className="px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 transition w-full disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>

            {/* Strategy Note */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Strategy Note</label>
              <input
                type="text"
                name="note"
                key={`inline-note-${inlineDate}`}
                defaultValue={isInlineWeekend ? '' : (hasTodayLog ? (todayLog?.note || '') : todayAutoNote)}
                disabled={isInlineWeekend}
                placeholder={isInlineWeekend ? 'Market Closed' : 'e.g. Took profit on NVDA...'}
                maxLength={200}
                className="px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition w-full disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>

            {/* Submit Button */}
            <div>
              <SubmitBtn label="Log Result" disabled={isInlineWeekend} />
            </div>
          </div>

          {/* Weekend Alert Warning */}
          {isInlineWeekend && (
            <div className="mt-4 flex items-center gap-2.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Weekend selected ({inlineDate}). Stock markets are closed on weekends — journal entries are disabled for Saturday &amp; Sunday.</span>
            </div>
          )}

          {/* Error Message */}
          {formState?.error && (
            <div className="mt-4 flex items-center gap-2.5 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-2xl p-3.5">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {formState.error}
            </div>
          )}
        </form>
      </Card>

      {/* ── View Switcher Toolbar & Main Heatmap/Table View ── */}
      <Card className="p-0 overflow-hidden border border-neutral-800 rounded-3xl bg-[#0c0c0c]/90 backdrop-blur-2xl shadow-2xl">
        <div className="px-6 py-4 border-b border-neutral-800 bg-[#080808]/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CalendarIcon className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">Trading History View</h3>
          </div>

          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'calendar'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>Calendar Heatmap</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Detailed Log Table</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {viewMode === 'calendar' ? (
            <JournalCalendar dailyLogs={logs} fmt={fmt} />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 font-bold uppercase tracking-wider bg-[#080808]/50">
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-4">Daily Return P&amp;L</th>
                    <th className="py-3.5 px-6">Strategy Note</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {logs.length > 0 ? (
                    logs.map((l) => {
                      const isProfit = l.profitLoss >= 0;
                      return (
                        <tr key={l.id} className="hover:bg-neutral-900/60 transition-colors">
                          <td className="py-4 px-6 font-bold text-white font-mono">{l.date}</td>
                          <td className="py-4 px-4 font-mono">
                            <span className={`px-2.5 py-1 rounded-xl text-xs font-extrabold ${isProfit ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                              {isProfit ? `+${fmt(l.profitLoss)}` : fmt(l.profitLoss)}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-neutral-300 font-medium">{l.note || '—'}</td>
                          <td className="py-4 px-6 text-right">
                            <button
                              type="button"
                              onClick={() => handleDelete(l.id)}
                              disabled={deletingId === l.id}
                              className="p-2 text-neutral-400 hover:text-red-400 bg-neutral-900 hover:bg-red-500/10 rounded-xl border border-neutral-800 transition cursor-pointer"
                              title="Delete log"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-neutral-500">
                        No historical daily logs recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* ── Modal Add Entry Popup ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0c0c0c] border border-emerald-500/30 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <BookOpen className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">New Journal Entry</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form action={formAction} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Session Date</label>
                <input
                  type="date"
                  name="date"
                  value={modalDate}
                  onChange={(e) => setModalDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Profit / Loss (CAD)</label>
                <input
                  type="number"
                  name="profitLoss"
                  key={`modal-pnl-${modalDate}`}
                  defaultValue={isModalWeekend ? '' : (hasTodayLog ? todayLog?.profitLoss : (todayAutoPL !== 0 ? todayAutoPL : ''))}
                  disabled={isModalWeekend}
                  placeholder={isModalWeekend ? 'Market Closed' : 'e.g. +500.00 or -150.00'}
                  step="0.01"
                  required={!isModalWeekend}
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-40"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Strategy Note</label>
                <input
                  type="text"
                  name="note"
                  key={`modal-note-${modalDate}`}
                  defaultValue={isModalWeekend ? '' : (hasTodayLog ? (todayLog?.note || '') : todayAutoNote)}
                  disabled={isModalWeekend}
                  placeholder={isModalWeekend ? 'Market Closed' : 'e.g. Closed SPY position...'}
                  maxLength={200}
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-40"
                />
              </div>

              <div className="mt-2">
                <SubmitBtn label="Save Entry" disabled={isModalWeekend} />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
