'use client';

import React, { useState, useTransition, useRef } from 'react';
import { DailyLog } from '@/types/trading';
import { Card } from '@/components/ui/Card';
import {
  TrendingUp,
  TrendingDown,
  Trash2,
  Plus,
  Calendar,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  PencilLine,
  X,
  Check,
} from 'lucide-react';
import { addDailyLogAction, deleteDailyLogAction } from '@/lib/actions/trading';
import { useFormState, useFormStatus } from 'react-dom';

interface JournalClientProps {
  initialLogs: DailyLog[];
}

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 px-4 py-2.5 bg-white text-black text-xs font-bold rounded-lg hover:bg-neutral-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
      {pending ? 'Adding…' : 'Add Entry'}
    </button>
  );
}

export default function JournalClient({ initialLogs }: JournalClientProps) {
  const [logs, setLogs] = useState<DailyLog[]>(initialLogs);
  const [formState, formAction] = useFormState(
    async (prevState: any, formData: FormData) => {
      const res = await addDailyLogAction(prevState, formData);
      if (res?.success) {
        // Optimistically refresh: reload page data via router would revalidate,
        // but for now refetch via window reload on success
        window.location.reload();
      }
      return res;
    },
    null
  );
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNote, setEditNote] = useState('');
  const [isPending, startTransition] = useTransition();

  // Summary stats
  const totalDays = logs.length;
  const profitDays = logs.filter((l) => l.profitLoss > 0).length;
  const lossDays = logs.filter((l) => l.profitLoss < 0).length;
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

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="flex flex-col gap-6 max-w-5xl">

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#141414] border border-[#222] rounded-xl p-4">
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold mb-2">Net P&L</p>
          <p className={`text-xl font-black ${netPL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(netPL)}</p>
          <p className="text-[10px] text-neutral-600 mt-1">All entries combined</p>
        </div>
        <div className="bg-[#141414] border border-[#222] rounded-xl p-4">
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold mb-2">Win Rate</p>
          <p className="text-xl font-black text-white">{winRate}%</p>
          <p className="text-[10px] text-neutral-600 mt-1">{profitDays}/{totalDays} days profitable</p>
        </div>
        <div className="bg-[#141414] border border-[#222] rounded-xl p-4">
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold mb-2">Profit Days</p>
          <p className="text-xl font-black text-emerald-400">{profitDays}</p>
          <p className="text-[10px] text-neutral-600 mt-1">Green sessions</p>
        </div>
        <div className="bg-[#141414] border border-[#222] rounded-xl p-4">
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold mb-2">Loss Days</p>
          <p className="text-xl font-black text-red-400">{lossDays}</p>
          <p className="text-[10px] text-neutral-600 mt-1">Red sessions</p>
        </div>
      </div>

      {/* ── Add Entry Form ── */}
      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1a1a1a] bg-[#141414] flex items-center gap-2.5">
          <PencilLine className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Log Today&apos;s P&L</span>
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
                className="px-3 py-2 bg-[#0a0a0a] border border-[#262626] rounded-lg text-xs text-white focus:outline-none transition w-36"
              />
            </div>

            {/* P&L Amount */}
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <label className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">P&L Amount (CAD)</label>
              <input
                type="number"
                name="profitLoss"
                placeholder="e.g. 250.00 or -120.50"
                step="0.01"
                required
                className="px-3 py-2 bg-[#0a0a0a] border border-[#262626] rounded-lg text-xs placeholder-neutral-600 focus:outline-none transition w-full"
              />
            </div>

            {/* Note */}
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <label className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Note (optional)</label>
              <input
                type="text"
                name="note"
                placeholder="e.g. Sold NVDA, covered TSLA puts…"
                maxLength={200}
                className="px-3 py-2 bg-[#0a0a0a] border border-[#262626] rounded-lg text-xs placeholder-neutral-600 focus:outline-none transition w-full"
              />
            </div>

            {/* Submit */}
            <div className="flex flex-col justify-end">
              <SubmitBtn />
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

      {/* ── Journal Table ── */}
      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1a1a1a] bg-[#141414] flex items-center gap-2.5">
          <Calendar className="h-4 w-4 text-purple-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Daily P&L Journal</span>
          {logs.length > 0 && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-neutral-400 border border-neutral-700 ml-auto">
              {logs.length} {logs.length === 1 ? 'Entry' : 'Entries'}
            </span>
          )}
        </div>

        {logs.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-center px-6">
            <FileText className="h-10 w-10 text-neutral-700" />
            <div>
              <p className="text-sm font-semibold text-neutral-400">No journal entries yet</p>
              <p className="text-xs text-neutral-600 mt-1">Add your first P&L entry above to start tracking your daily performance.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1a1a1a] text-neutral-500 uppercase tracking-wider font-semibold text-left">
                  <th className="py-3 px-5 w-6"></th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">P&L (CAD)</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4 flex-1">Note</th>
                  <th className="py-3 px-4 text-right">Action</th>
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
                      {/* Color bar */}
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

                      {/* Result Badge */}
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

                      {/* Note (editable) */}
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
                            className="text-neutral-500 truncate cursor-pointer hover:text-neutral-300 transition max-w-50 block"
                            title={log.note || 'Click to add note'}
                            onClick={() => {
                              setEditingId(log.id);
                              setEditNote(log.note || '');
                            }}
                          >
                            {log.note || <span className="italic text-neutral-700">No note</span>}
                          </span>
                        )}
                      </td>

                      {/* Delete */}
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleDelete(log.id)}
                          disabled={isDeleting}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold bg-red-500/0 hover:bg-red-500/10 text-neutral-600 hover:text-red-400 border border-transparent hover:border-red-500/20 rounded-lg transition-all cursor-pointer group-hover:opacity-100 disabled:opacity-50"
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
