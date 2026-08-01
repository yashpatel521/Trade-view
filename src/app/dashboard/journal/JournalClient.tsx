'use client';

import React, { useState, useActionState } from 'react';
import { DailyLog } from '@/types/trading';
import { Card } from '@/components/ui/Card';
import {
  TrendingUp,
  TrendingDown,
  Trash2,
  Plus,
  Calendar,
  FileText,
  AlertCircle,
  Loader2,
  PencilLine,
  X,
  BookOpen,
  List,
} from 'lucide-react';
import { addDailyLogAction, deleteDailyLogAction } from '@/lib/actions/trading';
import { useFormStatus } from 'react-dom';
import JournalCalendar from '@/components/dashboard/journal/JournalCalendar';

interface JournalClientProps {
  initialLogs: DailyLog[];
}

function SubmitBtn({ label = 'Add to Journal' }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5 stroke-[2.5]" />}
      {pending ? 'Saving…' : label}
    </button>
  );
}

export default function JournalClient({ initialLogs }: JournalClientProps) {
  const [logs, setLogs] = useState<DailyLog[]>(initialLogs);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNote, setEditNote] = useState('');

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
  const today = new Date().toISOString().split('T')[0];
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
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* ── Page Header + Main Add to Journal Action ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1a1a1a] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Trading Journal</h1>
          </div>
          <p className="text-xs text-neutral-500 mt-1.5">
            Record your daily profit and loss results and keep track of your trading performance.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Add to Journal</span>
        </button>
      </div>

      {/* ── Summary Stats: Today's P&L, Net P&L, Profit, Loss, Win Rate ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Today's P&L Card */}
        <div className="bg-[#141414] border border-[#222] rounded-xl p-4 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold">Today&apos;s P&amp;L</p>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
              {today}
            </span>
          </div>
          <p className={`text-xl font-black mt-1 ${
            !hasTodayLog
              ? 'text-neutral-400'
              : todayPL >= 0
              ? 'text-emerald-400'
              : 'text-red-400'
          }`}>
            {hasTodayLog ? (todayPL >= 0 ? `+${fmt(todayPL)}` : fmt(todayPL)) : '$0.00'}
          </p>
          <p className="text-[10px] text-neutral-500 mt-1 truncate">
            {hasTodayLog ? (todayPL >= 0 ? 'Profit recorded today' : 'Loss recorded today') : 'No entry logged today'}
          </p>
        </div>

        <div className="bg-[#141414] border border-[#222] rounded-xl p-4 flex flex-col justify-between">
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold mb-1">Net P&amp;L</p>
          <p className={`text-xl font-black ${netPL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(netPL)}</p>
          <p className="text-[10px] text-neutral-600 mt-1">Cumulative result</p>
        </div>

        <div className="bg-[#141414] border border-[#222] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Total Profit</p>
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <p className="text-xl font-black text-emerald-400">+{fmt(totalProfit)}</p>
          <p className="text-[10px] text-neutral-600 mt-1">{profitDays} winning sessions</p>
        </div>

        <div className="bg-[#141414] border border-[#222] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Total Loss</p>
            <TrendingDown className="h-3.5 w-3.5 text-red-400" />
          </div>
          <p className="text-xl font-black text-red-400">{fmt(totalLoss)}</p>
          <p className="text-[10px] text-neutral-600 mt-1">{lossDays} red sessions</p>
        </div>

        <div className="bg-[#141414] border border-[#222] rounded-xl p-4 flex flex-col justify-between col-span-2 sm:col-span-1">
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold mb-1">Win Rate</p>
          <p className="text-xl font-black text-white">{winRate}%</p>
          <p className="text-[10px] text-neutral-600 mt-1">{profitDays}/{totalDays} days profitable</p>
        </div>
      </div>

      {/* ── Inline Add Entry Form ── */}
      <Card className="p-0 overflow-hidden border border-[#222]">
        <div className="px-5 py-4 border-b border-[#1a1a1a] bg-[#141414] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <PencilLine className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Log Today&apos;s Profit or Loss</span>
          </div>
        </div>

        <form action={formAction} className="p-5">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Date</label>
              <input
                type="date"
                name="date"
                defaultValue={today}
                required
                className="px-3.5 py-2.5 bg-[#0a0a0a] border border-[#262626] rounded-xl text-xs text-white focus:outline-none transition w-full sm:w-36"
              />
            </div>

            {/* P&L Amount */}
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <label className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Profit or Loss (CAD)</label>
              <input
                type="number"
                name="profitLoss"
                placeholder="e.g. +250.00 or -120.50"
                step="0.01"
                required
                className="px-3.5 py-2.5 bg-[#0a0a0a] border border-[#262626] rounded-xl text-xs text-white focus:outline-none transition w-full"
              />
            </div>

            {/* Note */}
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <label className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Note / Strategy (optional)</label>
              <input
                type="text"
                name="note"
                placeholder="e.g. Sold NVDA, covered TSLA puts…"
                maxLength={200}
                className="px-3.5 py-2.5 bg-[#0a0a0a] border border-[#262626] rounded-xl text-xs text-white focus:outline-none transition w-full"
              />
            </div>

            {/* Submit Button */}
            <div className="flex flex-col justify-end">
              <SubmitBtn label="Add to Journal" />
            </div>
          </div>

          {/* Form feedback */}
          {formState?.error && (
            <div className="mt-3 flex items-center gap-2 text-xs text-red-400 bg-red-500/8 border border-red-500/20 rounded-lg px-3 py-2">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {formState.error}
            </div>
          )}
        </form>
      </Card>

      {/* ── Modal Add to Journal Popup ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141414] border border-neutral-800 rounded-2xl p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <BookOpen className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Add Entry to Journal</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form action={formAction} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-neutral-400 font-semibold uppercase">Date</label>
                <input
                  type="date"
                  name="date"
                  defaultValue={today}
                  required
                  className="w-full px-3.5 py-2.5 bg-[#0a0a0a] border border-neutral-800 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-neutral-400 font-semibold uppercase">Profit or Loss Amount (CAD)</label>
                <input
                  type="number"
                  name="profitLoss"
                  placeholder="e.g. 500.00 or -150.00"
                  step="0.01"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#0a0a0a] border border-neutral-800 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-neutral-400 font-semibold uppercase">Trading Note</label>
                <input
                  type="text"
                  name="note"
                  placeholder="e.g. Great execution on intraday reversal…"
                  maxLength={200}
                  className="w-full px-3.5 py-2.5 bg-[#0a0a0a] border border-neutral-800 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              {formState?.error && (
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {formState.error}
                </div>
              )}

              <div className="flex justify-end gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <SubmitBtn label="Add to Journal" />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Journal History Card (Calendar / Table View) ── */}
      <Card className="p-0 overflow-hidden border border-[#222]">
        <div className="px-5 py-4 border-b border-[#1a1a1a] bg-[#141414] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Calendar className="h-4 w-4 text-purple-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Journal History</span>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Switcher */}
            <div className="inline-flex rounded-xl p-0.5 bg-neutral-900 border border-neutral-800 text-[11px] font-semibold select-none">
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'calendar'
                    ? 'bg-neutral-800 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Calendar className="h-3 w-3" />
                <span>Calendar</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-neutral-800 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <List className="h-3 w-3" />
                <span>Table</span>
              </button>
            </div>

            {logs.length > 0 && (
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-neutral-800 text-neutral-300 border border-neutral-700 hidden sm:inline-block">
                {logs.length} {logs.length === 1 ? 'Entry' : 'Entries'}
              </span>
            )}
          </div>
        </div>

        {viewMode === 'calendar' ? (
          <JournalCalendar dailyLogs={logs} fmt={fmt} />
        ) : logs.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-center px-6">
            <FileText className="h-10 w-10 text-neutral-700" />
            <div>
              <p className="text-sm font-semibold text-neutral-400">No journal entries recorded</p>
              <p className="text-xs text-neutral-600 mt-1">Click "Add to Journal" above to record your first P&L entry.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="mt-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-extrabold rounded-xl transition cursor-pointer"
            >
              + Add First Entry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1a1a1a] text-neutral-500 uppercase tracking-wider font-semibold text-left">
                  <th className="py-3.5 px-5 w-6"></th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Profit / Loss</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 flex-1">Note</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#111]">
                {logs.map((log) => {
                  const isUp = log.profitLoss > 0;
                  const isFlat = log.profitLoss === 0;
                  const isDeleting = deletingId === log.id;
                  const isEditing = editingId === log.id;

                  return (
                    <tr key={log.id} className="hover:bg-[#141414] transition-colors group">
                      {/* Color indicator bar */}
                      <td className="py-4 px-5 w-6">
                        <div className={`h-8 w-1 rounded-full mx-auto ${isFlat ? 'bg-neutral-600' : isUp ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4">
                        <span className="font-semibold text-neutral-200">{log.date}</span>
                      </td>

                      {/* P&L */}
                      <td className="py-4 px-4">
                        <span className={`text-sm font-black ${isFlat ? 'text-neutral-400' : isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                          {log.profitLoss >= 0 ? '+' : ''}{fmt(log.profitLoss)}
                        </span>
                      </td>

                      {/* Status Result Badge */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          isFlat
                            ? 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                            : isUp
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {isFlat ? '–' : isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {isFlat ? 'Flat' : isUp ? 'Profit' : 'Loss'}
                        </span>
                      </td>

                      {/* Note */}
                      <td className="py-4 px-4 max-w-xs">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              autoFocus
                              type="text"
                              value={editNote}
                              onChange={(e) => setEditNote(e.target.value)}
                              maxLength={200}
                              className="flex-1 px-2 py-1 bg-[#0a0a0a] border border-blue-500/40 rounded text-xs text-white focus:outline-none"
                            />
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-neutral-500 hover:text-white transition cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span
                            className="text-neutral-400 truncate cursor-pointer hover:text-white transition max-w-50 block"
                            title={log.note || 'Click to add note'}
                            onClick={() => {
                              setEditingId(log.id);
                              setEditNote(log.note || '');
                            }}
                          >
                            {log.note || <span className="italic text-neutral-600">No note</span>}
                          </span>
                        )}
                      </td>

                      {/* Delete */}
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleDelete(log.id)}
                          disabled={isDeleting}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                          Delete
                        </button>
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
