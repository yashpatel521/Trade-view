import { getDashboardDataAction } from '@/lib/actions/trading';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  // Fetch initial dashboard metrics in base currency (CAD)
  const data = await getDashboardDataAction();

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <p className="text-neutral-500">Unable to load dashboard data. Please try logging in again.</p>
      </div>
    );
  }

  return <DashboardClient data={data} />;
}
