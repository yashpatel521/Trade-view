import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { getDailyLogsAction } from '@/lib/actions/trading';
import JournalClient from './JournalClient';

export const metadata = {
  title: 'Daily Journal | Trade View',
  description: 'Track your daily trading P&L and performance journal.',
};

export default async function JournalPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const result = await getDailyLogsAction();

  return <JournalClient initialLogs={result?.logs ?? []} />;
}
