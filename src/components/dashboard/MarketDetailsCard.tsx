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
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [isWebSocketActive, setIsWebSocketActive] = useState<boolean>(false);
  const [priceFlash, setPriceFlash] = useState<'up' | 'down' | null>(null);
  const prevPriceRef = React.useRef<number>(0);

  const tickerUpper = ticker.toUpperCase();

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

  // Live WebSocket connection for Market Details real-time ticks
  useEffect(() => {
    const isCanadian = tickerUpper.endsWith('.TO') || tickerUpper.endsWith('.V') || tickerUpper.endsWith('.CN');
    if (isCanadian) {
      setIsWebSocketActive(false);
      return;
    }

    const cleanTicker = tickerUpper.replace(/\.(TO|V|CN)$/i, '');
    const apiKey = 'd8q0q89r01qr03nct970d8q0q89r01qr03nct97g';
    let socket: WebSocket | null = null;

    try {
      socket = new WebSocket(`wss://ws.finnhub.io?token=${apiKey}`);

      socket.onopen = () => {
        if (socket?.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'subscribe', symbol: cleanTicker }));
          setIsWebSocketActive(true);
        }
      };

      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg && msg.type === 'trade' && Array.isArray(msg.data) && msg.data.length > 0) {
            const lastTrade = msg.data[msg.data.length - 1];
            if (typeof lastTrade.p === 'number' && lastTrade.p > 0) {
              const newPrice = parseFloat(lastTrade.p.toFixed(2));
              if (prevPriceRef.current > 0 && newPrice !== prevPriceRef.current) {
                setPriceFlash(newPrice > prevPriceRef.current ? 'up' : 'down');
                setTimeout(() => setPriceFlash(null), 1000);
              }
              prevPriceRef.current = newPrice;
              setLivePrice(newPrice);
            }
          }
        } catch (err) {}
      };

      socket.onerror = () => {
        setIsWebSocketActive(false);
      };

      socket.onclose = () => {
        setIsWebSocketActive(false);
      };
    } catch (err) {
      setIsWebSocketActive(false);
    }

    return () => {
      if (socket) {
        if (socket.readyState === WebSocket.OPEN) {
          try {
            socket.send(JSON.stringify({ type: 'unsubscribe', symbol: cleanTicker }));
          } catch (e) {}
        }
        socket.close();
      }
    };
  }, [tickerUpper]);

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
    exchange: tickerUpper.endsWith('.TO') ? 'TSX' : 'NASDAQ',
    marginReq: '30.00%',
    marketCap: '$1.17T',
    sharesOutstanding: '3.76B',
    peRatio: '290.84',
    currency: nativeCurrency,
  };

  const d = details || defaultDetails;

  // Format live last sale display
  const liveLastSaleDisplay = livePrice
    ? `$${livePrice.toFixed(2)}`
    : d.lastSale;

  const marketRows = [
    { label: 'Open', value: d.open, isLive: false },
    { label: 'Close', value: d.close || '$311.38', isLive: false },
    { label: 'Bid', value: d.bid, isLive: false },
    { label: 'Ask', value: d.ask, isLive: false },
    { label: 'Last sale', value: liveLastSaleDisplay, isLive: !!livePrice },
    { label: 'High', value: d.high, isLive: false },
    { label: 'Low', value: d.low, isLive: false },
    { label: 'Volume', value: d.volume, isLive: false },
    { label: 'Average volume', value: d.avgVolume, isLive: false },
    { label: '52 week high', value: d.fiftyTwoWeekHigh, isLive: false },
    { label: '52 week low', value: d.fiftyTwoWeekLow, isLive: false },
    { label: 'Exchange', value: d.exchange, isLive: false },
    { label: 'Margin requirement', value: d.marginReq, isLive: false },
  ];

  const financialRows = [
    { label: 'Market cap', value: d.marketCap },
    { label: 'Shares outstanding', value: d.sharesOutstanding },
    { label: 'P/E ratio', value: d.peRatio },
  ];

  return (
    <Card className={`flex flex-col justify-between gap-6 p-5 h-full ${className}`}>
      {/* Market details Section Header */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-sm font-bold text-white tracking-tight">Market details</h3>
          {isWebSocketActive && (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live WebSocket
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
          {marketRows.map((row, idx) => (
            <div key={idx} className="flex flex-col text-xs">
              <span className="text-neutral-400 font-medium text-[11px] leading-tight mb-0.5">{row.label}</span>
              <span
                className={`font-semibold text-xs leading-tight transition-colors duration-500 ${
                  row.label === 'Last sale' && priceFlash === 'up'
                    ? 'text-emerald-400 bg-emerald-500/20 px-1 py-0.5 rounded'
                    : row.label === 'Last sale' && priceFlash === 'down'
                    ? 'text-red-400 bg-red-500/20 px-1 py-0.5 rounded'
                    : row.isLive
                    ? 'text-emerald-400 font-bold'
                    : 'text-white'
                }`}
              >
                {row.value}
              </span>
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
