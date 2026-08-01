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
  Legend
} from 'recharts';
import { ChartDataPoint, AllocationData } from '@/types/trading';
import { Card } from '@/components/ui/Card';

interface DashboardChartsProps {
  chartData: ChartDataPoint[];
  allocationData: AllocationData[];
}

const COLORS = ['#666', '#888', '#aaa', '#555', '#777', '#999', '#bbb'];

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ chartData, allocationData }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 h-87.5 flex items-center justify-center text-neutral-600 text-xs">
          Loading chart...
        </Card>
        <Card className="h-87.5 flex items-center justify-center text-neutral-600 text-xs">
          Loading allocation...
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Performance Chart */}
      <Card className="lg:col-span-2 flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Performance</h3>
          <p className="text-xs text-neutral-500 mt-0.5">Cumulative P&L over time</p>
        </div>
        <div className="h-70 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1a1a1a" horizontal={true} vertical={false} />
                <XAxis dataKey="date" stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', boxShadow: 'none' }}
                  labelStyle={{ color: '#888', fontSize: '11px' }}
                  itemStyle={{ color: '#eee', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="cumulativeProfit" name="P&L" stroke="#10b981" strokeWidth={1.5} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-neutral-600 text-xs">
              Add daily P&L logs to see your performance curve.
            </div>
          )}
        </div>
      </Card>

      {/* Allocation */}
      <Card className="flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Allocation</h3>
          <p className="text-xs text-neutral-500 mt-0.5">By market value</p>
        </div>
        <div className="h-70 w-full flex items-center justify-center">
          {allocationData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', boxShadow: 'none' }}
                  itemStyle={{ color: '#eee', fontSize: '12px' }}
                  formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Value']}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={6}
                  formatter={(value: string) => <span className="text-[10px] text-neutral-500 font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-neutral-600 text-xs">
              Add trades to see allocation.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DashboardCharts;
