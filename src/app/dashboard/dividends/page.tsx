import React from 'react';
import { Metadata } from 'next';
import { getDividendTrackerDataAction } from '@/lib/actions/trading';
import DividendsClient from './DividendsClient';

export const metadata: Metadata = {
  title: 'Dividend Tracker & Income Calendar | Trade View',
  description: 'Track passive dividend cash flow, ex-dividend target dates, payout frequencies, and projected 12-month distributions.',
};

export default async function DividendsPage() {
  const initialData = await getDividendTrackerDataAction();
  return <DividendsClient initialData={initialData} />;
}
