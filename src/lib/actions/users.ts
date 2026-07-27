'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import * as postgresSchema from '@/db/schema.postgres';
import { eq, desc } from 'drizzle-orm';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  cashBalance: number;
  isPublic: boolean;
  createdAt: string;
}

export async function getAllUsersAction(): Promise<UserRecord[]> {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return [];
  }

  const driver = (process.env.DATABASE_DRIVER || '').toLowerCase();
  const targetUsers = driver === 'postgres' ? (postgresSchema.users as any) : (users as any);

  try {
    const list = await db
      .select({
        id: targetUsers.id,
        name: targetUsers.name,
        email: targetUsers.email,
        role: targetUsers.role,
        cashBalance: targetUsers.cashBalance,
        isPublic: targetUsers.isPublic,
        createdAt: targetUsers.createdAt,
      })
      .from(targetUsers)
      .orderBy(desc(targetUsers.createdAt));

    return list.map((u: any) => ({
      id: u.id,
      name: u.name || 'User',
      email: u.email,
      role: u.role === 'admin' ? 'admin' : 'user',
      cashBalance: typeof u.cashBalance === 'number' ? u.cashBalance : 0,
      isPublic: Boolean(u.isPublic),
      createdAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Recent',
    }));
  } catch (err) {
    console.error('Error fetching all users in getAllUsersAction:', err);
    return [];
  }
}

export async function toggleUserRoleAction(targetUserId: number): Promise<{ success: boolean; newRole?: 'admin' | 'user'; error?: string }> {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return { success: false, error: 'Unauthorized: Admin privileges required.' };
  }

  const driver = (process.env.DATABASE_DRIVER || '').toLowerCase();
  const targetUsers = driver === 'postgres' ? (postgresSchema.users as any) : (users as any);

  try {
    const targetUser = await db
      .select()
      .from(targetUsers)
      .where(eq(targetUsers.id, targetUserId))
      .limit(1);

    if (!targetUser || targetUser.length === 0) {
      return { success: false, error: 'User not found' };
    }

    const currentRole = targetUser[0].role;
    const newRole = currentRole === 'admin' ? 'user' : 'admin';

    await db
      .update(targetUsers)
      .set({ role: newRole })
      .where(eq(targetUsers.id, targetUserId));

    revalidatePath('/dashboard/users');
    revalidatePath('/dashboard/portfolios');
    return { success: true, newRole };
  } catch (err) {
    console.error(`Error toggling user role for user #${targetUserId}:`, err);
    return { success: false, error: 'Failed to update user role' };
  }
}
