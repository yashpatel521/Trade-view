'use client';

import React, { useState } from 'react';
import { User, LogOut } from 'lucide-react';
import { logoutAction } from '@/lib/actions/auth';
import { SessionPayload } from '@/types/auth';

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

  const formattedCad = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(cashBalanceCad);

  const formattedUsd = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cashBalanceUsd);

  return (
    <header className="h-16 border-b border-[#1a1a1a] bg-[#0a0a0a] flex items-center justify-between px-8 shrink-0">
      <div>
        <h1 className="text-sm font-semibold text-white">
          Welcome back, {session?.name || 'Trader'}
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Your portfolio overview
        </p>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Dual Cash Accounts Display Badges */}
        <div className="flex items-center gap-2">
          {/* CAD Account Badge */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xs">
            <span className="text-xs">🇨🇦</span>
            <div className="flex flex-col">
              <span className="text-[8px] uppercase tracking-wider text-neutral-500 font-semibold leading-none">CAD Cash</span>
              <span className="text-xs font-bold text-emerald-400 mt-0.5 leading-none">{formattedCad}</span>
            </div>
          </div>

          {/* USD Account Badge */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xs">
            <span className="text-xs">🇺🇸</span>
            <div className="flex flex-col">
              <span className="text-[8px] uppercase tracking-wider text-neutral-500 font-semibold leading-none">USD Cash</span>
              <span className="text-xs font-bold text-blue-400 mt-0.5 leading-none">{formattedUsd}</span>
            </div>
          </div>
        </div>



        {session && (
          <div className="relative">
            {/* User Icon Trigger */}
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="h-9 w-9 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white transition-colors cursor-pointer select-none shadow-xs"
              title={session.name}
            >
              <User className="h-4 w-4 text-neutral-300" />
            </button>

            {/* Floating Dropdown Menu Panel */}
            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-60 bg-[#141414] border border-neutral-800 rounded-2xl p-3 z-50 shadow-2xl flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150">
                {/* User Info Card */}
                <div className="flex items-center gap-3 p-2.5 bg-neutral-900/80 rounded-xl border border-neutral-800">
                  <div className="h-9 w-9 rounded-full bg-neutral-800 flex items-center justify-center text-white border border-neutral-700 shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate">{session.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        session.role === 'admin'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                      }`}>
                        {session.role}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 truncate">{session.email}</span>
                  </div>
                </div>

                <div className="border-t border-neutral-800/80" />

                {/* Logout Form Button */}
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 text-red-400" />
                    <span>Log out</span>
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

export default Header;
