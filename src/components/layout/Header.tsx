'use client';

import React from 'react';
import { Calendar, User, LogOut } from 'lucide-react';
import { logoutAction } from '@/lib/actions/auth';
import { SessionPayload } from '@/types/auth';
import { useCurrencyStore } from '@/lib/store';

interface HeaderProps {
  session: SessionPayload | null;
}

export const Header: React.FC<HeaderProps> = ({ session }) => {
  const { currency, setCurrency } = useCurrencyStore();

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

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

      <div className="flex items-center gap-4">
        {/* Currency Toggle Switch (Zustand-managed) */}
        <div className="inline-flex rounded-lg p-0.5 bg-neutral-900 border border-neutral-800 text-[10px] select-none">
          <button
            type="button"
            onClick={() => setCurrency('CAD')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
              currency === 'CAD'
                ? 'bg-neutral-850 text-white'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            CAD
          </button>
          <button
            type="button"
            onClick={() => setCurrency('USD')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
              currency === 'USD'
                ? 'bg-neutral-850 text-white'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            USD
          </button>
        </div>

        {/* Date */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-500">
          <Calendar className="h-3.5 w-3.5" />
          <span>{currentDate}</span>
        </div>

        {session && (
          <>
            <div className="h-5 w-px bg-neutral-800" />

            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 border border-neutral-700">
                <User className="h-3.5 w-3.5" />
              </div>
              <div className="hidden md:flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-neutral-200">{session.name}</span>
                  <span className={`px-1.5 py-px rounded text-[9px] font-semibold uppercase tracking-wide ${
                    session.role === 'admin'
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-neutral-700 text-neutral-400'
                  }`}>
                    {session.role}
                  </span>
                </div>
                <span className="text-[10px] text-neutral-600 mt-0.5">{session.email}</span>
              </div>

              <form action={logoutAction} className="ml-1">
                <button
                  type="submit"
                  className="h-8 w-8 rounded-lg hover:bg-neutral-800 text-neutral-500 hover:text-neutral-300 flex items-center justify-center transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
