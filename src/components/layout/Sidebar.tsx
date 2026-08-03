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
  Sparkles,
} from 'lucide-react';
import { TradeViewLogo } from '@/components/ui/TradeViewLogo';

interface SidebarProps {
  isAdmin?: boolean;
}

interface NavGroup {
  title: string;
  items: {
    href: string;
    label: string;
    icon: React.ElementType;
    active: boolean;
    badge?: string;
  }[];
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

  const navGroups: NavGroup[] = [
    {
      title: 'PORTFOLIO',
      items: [
        {
          href: '/dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          active: pathname === '/dashboard',
        },
        {
          href: '/dashboard/add',
          label: 'Add Trade',
          icon: PlusCircle,
          active: pathname === '/dashboard/add',
        },
        {
          href: '/dashboard/stocks',
          label: 'Stock Market',
          icon: Layers,
          active: pathname === '/dashboard/stocks' || pathname.startsWith('/dashboard/stocks/'),
        },
        {
          href: '/dashboard/watchlist',
          label: 'Watchlist',
          icon: Bookmark,
          active: pathname === '/dashboard/watchlist',
        },
      ],
    },
    {
      title: 'ANALYTICS & JOURNAL',
      items: [
        {
          href: '/dashboard/journal',
          label: 'P&L Journal',
          icon: BookOpen,
          active: pathname === '/dashboard/journal',
        },
        {
          href: '/dashboard/portfolios',
          label: 'Portfolios',
          icon: Briefcase,
          active: pathname === '/dashboard/portfolios',
        },
        {
          href: '/dashboard/weekly-report',
          label: 'Weekly Report',
          icon: FileText,
          active: pathname === '/dashboard/weekly-report',
        },
        {
          href: '/dashboard/report-history',
          label: 'Report History',
          icon: History,
          active: pathname === '/dashboard/report-history',
        },
      ],
    },
  ];

  const systemItems = [];
  if (isAdmin) {
    systemItems.push({
      href: '/dashboard/users',
      label: 'User Admin',
      icon: Users,
      active: pathname === '/dashboard/users',
      badge: 'Admin',
    });
  }
  systemItems.push({
    href: '/dashboard/settings',
    label: 'Settings',
    icon: Settings,
    active: pathname === '/dashboard/settings',
  });

  navGroups.push({
    title: 'ACCOUNT',
    items: systemItems,
  });

  return (
    <aside
      className={`relative z-50 flex flex-col h-full bg-[#0a0a0a] border-r border-[#222222] transition-all duration-200 ease-out select-none ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Top Sidebar Header */}
      <div className="h-16 px-4 border-b border-[#222222] flex items-center justify-between shrink-0">
        <Link href="/" className="flex items-center gap-2 overflow-hidden">
          <TradeViewLogo showText={!isCollapsed} size={30} borderless={true} />
        </Link>

        <button
          type="button"
          onClick={toggleCollapse}
          className="p-1.5 rounded-lg bg-[#141414] hover:bg-[#1a1a1a] border border-[#222222] text-neutral-400 hover:text-white transition cursor-pointer"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-5">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {/* Section Header */}
            {!isCollapsed ? (
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 px-3 py-1 font-mono">
                {group.title}
              </p>
            ) : groupIdx > 0 ? (
              <div className="my-2 border-t border-[#1f1f1f] mx-2" />
            ) : null}

            {/* Nav Items */}
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative group flex items-center gap-3 transition-colors ${
                    isCollapsed
                      ? 'justify-center w-10 h-10 mx-auto rounded-xl'
                      : 'px-3.5 py-2.5 rounded-xl text-xs font-semibold'
                  } ${
                    item.active
                      ? 'bg-[#1a1a1a] text-white border border-[#2a2a2a] shadow-xs'
                      : 'text-neutral-400 hover:text-white hover:bg-[#141414]'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      item.active ? 'text-emerald-400' : 'text-neutral-500 group-hover:text-neutral-300'
                    }`}
                  />

                  {!isCollapsed && (
                    <div className="flex items-center justify-between flex-1 min-w-0">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-neutral-800 text-neutral-300 border border-neutral-700">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Tooltip in Collapsed Mode */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#141414] border border-[#222222] text-white text-xs font-semibold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Wealthsimple Footer */}
      {!isCollapsed && (
        <div className="p-3 border-t border-[#222222] bg-[#0a0a0a] text-[10px] text-neutral-500 font-mono flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Market Active</span>
          </div>
          <span>v2.0</span>
        </div>
      )}
    </aside>
  );
};
