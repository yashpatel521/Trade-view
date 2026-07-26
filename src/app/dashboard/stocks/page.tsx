import { getDashboardDataAction } from '@/lib/actions/trading';
import StocksClient from './StocksClient';

export default async function StocksPage() {
  const data = await getDashboardDataAction();

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <p className="text-neutral-500">Unable to load stock holdings. Please try logging in again.</p>
      </div>
    );
  }

  return <StocksClient data={data} />;
}
