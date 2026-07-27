import { pgTable, serial, text, doublePrecision, boolean, timestamp, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').default('user').notNull(),
  cashBalance: doublePrecision('cash_balance').default(0).notNull(),
  isPublic: boolean('is_public').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const holdings = pgTable('holdings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  ticker: text('ticker').notNull(),
  shares: doublePrecision('shares').notNull(),
  averagePrice: doublePrecision('average_price').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const trades = pgTable('trades', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  ticker: text('ticker').notNull(),
  type: text('type').notNull(),
  shares: doublePrecision('shares').notNull(),
  price: doublePrecision('price').notNull(),
  currency: text('currency').default('USD').notNull(),
  date: text('date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const dailyLogs = pgTable('daily_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  profitLoss: doublePrecision('profit_loss').notNull(),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const weeklyReports = pgTable('weekly_reports', {
  id: serial('id').primaryKey(),
  reportData: text('report_data').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const stockStrategyPredictions = pgTable('stock_strategy_predictions', {
  id: serial('id').primaryKey(),
  ticker: text('ticker').notNull(),
  predictionData: text('prediction_data').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const watchlist = pgTable('watchlist', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  ticker: text('ticker').notNull(),
  addedAt: timestamp('added_at').defaultNow().notNull(),
});

export const stockChartCandles = pgTable('stock_chart_candles', {
  id: serial('id').primaryKey(),
  ticker: text('ticker').notNull(),
  range: text('range').notNull(),
  candleData: text('candle_data').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
