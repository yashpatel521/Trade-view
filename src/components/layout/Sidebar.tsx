'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TrendingUp, LayoutDashboard, Layers, PlusCircle, Settings, Users, FileText, History, Bookmark, BookOpen } from 'lucide-react';

interface SidebarProps {
  isAdmin?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isAdmin = false }) => {
  const pathname = usePathname();

  const isDashboardActive = pathname === '/dashboard';
  const isStocksActive = pathname === '/dashboard/stocks';
  const isWatchlistActive = pathname === '/dashboard/watchlist';
  const isPortfoliosActive = pathname === '/dashboard/portfolios';
  const isWeeklyReportActive = pathname === '/dashboard/weekly-report';
  const isHistoryActive = pathname === '/dashboard/report-history';
  const isUsersActive = pathname === '/dashboard/users';
  const isJournalActive = pathname === '/dashboard/journal';
  const isAddActive = pathname === '/dashboard/add';
  const isSettingsActive = pathname === '/dashboard/settings';

  return (
    <aside className="w-60 border-r border-[#1a1a1a] bg-[#0a0a0a] flex flex-col h-full sticky top-0">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-[#1a1a1a] gap-2.5">
        <TrendingUp className="h-5 w-5 text-white" />
        <span className="font-bold text-base text-white tracking-tight">
          Trade View
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-5 px-3 flex flex-col gap-1">
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isDashboardActive 
              ? 'text-white bg-neutral-800' 
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
          }`}
        >
          <LayoutDashboard className={`h-4 w-4 ${isDashboardActive ? 'text-white' : 'text-neutral-500'}`} />
          Dashboard
        </Link>

        <Link
          href="/dashboard/stocks"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isStocksActive 
              ? 'text-white bg-neutral-800' 
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
          }`}
        >
          <Layers className={`h-4 w-4 ${isStocksActive ? 'text-white' : 'text-neutral-500'}`} />
          Stocks
        </Link>

        <Link
          href="/dashboard/watchlist"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isWatchlistActive 
              ? 'text-white bg-neutral-800' 
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
          }`}
        >
          <Bookmark className={`h-4 w-4 ${isWatchlistActive ? 'text-white' : 'text-neutral-500'}`} />
          Watchlist
        </Link>

        <Link
          href="/dashboard/journal"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isJournalActive 
              ? 'text-white bg-neutral-800' 
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
          }`}
        >
          <BookOpen className={`h-4 w-4 ${isJournalActive ? 'text-blue-400' : 'text-neutral-500'}`} />
          Journal
        </Link>

        {/* Admin Only: Weekly Report, History & Users */}
        {isAdmin && (
          <>
            <Link
              href="/dashboard/users"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isUsersActive 
                  ? 'text-white bg-neutral-800' 
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
              }`}
            >
              <Users className={`h-4 w-4 ${isUsersActive ? 'text-amber-400' : 'text-neutral-500'}`} />
              <span>Users</span>
            </Link>

            <Link
              href="/dashboard/weekly-report"
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isWeeklyReportActive 
                  ? 'text-white bg-neutral-800' 
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className={`h-4 w-4 ${isWeeklyReportActive ? 'text-white' : 'text-neutral-500'}`} />
                <span>Weekly Report</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                AI
              </span>
            </Link>

            <Link
              href="/dashboard/report-history"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isHistoryActive 
                  ? 'text-white bg-neutral-800' 
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
              }`}
            >
              <History className={`h-4 w-4 ${isHistoryActive ? 'text-white' : 'text-neutral-500'}`} />
              Report History
            </Link>
          </>
        )}

        <Link
          href="/dashboard/portfolios"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isPortfoliosActive 
              ? 'text-white bg-neutral-800' 
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
          }`}
        >
          <Users className={`h-4 w-4 ${isPortfoliosActive ? 'text-white' : 'text-neutral-500'}`} />
          Portfolios
        </Link>

        <Link
          href="/dashboard/add"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isAddActive 
              ? 'text-white bg-neutral-800' 
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
          }`}
        >
          <PlusCircle className={`h-4 w-4 ${isAddActive ? 'text-white' : 'text-neutral-500'}`} />
          Add Record
        </Link>

        <Link
          href="/dashboard/settings"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isSettingsActive 
              ? 'text-white bg-neutral-800' 
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
          }`}
        >
          <Settings className={`h-4 w-4 ${isSettingsActive ? 'text-white' : 'text-neutral-500'}`} />
          Settings
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
