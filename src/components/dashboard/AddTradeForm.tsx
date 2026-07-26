'use client';

import React, { useActionState, useState } from 'react';
import { addTradeAction } from '@/lib/actions/trading';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

// Get today's date as YYYY-MM-DD in local timezone
const getTodayLocal = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const AddTradeForm: React.FC = () => {
  const [state, formAction, isPending] = useActionState(addTradeAction, {} as any);
  const [currency, setCurrency] = useState<'USD' | 'CAD'>('USD');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [shares, setShares] = useState<string>('');
  const [price, setPrice] = useState<string>('');

  // Auto-detect from ticker (TSX stocks ending in .TO are CAD, otherwise USD)
  const handleTickerBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().trim();
    if (val.endsWith('.TO') || val.endsWith('.V') || val.endsWith('.CN')) {
      setCurrency('CAD');
    } else if (val.length > 0) {
      setCurrency('USD');
    }
  };

  const calculatedTotal = (parseFloat(shares) || 0) * (parseFloat(price) || 0);

  return (
    <Card>
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-white">Add Trade</h3>
        <p className="text-xs text-neutral-500 mt-0.5">
          Buying deducts from your cash balance; selling credits your cash balance.
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        {/* Ticker + Type */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Ticker"
            name="ticker"
            placeholder="AAPL / RY.TO"
            required
            onBlur={handleTickerBlur}
          />
          <div className="w-full flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Type</label>
            <select
              name="type"
              value={tradeType}
              onChange={(e) => setTradeType(e.target.value as 'BUY' | 'SELL')}
              className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-700 transition-colors duration-150 cursor-pointer"
            >
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
            </select>
          </div>
        </div>

        {/* Shares + Price */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Shares"
            name="shares"
            type="number"
            placeholder="0"
            required
            min="1"
            step="any"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
          />
          <Input
            label="Price"
            name="price"
            type="number"
            placeholder="0.00"
            required
            min="0"
            step="any"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        {/* Currency + Date */}
        <div className="grid grid-cols-2 gap-3">
          <div className="w-full flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Currency
            </label>
            <div className="flex rounded-lg overflow-hidden border border-neutral-800 text-xs font-semibold select-none">
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`flex-1 py-2.5 transition-colors cursor-pointer ${
                  currency === 'USD'
                    ? 'bg-neutral-700 text-white'
                    : 'bg-neutral-900 text-neutral-500 hover:text-neutral-300'
                }`}
              >
                🇺🇸 USD
              </button>
              <button
                type="button"
                onClick={() => setCurrency('CAD')}
                className={`flex-1 py-2.5 transition-colors cursor-pointer ${
                  currency === 'CAD'
                    ? 'bg-neutral-700 text-white'
                    : 'bg-neutral-900 text-neutral-500 hover:text-neutral-300'
                }`}
              >
                🇨🇦 CAD
              </button>
            </div>
            <input type="hidden" name="currency" value={currency} />
          </div>

          <Input
            label="Date"
            name="date"
            type="date"
            required
            defaultValue={getTodayLocal()}
          />
        </div>

        {/* Estimated Order Summary */}
        {calculatedTotal > 0 && (
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg flex justify-between items-center text-xs">
            <span className="text-neutral-400">
              Estimated {tradeType === 'BUY' ? 'Cost' : 'Proceeds'}:
            </span>
            <span className="font-semibold text-white">
              ${calculatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
            </span>
          </div>
        )}

        {state?.error && (
          <p className="text-xs text-red-400 font-medium bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2">
            {state.error}
          </p>
        )}
        {state?.success && (
          <p className="text-xs text-emerald-400 font-medium bg-emerald-500/5 border border-emerald-500/10 rounded-lg px-3 py-2">
            Trade recorded and cash balance updated.
          </p>
        )}

        <Button type="submit" isLoading={isPending}>
          Submit Trade
        </Button>
      </form>
    </Card>
  );
};

export default AddTradeForm;
