'use client';

import React, { useActionState, useState, useEffect } from 'react';
import { addTradeAction } from '@/lib/actions/trading';
import { Holding } from '@/types/trading';
import { X, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface SellModalProps {
  holding: Holding | null;
  onClose: () => void;
}

const getTodayLocal = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const SellModal: React.FC<SellModalProps> = ({ holding, onClose }) => {
  const [state, formAction, isPending] = useActionState(addTradeAction, {} as any);
  const [sharesToSell, setSharesToSell] = useState<string>('');
  const [pricePerShare, setPricePerShare] = useState<string>('');
  const [currency, setCurrency] = useState<'USD' | 'CAD'>('USD');

  useEffect(() => {
    if (holding) {
      setSharesToSell(String(holding.shares));
      setPricePerShare(holding.currentPrice ? holding.currentPrice.toFixed(2) : String(holding.averagePrice));
      
      const tickerUpper = holding.ticker.toUpperCase();
      if (tickerUpper.endsWith('.TO') || tickerUpper.endsWith('.V') || tickerUpper.endsWith('.CN')) {
        setCurrency('CAD');
      } else {
        setCurrency('USD');
      }
    }
  }, [holding]);

  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        onClose();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state, onClose]);

  if (!holding) return null;

  const sharesNum = parseFloat(sharesToSell) || 0;
  const priceNum = parseFloat(pricePerShare) || 0;
  const estimatedProceeds = sharesNum * priceNum;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#141414] border border-[#222] rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#222]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-red-500/10 text-red-400">
              <TrendingDown className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Sell Position: {holding.ticker}</h3>
              <p className="text-[11px] text-neutral-400">
                You own <span className="font-semibold text-white">{holding.shares.toLocaleString()}</span> shares
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form action={formAction} className="p-5 flex flex-col gap-4">
          <input type="hidden" name="ticker" value={holding.ticker} />
          <input type="hidden" name="type" value="SELL" />

          {/* Shares + Price Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Shares to Sell"
              name="shares"
              type="number"
              required
              min="0.000001"
              max={holding.shares}
              step="any"
              value={sharesToSell}
              onChange={(e) => setSharesToSell(e.target.value)}
            />
            <Input
              label="Price per Share"
              name="price"
              type="number"
              required
              min="0.01"
              step="any"
              value={pricePerShare}
              onChange={(e) => setPricePerShare(e.target.value)}
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

          {/* Order Proceeds Summary */}
          {estimatedProceeds > 0 && (
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg flex justify-between items-center text-xs">
              <span className="text-neutral-400">Estimated Cash Proceeds:</span>
              <span className="font-semibold text-emerald-400">
                +${estimatedProceeds.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
              </span>
            </div>
          )}

          {/* Feedback Messages */}
          {state?.error && (
            <p className="text-xs text-red-400 font-medium bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2">
              {state.error}
            </p>
          )}
          {state?.success && (
            <p className="text-xs text-emerald-400 font-medium bg-emerald-500/5 border border-emerald-500/10 rounded-lg px-3 py-2">
              Sell transaction recorded. Cash balance credited!
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <Button type="submit" isLoading={isPending} className="bg-red-600 hover:bg-red-500 text-white">
              Confirm Sell
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellModal;
