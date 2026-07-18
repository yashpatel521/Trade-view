import Link from 'next/link';
import { TrendingUp, BarChart3, PieChart, Shield, ArrowRight, DollarSign } from 'lucide-react';
import { getSession } from '@/lib/session';

export default async function Home() {
  const session = await getSession();

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#1a1a1a] bg-[#0a0a0a]/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <TrendingUp className="h-5 w-5 text-white" />
            <span className="font-bold text-base tracking-tight">Trade View</span>
          </div>

          <nav className="flex items-center gap-5">
            {session ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium bg-white text-black rounded-lg hover:bg-neutral-200 transition"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm text-neutral-400 hover:text-white transition">
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium bg-white text-black rounded-lg hover:bg-neutral-200 transition"
                >
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 flex flex-col justify-center py-24 lg:py-36">
        <div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-6">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.1]">
            Track your trades.
            <br />
            <span className="text-neutral-500">Grow your portfolio.</span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-500 max-w-xl leading-relaxed">
            A simple, powerful trading journal. Log daily P&L, track average costs,
            and monitor your portfolio allocation — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-4">
            <Link
              href={session ? "/dashboard" : "/register"}
              className="group px-6 py-3 font-medium bg-white text-black rounded-lg hover:bg-neutral-200 transition flex items-center gap-2 text-sm cursor-pointer"
            >
              Start for free
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 font-medium border border-neutral-800 hover:border-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-900 transition text-sm cursor-pointer"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-28 lg:mt-36">
          <div className="bg-[#141414] border border-[#222] rounded-xl p-7 flex flex-col gap-3 hover:border-neutral-700 transition group">
            <div className="h-10 w-10 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400 group-hover:text-white transition">
              <DollarSign className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold">Daily P&L Logs</h3>
            <p className="text-neutral-500 text-sm leading-relaxed">
              Log your day-to-day profits and losses. Add notes and build a complete historical trading journal.
            </p>
          </div>

          <div className="bg-[#141414] border border-[#222] rounded-xl p-7 flex flex-col gap-3 hover:border-neutral-700 transition group">
            <div className="h-10 w-10 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400 group-hover:text-white transition">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold">Automated Costs</h3>
            <p className="text-neutral-500 text-sm leading-relaxed">
              Enter buy and sell transactions. The dashboard calculates weighted average price, total costs, and current values.
            </p>
          </div>

          <div className="bg-[#141414] border border-[#222] rounded-xl p-7 flex flex-col gap-3 hover:border-neutral-700 transition group">
            <div className="h-10 w-10 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400 group-hover:text-white transition">
              <PieChart className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold">Allocation Metrics</h3>
            <p className="text-neutral-500 text-sm leading-relaxed">
              See the breakdown of your portfolio allocations. Interactive charts visualize your diversification.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-[#1a1a1a] text-center text-xs text-neutral-600">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Trade View. All rights reserved.</p>
          <div className="flex items-center gap-1 text-neutral-600">
            <Shield className="h-3.5 w-3.5" />
            <span>Serverless architecture</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
