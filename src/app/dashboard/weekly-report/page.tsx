import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { getLastWeeklyReportAction } from '@/lib/actions/trading';
import WeeklyReportClient from './WeeklyReportClient';

export const metadata = {
  title: 'Weekly Stock Report | Trade View',
  description: 'Institutional market research scan identifying the 5 best high-conviction bullish stock opportunities today.',
};

export default async function WeeklyReportPage() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    redirect('/dashboard');
  }

  const { report, createdAt } = await getLastWeeklyReportAction();

  return <WeeklyReportClient initialReport={report} initialCreatedAt={createdAt} />;
}
