'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  PlusCircle,
  Settings,
  Users,
  FileText,
  History,
  Bookmark,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  TrendingUp,
} from 'lucide-react';
import { TradeViewLogo } from '@/components/ui/TradeViewLogo';

interface SidebarProps {
  isAdmin?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isAdmin = false }) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem('sidebar_collapsed', String(next));
  };

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

  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      active: isDashboardActive,
      iconColor: isDashboardActive ? 'text-emerald-400' : 'text-neutral-400',
    },
    {
      href: '/dashboard/add',
      label: 'Add Trade',
      icon: PlusCircle,
      active: isAddActive,
      iconColor: isAddActive ? 'text-emerald-400' : 'text-neutral-400',
    },
    {
      href: '/dashboard/stocks',
      label: 'Stock Market',
      icon: Layers,
      active: isStocksActive,
      iconColor: isStocksActive ? 'text-emerald-400' : 'text-neutral-400',
    },
    {
      href: '/dashboard/watchlist',
      label: 'Watchlist',
      icon: Bookmark,
      active: isWatchlistActive,
      iconColor: isWatchlistActive ? 'text-emerald-400' : 'text-neutral-400',
    },
    {
      href: '/dashboard/journal',
      label: 'P&L Journal',
      icon: BookOpen,
      active: isJournalActive,
      iconColor: isJournalActive ? 'text-emerald-400' : 'text-neutral-400',
    },
    {
      href: '/dashboard/portfolios',
      label: 'Portfolios',
      icon: Briefcase,
      active: isPortfoliosActive,
      iconColor: isPortfoliosActive ? 'text-emerald-400' : 'text-neutral-400',
    },
    {
      href: '/dashboard/weekly-report',
      label: 'Weekly Report',
      icon: FileText,
      active: isWeeklyReportActive,
      iconColor: isWeeklyReportActive ? 'text-emerald-400' : 'text-neutral-400',
    },
    {
      href: '/dashboard/report-history',
      label: 'Report History',
      icon: History,
      active: isHistoryActive,
      iconColor: isHistoryActive ? 'text-emerald-400' : 'text-neutral-400',
    },
  ];

  if (isAdmin) {
    navItems.push({
      href: '/dashboard/users',
      label: 'User Admin',
      icon: Users,
      active: isUsersActive,
      iconColor: isUsersActive ? 'text-emerald-400' : 'text-neutral-400',
    });
  }

  navItems.push({
    href: '/dashboard/settings',
    label: 'Settings',
    icon: Settings,
    active: isSettingsActive,
    iconColor: isSettingsActive ? 'text-emerald-400' : 'text-neutral-400',
  });

  return (
    <aside
      className={`relative z-50 flex flex-col border-r border-white/10 bg-[#060606]/95 backdrop-blur-2xl transition-all duration-300 ease-out select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Sidebar Header */}
      <div className="h-16 sm:h-20 flex items-center justify-between px-4 border-b border-white/10 shrink-0">
        <Link href="/" className="flex items-center gap-2 overflow-hidden">
          <TradeViewLogo showText={!isCollapsed} size={34} borderless={true} />
        </Link>

        {/* Toggle Collapse Button */}
        <button
          type="button"
          onClick={toggleCollapse}
          className="p-1.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Links List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                item.active
                  ? 'bg-emerald-500/15 text-white border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`h-4 w-4 shrink-0 stroke-[2.2] ${item.iconColor}`} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Footer Info */}
      {!isCollapsed && (
        <div className="p-4 border-t border-white/5 text-[10px] text-neutral-500 font-mono text-center shrink-0">
          <span>Trade View Pro v2.0</span>
        </div>
      )}
    </aside>
  );
};
