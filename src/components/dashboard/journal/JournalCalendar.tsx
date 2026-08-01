'use client';

import React, { useState } from 'react';
import { DailyLog } from '@/types/trading';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface JournalCalendarProps {
  dailyLogs: DailyLog[];
  fmt: (val: number) => string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function JournalCalendar({ dailyLogs, fmt }: JournalCalendarProps) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Build a lookup map: "YYYY-MM-DD" -> DailyLog
  const logMap = new Map<string, DailyLog>();
  for (const log of dailyLogs) {
    logMap.set(log.date, log);
  }

  // Calendar grid
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const cells: (number | null)[] = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - firstDay + 1;
    cells.push(dayNum >= 1 && dayNum <= daysInMonth ? dayNum : null);
  }

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  // Month stats
  const monthLogs = dailyLogs.filter((l) => l.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`));
  const monthNet = monthLogs.reduce((s, l) => s + l.profitLoss, 0);
  const monthProfit = monthLogs.filter((l) => l.profitLoss > 0).length;
  const monthLoss = monthLogs.filter((l) => l.profitLoss < 0).length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#1a1a1a] bg-[#141414] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <BookOpen className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">P&L Calendar</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="h-6 w-6 rounded flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="text-xs font-semibold text-white min-w-28 text-center">
            {MONTHS[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            disabled={isCurrentMonth}
            className="h-6 w-6 rounded flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-800 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Month summary strip */}
      <div className="flex items-center gap-4 px-5 py-2.5 border-b border-[#111] bg-[#0d0d0d]">
        <span className={`text-xs font-black ${monthNet >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {monthNet >= 0 ? '+' : ''}{fmt(monthNet)}
        </span>
        <span className="text-[10px] text-neutral-600">·</span>
        <span className="text-[10px] text-emerald-500 font-semibold">{monthProfit}↑</span>
        <span className="text-[10px] text-red-500 font-semibold">{monthLoss}↓</span>
        <Link
          href="/dashboard/journal"
          className="ml-auto text-[10px] text-neutral-500 hover:text-white transition font-semibold"
        >
          Open Journal →
        </Link>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 px-3 pt-3">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[9px] font-bold text-neutral-600 uppercase pb-2">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 px-3 pb-3 flex-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const log = logMap.get(dateStr);
          const isToday = dateStr === today.toISOString().split('T')[0];
          const isProfit = log && log.profitLoss > 0;
          const isLoss = log && log.profitLoss < 0;

          // Format compact value: e.g. +1.2k or -340
          const compactVal = (v: number) => {
            const abs = Math.abs(v);
            const sign = v >= 0 ? '+' : '-';
            if (abs >= 1000) return `${sign}${(abs / 1000).toFixed(1)}k`;
            if (abs >= 100) return `${sign}${Math.round(abs)}`;
            return `${sign}${abs.toFixed(0)}`;
          };

          return (
            <div
              key={i}
              title={log ? `${dateStr}: ${fmt(log.profitLoss)}${log.note ? `\n${log.note}` : ''}` : dateStr}
              className={`
                relative rounded-lg flex flex-col items-start justify-between p-1.5 min-h-13 transition-all select-none
                ${log
                  ? isProfit
                    ? 'bg-emerald-500/15 border border-emerald-500/30'
                    : isLoss
                    ? 'bg-red-500/15 border border-red-500/30'
                    : 'bg-neutral-800 border border-neutral-700'
                  : 'bg-[#111] border border-[#1a1a1a] hover:bg-[#181818]'
                }
                ${isToday ? 'ring-1 ring-white/25' : ''}
              `}
            >
              {/* Day number */}
              <span className={`text-[10px] font-bold leading-none ${isToday ? 'text-white' : log ? (isProfit ? 'text-emerald-300' : isLoss ? 'text-red-300' : 'text-neutral-400') : 'text-neutral-600'}`}>
                {day}
              </span>

              {/* P&L value */}
              {log && (
                <span className={`text-[9px] font-black leading-none w-full text-center mt-auto ${isProfit ? 'text-emerald-400' : isLoss ? 'text-red-400' : 'text-neutral-500'}`}>
                  {compactVal(log.profitLoss)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 px-5 pb-4 pt-1 border-t border-[#111]">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500/30 border border-emerald-500/40" />
          <span className="text-[9px] text-neutral-600">Profit</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-red-500/30 border border-red-500/40" />
          <span className="text-[9px] text-neutral-600">Loss</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-neutral-800 border border-neutral-700" />
          <span className="text-[9px] text-neutral-600">Flat</span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <div className="h-2.5 w-2.5 rounded-sm ring-1 ring-white/30" />
          <span className="text-[9px] text-neutral-600">Today</span>
        </div>
      </div>
    </div>
  );
}
