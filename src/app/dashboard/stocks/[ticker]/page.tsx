import type { Metadata } from 'next';
import { getDashboardDataAction } from '@/lib/actions/trading';
import { getSession } from '@/lib/session';
import StockDetailClient from './StockDetailClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface StockDetailPageProps {
  params: Promise<{ ticker: string }>;
}

export async function generateMetadata({ params }: StockDetailPageProps): Promise<Metadata> {
  const { ticker } = await params;
  const decodedTicker = decodeURIComponent(ticker).toUpperCase().trim();
  const isCad = decodedTicker.endsWith('.TO') || decodedTicker.endsWith('.V') || decodedTicker.endsWith('.CN');

  return {
    title: `${decodedTicker} Live Stock Price & AI Strategy Analysis | Trade View`,
    description: `Track real-time ${decodedTicker} stock chart, peak/trough levels, native ${isCad ? 'CAD (CA$)' : 'USD ($)'} quotes, and Gemini AI pattern predictions.`,
    openGraph: {
      title: `${decodedTicker} Live Chart & Technical Signals | Trade View`,
      description: `Real-time interactive chart for ${decodedTicker} with automatic High/Low reference dots and AI pattern analysis.`,
      url: `https://trade-view.app/dashboard/stocks/${encodeURIComponent(decodedTicker)}`,
      siteName: 'Trade View',
    },
  };
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
