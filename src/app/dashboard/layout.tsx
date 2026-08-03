import type { Metadata } from 'next';
import { getSession } from '@/lib/session';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getFxRateAction } from '@/lib/actions/trading';

export const metadata: Metadata = {
  title: 'Pro Trading Dashboard | Trade View Portfolio Manager',
  description:
    'Manage your US & Canadian stock positions, view automated 5:00 PM P&L journal logs, track multi-currency cash balances, and monitor Gemini AI pattern signals.',
  keywords: [
    'trading dashboard',
    'portfolio manager',
    'stock journal',
    'real-time stock tracking',
    'CAD USD trading dashboard',
    'Gemini AI trading signals',
  ],
  openGraph: {
    title: 'Pro Trading Dashboard | Trade View Portfolio Manager',
    description:
      'Manage your US & Canadian stock positions with real-time portfolio tracking, multi-currency conversion, and AI strategy signals.',
    url: 'https://trade-view.app/dashboard',
    siteName: 'Trade View',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pro Trading Dashboard | Trade View Portfolio Manager',
    description:
      'Real-time stock portfolio tracking, CAD/USD multi-currency ledger, and 5 PM auto-journaling.',
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, Number(session.userId)),
  });
  const fxRate = await getFxRateAction();

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-neutral-100 overflow-hidden">
      <Sidebar isAdmin={session.role === 'admin'} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header
          session={session}
          cashBalance={user?.cashBalance ?? 0}
          cashBalanceCad={user?.cashBalanceCad ?? user?.cashBalance ?? 0}
          cashBalanceUsd={user?.cashBalanceUsd ?? 0}
          fxRate={fxRate}
        />

        <main className="flex-1 overflow-y-auto no-scrollbar p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
