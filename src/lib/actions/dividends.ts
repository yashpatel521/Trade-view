'use server';

import { db } from '@/db';
import { holdings } from '@/db/schema';
import * as postgresSchema from '@/db/schema.postgres';
import { eq } from 'drizzle-orm';
import { DividendHolding, DividendTrackerData, MonthlyDividendDistribution } from '@/types/trading';
import { fetchFxRate, fetchStockPrice } from './market';
import { getUserIdOrThrow } from './portfolio';

// Fallback dividend yield & frequency database map for common tickers
const DIVIDEND_PRESETS: Record<
  string,
  { yieldPct: number; freq: 'Monthly' | 'Quarterly'; exDate: string }
> = {
  'RY.TO': { yieldPct: 3.85, freq: 'Quarterly', exDate: '2026-08-26' },
  'TD.TO': { yieldPct: 4.62, freq: 'Quarterly', exDate: '2026-09-08' },
  'BNS.TO': { yieldPct: 5.82, freq: 'Quarterly', exDate: '2026-09-02' },
  'ENB.TO': { yieldPct: 6.45, freq: 'Quarterly', exDate: '2026-08-14' },
  'SHOP.TO': { yieldPct: 0.0, freq: 'Quarterly', exDate: 'N/A' },
  AAPL: { yieldPct: 0.55, freq: 'Quarterly', exDate: '2026-08-11' },
  MSFT: { yieldPct: 0.72, freq: 'Quarterly', exDate: '2026-08-20' },
  NVDA: { yieldPct: 0.08, freq: 'Quarterly', exDate: '2026-09-11' },
  AVGO: { yieldPct: 1.35, freq: 'Quarterly', exDate: '2026-09-18' },
  CRWD: { yieldPct: 0.0, freq: 'Quarterly', exDate: 'N/A' },
  SPCX: { yieldPct: 0.0, freq: 'Quarterly', exDate: 'N/A' },
  'TQQQ.TO': { yieldPct: 1.25, freq: 'Quarterly', exDate: '2026-09-22' },
  TQQQ: { yieldPct: 1.18, freq: 'Quarterly', exDate: '2026-09-22' },
  O: { yieldPct: 5.42, freq: 'Monthly', exDate: '2026-08-30' },
  MAIN: { yieldPct: 6.15, freq: 'Monthly', exDate: '2026-08-20' },
  XOM: { yieldPct: 3.35, freq: 'Quarterly', exDate: '2026-08-12' },
  JNJ: { yieldPct: 3.12, freq: 'Quarterly', exDate: '2026-08-25' },
  PG: { yieldPct: 2.38, freq: 'Quarterly', exDate: '2026-08-18' },
  KO: { yieldPct: 3.05, freq: 'Quarterly', exDate: '2026-09-14' },
  PEP: { yieldPct: 3.15, freq: 'Quarterly', exDate: '2026-09-05' },
};

