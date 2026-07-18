'use client';

import React, { useActionState } from 'react';
import { addDailyLogAction } from '@/lib/actions/trading';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export const AddDailyLogForm: React.FC = () => {
  const [state, formAction, isPending] = useActionState(addDailyLogAction, {} as any);

  return (
    <Card>
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-white">Daily P&L Log</h3>
        <p className="text-xs text-neutral-500 mt-0.5">Record your daily result</p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <Input label="Date" name="date" type="date" required />
        <Input label="Profit / Loss ($)" name="profitLoss" type="number" placeholder="0.00" required step="0.01" />
        <Input label="Note (optional)" name="note" placeholder="Quick summary..." />

        {state?.error && (
          <p className="text-xs text-red-400 font-medium bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2">{state.error}</p>
        )}
        {state?.success && (
          <p className="text-xs text-emerald-400 font-medium bg-emerald-500/5 border border-emerald-500/10 rounded-lg px-3 py-2">Entry saved.</p>
        )}

        <Button type="submit" isLoading={isPending}>
          Save Entry
        </Button>
      </form>
    </Card>
  );
};

export default AddDailyLogForm;
