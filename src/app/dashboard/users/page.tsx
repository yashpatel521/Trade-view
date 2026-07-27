import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { getAllUsersAction } from '@/lib/actions/users';
import UsersClient from './UsersClient';

export const metadata = {
  title: 'User Management | Trade View Admin',
  description: 'Manage registered user accounts and admin privileges.',
};

export default async function UsersPage() {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    redirect('/dashboard');
  }

  const users = await getAllUsersAction();

  return <UsersClient initialUsers={users} currentUserId={Number(session.userId)} />;
}
