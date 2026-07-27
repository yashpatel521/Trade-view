import { getSession } from '@/lib/session';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getFxRateAction } from '@/lib/actions/trading';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, Number(session.userId)),
  });
  const fxRate = await getFxRateAction();

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-neutral-100 overflow-hidden">
      <Sidebar isAdmin={session.role === 'admin'} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header session={session} cashBalance={user?.cashBalance ?? 0} fxRate={fxRate} />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
