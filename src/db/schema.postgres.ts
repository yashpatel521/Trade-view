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
