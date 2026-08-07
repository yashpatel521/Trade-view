import React from 'react';
import { Metadata } from 'next';
import ImportCsvClient from './ImportCsvClient';

export const metadata: Metadata = {
  title: 'Import Portfolio CSV | Trade View',
  description: 'Bulk update or reset your stock portfolio, holdings, and trades via CSV file upload.',
};

export default function ImportPortfolioPage() {
  return <ImportCsvClient />;
}
