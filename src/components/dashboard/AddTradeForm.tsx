/* eslint-disable tailwindcss/no-contradicting-classname */
'use client';

import React, { useActionState } from 'react';
import { addTradeAction } from '@/lib/actions/trading';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export const AddTradeForm: React.FC = () => {
  const [state, formAction, isPending] = useActionState(addTradeAction, {} as any);

  return (
    <Card>
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-white">Add Trade</h3>
        <p className="text-xs text-neutral-500 mt-0.5">Record a buy or sell</p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Ticker" name="ticker" placeholder="AAPL" required />
          <div className="w-full flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Type</label>
            <select
              name="type"
              className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-100 focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-700 transition-colors duration-150 cursor-pointer"
            >
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Shares" name="shares" type="number" placeholder="0" required min="1" step="1" />
          <Input label="Price" name="price" type="number" placeholder="0.00" required min="0" step="0.01" />
        </div>

        <Input label="Date" name="date" type="date" required />

        {state?.error && (
          <p className="text-xs text-red-400 font-medium bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2">{state.error}</p>
        )}
        {state?.success && (
          <p className="text-xs text-emerald-400 font-medium bg-emerald-500/5 border border-emerald-500/10 rounded-lg px-3 py-2">Trade recorded.</p>
        )}

        <Button type="submit" isLoading={isPending}>
          Submit Trade
        </Button>
      </form>
    </Card>
  );
};

export default AddTradeForm;
