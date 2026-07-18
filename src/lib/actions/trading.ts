'use server';

import { db } from '@/db';
import { holdings, trades, dailyLogs, users } from '@/db/schema';
import { eq, and, desc, ne } from 'drizzle-orm';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { MOCK_STOCK_PRICES } from '@/constants';
import { DashboardData, Holding, DailyLog, Trade, ChartDataPoint, AllocationData, PublicPortfolio, PublicPortfolioDetails } from '@/types/trading';

// In-memory cache for live price scraping to keep the application fast
interface CachedPrice {
  price: number;
  currency: string;
  timestamp: number;
}

const priceCache: Record<string, CachedPrice> = {};
let cachedFxRate: { rate: number; timestamp: number } | null = null;

async function fetchFxRate(): Promise<number> {
  if (cachedFxRate && Date.now() - cachedFxRate.timestamp < 5 * 60 * 1000) {
    return cachedFxRate.rate;
  }
  
  const url = 'https://www.google.com/finance/quote/USD-CAD';
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      next: { revalidate: 60 }
    });
    const html = await res.text();
    const regex = /"USD-CAD"\s*,\s*"USD\s*\/\s*CAD"\s*,\s*([0-9.]+)/i;
    const match = html.match(regex);
    if (match) {
      const rate = parseFloat(match[1]);
      cachedFxRate = { rate, timestamp: Date.now() };
      return rate;
    }
  } catch (err) {
    console.error('Failed to fetch FX rate:', err);
  }
  return cachedFxRate?.rate ?? 1.40;
}

async function fetchStockPrice(ticker: string): Promise<{ price: number; currency: string }> {
  const tickerUpper = ticker.toUpperCase().trim();
  if (priceCache[tickerUpper] && Date.now() - priceCache[tickerUpper].timestamp < 5 * 60 * 1000) {
    return priceCache[tickerUpper];
  }

  const exchanges = ['NASDAQ', 'NYSE', 'TSE'];
  for (const ex of exchanges) {
    const url = `https://www.google.com/finance/quote/${tickerUpper}:${ex}`;
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        next: { revalidate: 60 }
      });
      const html = await res.text();
      const regex = new RegExp(`\\[\\s*"${tickerUpper}"\\s*,\\s*"[^"]+"\\s*\\]\\s*,\\s*"[^"]+"\\s*,\\s*\\d+\\s*,\\s*"([A-Z]{3})",\\s*\\[\\s*([0-9.]+)`);
      const match = html.match(regex);
      if (match) {
        const result = {
          price: parseFloat(match[2]),
          currency: match[1],
          timestamp: Date.now()
        };
        priceCache[tickerUpper] = result;
        return result;
      }
    } catch (err) {
      // try next exchange
    }
  }

  const fallbackPrice = MOCK_STOCK_PRICES[tickerUpper] ?? 150.0;
  return { price: fallbackPrice, currency: 'USD' };
}


// Helper to fetch user ID or throw an error
async function getUserIdOrThrow() {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized. Please log in.');
  }
  return Number(session.userId);
}

