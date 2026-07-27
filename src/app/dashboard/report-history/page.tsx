import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { getAllWeeklyReportsAction } from '@/lib/actions/trading';
import ReportHistoryClient from './ReportHistoryClient';

export const metadata = {
  title: 'Report History | Trade View',
  description: 'Complete historical archive of all generated market scans and stock reports.',
};

export default async function ReportHistoryPage() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    redirect('/dashboard');
  }

  const initialReports = await getAllWeeklyReportsAction();

  return <ReportHistoryClient initialReports={initialReports} />;
}
