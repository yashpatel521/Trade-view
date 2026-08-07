'use server';

import { db } from '@/db';
import { holdings, trades, dailyLogs, users } from '@/db/schema';
import * as postgresSchema from '@/db/schema.postgres';
import { eq, and, ne } from 'drizzle-orm';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { PublicPortfolio, PublicPortfolioDetails, Holding } from '@/types/trading';
import { fetchFxRate, fetchStockPrice } from './market';
import { getUserIdOrThrow } from './portfolio';

export async function updateFundsAction(prevState: any, formData: FormData) {
  try {
    const userIdRaw = await getUserIdOrThrow();
    const userId = Number(userIdRaw);

    const amount = parseFloat(formData.get('amount') as string);
    const actionType = formData.get('actionType') as 'ADD' | 'SET';
    const currency = (formData.get('currency') as string) === 'USD' ? 'USD' : 'CAD';

    if (isNaN(amount) || amount < 0) {
      return { error: 'Please enter a valid positive number.' };
    }

    const driver = (process.env.DATABASE_DRIVER || '').toLowerCase();
    const targetUsers = driver === 'postgres' ? (postgresSchema.users as any) : (users as any);

    const userRecords = await db
      .select()
      .from(targetUsers)
      .where(eq(targetUsers.id, userId))
      .limit(1);

    const user = userRecords[0];

    if (!user) {
      return { error: 'User not found. Please log in again.' };
    }

    const fxRate = await fetchFxRate();
    let currentCad = typeof user.cashBalanceCad === 'number' && (user.cashBalanceCad > 0 || (user.cashBalanceUsd && user.cashBalanceUsd > 0))
      ? user.cashBalanceCad
      : (typeof user.cashBalance === 'number' ? user.cashBalance : 0);
    let currentUsd = typeof user.cashBalanceUsd === 'number' ? user.cashBalanceUsd : 0;

    if (currency === 'USD') {
      currentUsd = actionType === 'ADD' ? currentUsd + amount : amount;
    } else {
      currentCad = actionType === 'ADD' ? currentCad + amount : amount;
    }

    const totalCashCad = currentCad + (currentUsd * fxRate);

    await db.update(targetUsers)
      .set({
        cashBalanceCad: currentCad,
        cashBalanceUsd: currentUsd,
        cashBalance: totalCashCad,
      })
      .where(eq(targetUsers.id, userId));

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

    const currentUserId = Number(session.userId);

    const allUsers = await db.query.users.findMany({
      where: and(eq(users.isPublic, true), ne(users.id, currentUserId)),
    });
    const fxRate = await fetchFxRate();

    const portfolios = await Promise.all(
      allUsers.map(async (u: any) => {
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
      userHoldings.map(async (h: any) => {
        const tickerUpper = h.ticker.toUpperCase();
        const liveData = await fetchStockPrice(tickerUpper);

        let priceInCAD = liveData.price;
        let avgPriceInCAD = h.averagePrice;
        if (liveData.currency === 'USD') {
          priceInCAD = liveData.price * fxRate;
          avgPriceInCAD = h.averagePrice * fxRate;
        }

        const hTotalCost = h.shares * avgPriceInCAD;
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

export async function getCurrentUserRoleAction(): Promise<{ role: 'admin' | 'user'; isAdmin: boolean }> {
  try {
    const session = await getSession();
    const role = session?.role === 'admin' ? 'admin' : 'user';
    return { role, isAdmin: role === 'admin' };
  } catch {
    return { role: 'user', isAdmin: false };
  }
}

export async function resetUserDataAction(targetUserId?: number): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Unauthorized session. Please log in.' };
    }

    if (session.role !== 'admin') {
      return { success: false, error: 'Access denied. Only Administrator accounts can reset user portfolio data.' };
    }

    // Strictly target ONLY the specified user ID (or the current logged-in user ID)
    const userId = targetUserId ? Number(targetUserId) : Number(session.userId);
    const driver = (process.env.DATABASE_DRIVER || '').toLowerCase();
    const targetUsers = driver === 'postgres' ? (postgresSchema.users as any) : (users as any);
    const targetHoldings = driver === 'postgres' ? (postgresSchema.holdings as any) : (holdings as any);
    const targetTrades = driver === 'postgres' ? (postgresSchema.trades as any) : (trades as any);
    const targetDailyLogs = driver === 'postgres' ? (postgresSchema.dailyLogs as any) : (dailyLogs as any);

    // 1. Clear trade history for THIS user ONLY
    await db.delete(targetTrades).where(eq(targetTrades.userId, userId));

    // 2. Clear holdings for THIS user ONLY
    await db.delete(targetHoldings).where(eq(targetHoldings.userId, userId));

    // 3. Clear daily P&L logs for THIS user ONLY
    await db.delete(targetDailyLogs).where(eq(targetDailyLogs.userId, userId));

    // 4. Reset cash balances to 0 CAD / 0 USD for THIS user ONLY
    const defaultCad = 0;
    const defaultUsd = 0;

    await db.update(targetUsers)
      .set({
        cashBalanceCad: defaultCad,
        cashBalanceUsd: defaultUsd,
        cashBalance: 0,
      })
      .where(eq(targetUsers.id, userId));

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/stocks');
    revalidatePath('/dashboard/journal');
    revalidatePath('/dashboard/settings');
    revalidatePath('/dashboard/watchlist');

    return { success: true };
  } catch (err: any) {
    console.error('Error resetting user data:', err);
    return { success: false, error: err?.message || 'Failed to reset user portfolio data.' };
  }
}