export async function addTradeAction(prevState: any, formData: FormData) {
  try {
    const userId = await getUserIdOrThrow();
    const ticker = (formData.get('ticker') as string).toUpperCase().trim();
    const type = formData.get('type') as 'BUY' | 'SELL';
    const shares = parseFloat(formData.get('shares') as string);
    const price = parseFloat(formData.get('price') as string);
    const date = formData.get('date') as string;
    const currency = (formData.get('currency') as string) === 'CAD' ? 'CAD' : 'USD';

    if (!ticker || !type || isNaN(shares) || shares <= 0 || isNaN(price) || price <= 0 || !date) {
      return { error: 'Invalid input. Make sure values are positive numbers.' };
    }

    // Retrieve existing holding
    const existingHolding = await db.query.holdings.findFirst({
      where: and(eq(holdings.userId, userId), eq(holdings.ticker, ticker)),
    });

    if (type === 'BUY') {
      if (existingHolding) {
        // Average Price Calculation: Weighted Average
        const newShares = existingHolding.shares + shares;
        const newAvgPrice = 
          ((existingHolding.shares * existingHolding.averagePrice) + (shares * price)) / newShares;
        
        await db.update(holdings)
          .set({
            shares: newShares,
            averagePrice: newAvgPrice,
            updatedAt: new Date(),
          })
          .where(eq(holdings.id, existingHolding.id));
      } else {
        await db.insert(holdings).values({
          userId,
          ticker,
          shares,
          averagePrice: price,
        });
      }
    } else { // SELL
      if (!existingHolding) {
        return { error: `You do not own any shares of ${ticker} to sell.` };
      }
      if (existingHolding.shares < shares) {
        return { error: `Cannot sell ${shares} shares of ${ticker}. You only own ${existingHolding.shares} shares.` };
      }
      
      const newShares = existingHolding.shares - shares;
      if (newShares === 0) {
        await db.delete(holdings).where(eq(holdings.id, existingHolding.id));
      } else {
        await db.update(holdings)
          .set({
            shares: newShares,
            updatedAt: new Date(),
          })
          .where(eq(holdings.id, existingHolding.id));
      }
    }

    // Record this individual trade
    await db.insert(trades).values({
      userId,
      ticker,
      type,
      shares,
      price,
      currency,
      date,
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Add trade error:', error);
    return { error: error.message || 'Something went wrong.' };
  }
}

export async function addDailyLogAction(prevState: any, formData: FormData) {
  try {
    const userId = await getUserIdOrThrow();
    const date = formData.get('date') as string;
    const profitLoss = parseFloat(formData.get('profitLoss') as string);
    const note = formData.get('note') as string;

    if (!date || isNaN(profitLoss)) {
      return { error: 'Invalid input. Please provide a valid date and P&L value.' };
    }

    // Check if a P&L log for this date already exists
    const existingLog = await db.query.dailyLogs.findFirst({
      where: and(eq(dailyLogs.userId, userId), eq(dailyLogs.date, date)),
    });

    if (existingLog) {
      await db.update(dailyLogs)
        .set({
          profitLoss,
          note: note.trim() || null,
        })
        .where(eq(dailyLogs.id, existingLog.id));
    } else {
      await db.insert(dailyLogs).values({
        userId,
        date,
        profitLoss,
        note: note.trim() || null,
      });
    }

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Add daily log error:', error);
    return { error: error.message || 'Something went wrong.' };
  }
}

export async function deleteDailyLogAction(id: number) {
  try {
    const userId = await getUserIdOrThrow();
    await db.delete(dailyLogs)
      .where(and(eq(dailyLogs.id, id), eq(dailyLogs.userId, userId)));
    
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Delete daily log error:', error);
    return { error: error.message || 'Something went wrong.' };
  }
}

export async function getDashboardDataAction(viewCurrency: 'CAD' | 'USD' = 'CAD'): Promise<DashboardData | null> {
  try {
    const session = await getSession();
    if (!session) return null;
    const userId = session.userId;

    // Fetch user cash balance
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    const cashBalance = user?.cashBalance ?? 0;

    // Fetch current holdings
    const userHoldings = await db.query.holdings.findMany({
      where: eq(holdings.userId, userId),
    });

    // Fetch daily logs (sorted by date descending)
    const userLogs = await db.query.dailyLogs.findMany({
      where: eq(dailyLogs.userId, userId),
      orderBy: [desc(dailyLogs.date)],
    });

    // Fetch recent 10 trades
    const userTrades = await db.query.trades.findMany({
      where: eq(trades.userId, userId),
      orderBy: [desc(trades.date)],
      limit: 10,
    });

    // Resolve FX conversion factor
    const fxRate = await fetchFxRate();
    const conversionFactor = viewCurrency === 'USD' ? (1 / fxRate) : 1;
    const cashBalanceConverted = cashBalance * conversionFactor;

    // Compute Holdings valuations
    let totalCostConverted = 0;
    let currentValueConverted = 0;

    const enrichedHoldings: Holding[] = await Promise.all(userHoldings.map(async (h) => {
      const tickerUpper = h.ticker.toUpperCase();
      const liveData = await fetchStockPrice(tickerUpper);
      
      const avgPriceConverted = h.averagePrice * conversionFactor;
      
      let livePriceInView = liveData.price;
      if (liveData.currency === 'USD' && viewCurrency === 'CAD') {
        livePriceInView = liveData.price * fxRate;
      } else if (liveData.currency === 'CAD' && viewCurrency === 'USD') {
        livePriceInView = liveData.price / fxRate;
      }

      const hTotalCostConverted = h.shares * avgPriceConverted;
      const hCurrentValueConverted = h.shares * livePriceInView;
      const hUnrealizedPLConverted = hCurrentValueConverted - hTotalCostConverted;
      const hUnrealizedPLPercent = hTotalCostConverted > 0 ? (hUnrealizedPLConverted / hTotalCostConverted) * 100 : 0;

      totalCostConverted += hTotalCostConverted;
      currentValueConverted += hCurrentValueConverted;

      return {
        id: h.id,
        userId: h.userId,
        ticker: h.ticker,
        shares: h.shares,
        averagePrice: avgPriceConverted,
        updatedAt: h.updatedAt,
        currentPrice: livePriceInView,
        currentValue: hCurrentValueConverted,
        totalCost: hTotalCostConverted,
        unrealizedPL: hUnrealizedPLConverted,
        unrealizedPLPercent: hUnrealizedPLPercent,
      };
    }));

    const unrealizedPL = currentValueConverted - totalCostConverted;
    const unrealizedPLPercent = totalCostConverted > 0 ? (unrealizedPL / totalCostConverted) * 100 : 0;

    // Daily Logs and Win Rate computations
    const totalDaysCount = userLogs.length;
    const profitableDaysCount = userLogs.filter((l) => l.profitLoss > 0).length;
    const winRate = totalDaysCount > 0 ? (profitableDaysCount / totalDaysCount) * 100 : 0;

    // Chronological logs for cumulative performance graph
    const sortedLogs = [...userLogs].sort((a, b) => a.date.localeCompare(b.date));
    let cumulativeProfit = 0;
    const chartData: ChartDataPoint[] = sortedLogs.map((log) => {
      const profitLossConverted = log.profitLoss * conversionFactor;
      cumulativeProfit += profitLossConverted;
      return {
        date: log.date,
        profitLoss: profitLossConverted,
        cumulativeProfit,
      };
    });

    // Asset Allocation data
    const allocationData: AllocationData[] = enrichedHoldings.map((h) => {
      const percentage = currentValueConverted > 0 ? ((h.currentValue || 0) / currentValueConverted) * 100 : 0;
      return {
        name: h.ticker,
        value: h.currentValue || 0,
        percentage,
      };
    });

    const stats = {
      totalPortfolioValue: currentValueConverted + cashBalanceConverted,
      cashBalance: cashBalanceConverted,
      totalCost: totalCostConverted,
      unrealizedPL,
      unrealizedPLPercent,
      winRate,
      profitableDaysCount,
      totalDaysCount,
      recentPLChange: (userLogs[0]?.profitLoss ?? 0) * conversionFactor,
      currency: viewCurrency,
      fxRate,
      isPublic: user?.isPublic ?? true,
    };

    return {
      stats,
      holdings: enrichedHoldings,
      dailyLogs: userLogs.map(l => ({
        ...l,
        profitLoss: l.profitLoss * conversionFactor,
        createdAt: new Date(l.createdAt),
      })),
      chartData,
      allocationData,
      trades: userTrades.map(t => ({
        ...t,
        price: t.price * conversionFactor,
        type: t.type as 'BUY' | 'SELL',
        createdAt: new Date(t.createdAt),
      })),
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return null;
  }
}

export async function updateFundsAction(prevState: any, formData: FormData) {
  try {
    const userIdRaw = await getUserIdOrThrow();
    const userId = Number(userIdRaw);
    console.log(`[updateFundsAction] userId: ${userId} (${typeof userIdRaw} -> ${typeof userId})`);

    const amount = parseFloat(formData.get('amount') as string);
    const actionType = formData.get('actionType') as 'ADD' | 'SET';

    if (isNaN(amount) || amount < 0) {
      return { error: 'Please enter a valid positive number.' };
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      console.warn(`[updateFundsAction] User with ID ${userId} not found in database.`);
      return { error: 'User not found. Your session may be stale due to a database reset. Please log out and log in again.' };
    }

    let newBalance = user.cashBalance;
    if (actionType === 'ADD') {
      newBalance += amount;
    } else {
      newBalance = amount;
    }

    await db.update(users)
      .set({ cashBalance: newBalance })
      .where(eq(users.id, userId));

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/settings');
    return { success: true };
  } catch (error: any) {
    console.error('Update funds error:', error);
    return { error: error.message || 'Something went wrong.' };
  }
}

export async function getAllPortfoliosAction(): Promise<PublicPortfolio[]> {
  try {
    const session = await getSession();
    if (!session) return [];

    // Only fetch users who have set their portfolios to public
    const currentUserId = Number(session.userId);

    // Only fetch users who have set their portfolios to public AND are not the current user
    const allUsers = await db.query.users.findMany({
      where: and(eq(users.isPublic, true), ne(users.id, currentUserId)),
    });
    const fxRate = await fetchFxRate();

    const portfolios = await Promise.all(
      allUsers.map(async (u) => {
        const userHoldings = await db.query.holdings.findMany({
          where: eq(holdings.userId, u.id),
        });

        let assetValue = 0;
        const tickers: string[] = [];

        for (const h of userHoldings) {
          const liveData = await fetchStockPrice(h.ticker);
          let priceInCAD = liveData.price;
          if (liveData.currency === 'USD') {
            priceInCAD = liveData.price * fxRate;
          }
          assetValue += h.shares * priceInCAD;
          tickers.push(h.ticker.toUpperCase());
        }

        return {
          userId: u.id,
          name: u.name,
          email: u.email,
          totalPortfolioValue: assetValue + u.cashBalance,
          cashBalance: u.cashBalance,
          holdingsCount: userHoldings.length,
          holdingsSummary: Array.from(new Set(tickers)),
        };
      })
    );

    return portfolios.sort((a, b) => b.totalPortfolioValue - a.totalPortfolioValue);
  } catch (error) {
    console.error('Error fetching all portfolios:', error);
    return [];
  }
}

export async function getFxRateAction(): Promise<number> {
  return await fetchFxRate();
}

export async function updatePrivacyAction(prevState: any, formData: FormData) {
  try {
    const userId = await getUserIdOrThrow();
    const isPublic = formData.get('isPublic') === 'true';

    await db.update(users)
      .set({ isPublic })
      .where(eq(users.id, userId));

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/settings');
    revalidatePath('/dashboard/portfolios');
    return { success: true };
  } catch (error: any) {
    console.error('Update privacy error:', error);
    return { error: error.message || 'Something went wrong.' };
  }
}

export async function getPublicPortfolioDetailsAction(userId: number): Promise<PublicPortfolioDetails | null> {
  try {
    const session = await getSession();
    if (!session) return null;

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user || !user.isPublic) {
      return null;
    }

    const fxRate = await fetchFxRate();
    const userHoldings = await db.query.holdings.findMany({
      where: eq(holdings.userId, userId),
    });

    let totalCost = 0;
    let currentValue = 0;

    const enrichedHoldings: Holding[] = await Promise.all(
      userHoldings.map(async (h) => {
        const tickerUpper = h.ticker.toUpperCase();
        const liveData = await fetchStockPrice(tickerUpper);

        let priceInCAD = liveData.price;
        if (liveData.currency === 'USD') {
          priceInCAD = liveData.price * fxRate;
        }

        const hTotalCost = h.shares * h.averagePrice;
        const hCurrentValue = h.shares * priceInCAD;
        const hUnrealizedPL = hCurrentValue - hTotalCost;
        const hUnrealizedPLPercent = hTotalCost > 0 ? (hUnrealizedPL / hTotalCost) * 100 : 0;

        totalCost += hTotalCost;
        currentValue += hCurrentValue;

        return {
          id: h.id,
          userId: h.userId,
          ticker: h.ticker,
          shares: h.shares,
          averagePrice: h.averagePrice,
          updatedAt: h.updatedAt,
          currentPrice: priceInCAD,
          currentValue: hCurrentValue,
          totalCost: hTotalCost,
          unrealizedPL: hUnrealizedPL,
          unrealizedPLPercent: hUnrealizedPLPercent,
        };
      })
    );

    const unrealizedPL = currentValue - totalCost;
    const unrealizedPLPercent = totalCost > 0 ? (unrealizedPL / totalCost) * 100 : 0;

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isPublic: user.isPublic,
      },
      stats: {
        totalPortfolioValue: currentValue + user.cashBalance,
        cashBalance: user.cashBalance,
        totalCost,
        unrealizedPL,
        unrealizedPLPercent,
        fxRate,
      },
      holdings: enrichedHoldings,
    };
  } catch (error) {
    console.error('Error fetching public portfolio details:', error);
    return null;
  }
}




