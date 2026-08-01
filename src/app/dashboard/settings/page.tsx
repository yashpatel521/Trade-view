'use client';

import React, { useActionState, useEffect, useState } from 'react';
import { updateFundsAction, updatePrivacyAction, getDashboardDataAction } from '@/lib/actions/trading';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DollarSign, Plus, Settings, Eye, EyeOff, Wallet } from 'lucide-react';

export default function SettingsPage() {
  const [state, formAction, isPending] = useActionState(updateFundsAction, {} as any);
  const [privacyState, privacyFormAction, isPrivacyPending] = useActionState(updatePrivacyAction, {} as any);
  
  const [cashBalanceCad, setCashBalanceCad] = useState<number | null>(null);
  const [cashBalanceUsd, setCashBalanceUsd] = useState<number | null>(null);
  const [depositCurrency, setDepositCurrency] = useState<'CAD' | 'USD'>('CAD');
  const [isPublic, setIsPublic] = useState<boolean | null>(null);

  // Load the current user configurations dynamically
  const loadSettings = () => {
    getDashboardDataAction().then((data) => {
      if (data) {
        setCashBalanceCad(data.stats.cashBalanceCad);
        setCashBalanceUsd(data.stats.cashBalanceUsd);
        setIsPublic(data.stats.isPublic);
      }
    });
  };

  useEffect(() => {
    loadSettings();
  }, [state, privacyState]);

  const fmtCad = (val: number) =>
    new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(val);
  const fmtUsd = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-[#1a1a1a] pb-4">
        <Settings className="h-5 w-5 text-neutral-400" />
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Settings & Accounts</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Manage your separate CAD & USD cash accounts and preferences</p>
        </div>
      </div>

      {/* Dual Cash Accounts Display Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* CAD Cash Account Card */}
        <Card className="flex items-center justify-between border border-emerald-500/20 bg-neutral-900/60">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm">🇨🇦</span>
              <p className="text-xs text-neutral-400 uppercase tracking-wider font-bold">CAD Cash Account</p>
            </div>
            <p className="text-2xl font-bold text-emerald-400">
              {cashBalanceCad !== null ? fmtCad(cashBalanceCad) : 'Loading...'}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Wallet className="h-5 w-5" />
          </div>
        </Card>

        {/* USD Cash Account Card */}
        <Card className="flex items-center justify-between border border-blue-500/20 bg-neutral-900/60">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm">🇺🇸</span>
              <p className="text-xs text-neutral-400 uppercase tracking-wider font-bold">USD Cash Account</p>
            </div>
            <p className="text-2xl font-bold text-blue-400">
              {cashBalanceUsd !== null ? fmtUsd(cashBalanceUsd) : 'Loading...'}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Wallet className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Update Funds Card */}
      <Card>
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-white">Deposit & Account Management</h3>
          <p className="text-xs text-neutral-500 mt-0.5">Add deposits directly to your CAD or USD cash account</p>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          {/* Account Currency Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Target Account</label>
            <div className="flex rounded-lg overflow-hidden border border-neutral-800 text-xs font-semibold select-none max-w-xs">
              <button
                type="button"
                onClick={() => setDepositCurrency('CAD')}
                className={`flex-1 py-2.5 transition-colors cursor-pointer ${
                  depositCurrency === 'CAD'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-neutral-900 text-neutral-500 hover:text-neutral-300'
                }`}
              >
                🇨🇦 CAD Account
              </button>
              <button
                type="button"
                onClick={() => setDepositCurrency('USD')}
                className={`flex-1 py-2.5 transition-colors cursor-pointer ${
                  depositCurrency === 'USD'
                    ? 'bg-blue-600 text-white'
                    : 'bg-neutral-900 text-neutral-500 hover:text-neutral-300'
                }`}
              >
                🇺🇸 USD Account
              </button>
            </div>
            <input type="hidden" name="currency" value={depositCurrency} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="w-full flex flex-col gap-1.5">
              <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Action</label>
              <select
                name="actionType"
                defaultValue="ADD"
                className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-100 focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-700 transition-colors duration-150 cursor-pointer"
              >
                <option value="ADD">Add Funds (+)</option>
                <option value="SET">Set Absolute Balance (=)</option>
              </select>
            </div>

            <Input
              label={`Amount (${depositCurrency})`}
              name="amount"
              type="number"
              placeholder="0.00"
              required
              min="0"
              step="0.01"
            />
          </div>

          {state?.error && (
            <p className="text-xs text-red-400 font-medium bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2">
              {state.error}
            </p>
          )}
          {state?.success && (
            <p className="text-xs text-emerald-400 font-medium bg-emerald-500/5 border border-emerald-500/10 rounded-lg px-3 py-2">
              {depositCurrency} Account balance updated successfully.
            </p>
          )}

          <Button type="submit" isLoading={isPending} className="flex items-center justify-center gap-1.5 self-start">
            <Plus className="h-4 w-4" />
            Update {depositCurrency} Account
          </Button>
        </form>
      </Card>

      {/* Privacy Settings Card */}
      <Card>
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-white">Privacy Settings</h3>
          <p className="text-xs text-neutral-500 mt-0.5">Control who can view your portfolio on the public leaderboard</p>
        </div>

        <form action={privacyFormAction} className="flex flex-col gap-4">
          <div className="flex items-center justify-between p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <div className="flex items-center gap-3.5 min-w-0 pr-4">
              <div className="h-9 w-9 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 shrink-0">
                {isPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-neutral-200">Public Portfolio Visibility</span>
                <span className="text-[10px] text-neutral-400 mt-1 leading-normal">
                  Allow other community members to view your name, rank, cash balances, and asset tickers on the leaderboard.
                </span>
              </div>
            </div>
            
            {/* Custom styled toggle switch */}
            <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
              <input
                type="checkbox"
                name="isPublic"
                value="true"
                checked={isPublic === true}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-neutral-800 rounded-full peer peer-focus:ring-1 peer-focus:ring-neutral-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-neutral-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-neutral-200 peer-checked:after:bg-neutral-950"></div>
            </label>
          </div>

          {privacyState?.error && (
            <p className="text-xs text-red-400 font-medium bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2">
              {privacyState.error}
            </p>
          )}
          {privacyState?.success && (
            <p className="text-xs text-emerald-400 font-medium bg-emerald-500/5 border border-emerald-500/10 rounded-lg px-3 py-2">
              Privacy settings saved successfully.
            </p>
          )}

          <Button type="submit" isLoading={isPrivacyPending} className="self-start">
            Save Settings
          </Button>
        </form>
      </Card>
    </div>
  );
}
