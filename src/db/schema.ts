import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['admin', 'user'] }).default('user').notNull(),
  cashBalance: real('cash_balance').default(0).notNull(),
  isPublic: integer('is_public', { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(strftime('%s', 'now') * 1000)`)
    .notNull(),
});

export const holdings = sqliteTable('holdings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  ticker: text('ticker').notNull(),
  shares: real('shares').notNull(),
  averagePrice: real('average_price').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .default(sql`(strftime('%s', 'now') * 1000)`)
    .notNull(),
});

export const trades = sqliteTable('trades', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  ticker: text('ticker').notNull(),
  type: text('type', { enum: ['BUY', 'SELL'] }).notNull(),
  shares: real('shares').notNull(),
  price: real('price').notNull(),
  currency: text('currency', { enum: ['USD', 'CAD'] }).default('USD').notNull(),
  date: text('date').notNull(), // Format: YYYY-MM-DD
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(strftime('%s', 'now') * 1000)`)
    .notNull(),
});

export const dailyLogs = sqliteTable('daily_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  date: text('date').notNull(), // Format: YYYY-MM-DD
  profitLoss: real('profit_loss').notNull(),
  note: text('note'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(strftime('%s', 'now') * 1000)`)
    .notNull(),
});
