'use client';

import React, { useActionState, useState } from 'react';
import { addTradeAction } from '@/lib/actions/trading';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PlusCircle, TrendingUp, TrendingDown, DollarSign, Calendar, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

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
  const [tickerInput, setTickerInput] = useState<string>('');

  const updateCurrencyFromTicker = (val: string) => {
    const clean = val.toUpperCase().trim();
    if (clean.endsWith('.TO') || clean.endsWith('.V') || clean.endsWith('.CN')) {
      setCurrency('CAD');
    } else {
      setCurrency('USD');
    }
  };

  const handleTickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTickerInput(val);
    updateCurrencyFromTicker(val);
  };

  const calculatedTotal = (parseFloat(shares) || 0) * (parseFloat(price) || 0);

  return (
    <Card className="p-0 overflow-hidden border border-neutral-800 rounded-3xl bg-[#0c0c0c]/90 backdrop-blur-2xl shadow-2xl transition-all hover:border-emerald-500/30 font-sans">
      {/* Form Card Header */}
      <div className="px-6 py-4.5 border-b border-neutral-800 bg-[#080808]/90 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl border ${tradeType === 'BUY' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
            {tradeType === 'BUY' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">Execute Stock Trade</h3>
            <p className="text-[10px] text-neutral-400 font-medium">Automatic CAD / USD account routing</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-neutral-900 text-neutral-400 border border-neutral-800">
          Order Execution
        </span>
      </div>

      <form action={formAction} className="p-6 flex flex-col gap-4.5">
        {/* Ticker & Order Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Stock Ticker Symbol</label>
            <input
              type="text"
              name="ticker"
              placeholder="e.g. AAPL, NVDA, RY.TO"
              required
              value={tickerInput}
              onChange={handleTickerChange}
              className="px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white font-mono font-extrabold focus:outline-none focus:ring-1 focus:ring-emerald-500 transition uppercase"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Order Action</label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-950 border border-neutral-800 rounded-xl">
              <button
                type="button"
                onClick={() => setTradeType('BUY')}
                className={`py-2 rounded-lg text-xs font-black uppercase transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  tradeType === 'BUY'
                    ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Buy</span>
              </button>
              <button
                type="button"
                onClick={() => setTradeType('SELL')}
                className={`py-2 rounded-lg text-xs font-black uppercase transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  tradeType === 'SELL'
                    ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <TrendingDown className="h-3.5 w-3.5" />
                <span>Sell</span>
              </button>
            </div>
            <input type="hidden" name="type" value={tradeType} />
          </div>
        </div>

        {/* Shares & Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Shares Quantity</label>
            <input
              type="number"
              name="shares"
              placeholder="e.g. 100 or 0.5"
              required
              min="0.000001"
              step="any"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              className="px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Execution Price</label>
            <input
              type="number"
              name="price"
              placeholder="0.00"
              required
              min="0.000001"
              step="any"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
            />
          </div>
        </div>

        {/* Currency & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Currency Ledger</label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-950 border border-neutral-800 rounded-xl">
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`py-2 rounded-lg text-xs font-black font-mono transition cursor-pointer ${
                  currency === 'USD'
                    ? 'bg-neutral-800 text-white border border-neutral-700 shadow-sm'
                    : 'text-neutral-500 hover:text-white'
                }`}
              >
                🇺🇸 USD
              </button>
              <button
                type="button"
                onClick={() => setCurrency('CAD')}
                className={`py-2 rounded-lg text-xs font-black font-mono transition cursor-pointer ${
                  currency === 'CAD'
                    ? 'bg-neutral-800 text-white border border-neutral-700 shadow-sm'
                    : 'text-neutral-500 hover:text-white'
                }`}
              >
                🇨🇦 CAD
              </button>
            </div>
            <input type="hidden" name="currency" value={currency} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Trade Date</label>
            <input
              type="date"
              name="date"
              required
              defaultValue={getTodayLocal()}
              className="px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
            />
          </div>
        </div>

        {/* Estimated Order Summary */}
        {calculatedTotal > 0 && (
          <div className="p-4 bg-neutral-950/90 border border-neutral-800 rounded-2xl flex justify-between items-center text-xs font-mono shadow-md">
            <span className="text-neutral-400 font-sans font-bold text-[11px] uppercase tracking-wider">
              Estimated {tradeType === 'BUY' ? 'Order Cost' : 'Order Proceeds'}:
            </span>
            <span className="font-black text-sm text-emerald-400">
              ${calculatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
            </span>
          </div>
        )}

        {/* Error Feedback */}
        {state?.error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-400 font-medium">
            {state.error}
          </div>
        )}

        {/* Submit Action Button */}
        <Button
          type="submit"
          isLoading={isPending}
          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs sm:text-sm rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all cursor-pointer mt-1"
        >
          {tradeType === 'BUY' ? 'Execute Buy Order' : 'Execute Sell Order'}
        </Button>
      </form>
    </Card>
  );
};

export default AddTradeForm;
