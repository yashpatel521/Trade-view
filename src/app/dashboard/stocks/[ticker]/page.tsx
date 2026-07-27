import { getDashboardDataAction } from '@/lib/actions/trading';
import { getSession } from '@/lib/session';
import StockDetailClient from './StockDetailClient';

interface StockDetailPageProps {
  params: Promise<{ ticker: string }>;
}

export default async function StockDetailPage({ params }: StockDetailPageProps) {
  const { ticker } = await params;
  const decodedTicker = decodeURIComponent(ticker).toUpperCase().trim();

  const session = await getSession();
  const isAdmin = session?.role === 'admin';

  const data = await getDashboardDataAction();

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <p className="text-neutral-500">Unable to load stock details. Please try logging in again.</p>
      </div>
    );
  }

  // Find user holding for this ticker
  const holding = data.holdings.find(
    (h) => h.ticker.toUpperCase() === decodedTicker
  ) || null;

  // Filter all trades for this ticker
  const trades = data.trades.filter(
    (t) => t.ticker.toUpperCase() === decodedTicker
  );

  return (
    <StockDetailClient
      ticker={decodedTicker}
      holding={holding}
      trades={trades}
      fxRate={data.stats.fxRate || 1.40}
      isAdmin={isAdmin}
    />
  );
}
