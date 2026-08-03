'use client';

import React, { useActionState } from 'react';
import { addDailyLogAction } from '@/lib/actions/trading';
import { Card } from '@/components/ui/Card';
import { BookOpen, PencilLine, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const getTodayLocal = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const AddDailyLogForm: React.FC = () => {
  const [state, formAction, isPending] = useActionState(addDailyLogAction, {} as any);

  return (
    <Card className="p-0 overflow-hidden border border-neutral-800 rounded-3xl bg-[#0c0c0c]/90 backdrop-blur-2xl shadow-2xl transition-all hover:border-emerald-500/30 font-sans">
      {/* Card Header */}
      <div className="px-6 py-4.5 border-b border-neutral-800 bg-[#080808]/90 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">Log Daily Session P&amp;L</h3>
            <p className="text-[10px] text-neutral-400 font-medium">Auto 5 PM market close logging</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-neutral-900 text-neutral-400 border border-neutral-800">
          Journal Entry
        </span>
      </div>

      <form action={formAction} className="p-6 flex flex-col gap-4.5">
        {/* Date Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Session Date</label>
          <input
            type="date"
            name="date"
            required
            defaultValue={getTodayLocal()}
            className="px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 transition w-full"
          />
        </div>

        {/* Profit / Loss Amount */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Profit / Loss (CAD $)</label>
          <input
            type="number"
            name="profitLoss"
            placeholder="e.g. +350.00 or -120.00"
            required
            step="0.01"
            className="px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-purple-500 transition w-full"
          />
        </div>

        {/* Strategy Note */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Session Note (Optional)</label>
          <input
            type="text"
            name="note"
            placeholder="e.g. Took profit on GOOGL breakout..."
            maxLength={200}
            className="px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 transition w-full"
          />
        </div>

        {/* Feedback Messages */}
        {state?.error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-400 font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        {state?.success && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Journal entry saved successfully!</span>
          </div>
        )}

        {/* Submit Action Button */}
        <Button
          type="submit"
          isLoading={isPending}
          className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-[0_0_25px_rgba(168,85,247,0.35)] transition-all cursor-pointer mt-1"
        >
          Save Journal Entry
        </Button>
      </form>
    </Card>
  );
};

export default AddDailyLogForm;
