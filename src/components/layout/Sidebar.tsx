'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TrendingUp, LayoutDashboard, PlusCircle, Settings, Users } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const isDashboardActive = pathname === '/dashboard';
  const isAddActive = pathname === '/dashboard/add';
  const isPortfoliosActive = pathname === '/dashboard/portfolios';
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
