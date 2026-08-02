import type { Metadata } from 'next';
import { getSession } from '@/lib/session';
import LandingPageClient from './LandingPageClient';

export const metadata: Metadata = {
  title: 'Trade View | Spatial Portfolio Tracker & Real-Time Trading Journal',
  description:
    'Track US & Canadian stock portfolios in real-time with automated CAD/USD multi-currency conversion, daily 5 PM P&L journal logs, and Gemini AI pattern detection.',
  keywords: [
    'trading journal',
    'portfolio tracker',
    'wealthsimple alternative',
    'stock P&L calculator',
    'real-time market data',
    'CAD USD stock tracking',
    'algorithmic trading strategies',
  ],
  authors: [{ name: 'Trade View Team' }],
  openGraph: {
    title: 'Trade View - Spatial Portfolio Tracker & Trading Journal',
    description:
      'Track US & Canadian stocks in real-time with automated CAD/USD currency conversion, daily P&L journaling, and AI technical pattern engine.',
    url: 'https://trade-view.app',
    siteName: 'Trade View',
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'Trade View Pro Terminal' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trade View - Spatial Portfolio Tracker',
    description: 'Real-time stock portfolio tracking, CAD/USD multi-currency ledger, and 5 PM auto-journaling.',
    images: ['/logo.png'],
  },
};

export default async function Home() {
  const session = await getSession();
  const isLoggedIn = Boolean(session);

  return <LandingPageClient isLoggedIn={isLoggedIn} />;
}
