'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { getStockMarketDetailsAction, MarketDetailsData } from '@/lib/actions/trading';

interface MarketDetailsCardProps {
  ticker: string;
  nativeCurrency?: 'USD' | 'CAD';
  className?: string;
}

export const MarketDetailsCard: React.FC<MarketDetailsCardProps> = ({
  ticker,
  nativeCurrency = 'USD',
  className = '',
}) => {
  const [details, setDetails] = useState<MarketDetailsData | null>(null);

  useEffect(() => {
    let isSubscribed = true;
    async function loadDetails() {
      const data = await getStockMarketDetailsAction(ticker);
      if (isSubscribed) {
        setDetails(data);
      }
    }
    loadDetails();
    return () => {
      isSubscribed = false;
    };
  }, [ticker]);

  const defaultDetails: MarketDetailsData = {
    open: '$320.88',
    close: '$311.38',
    bid: '$311.36 x 3',
    ask: '$311.40 x 1,275',
    lastSale: '$311.38 x 100',
    high: '$322.96',
    low: '$306.51',
    volume: '45.43M',
    avgVolume: '47.74M',
    fiftyTwoWeekHigh: '$498.83',
    fiftyTwoWeekLow: '$297.82',
    exchange: ticker.toUpperCase().endsWith('.TO') ? 'TSX' : 'NASDAQ',
    marginReq: '30.00%',
    marketCap: '$1.17T',
    sharesOutstanding: '3.76B',
    peRatio: '290.84',
    currency: nativeCurrency,
  };

  const d = details || defaultDetails;

  const marketRows = [
    { label: 'Open', value: d.open },
    { label: 'Close', value: d.close || '$311.38' },
    { label: 'Bid', value: d.bid },
    { label: 'Ask', value: d.ask },
    { label: 'Last sale', value: d.lastSale },
    { label: 'High', value: d.high },
    { label: 'Low', value: d.low },
    { label: 'Volume', value: d.volume },
    { label: 'Average volume', value: d.avgVolume },
    { label: '52 week high', value: d.fiftyTwoWeekHigh },
    { label: '52 week low', value: d.fiftyTwoWeekLow },
    { label: 'Exchange', value: d.exchange },
    { label: 'Margin requirement', value: d.marginReq },
  ];

  const financialRows = [
    { label: 'Market cap', value: d.marketCap },
    { label: 'Shares outstanding', value: d.sharesOutstanding },
    { label: 'P/E ratio', value: d.peRatio },
  ];

  return (
    <Card className={`flex flex-col justify-between gap-6 p-5 h-full ${className}`}>
      {/* Market details Section */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3.5 tracking-tight">Market details</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
          {marketRows.map((row, idx) => (
            <div key={idx} className="flex flex-col text-xs">
              <span className="text-neutral-400 font-medium text-[11px] leading-tight mb-0.5">{row.label}</span>
              <span className="text-white font-semibold text-xs leading-tight">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Financials Section */}
      <div className="border-t border-[#222] pt-4">
        <h3 className="text-sm font-bold text-white mb-3.5 tracking-tight">Financials</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
          {financialRows.map((row, idx) => (
            <div key={idx} className="flex flex-col text-xs">
              <span className="text-neutral-400 font-medium text-[11px] leading-tight mb-0.5">{row.label}</span>
              <span className="text-white font-semibold text-xs leading-tight">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default MarketDetailsCard;
