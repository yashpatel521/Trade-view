import AddTradeForm from '@/components/dashboard/AddTradeForm';
import AddDailyLogForm from '@/components/dashboard/AddDailyLogForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AddRecordPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl">
      {/* Header */}
      <div>
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-300 transition-colors mb-3"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Dashboard
        </Link>
        <h2 className="text-2xl font-bold text-white tracking-tight">Add Record</h2>
        <p className="text-xs text-neutral-500 mt-1">
          Record a new trade transaction or log your daily profit and loss results
        </p>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AddTradeForm />
        <AddDailyLogForm />
      </div>
    </div>
  );
}
