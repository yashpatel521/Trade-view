import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { getDailyLogsAction } from '@/lib/actions/trading';
import JournalClient from './JournalClient';

export const metadata: Metadata = {
  title: 'P&L Trading Journal & Calendar Heatmaps | Trade View',
  description:
    'Review automated 5:00 PM market-close P&L logs, monthly calendar heatmaps, win-rate analytics, and custom session notes.',
  openGraph: {
    title: 'P&L Trading Journal & Calendar Heatmaps | Trade View',
    description:
      'Review automated weekday 5:00 PM market-close P&L logs, monthly calendar heatmaps, and win-rate analytics.',
    url: 'https://trade-view.app/dashboard/journal',
    siteName: 'Trade View',
  },
};

export default async function JournalPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const result = await getDailyLogsAction();

  return (
    <JournalClient
      initialLogs={result?.logs ?? []}
      todayAutoPL={result?.todayAutoPL ?? 0}
      todayAutoNote={result?.todayAutoNote ?? ''}
    />
  );
}
