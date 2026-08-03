'use client';

import React, { useState } from 'react';
import { DailyLog } from '@/types/trading';
import { ChevronLeft, ChevronRight, BookOpen, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
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

  // Lookup map: "YYYY-MM-DD" -> DailyLog
  const logMap = new Map<string, DailyLog>();
  for (const log of dailyLogs) {
    logMap.set(log.date, log);
  }

  // Calendar grid math
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

  // Month summary stats
  const monthLogs = dailyLogs.filter((l) => l.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`));
  const monthNet = monthLogs.reduce((s, l) => s + l.profitLoss, 0);
  const monthProfit = monthLogs.filter((l) => l.profitLoss > 0).length;
  const monthLoss = monthLogs.filter((l) => l.profitLoss < 0).length;

  return (
    <div className="flex flex-col h-full font-sans">
      {/* Top Calendar Toolbar */}
      <div className="px-6 py-4 border-b border-neutral-800 bg-[#080808]/90 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <CalendarIcon className="h-4 w-4 text-emerald-400" />
          <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">Monthly P&amp;L Heatmap</h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-black text-white min-w-32 text-center font-mono">
              {MONTHS[month]} {year}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              disabled={isCurrentMonth}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition disabled:opacity-30 disabled:cursor-not-allowed"
              title="Next Month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Summary Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-800/80 bg-neutral-950/80">
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Monthly Net:</span>
          <span className={`font-black ${monthNet >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {monthNet >= 0 ? '+' : ''}{fmt(monthNet)}
          </span>
          <span className="text-neutral-700">·</span>
          <span className="text-emerald-400 font-bold">{monthProfit} Win{monthProfit !== 1 ? 's' : ''}</span>
          <span className="text-red-400 font-bold">{monthLoss} Loss{monthLoss !== 1 ? 'es' : ''}</span>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 px-4 pt-4">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-extrabold text-neutral-400 uppercase pb-2 font-mono">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Heatmap Grid */}
      <div className="grid grid-cols-7 gap-1.5 px-4 pb-4 flex-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} className="min-h-14 rounded-xl bg-transparent" />;

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const log = logMap.get(dateStr);
          const isToday = dateStr === today.toISOString().split('T')[0];
          const isProfit = log && log.profitLoss > 0;
          const isLoss = log && log.profitLoss < 0;

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
                relative rounded-2xl flex flex-col justify-between p-2 min-h-16 transition-all select-none group
                ${log
                  ? isProfit
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : isLoss
                    ? 'bg-red-500/20 border border-red-500/40 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                    : 'bg-neutral-900 border border-neutral-800'
                  : 'bg-neutral-950/60 border border-neutral-900 hover:border-neutral-800'
                }
                ${isToday ? 'ring-2 ring-emerald-400' : ''}
              `}
            >
              {/* Day Number */}
              <div className="flex items-center justify-between w-full">
                <span
                  className={`text-[11px] font-black font-mono leading-none ${
                    isToday
                      ? 'text-emerald-400'
                      : log
                      ? isProfit
                        ? 'text-emerald-300'
                        : isLoss
                        ? 'text-red-300'
                        : 'text-neutral-400'
                      : 'text-neutral-400'
                  }`}
                >
                  {day}
                </span>
                {isToday && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
              </div>

              {/* P&L Value Badge */}
              {log && (
                <div className="mt-auto w-full text-center">
                  <span
                    className={`text-[10px] font-black font-mono block truncate ${
                      isProfit ? 'text-emerald-400' : isLoss ? 'text-red-400' : 'text-neutral-400'
                    }`}
                  >
                    {compactVal(log.profitLoss)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
