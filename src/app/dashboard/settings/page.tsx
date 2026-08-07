'use client';

import React, { useActionState, useEffect, useState } from 'react';
import {
  updateFundsAction,
  updatePrivacyAction,
  getDashboardDataAction,
  getCurrentUserRoleAction,
  resetUserDataAction,
} from '@/lib/actions/trading';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Plus,
  Settings,
  Eye,
  EyeOff,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  ShieldAlert,
  Trash2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

export default function SettingsPage() {
  const [state, formAction, isPending] = useActionState(updateFundsAction, {} as any);
  const [privacyState, privacyFormAction, isPrivacyPending] = useActionState(updatePrivacyAction, {} as any);
  
  const [cashBalanceCad, setCashBalanceCad] = useState<number | null>(null);
  const [cashBalanceUsd, setCashBalanceUsd] = useState<number | null>(null);
  const [depositCurrency, setDepositCurrency] = useState<'CAD' | 'USD'>('CAD');
  const [isPublic, setIsPublic] = useState<boolean | null>(null);

  // Admin Reset State
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [resetConfirming, setResetConfirming] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [resetStatus, setResetStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

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
    getCurrentUserRoleAction().then((res) => {
      setIsAdmin(res.isAdmin);
    });
  }, [state, privacyState]);

  const handleExecuteAdminReset = async () => {
    setIsResetting(true);
    setResetStatus(null);

    try {
      const res = await resetUserDataAction();
      if (res.success) {
        setResetStatus({
          type: 'success',
          message: 'Portfolio successfully reset! All trades, holdings, and journal logs cleared. Cash balance set to $0.00 CAD.',
        });
        setResetConfirming(false);
        loadSettings();
      } else {
        setResetStatus({
          type: 'error',
          message: res.error || 'Failed to reset portfolio data.',
        });
      }
    } catch (err: any) {
      setResetStatus({
        type: 'error',
        message: err?.message || 'An unexpected error occurred during reset.',
      });
    } finally {
      setIsResetting(false);
    }
  };

  const fmtCad = (val: number) =>
    new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(val);
  const fmtUsd = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full max-w-none font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* ── Dual Cash Account Balances Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* CAD Cash Card */}
        <div className="bg-[#0c0c0c]/90 border border-emerald-500/30 rounded-3xl p-6 flex items-center justify-between shadow-xl backdrop-blur-2xl transition-all hover:border-emerald-500/50 group">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-sm">🇨🇦</span>
              <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">CAD Cash Account</span>
            </div>
            <p className="text-3xl font-black text-emerald-400 font-mono">
              {cashBalanceCad !== null ? fmtCad(cashBalanceCad) : 'Loading...'}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1 font-medium">Base Canadian Dollar Balance</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Wallet className="h-6 w-6" />
          </div>
        </div>

        {/* USD Cash Card */}
        <div className="bg-[#0c0c0c]/90 border border-blue-500/30 rounded-3xl p-6 flex items-center justify-between shadow-xl backdrop-blur-2xl transition-all hover:border-blue-500/50 group">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-sm">🇺🇸</span>
              <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">USD Cash Account</span>
            </div>
            <p className="text-3xl font-black text-blue-400 font-mono">
              {cashBalanceUsd !== null ? fmtUsd(cashBalanceUsd) : 'Loading...'}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1 font-medium">US Stock Trading Cash Balance</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <Wallet className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* ── Main Forms Grid Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
        
        {/* Deposit & Funds Management Form */}
        <Card className="p-0 overflow-hidden border border-neutral-800 rounded-3xl bg-[#0c0c0c]/90 backdrop-blur-2xl shadow-2xl">
          <div className="px-6 py-4.5 border-b border-neutral-800 bg-[#080808]/90 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Wallet className="h-4 w-4 text-emerald-400" />
              <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">Deposit &amp; Account Funds</h3>
            </div>
          </div>

          <form action={formAction} className="p-6 flex flex-col gap-4.5">
            {/* Target Account Pill Switcher */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Target Currency Account</label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-950 border border-neutral-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setDepositCurrency('CAD')}
                  className={`py-2.5 rounded-lg text-xs font-black font-mono transition cursor-pointer ${
                    depositCurrency === 'CAD'
                      ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : 'text-neutral-500 hover:text-white'
                  }`}
                >
                  🇨🇦 CAD Account
                </button>
                <button
                  type="button"
                  onClick={() => setDepositCurrency('USD')}
                  className={`py-2.5 rounded-lg text-xs font-black font-mono transition cursor-pointer ${
                    depositCurrency === 'USD'
                      ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                      : 'text-neutral-500 hover:text-white'
                  }`}
                >
                  🇺🇸 USD Account
                </button>
              </div>
              <input type="hidden" name="currency" value={depositCurrency} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Update Action</label>
                <select
                  name="actionType"
                  defaultValue="ADD"
                  className="px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 transition cursor-pointer"
                >
                  <option value="ADD">Add Funds (+)</option>
                  <option value="SET">Set Absolute Balance (=)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Amount ({depositCurrency})</label>
                <input
                  type="number"
                  name="amount"
                  placeholder="0.00"
                  required
                  min="0"
                  step="0.01"
                  className="px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>
            </div>

            {state?.error && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-400 font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}
            {state?.success && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{depositCurrency} account balance updated successfully.</span>
              </div>
            )}

            <Button
              type="submit"
              isLoading={isPending}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs sm:text-sm rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all cursor-pointer mt-1"
            >
              Update {depositCurrency} Cash Account
            </Button>
          </form>
        </Card>

        {/* Privacy & Public Visibility Settings Card */}
        <Card className="p-0 overflow-hidden border border-neutral-800 rounded-3xl bg-[#0c0c0c]/90 backdrop-blur-2xl shadow-2xl">
          <div className="px-6 py-4.5 border-b border-neutral-800 bg-[#080808]/90 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-purple-400" />
              <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">Privacy &amp; Community Visibility</h3>
            </div>
          </div>

          <form action={privacyFormAction} className="p-6 flex flex-col gap-4.5">
            <div className="flex items-center justify-between p-4 bg-neutral-950 border border-neutral-800 rounded-2xl">
              <div className="flex items-center gap-3.5 min-w-0 pr-4">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                  {isPublic ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-extrabold text-white">Public Leaderboard Visibility</span>
                  <span className="text-[11px] text-neutral-400 mt-0.5 leading-normal font-medium">
                    Allow other community traders to view your profile, rank, cash balances, and stock tickers.
                  </span>
                </div>
              </div>

              {/* Custom Styled Switch */}
              <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                <input
                  type="checkbox"
                  name="isPublic"
                  value="true"
                  checked={isPublic === true}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                    isPublic ? 'bg-emerald-500' : 'bg-neutral-800'
                  }`}
                >
                  <div
                    className={`h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                      isPublic ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </label>
            </div>

            {privacyState?.error && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-400 font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{privacyState.error}</span>
              </div>
            )}
            {privacyState?.success && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Privacy settings saved successfully.</span>
              </div>
            )}

            <Button
              type="submit"
              isLoading={isPrivacyPending}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-[0_0_25px_rgba(168,85,247,0.35)] transition-all cursor-pointer mt-1"
            >
              Save Privacy Settings
            </Button>
          </form>
        </Card>
      </div>

      {/* ── Admin Only Reset Account & Portfolio Section ── */}
      {isAdmin && (
        <Card className="p-0 overflow-hidden border border-red-500/30 rounded-3xl bg-[#0c0c0c]/90 backdrop-blur-2xl shadow-2xl mt-2">
          <div className="px-6 py-4.5 border-b border-red-500/20 bg-red-500/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>Admin Danger Zone — Emergency Account Reset</span>
                </h3>
                <p className="text-[10px] text-neutral-400 font-medium">Visible to Administrator Accounts Only</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/30 uppercase tracking-wide">
              Admin Restricted
            </span>
          </div>

          <div className="p-6 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
              <div className="flex flex-col gap-1 max-w-2xl">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-red-400" />
                  Reset Balance &amp; Wipe Trades, Holdings, and Journal Logs
                </span>
                <p className="text-[11px] text-neutral-400 leading-relaxed font-medium">
                  This action will permanently delete all trade records, stock holdings, and P&amp;L daily journal logs from the database <strong className="text-white">for your account only</strong>, and reset cash balance back to <strong className="text-emerald-400">$0.00 CAD</strong>.
                </p>
              </div>

              {!resetConfirming ? (
                <button
                  type="button"
                  onClick={() => setResetConfirming(true)}
                  className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-xs transition cursor-pointer shrink-0"
                >
                  Reset Account Data
                </button>
              ) : (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setResetConfirming(false)}
                    disabled={isResetting}
                    className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white font-bold text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteAdminReset}
                    disabled={isResetting}
                    className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-black text-xs transition cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.4)] flex items-center gap-2"
                  >
                    {isResetting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Wiping Data...</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>Confirm Permanent Reset</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {resetStatus && (
              <div
                className={`p-3.5 rounded-2xl border text-xs font-medium flex items-center gap-2.5 ${
                  resetStatus.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}
              >
                {resetStatus.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                )}
                <span>{resetStatus.message}</span>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
