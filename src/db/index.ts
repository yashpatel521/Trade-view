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
  url.startsWith('postgres') ? 'postgres' : url.startsWith('mongodb') ? 'mongodb' : 'sqlite'
)).toLowerCase();

function initDb() {
  if (driver === 'postgres') {
    console.log('[Database Factory] Initializing PostgreSQL Driver...');
    const pool = new Pool({ connectionString: url });
    return drizzlePg(pool, { schema: postgresSchema }) as any;
  }
  
  if (driver === 'mongodb') {
    console.log('[Database Factory] Initializing MongoDB Adapter...');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createMongoDbAdapter } = require('./mongo.adapter');
    return createMongoDbAdapter(url) as any;
  }

  console.log('[Database Factory] Initializing SQLite / LibSQL Driver...');
  const authToken = process.env.DATABASE_AUTH_TOKEN;
  const client = createClient({ url, authToken });
  return drizzleLibsql(client, { schema }) as any;
}

export const db = initDb();
export type DbType = typeof db;
export * from './schema';

// Seeding logic for default admin user
async function seedAdminUser() {
  try {
    const adminEmail = 'admin@trading.com';
    const existingAdmin = await db.query.users.findFirst({
      where: eq(schema.users.email as any, adminEmail),
    });

    if (!existingAdmin) {
      console.log('Seeding default admin user...');
      const passwordHash = bcrypt.hashSync('admin', 10);
      await db.insert(schema.users).values({
        name: 'Default Admin',
        email: adminEmail,
        passwordHash,
        role: 'admin',
      });
      console.log('Default admin user successfully seeded!');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
}

// Trigger seeding in the background of module load
seedAdminUser().catch(console.error);
