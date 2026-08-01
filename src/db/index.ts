import { drizzle as drizzleLibsql } from 'drizzle-orm/libsql';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { createClient } from '@libsql/client';
import { Pool } from 'pg';
import * as schema from './schema';
import * as postgresSchema from './schema.postgres';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const url = process.env.DATABASE_URL || 'file:local.db';
const driver = (process.env.DATABASE_DRIVER || (
  url.startsWith('postgres') || url.startsWith('postgresql') ? 'postgres' : 'sqlite'
)).toLowerCase();

let pgPoolInstance: Pool | null = null;
let sqliteClientInstance: any = null;

function initDb() {
  if (driver === 'postgres') {
    console.log('[Database Factory] Initializing PostgreSQL Driver...');
    pgPoolInstance = new Pool({
      connectionString: url,
      ssl: url.includes('localhost') || url.includes('127.0.0.1') ? false : { rejectUnauthorized: false },
    });
    return drizzlePg(pgPoolInstance, { schema: postgresSchema }) as any;
  }

  console.log('[Database Factory] Initializing SQLite / LibSQL Driver...');
  const authToken = process.env.DATABASE_AUTH_TOKEN;
  sqliteClientInstance = createClient({ url, authToken });
  return drizzleLibsql(sqliteClientInstance, { schema }) as any;
}

export const db = initDb();
export type DbType = typeof db;
export * from './schema';

// Automatic Table Creation and Admin Seeder
export async function ensureTablesAndAdminSeeded() {
  try {
    if (driver === 'postgres' && pgPoolInstance) {
      // Execute PostgreSQL table creation DDL statements
      await pgPoolInstance.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'user',
          cash_balance DOUBLE PRECISION NOT NULL DEFAULT 0,
          is_public BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS holdings (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          ticker TEXT NOT NULL,
          shares DOUBLE PRECISION NOT NULL,
          average_price DOUBLE PRECISION NOT NULL,
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS trades (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          ticker TEXT NOT NULL,
          type TEXT NOT NULL,
          shares DOUBLE PRECISION NOT NULL,
          price DOUBLE PRECISION NOT NULL,
          currency TEXT NOT NULL DEFAULT 'USD',
          date TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS daily_logs (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          date TEXT NOT NULL,
          profit_loss DOUBLE PRECISION NOT NULL,
          note TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS weekly_reports (
          id SERIAL PRIMARY KEY,
          report_data TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS stock_strategy_predictions (
          id SERIAL PRIMARY KEY,
          ticker TEXT NOT NULL,
          prediction_data TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS watchlist (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          ticker TEXT NOT NULL,
          added_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS stock_chart_candles (
          id SERIAL PRIMARY KEY,
          ticker TEXT NOT NULL,
          range TEXT NOT NULL,
          candle_data TEXT NOT NULL,
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        ALTER TABLE users ADD COLUMN IF NOT EXISTS cash_balance_cad DOUBLE PRECISION NOT NULL DEFAULT 0;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS cash_balance_usd DOUBLE PRECISION NOT NULL DEFAULT 0;
      `);
      console.log('[Auto-Initializer] PostgreSQL tables verified/created successfully.');
    } else if (driver === 'sqlite' && sqliteClientInstance) {
      // Execute SQLite table creation DDL statements
      await sqliteClientInstance.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'user',
          cash_balance REAL NOT NULL DEFAULT 0,
          cash_balance_cad REAL NOT NULL DEFAULT 0,
          cash_balance_usd REAL NOT NULL DEFAULT 0,
          is_public INTEGER NOT NULL DEFAULT 1,
          created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
        );
      `);

      try { await sqliteClientInstance.execute(`ALTER TABLE users ADD COLUMN cash_balance_cad REAL NOT NULL DEFAULT 0;`); } catch (e) {}
      try { await sqliteClientInstance.execute(`ALTER TABLE users ADD COLUMN cash_balance_usd REAL NOT NULL DEFAULT 0;`); } catch (e) {}
      await sqliteClientInstance.execute(`
        CREATE TABLE IF NOT EXISTS holdings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          ticker TEXT NOT NULL,
          shares REAL NOT NULL,
          average_price REAL NOT NULL,
          updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
        );
      `);
      await sqliteClientInstance.execute(`
        CREATE TABLE IF NOT EXISTS trades (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          ticker TEXT NOT NULL,
          type TEXT NOT NULL,
          shares REAL NOT NULL,
          price REAL NOT NULL,
          currency TEXT NOT NULL DEFAULT 'USD',
          date TEXT NOT NULL,
          created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
        );
      `);
      await sqliteClientInstance.execute(`
        CREATE TABLE IF NOT EXISTS daily_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          date TEXT NOT NULL,
          profit_loss REAL NOT NULL,
          note TEXT,
          created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
        );
      `);
      await sqliteClientInstance.execute(`
        CREATE TABLE IF NOT EXISTS weekly_reports (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          report_data TEXT NOT NULL,
          created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
        );
      `);
      await sqliteClientInstance.execute(`
        CREATE TABLE IF NOT EXISTS stock_strategy_predictions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ticker TEXT NOT NULL,
          prediction_data TEXT NOT NULL,
          created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
        );
      `);
      await sqliteClientInstance.execute(`
        CREATE TABLE IF NOT EXISTS watchlist (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          ticker TEXT NOT NULL,
          added_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
        );
      `);
      await sqliteClientInstance.execute(`
        CREATE TABLE IF NOT EXISTS stock_chart_candles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ticker TEXT NOT NULL,
          range TEXT NOT NULL,
          candle_data TEXT NOT NULL,
          updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
        );
      `);
      console.log('[Auto-Initializer] SQLite tables verified/created successfully.');
    }

    // Seed default admin user
    const adminEmail = 'admin@trading.com';
    const targetTable = driver === 'postgres' ? (postgresSchema.users as any) : (schema.users as any);
    const existingAdmin = await db.query.users.findFirst({
      where: eq(targetTable.email, adminEmail),
    });

    if (!existingAdmin) {
      console.log('[Auto-Seeder] Seeding default admin user into database...');
      const passwordHash = bcrypt.hashSync('admin', 10);
      await db.insert(targetTable).values({
        name: 'Default Admin',
        email: adminEmail,
        passwordHash,
        role: 'admin',
        cashBalance: 10000,
        cashBalanceCad: 10000,
        cashBalanceUsd: 5000,
        isPublic: true,
      });
      console.log('[Auto-Seeder] Default admin user successfully seeded!');
    } else {
      // Migrate existing admin/users if cashBalanceCad or cashBalanceUsd are 0
      if ((!existingAdmin.cashBalanceCad || existingAdmin.cashBalanceCad === 0) && (!existingAdmin.cashBalanceUsd || existingAdmin.cashBalanceUsd === 0) && existingAdmin.cashBalance > 0) {
        await db.update(targetTable)
          .set({
            cashBalanceCad: existingAdmin.cashBalance,
            cashBalanceUsd: 5000,
          })
          .where(eq(targetTable.id, existingAdmin.id));
      }
      console.log('[Auto-Seeder] Default admin user verified.');
    }
  } catch (error) {
    console.error('[Auto-Initializer] Error during table setup or seeding:', error);
  }
}

// Automatically trigger setup and seeding on module import
ensureTablesAndAdminSeeded().catch(console.error);
