'use client';

import React, { useState } from 'react';
import { User, LogOut } from 'lucide-react';
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
    <header className="h-16 bg-[#0a0a0a] border-b border-[#222222] flex items-center justify-between px-6 shrink-0 z-40 relative select-none">
      {/* Greeting */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <span>Welcome back, {session?.name || 'Trader'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </h1>
          <p className="text-[11px] text-neutral-500 font-medium">
            Wealthsimple Pro Terminal Overview
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3.5">
        {/* Wealthsimple Segmented Currency Switcher */}
        <div className="flex items-center bg-[#141414] p-1 rounded-xl border border-[#222222]">
          <button
            type="button"
            onClick={() => setCurrency('CAD')}
            className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition cursor-pointer flex items-center gap-1.5 ${
              currency === 'CAD'
                ? 'bg-[#222222] text-white shadow-xs'
                : 'text-neutral-500 hover:text-white'
            }`}
          >
            <span>🇨🇦 CAD</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrency('USD')}
            className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition cursor-pointer flex items-center gap-1.5 ${
              currency === 'USD'
                ? 'bg-[#222222] text-white shadow-xs'
                : 'text-neutral-500 hover:text-white'
            }`}
          >
            <span>🇺🇸 USD</span>
          </button>
        </div>

        {/* Dual Account Balances Badges */}
        <div className="hidden sm:flex items-center gap-2">
          {/* CAD Cash Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#141414] border border-[#222222] rounded-xl shadow-xs">
            <span className="text-xs">🇨🇦</span>
            <div className="flex flex-col text-left">
              <span className="text-[8px] uppercase tracking-wider text-neutral-500 font-bold leading-none">CAD Cash</span>
              <span className="text-xs font-bold text-emerald-400 mt-0.5 leading-none font-mono">{formattedCad}</span>
            </div>
          </div>

          {/* USD Cash Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#141414] border border-[#222222] rounded-xl shadow-xs">
            <span className="text-xs">🇺🇸</span>
            <div className="flex flex-col text-left">
              <span className="text-[8px] uppercase tracking-wider text-neutral-500 font-bold leading-none">USD Cash</span>
              <span className="text-xs font-bold text-blue-400 mt-0.5 leading-none font-mono">{formattedUsd}</span>
            </div>
          </div>
        </div>

        {session && (
          <div className="relative">
            {/* User Avatar Button */}
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="h-9 w-9 rounded-xl bg-[#141414] hover:bg-[#1a1a1a] border border-[#222222] hover:border-[#333333] flex items-center justify-center text-white transition cursor-pointer select-none"
              title={session.name}
            >
              <User className="h-4 w-4 text-neutral-300" />
            </button>

            {/* Floating Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-60 bg-[#141414] border border-[#222222] rounded-xl p-3 z-50 shadow-2xl flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-150">
                {/* User Info */}
                <div className="flex items-center gap-3 p-2.5 bg-[#0a0a0a] rounded-lg border border-[#222222]">
                  <div className="h-8 w-8 rounded-lg bg-[#1c1c1c] border border-[#2a2a2a] flex items-center justify-center text-white shrink-0">
                    <User className="h-4 w-4 text-neutral-300" />
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate">{session.name}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase tracking-wider ${
                        session.role === 'admin'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-[#222222] text-neutral-300'
                      }`}>
                        {session.role}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-500 truncate">{session.email}</span>
                  </div>
                </div>

                {/* Logout Action */}
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
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
