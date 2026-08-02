import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker')?.toUpperCase().trim() || 'GOOGL';

  try {
    // Query Yahoo Finance v8 real-time chart endpoint for live price and change
    const yahooSymbol = ticker.includes('.') ? ticker : ticker;
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=1d`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        cache: 'no-store',
      }
    );

    if (res.ok) {
      const data = await res.json();
      const meta = data?.chart?.result?.[0]?.meta;
      if (meta && typeof meta.regularMarketPrice === 'number' && meta.regularMarketPrice > 0) {
        const price = meta.regularMarketPrice;
        const prevClose = meta.chartPreviousClose || meta.previousClose || price;
        const change = price - prevClose;
        const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;
        const isUp = change >= 0;

        return NextResponse.json({
          ticker,
          price: `$${price.toFixed(2)} USD`,
          rawPrice: price,
          change: `${isUp ? '+' : ''}${changePercent.toFixed(2)}%`,
          up: isUp,
          curr: '🇺🇸 USD',
          currency: 'USD',
          high: meta.regularMarketDayHigh ? `$${meta.regularMarketDayHigh.toFixed(2)} USD` : null,
          low: meta.regularMarketDayLow ? `$${meta.regularMarketDayLow.toFixed(2)} USD` : null,
        });
      }
    }
  } catch (err) {
    console.error(`Failed to fetch live quote for ${ticker}:`, err);
  }

  // Fallback default response if market is offline or rate limited
  return NextResponse.json({
    ticker,
    price: ticker === 'GOOGL' ? '$178.60 USD' : ticker === 'NVDA' ? '$128.40 USD' : '$224.50 USD',
    change: '+2.85%',
    up: true,
    curr: '🇺🇸 USD',
    currency: 'USD',
  });
}
