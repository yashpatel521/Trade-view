import { getPublicPortfolioDetailsAction } from '@/lib/actions/trading';
import PublicPortfolioClient from './PublicPortfolioClient';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function PublicPortfolioPage({ params }: PageProps) {
  const { userId } = await params;
  const data = await getPublicPortfolioDetailsAction(Number(userId));

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-80 gap-4 text-center">
        <p className="text-neutral-500 text-sm">
          This portfolio is private or does not exist.
        </p>
        <Link
          href="/dashboard/portfolios"
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Leaderboard</span>
        </Link>
      </div>
    );
  }

  return <PublicPortfolioClient data={data} />;
}
