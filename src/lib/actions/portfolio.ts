'use server';

import { db } from '@/db';
import { holdings, trades, dailyLogs, users } from '@/db/schema';
import * as postgresSchema from '@/db/schema.postgres';
import { eq, and, desc } from 'drizzle-orm';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { DashboardData, Holding, DailyLog, ChartDataPoint, AllocationData } from '@/types/trading';
import { fetchFxRate, fetchStockPrice } from './market';

// Helper to fetch user ID or throw an error
export async function getUserIdOrThrow() {
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
    const isCanadian = ticker.endsWith('.TO') || ticker.endsWith('.V') || ticker.endsWith('.CN');
    const currency: 'USD' | 'CAD' = isCanadian ? 'CAD' : 'USD';

    if (!ticker || !type || isNaN(shares) || shares <= 0 || isNaN(price) || price <= 0 || !date) {
      return { error: 'Invalid input. Make sure values are positive numbers.' };
    }

    const driver = (process.env.DATABASE_DRIVER || '').toLowerCase();
    const targetUsers = driver === 'postgres' ? (postgresSchema.users as any) : (users as any);
    const targetHoldings = driver === 'postgres' ? (postgresSchema.holdings as any) : (holdings as any);
    const targetTrades = driver === 'postgres' ? (postgresSchema.trades as any) : (trades as any);

    // Retrieve user for cash balance validation and updates
    const userRecords = await db
      .select()
      .from(targetUsers)
      .where(eq(targetUsers.id, userId))
      .limit(1);

    const user = userRecords[0];

    if (!user) {
      return { error: 'User account not found. Please log in again.' };
    }

    // Calculate total trade cost/proceeds in CAD (base currency for cashBalance)
    const fxRate = await fetchFxRate();
    const tradeTotalInCurrency = shares * price;

    // Retrieve existing holding
    const holdingRecords = await db
      .select()
      .from(targetHoldings)
      .where(and(eq(targetHoldings.userId, userId), eq(targetHoldings.ticker, ticker)))
      .limit(1);

    const existingHolding = holdingRecords[0];

    const cadBalance = typeof user.cashBalanceCad === 'number' && (user.cashBalanceCad > 0 || (user.cashBalanceUsd && user.cashBalanceUsd > 0))
      ? user.cashBalanceCad
      : (typeof user.cashBalance === 'number' ? user.cashBalance : 0);
    const usdBalance = typeof user.cashBalanceUsd === 'number' ? user.cashBalanceUsd : 0;

    if (currency === 'USD') {
      if (type === 'BUY') {
        if (usdBalance < tradeTotalInCurrency) {
          const requiredStr = `$${tradeTotalInCurrency.toFixed(2)} USD`;
          const availableStr = `$${usdBalance.toFixed(2)} USD`;
          return {
            error: `Insufficient USD account balance to buy ${shares} share(s) of ${ticker}. Required: ${requiredStr}, Available: ${availableStr}. Please add USD funds under Settings first.`
          };
        }

        const newUsd = usdBalance - tradeTotalInCurrency;
        await db.update(targetUsers)
          .set({
            cashBalanceUsd: newUsd,
            cashBalanceCad: cadBalance,
            cashBalance: cadBalance + (newUsd * fxRate),
          })
          .where(eq(targetUsers.id, userId));
      } else { // SELL
        const newUsd = usdBalance + tradeTotalInCurrency;
        await db.update(targetUsers)
          .set({
            cashBalanceUsd: newUsd,
            cashBalanceCad: cadBalance,
            cashBalance: cadBalance + (newUsd * fxRate),
          })
          .where(eq(targetUsers.id, userId));
      }
    } else { // CAD
      if (type === 'BUY') {
        if (cadBalance < tradeTotalInCurrency) {
          const requiredStr = `$${tradeTotalInCurrency.toFixed(2)} CAD`;
          const availableStr = `$${cadBalance.toFixed(2)} CAD`;
          return {
            error: `Insufficient CAD account balance to buy ${shares} share(s) of ${ticker}. Required: ${requiredStr}, Available: ${availableStr}. Please add CAD funds under Settings first.`
          };
        }

        const newCad = cadBalance - tradeTotalInCurrency;
        await db.update(targetUsers)
          .set({
            cashBalanceCad: newCad,
            cashBalanceUsd: usdBalance,
            cashBalance: newCad + (usdBalance * fxRate),
          })
          .where(eq(targetUsers.id, userId));
      } else { // SELL
        const newCad = cadBalance + tradeTotalInCurrency;
        await db.update(targetUsers)
          .set({
            cashBalanceCad: newCad,
            cashBalanceUsd: usdBalance,
            cashBalance: newCad + (usdBalance * fxRate),
          })
          .where(eq(targetUsers.id, userId));
      }
    }

    if (type === 'BUY') {
      if (existingHolding) {
        // Average Price Calculation: Weighted Average
        const newShares = existingHolding.shares + shares;
        const newAvgPrice = 
          ((existingHolding.shares * existingHolding.averagePrice) + (shares * price)) / newShares;
        
        await db.update(targetHoldings)
          .set({
            shares: newShares,
            averagePrice: newAvgPrice,
            updatedAt: new Date(),
          })
          .where(eq(targetHoldings.id, existingHolding.id));
      } else {
        await db.insert(targetHoldings).values({
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
      if (newShares <= 0.000001) {
        await db.delete(targetHoldings).where(eq(targetHoldings.id, existingHolding.id));
      } else {
        await db.update(targetHoldings)
          .set({
            shares: newShares,
            updatedAt: new Date(),
          })
          .where(eq(targetHoldings.id, existingHolding.id));
      }
    }

    // Record this individual trade
    await db.insert(targetTrades).values({
      userId,
      ticker,
      type,
      shares,
      price,
      currency,
      date,
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/stocks');
    revalidatePath(`/dashboard/stocks/${ticker}`);
    revalidatePath('/dashboard/settings');
    return { success: true };
  } catch (error: any) {
    console.error('Add/Sell trade error:', error);
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

    // Server-side check for Saturday (6) and Sunday (0)
    const [y, m, d] = date.split('-').map(Number);
    const dayOfWeek = new Date(y, m - 1, d).getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return { error: 'Markets are closed on Saturday and Sunday. Journal entries are disabled for weekends.' };
    }

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

export async function checkAndAutoLogDailyJournal(userId: number) {
  try {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hour = now.getHours();

    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
    const isAfter5PM = hour >= 17;

    if (!isWeekday || !isAfter5PM) {
      return;
    }

    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const todayStr = `${y}-${m}-${d}`;

    const driver = (process.env.DATABASE_DRIVER || '').toLowerCase();
    const targetDailyLogs = driver === 'postgres' ? (postgresSchema.dailyLogs as any) : (dailyLogs as any);
    const targetHoldings = driver === 'postgres' ? (postgresSchema.holdings as any) : (holdings as any);

    const existing = await db
      .select()
      .from(targetDailyLogs)
      .where(and(eq(targetDailyLogs.userId, userId), eq(targetDailyLogs.date, todayStr)))
      .limit(1);

    if (existing && existing.length > 0) {
      return;
    }

    const userHoldings = await db
      .select()
      .from(targetHoldings)
      .where(eq(targetHoldings.userId, userId));

    const fxRate = await fetchFxRate();
    let totalUnrealizedPLInCAD = 0;

    for (const h of userHoldings) {
      const tickerUpper = h.ticker.toUpperCase();
      const liveData = await fetchStockPrice(tickerUpper);
      const isCanadian = tickerUpper.endsWith('.TO') || tickerUpper.endsWith('.V') || tickerUpper.endsWith('.CN');
      const nativePL = (liveData.price - h.averagePrice) * h.shares;
      const plInCAD = isCanadian ? nativePL : nativePL * fxRate;
      totalUnrealizedPLInCAD += plInCAD;
    }

    const autoPL = Math.round(totalUnrealizedPLInCAD * 100) / 100;

    await db.insert(targetDailyLogs).values({
      userId,
      date: todayStr,
      profitLoss: autoPL,
      note: 'Auto-logged weekday 5:00 PM market close P&L summary',
    });

    console.log(`[Auto-Journal] Created 5:00 PM weekday entry for user ${userId} on ${todayStr}: P&L ${autoPL} CAD`);
  } catch (err) {
    console.error('Error in checkAndAutoLogDailyJournal:', err);
  }
}

export async function getDailyLogsAction(): Promise<{ logs: DailyLog[]; todayAutoPL: number; todayAutoNote: string } | null> {
  try {
    const session = await getSession();
    if (!session) return null;
    const userId = session.userId as number;

    await checkAndAutoLogDailyJournal(userId);

    const driver = (process.env.DATABASE_DRIVER || '').toLowerCase();
    const targetDailyLogs = driver === 'postgres' ? (postgresSchema.dailyLogs as any) : (dailyLogs as any);
    const targetHoldings = driver === 'postgres' ? (postgresSchema.holdings as any) : (holdings as any);

    const logs = await db
      .select()
      .from(targetDailyLogs)
      .where(eq(targetDailyLogs.userId, userId))
      .orderBy(desc(targetDailyLogs.date));

    const userHoldings = await db
      .select()
      .from(targetHoldings)
      .where(eq(targetHoldings.userId, userId));

    const fxRate = await fetchFxRate();
    let totalUnrealizedPLInCAD = 0;
    const holdingNotesParts: string[] = [];

    for (const h of userHoldings) {
      if (!h.shares || h.shares <= 0) continue;
      const tickerUpper = h.ticker.toUpperCase();
      const liveData = await fetchStockPrice(tickerUpper);
      const isCanadian = tickerUpper.endsWith('.TO') || tickerUpper.endsWith('.V') || tickerUpper.endsWith('.CN');
      const nativePL = (liveData.price - h.averagePrice) * h.shares;
      const plInCAD = isCanadian ? nativePL : nativePL * fxRate;
      totalUnrealizedPLInCAD += plInCAD;

      const plStr = nativePL >= 0 ? `+$${nativePL.toFixed(2)}` : `-$${Math.abs(nativePL).toFixed(2)}`;
      holdingNotesParts.push(`${tickerUpper} (${plStr})`);
    }

    const todayAutoPL = Math.round(totalUnrealizedPLInCAD * 100) / 100;
    const todayAutoNote = holdingNotesParts.length > 0
      ? `Holdings: ${holdingNotesParts.join(', ')}`
      : 'No active holdings today';

    return {
      logs: logs.map((l: any) => ({
        id: l.id,
        userId: l.userId,
        date: l.date,
        profitLoss: l.profitLoss ?? 0,
        note: l.note ?? null,
        createdAt: l.createdAt,
      })),
      todayAutoPL,
      todayAutoNote,
    };
  } catch (error: any) {
    console.error('getDailyLogsAction error:', error);
    return null;
  }
}

export async function updateDailyLogNoteAction(id: number, note: string) {
  try {
    const userId = await getUserIdOrThrow();
    await db.update(dailyLogs)
      .set({ note: note.trim() || null })
      .where(and(eq(dailyLogs.id, id), eq(dailyLogs.userId, userId)));
    revalidatePath('/dashboard/journal');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Something went wrong.' };
  }
}

export async function getDashboardDataAction(viewCurrency: 'CAD' | 'USD' = 'CAD'): Promise<DashboardData | null> {
  try {
    const session = await getSession();
    if (!session) return null;
    const userId = session.userId;

    await checkAndAutoLogDailyJournal(userId);

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    const cadBalance = typeof user?.cashBalanceCad === 'number' && (user?.cashBalanceCad > 0 || (user?.cashBalanceUsd && user?.cashBalanceUsd > 0))
      ? user.cashBalanceCad
      : (typeof user?.cashBalance === 'number' ? user.cashBalance : 0);
    const usdBalance = typeof user?.cashBalanceUsd === 'number' ? user.cashBalanceUsd : 0;

    const userHoldings = await db.query.holdings.findMany({
      where: eq(holdings.userId, userId),
    });

    const userLogs = await db.query.dailyLogs.findMany({
      where: eq(dailyLogs.userId, userId),
      orderBy: [desc(dailyLogs.date)],
    });

    const userTrades = await db.query.trades.findMany({
      where: eq(trades.userId, userId),
      orderBy: [desc(trades.date)],
      limit: 10,
    });

    const fxRate = await fetchFxRate();
    const conversionFactor = viewCurrency === 'USD' ? (1 / fxRate) : 1;
    const totalCashCad = cadBalance + (usdBalance * fxRate);
    const cashBalanceConverted = viewCurrency === 'USD' ? totalCashCad / fxRate : totalCashCad;

    let totalCostConverted = 0;
    let currentValueConverted = 0;

    const enrichedHoldings: Holding[] = await Promise.all(userHoldings.map(async (h: any) => {
      const tickerUpper = h.ticker.toUpperCase();
      const liveData = await fetchStockPrice(tickerUpper);
      const isCanadian = tickerUpper.endsWith('.TO') || tickerUpper.endsWith('.V') || tickerUpper.endsWith('.CN');
      const nativeCurrency: 'USD' | 'CAD' = isCanadian ? 'CAD' : 'USD';
      const nativeAveragePrice = h.averagePrice;
      const nativeCurrentPrice = liveData.price;
      const nativeTotalCost = h.shares * nativeAveragePrice;
      const nativeCurrentValue = h.shares * nativeCurrentPrice;
      const nativeUnrealizedPL = nativeCurrentValue - nativeTotalCost;

      let livePriceInView = liveData.price;
      let avgPriceInView = h.averagePrice;

      if (nativeCurrency === 'USD' && viewCurrency === 'CAD') {
        livePriceInView = liveData.price * fxRate;
        avgPriceInView = h.averagePrice * fxRate;
      } else if (nativeCurrency === 'CAD' && viewCurrency === 'USD') {
        livePriceInView = liveData.price / fxRate;
        avgPriceInView = h.averagePrice / fxRate;
      }

      const hTotalCostConverted = h.shares * avgPriceInView;
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
        averagePrice: avgPriceInView,
        updatedAt: h.updatedAt,
        currentPrice: livePriceInView,
        currentValue: hCurrentValueConverted,
        totalCost: hTotalCostConverted,
        unrealizedPL: hUnrealizedPLConverted,
        unrealizedPLPercent: hUnrealizedPLPercent,
        nativeCurrency,
        nativeAveragePrice,
        nativeCurrentPrice,
        nativeTotalCost,
        nativeCurrentValue,
        nativeUnrealizedPL,
      };
    }));

    const unrealizedPL = currentValueConverted - totalCostConverted;
    const unrealizedPLPercent = totalCostConverted > 0 ? (unrealizedPL / totalCostConverted) * 100 : 0;

    const totalDaysCount = userLogs.length;
    const profitableDaysCount = userLogs.filter((l: any) => l.profitLoss > 0).length;
    const winRate = totalDaysCount > 0 ? (profitableDaysCount / totalDaysCount) * 100 : 0;

    const sortedLogs = [...userLogs].sort((a, b) => a.date.localeCompare(b.date));
    let cumulativeProfit = 0;
    const chartData: ChartDataPoint[] = sortedLogs.map((log: any) => {
      const profitLossConverted = log.profitLoss * conversionFactor;
      cumulativeProfit += profitLossConverted;
      return {
        date: log.date,
        profitLoss: profitLossConverted,
        cumulativeProfit,
      };
    });

    const allocationData: AllocationData[] = enrichedHoldings.map((h: any) => {
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
      cashBalanceCad: cadBalance,
      cashBalanceUsd: usdBalance,
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
      dailyLogs: userLogs.map((l: any) => ({
        ...l,
        profitLoss: l.profitLoss * conversionFactor,
        createdAt: new Date(l.createdAt),
      })),
      chartData,
      allocationData,
      trades: userTrades.map((t: any) => ({
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
