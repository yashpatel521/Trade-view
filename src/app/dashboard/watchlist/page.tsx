import { getWatchlistAction, getFxRateAction } from '@/lib/actions/trading';
import { WatchlistClient } from './WatchlistClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Stock Watchlist | Trade-View',
  description: 'Track your pinned equities with real-time price updates and native currency conversions.',
};

export default async function WatchlistPage() {
  const initialItems = await getWatchlistAction();
  const liveFxRate = await getFxRateAction();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <WatchlistClient initialItems={initialItems} liveFxRate={liveFxRate} />
    </div>
  );
}
