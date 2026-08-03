'use client';

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { ChartDataPoint, AllocationData } from '@/types/trading';
import { Card } from '@/components/ui/Card';
import { TrendingUp, PieChart as PieIcon } from 'lucide-react';

interface DashboardChartsProps {
  chartData: ChartDataPoint[];
  allocationData: AllocationData[];
}

const COLORS = [
  '#10b981', // Glowing Emerald
  '#3b82f6', // Electric Blue
  '#8b5cf6', // Vibrant Violet
  '#f59e0b', // Cyber Amber
  '#06b6d4', // Neon Cyan
  '#ec4899', // Hot Pink
  '#14b8a6', // Bright Teal
  '#6366f1', // Deep Indigo
  '#f97316', // Neon Orange
];

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ chartData, allocationData }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 h-96 flex items-center justify-center text-neutral-500 text-xs bg-[#0c0c0c]/90 border border-neutral-800 rounded-3xl">
          Loading performance chart...
        </Card>
        <Card className="h-96 flex items-center justify-center text-neutral-500 text-xs bg-[#0c0c0c]/90 border border-neutral-800 rounded-3xl">
          Loading allocation chart...
        </Card>
      </div>
    );
  }

  const totalAllocationVal = allocationData.reduce((acc, item) => acc + (item.value || 0), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      {/* ── Performance Area Chart ── */}
      <Card className="lg:col-span-2 p-6 flex flex-col gap-4 bg-[#0c0c0c]/90 border border-neutral-800 hover:border-emerald-500/30 rounded-3xl shadow-2xl backdrop-blur-2xl transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white tracking-tight uppercase">Performance Curve</h3>
              <p className="text-[11px] text-neutral-400 font-medium">Cumulative unrealized &amp; realized P&amp;L growth</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Real-Time
          </span>
        </div>

        <div className="h-72 w-full pt-2">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1a1a1a" horizontal={true} vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#121212',
                    border: '1px solid rgba(16,185,129,0.3)',
                    borderRadius: '16px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
                    padding: '10px 14px',
                  }}
                  labelStyle={{ color: '#aaa', fontSize: '11px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#10b981', fontSize: '13px', fontWeight: 'bold' }}
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeProfit"
                  name="Cumulative P&L"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-neutral-500 text-xs">
              Add daily P&amp;L logs to see your performance curve.
            </div>
          )}
        </div>
      </Card>

      {/* ── Asset Allocation Donut / Pie Chart ── */}
      <Card className="p-6 flex flex-col gap-4 bg-[#0c0c0c]/90 border border-neutral-800 hover:border-emerald-500/30 rounded-3xl shadow-2xl backdrop-blur-2xl transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <PieIcon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white tracking-tight uppercase">Portfolio Allocation</h3>
              <p className="text-[11px] text-neutral-400 font-medium">Position weight by market value</p>
            </div>
          </div>
        </div>

        <div className="h-72 w-full flex flex-col items-center justify-center">
          {allocationData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="#0a0a0a"
                  strokeWidth={2}
                >
                  {allocationData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      className="transition-all hover:opacity-80"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#121212',
                    border: '1px solid #333',
                    borderRadius: '14px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
                    padding: '8px 12px',
                  }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  formatter={(value: any, name: any) => [
                    `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })} (${
                      totalAllocationVal > 0 ? ((Number(value) / totalAllocationVal) * 100).toFixed(1) : 0
                    }%)`,
                    name,
                  ]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={48}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string, entry: any) => {
                    const colorIndex = allocationData.findIndex((item) => item.name === value);
                    const color = COLORS[colorIndex % COLORS.length] || '#10b981';
                    return (
                      <span className="text-[11px] font-bold text-neutral-300 font-mono inline-flex items-center gap-1 mr-2">
                        <span style={{ color }}>{value}</span>
                      </span>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-neutral-500 text-xs">
              Add trade positions to view allocation breakdown.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DashboardCharts;
