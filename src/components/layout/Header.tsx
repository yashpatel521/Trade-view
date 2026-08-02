'use client';

import React, { useState } from 'react';
import { User, LogOut, DollarSign, Globe, Shield } from 'lucide-react';
import { logoutAction } from '@/lib/actions/auth';
import { SessionPayload } from '@/types/auth';
import { useCurrencyStore } from '@/lib/store';

interface HeaderProps {
  session: SessionPayload | null;
  cashBalance?: number;
  cashBalanceCad?: number;
  cashBalanceUsd?: number;
  fxRate?: number;
}

export const Header: React.FC<HeaderProps> = ({
  session,
  cashBalanceCad = 0,
  cashBalanceUsd = 0,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { currency, setCurrency } = useCurrencyStore();

  const formattedCad = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(cashBalanceCad);

  const formattedUsd = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cashBalanceUsd);

  return (
    <header className="h-16 sm:h-20 border-b border-white/10 bg-[#060606]/90 backdrop-blur-2xl flex items-center justify-between px-6 lg:px-8 shrink-0 z-40 relative">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Welcome back, {session?.name || 'Trader'}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </h1>
          <p className="text-[11px] text-neutral-400 mt-0.5 font-medium">
            Pro Portfolio Terminal Overview
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Currency Switcher Pill Bar */}
        <div className="flex items-center gap-1 bg-neutral-900/90 p-1 rounded-xl border border-neutral-800">
          <button
            type="button"
            onClick={() => setCurrency('CAD')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition cursor-pointer flex items-center gap-1 ${
              currency === 'CAD'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>🇨🇦 CAD</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrency('USD')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition cursor-pointer flex items-center gap-1 ${
              currency === 'USD'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>🇺🇸 USD</span>
          </button>
        </div>

        {/* Dual Cash Accounts Display Badges */}
        <div className="hidden sm:flex items-center gap-2">
          {/* CAD Account Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0e0e0e] border border-neutral-800 rounded-xl shadow-xs">
            <span className="text-xs">🇨🇦</span>
            <div className="flex flex-col text-left">
              <span className="text-[8px] uppercase tracking-wider text-neutral-400 font-bold leading-none">CAD Cash</span>
              <span className="text-xs font-bold text-emerald-400 mt-0.5 leading-none font-mono">{formattedCad}</span>
            </div>
          </div>

          {/* USD Account Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0e0e0e] border border-neutral-800 rounded-xl shadow-xs">
            <span className="text-xs">🇺🇸</span>
            <div className="flex flex-col text-left">
              <span className="text-[8px] uppercase tracking-wider text-neutral-400 font-bold leading-none">USD Cash</span>
              <span className="text-xs font-bold text-blue-400 mt-0.5 leading-none font-mono">{formattedUsd}</span>
            </div>
          </div>
        </div>

        {session && (
          <div className="relative">
            {/* User Icon Trigger */}
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 transition-all cursor-pointer select-none shadow-md"
              title={session.name}
            >
              <User className="h-4 w-4 stroke-[2.5]" />
            </button>

            {/* Floating Dropdown Menu Panel */}
            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-[#0c0c0c]/95 border border-neutral-800 rounded-2xl p-3.5 z-50 shadow-2xl backdrop-blur-2xl flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150">
                {/* User Info Card */}
                <div className="flex items-center gap-3 p-3 bg-neutral-900/90 rounded-xl border border-neutral-800">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold shrink-0">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold text-white truncate">{session.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        session.role === 'admin'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                      }`}>
                        {session.role}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 truncate">{session.email}</span>
                  </div>
                </div>

                {/* Logout Form Action */}
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition duration-150 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
