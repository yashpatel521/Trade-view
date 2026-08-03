import AddTradeForm from '@/components/dashboard/trades/AddTradeForm';
import AddDailyLogForm from '@/components/dashboard/journal/AddDailyLogForm';
import Link from 'next/link';
import { ArrowLeft, PlusCircle, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Execute Trade & Log Journal | Trade View',
  description: 'Execute new stock trade orders with automatic CAD/USD currency routing or log your daily trading session P&L.',
};

export default function AddRecordPage() {
  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full max-w-none font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Clean Breadcrumb */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-emerald-400 transition-colors w-fit group"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Pro Dashboard</span>
        </Link>
      </div>

      {/* Forms Grid Layout (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
        <AddTradeForm />
        <AddDailyLogForm />
      </div>
    </div>
  );
}
