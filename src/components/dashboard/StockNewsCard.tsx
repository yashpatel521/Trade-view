'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { StockNewsItem } from '@/types/trading';
import { getStockNewsAction } from '@/lib/actions/trading';
import { Newspaper, ExternalLink, Loader2, Clock } from 'lucide-react';

interface StockNewsCardProps {
  ticker: string;
  className?: string;
}

export const StockNewsCard: React.FC<StockNewsCardProps> = ({ ticker, className = '' }) => {
  const [news, setNews] = useState<StockNewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isSubscribed = true;
    async function loadNews() {
      setIsLoading(true);
      const items = await getStockNewsAction(ticker);
      if (isSubscribed) {
        setNews(items);
        setIsLoading(false);
      }
    }
    loadNews();
    return () => {
      isSubscribed = false;
    };
  }, [ticker]);

  return (
    <Card className={`flex flex-col gap-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300">
            <Newspaper className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Latest News ({ticker.toUpperCase()})</h3>
            <p className="text-xs text-neutral-500">Live market news & updates via Finnhub API</p>
          </div>
        </div>
        {!isLoading && (
          <span className="text-xs text-neutral-500 font-medium">{news.length} articles</span>
        )}
      </div>

      {/* News Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-xs text-neutral-500">
          <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
          Loading company news for {ticker}...
        </div>
      ) : news.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {news.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col justify-between p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-900 transition-all cursor-pointer"
            >
              <div>
                {/* Source & Time Badges */}
                <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-2">
                  <span className="font-semibold px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                    {item.source}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {item.timeAgo}
                  </span>
                </div>

                {/* Headline Title */}
                <h4 className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                  {item.headline}
                </h4>

                {/* Article Summary */}
                {item.summary && (
                  <p className="text-[11px] text-neutral-400 line-clamp-3 mt-1.5 leading-relaxed">
                    {item.summary}
                  </p>
                )}
              </div>

              {/* Read Full Article Button */}
              <div className="mt-3 pt-2.5 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-400 group-hover:text-neutral-200">
                <span>Read Full Article</span>
                <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-neutral-500">
          No news articles found for {ticker}.
        </div>
      )}
    </Card>
  );
};

export default StockNewsCard;
