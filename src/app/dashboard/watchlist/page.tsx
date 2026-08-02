import type { Metadata } from 'next';
import { getWatchlistAction, getFxRateAction } from '@/lib/actions/trading';
import { WatchlistClient } from './WatchlistClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Stock Watchlist & Real-Time Quotes | Trade View',
  description:
    'Track your favorite US & Canadian stock tickers with real-time price feeds, native currency badges, and instant technical quote metrics.',
  openGraph: {
    title: 'Stock Watchlist & Real-Time Quotes | Trade View',
    description:
      'Track pinned US & Canadian stocks with real-time quotes, native CAD/USD badges, and rapid watchlist management.',
    url: 'https://trade-view.app/dashboard/watchlist',
    siteName: 'Trade View',
  },
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