export async function getDividendTrackerDataAction(): Promise<DividendTrackerData | null> {
  try {
    const userId = await getUserIdOrThrow();
    const fxRate = await fetchFxRate();

    const driver = (process.env.DATABASE_DRIVER || '').toLowerCase();
    const targetHoldings = driver === 'postgres' ? (postgresSchema.holdings as any) : (holdings as any);

    const userHoldings = await db
      .select()
      .from(targetHoldings)
      .where(eq(targetHoldings.userId, userId));

    if (!userHoldings || userHoldings.length === 0) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return {
        annualIncomeCad: 0,
        annualIncomeUsd: 0,
        monthlyIncomeCad: 0,
        monthlyIncomeUsd: 0,
        weightedYieldPercent: 0,
        upcomingExDate: null,
        monthlyDistributions: monthNames.map((month) => ({ month, amountCad: 0, amountUsd: 0 })),
        holdings: [],
        fxRate,
      };
    }

    const dividendHoldings: DividendHolding[] = [];
    let totalPortfolioValueCad = 0;
    let totalAnnualIncomeCad = 0;
    let totalAnnualIncomeUsd = 0;

    let closestExDate: { ticker: string; date: string; daysLeft: number } | null = null;
    const today = new Date();

    for (const h of userHoldings) {
      const tickerUpper = (h.ticker || '').toUpperCase().trim();
      const shares = Number(h.shares) || 0;
      if (shares <= 0) continue;

      const priceDetails = await fetchStockPrice(tickerUpper);
      const currentPrice = priceDetails.price > 0 ? priceDetails.price : Number(h.averagePrice) || 100;
      const isCanadian = tickerUpper.endsWith('.TO') || tickerUpper.endsWith('.V') || tickerUpper.endsWith('.CN');
      const currency: 'USD' | 'CAD' = isCanadian ? 'CAD' : 'USD';

      const preset = DIVIDEND_PRESETS[tickerUpper] || {
        yieldPct: isCanadian ? 3.25 : 1.85,
        freq: 'Quarterly',
        exDate: '2026-08-28',
      };

      const dividendYield = preset.yieldPct;
      const annualDividendPerShare = (currentPrice * dividendYield) / 100;
      const estimatedAnnualIncome = shares * annualDividendPerShare;
      const estimatedMonthlyIncome = estimatedAnnualIncome / 12;

      const holdingValueNative = shares * currentPrice;
      const holdingValueCad = currency === 'USD' ? holdingValueNative * fxRate : holdingValueNative;
      totalPortfolioValueCad += holdingValueCad;

      if (currency === 'USD') {
        totalAnnualIncomeUsd += estimatedAnnualIncome;
      } else {
        totalAnnualIncomeCad += estimatedAnnualIncome;
      }

      if (preset.exDate && preset.exDate !== 'N/A') {
        const exDateObj = new Date(preset.exDate);
        if (!isNaN(exDateObj.getTime())) {
          const diffMs = exDateObj.getTime() - today.getTime();
          const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          if (daysLeft >= 0 && (!closestExDate || daysLeft < closestExDate.daysLeft)) {
            closestExDate = { ticker: tickerUpper, date: preset.exDate, daysLeft };
          }
        }
      }

      dividendHoldings.push({
        ticker: tickerUpper,
        shares,
        currentPrice,
        currency,
        annualDividendPerShare,
        dividendYield,
        payoutFrequency: preset.freq,
        exDividendDate: preset.exDate,
        estimatedAnnualIncome,
        estimatedMonthlyIncome,
      });
    }

    dividendHoldings.sort((a, b) => b.estimatedAnnualIncome - a.estimatedAnnualIncome);

    const totalAnnualIncomeCadCombined = totalAnnualIncomeCad + (totalAnnualIncomeUsd * fxRate);
    const weightedYieldPercent = totalPortfolioValueCad > 0 ? (totalAnnualIncomeCadCombined / totalPortfolioValueCad) * 100 : 0;

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyDistributions: MonthlyDividendDistribution[] = monthNames.map((month) => ({
      month,
      amountCad: 0,
      amountUsd: 0,
    }));

    dividendHoldings.forEach((dh) => {
      if (dh.estimatedAnnualIncome <= 0) return;

      if (dh.payoutFrequency === 'Monthly') {
        const perMonth = dh.estimatedAnnualIncome / 12;
        monthlyDistributions.forEach((m) => {
          if (dh.currency === 'USD') m.amountUsd += perMonth;
          else m.amountCad += perMonth;
        });
      } else {
        const perQuarter = dh.estimatedAnnualIncome / 4;
        const targetMonthIndices = dh.ticker.length % 2 === 0 ? [1, 4, 7, 10] : [2, 5, 8, 11];
        targetMonthIndices.forEach((idx) => {
          if (dh.currency === 'USD') monthlyDistributions[idx].amountUsd += perQuarter;
          else monthlyDistributions[idx].amountCad += perQuarter;
        });
      }
    });

    return {
      annualIncomeCad: totalAnnualIncomeCad,
      annualIncomeUsd: totalAnnualIncomeUsd,
      monthlyIncomeCad: totalAnnualIncomeCad / 12,
      monthlyIncomeUsd: totalAnnualIncomeUsd / 12,
      weightedYieldPercent,
      upcomingExDate: closestExDate,
      monthlyDistributions,
      holdings: dividendHoldings,
      fxRate,
    };
  } catch (err) {
    console.error('Error fetching dividend tracker data:', err);
    return null;
  }
}
