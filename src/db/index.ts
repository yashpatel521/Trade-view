import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const url = process.env.DATABASE_URL || 'file:local.db';
const authToken = process.env.DATABASE_AUTH_TOKEN;

const client = createClient({ url, authToken });

export const db = drizzle(client, { schema });
export type DbType = typeof db;
export * from './schema';

// Seeding logic for default admin user
async function seedAdminUser() {
  try {
    const adminEmail = 'admin@trading.com';
    const existingAdmin = await db.query.users.findFirst({
      where: eq(schema.users.email, adminEmail),
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
