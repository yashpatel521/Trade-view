'use server';

import { db } from '@/db';
import { holdings, trades, dailyLogs, users } from '@/db/schema';
import * as postgresSchema from '@/db/schema.postgres';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { fetchFxRate, fetchStockPrice } from './market';
import { getUserIdOrThrow } from './portfolio';

export interface CsvImportRecord {
  ticker: string;
  type: 'BUY' | 'SELL';
  shares: number;
  price: number;
  date: string;
  currency?: 'USD' | 'CAD';
}

export type CsvTradeImportRecord = CsvImportRecord;

export async function importPortfolioCsvAction(
  records: CsvImportRecord[],
  resetPortfolio: boolean = false,
  initialCadCash: number = 10000,
  initialUsdCash: number = 0
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const userId = await getUserIdOrThrow();
    if (!Array.isArray(records) || records.length === 0) {
      return { success: false, error: 'No valid CSV trade records provided for import.' };
    }

    const driver = (process.env.DATABASE_DRIVER || '').toLowerCase();
    const targetUsers = driver === 'postgres' ? (postgresSchema.users as any) : (users as any);
    const targetHoldings = driver === 'postgres' ? (postgresSchema.holdings as any) : (holdings as any);
    const targetTrades = driver === 'postgres' ? (postgresSchema.trades as any) : (trades as any);
    const targetDailyLogs = driver === 'postgres' ? (postgresSchema.dailyLogs as any) : (dailyLogs as any);

    const fxRate = await fetchFxRate();

    if (resetPortfolio) {
      await db.delete(targetTrades).where(eq(targetTrades.userId, userId));
      await db.delete(targetHoldings).where(eq(targetHoldings.userId, userId));
      await db.delete(targetDailyLogs).where(eq(targetDailyLogs.userId, userId));
    }

    let processedCount = 0;

    for (const rec of records) {
      const ticker = (rec.ticker || '').toUpperCase().trim();
      const type = rec.type === 'SELL' ? 'SELL' : 'BUY';
      const shares = Math.abs(Number(rec.shares)) || 0;
      const price = Math.abs(Number(rec.price)) || 0;
      const date = (rec.date || new Date().toISOString().split('T')[0]).trim();

      if (!ticker || shares <= 0 || price <= 0) continue;

      const isCanadian = ticker.endsWith('.TO') || ticker.endsWith('.V') || ticker.endsWith('.CN');
      const currency: 'USD' | 'CAD' = isCanadian ? 'CAD' : 'USD';
      const tradeTotalInCurrency = shares * price;

      const userRecords = await db
        .select()
        .from(targetUsers)
        .where(eq(targetUsers.id, userId))
        .limit(1);

      const user = userRecords[0];
      if (user) {
        let cadBalance = typeof user.cashBalanceCad === 'number' && (user.cashBalanceCad > 0 || (user.cashBalanceUsd && user.cashBalanceUsd > 0))
          ? user.cashBalanceCad
          : (typeof user.cashBalance === 'number' ? user.cashBalance : 0);
        let usdBalance = typeof user.cashBalanceUsd === 'number' ? user.cashBalanceUsd : 0;

        if (currency === 'USD') {
          usdBalance = type === 'BUY' ? usdBalance - tradeTotalInCurrency : usdBalance + tradeTotalInCurrency;
        } else {
          cadBalance = type === 'BUY' ? cadBalance - tradeTotalInCurrency : cadBalance + tradeTotalInCurrency;
        }

        await db.update(targetUsers)
          .set({
            cashBalanceCad: cadBalance,
            cashBalanceUsd: usdBalance,
            cashBalance: cadBalance + (usdBalance * fxRate),
          })
          .where(eq(targetUsers.id, userId));
      }

      await db.insert(targetTrades).values({
        userId,
        ticker,
        type,
        shares,
        price,
        currency,
        date,
      });

      const existingHoldingRecords = await db
        .select()
        .from(targetHoldings)
        .where(and(eq(targetHoldings.userId, userId), eq(targetHoldings.ticker, ticker)))
        .limit(1);

      const existingHolding = existingHoldingRecords[0];

      if (type === 'BUY') {
        if (existingHolding) {
          const newShares = existingHolding.shares + shares;
          const newAvgPrice = ((existingHolding.shares * existingHolding.averagePrice) + (shares * price)) / newShares;
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
      } else {
        if (existingHolding) {
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
      }

      processedCount++;
    }

    if (resetPortfolio) {
      const finalCad = typeof initialCadCash === 'number' && !isNaN(initialCadCash) ? Math.max(0, initialCadCash) : 10000;
      const finalUsd = typeof initialUsdCash === 'number' && !isNaN(initialUsdCash) ? Math.max(0, initialUsdCash) : 0;

      await db.update(targetUsers)
        .set({
          cashBalanceCad: finalCad,
          cashBalanceUsd: finalUsd,
          cashBalance: finalCad + (finalUsd * fxRate),
        })
        .where(eq(targetUsers.id, userId));
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/stocks');
    revalidatePath('/dashboard/journal');
    revalidatePath('/dashboard/watchlist');
    revalidatePath('/dashboard/import');

    return {
      success: true,
      count: processedCount,
    };
  } catch (err: any) {
    console.error('Error importing portfolio CSV:', err);
    return { success: false, error: err?.message || 'Failed to import portfolio CSV records.' };
  }
}
