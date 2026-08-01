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
      iconColor: isDashboardActive ? 'text-emerald-400' : 'text-neutral-500',
    },
    {
      href: '/dashboard/stocks',
      label: 'Stocks',
      icon: Layers,
      active: isStocksActive,
      iconColor: isStocksActive ? 'text-emerald-400' : 'text-neutral-500',
    },
    {
      href: '/dashboard/watchlist',
      label: 'Watchlist',
      icon: Bookmark,
      active: isWatchlistActive,
      iconColor: isWatchlistActive ? 'text-emerald-400' : 'text-neutral-500',
    },
    {
      href: '/dashboard/journal',
      label: 'Journal',
      icon: BookOpen,
      active: isJournalActive,
      iconColor: isJournalActive ? 'text-emerald-400' : 'text-neutral-500',
    },
  ];

  const adminItems = [
    {
      href: '/dashboard/users',
      label: 'Users',
      icon: Users,
      active: isUsersActive,
      iconColor: isUsersActive ? 'text-emerald-400' : 'text-neutral-500',
    },
    {
      href: '/dashboard/weekly-report',
      label: 'Weekly Report',
      icon: FileText,
      active: isWeeklyReportActive,
      iconColor: isWeeklyReportActive ? 'text-emerald-400' : 'text-neutral-500',
      badge: 'AI',
    },
    {
      href: '/dashboard/report-history',
      label: 'Report History',
      icon: History,
      active: isHistoryActive,
      iconColor: isHistoryActive ? 'text-emerald-400' : 'text-neutral-500',
    },
  ];

  const bottomItems = [
    {
      href: '/dashboard/portfolios',
      label: 'Portfolios',
      icon: Briefcase,
      active: isPortfoliosActive,
      iconColor: isPortfoliosActive ? 'text-emerald-400' : 'text-neutral-500',
    },
    {
      href: '/dashboard/add',
      label: 'Add Record',
      icon: PlusCircle,
      active: isAddActive,
      iconColor: isAddActive ? 'text-emerald-400' : 'text-neutral-500',
    },
    {
      href: '/dashboard/settings',
      label: 'Settings',
      icon: Settings,
      active: isSettingsActive,
      iconColor: isSettingsActive ? 'text-emerald-400' : 'text-neutral-500',
    },
  ];

  return (
    <aside
      className={`${
        isCollapsed ? 'w-16' : 'w-60'
      } border-r border-[#1a1a1a] bg-[#0a0a0a] flex flex-col h-full sticky top-0 transition-all duration-300 select-none shrink-0`}
    >
      {/* Brand Header & Toggle */}
      <div
        className={`flex items-center transition-all duration-300 ${
          isCollapsed ? 'justify-center p-2 h-16' : 'justify-between px-4 py-4 h-20'
        }`}
      >
        <TradeViewLogo showText={!isCollapsed} size={isCollapsed ? 36 : 42} borderless={true} />

        <button
          type="button"
          onClick={toggleCollapse}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-5 px-2 flex flex-col gap-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-xl text-sm font-medium transition-all ${
                isCollapsed ? 'justify-center p-2.5' : 'px-3.5 py-2.5'
              } ${
                item.active
                  ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 font-bold shadow-xs'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50 border border-transparent'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${item.iconColor}`} />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        {/* Admin Section */}
        {isAdmin && (
          <>
            {!isCollapsed && (
              <div className="mt-3 mb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                Admin
              </div>
            )}
            {adminItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center gap-3 rounded-xl text-sm font-medium transition-all ${
                    isCollapsed ? 'justify-center p-2.5' : 'px-3.5 py-2.5 justify-between'
                  } ${
                    item.active
                      ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 font-bold shadow-xs'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`h-4 w-4 shrink-0 ${item.iconColor}`} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!isCollapsed && item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </>
        )}

        {/* Bottom Menu Items */}
        <div className="mt-auto pt-4 flex flex-col gap-1 border-t border-neutral-900">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 rounded-xl text-sm font-medium transition-all ${
                  isCollapsed ? 'justify-center p-2.5' : 'px-3.5 py-2.5'
                } ${
                  item.active
                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 font-bold shadow-xs'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50 border border-transparent'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${item.iconColor}`} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
