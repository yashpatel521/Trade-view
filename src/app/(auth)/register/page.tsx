'use client';

import { useActionState, useEffect, useState } from 'react';
import Link from 'next/link';
import { registerAction } from '@/lib/actions/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TradeViewLogo } from '@/components/ui/TradeViewLogo';
import { ArrowRight, ShieldCheck, Sparkles, BrainCircuit, CheckCircle2, UserPlus } from 'lucide-react';

interface SavedProfile {
  name: string;
  email: string;
  password?: string;
}

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, {});
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Save profile to localStorage and redirect when registration succeeds
  useEffect(() => {
    if (state?.success && state?.user) {
      const raw = localStorage.getItem('saved_profiles');
      let currentProfiles: SavedProfile[] = [];
      try {
        currentProfiles = raw ? JSON.parse(raw) : [];
      } catch (e) {
        currentProfiles = [];
      }

      // Filter out duplicate email addresses
      currentProfiles = currentProfiles.filter(
        (p) => p.email.toLowerCase() !== state.user!.email.toLowerCase()
      );

      // Add new profile at the front of the list
      currentProfiles.unshift({
        name: state.user.name,
        email: state.user.email,
        password: state.user.password,
      });

      localStorage.setItem('saved_profiles', JSON.stringify(currentProfiles));
      window.location.href = '/dashboard';
    }
  }, [state]);

  // Structured JSON-LD Schema for Register WebPage
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Create Free Account - Trade View',
    description: 'Registration page for free Trade View portfolio tracker and trading journal account.',
    url: 'https://trade-view.app/register',
  };

  return (
    <div className="relative h-screen max-h-screen w-screen bg-[#040404] text-neutral-100 flex overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-300 font-sans">
      {/* Structured SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Holographic 3D Grid Background */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-20">
        <div className="w-full h-full grid-bg" />
      </div>

      {/* Dynamic Mouse Spotlight Glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-60 transition-opacity duration-300"
        style={{
          background: `radial-gradient(900px circle at ${mousePos.x}px ${mousePos.y}px, rgba(16,185,129,0.12), transparent 80%)`,
        }}
      />

      {/* ── LEFT 50% COLUMN: Spatial Brand & Pro Features Showcase ── */}
      <div className="hidden lg:flex lg:w-1/2 h-full flex-col justify-between p-10 2xl:p-14 relative bg-linear-to-br from-emerald-950/60 via-[#06120b]/90 to-[#040404] border-r border-white/10 overflow-hidden z-10">
        {/* Top Header Logo */}
        <div className="flex items-center justify-between z-10">
          <Link href="/" id="register-brand-logo" className="flex items-center gap-2">
            <TradeViewLogo showText={true} size={38} borderless={true} />
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Yahoo &amp; Finnhub Engine v2.0</span>
          </div>
        </div>

        {/* Middle Features & Market Card Showcase */}
        <div className="my-auto space-y-6 max-w-lg z-10 text-left w-full">
          <div className="space-y-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Free Account Creation</span>
            <h2 className="text-3xl 2xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Start Tracking Your Trades with{' '}
              <span className="bg-linear-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
                Pro Tools Today
              </span>
            </h2>
            <p className="text-sm 2xl:text-base text-neutral-400 leading-relaxed">
              Create your free account to access real-time stock charts, automated 5:00 PM market-close journaling, and Gemini AI technical strategy signals.
            </p>
          </div>

          {/* Feature Points Deck */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#0c0c0c]/80 border border-neutral-800">
              <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-white block">Automated Market-Close Journaling</span>
                <span className="text-[11px] text-neutral-400">5:00 PM auto-sync logs net P&amp;L directly to your journal</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#0c0c0c]/80 border border-neutral-800">
              <div className="h-8 w-8 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                <BrainCircuit className="h-4 w-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-white block">Gemini AI Strategy Signals</span>
                <span className="text-[11px] text-neutral-400">Pattern detection for Cup &amp; Handle, Double Bottom, &amp; Donchian Breakouts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Info */}
        <div className="flex items-center justify-between text-xs text-neutral-500 z-10 pt-4 border-t border-white/5">
          <span>© {new Date().getFullYear()} Trade View Pro</span>
          <div className="flex items-center gap-2 text-neutral-400 font-mono text-[11px]">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>SQLite &amp; PostgreSQL Dual-DB</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT 50% COLUMN: Dedicated Registration Form ── */}
      <div className="w-full lg:w-1/2 h-full flex flex-col justify-center items-center p-6 sm:p-12 overflow-y-auto relative z-10">
        <div className="w-full max-w-md bg-[#0c0c0c]/90 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.95)] backdrop-blur-2xl transition-all my-auto">
          
          {/* Header Brand */}
          <div className="flex flex-col items-center text-center gap-2 mb-6">
            <div className="lg:hidden">
              <Link href="/" id="register-mobile-logo" className="flex items-center gap-2">
                <TradeViewLogo showText={true} size={36} borderless={true} />
              </Link>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mt-1">
              <UserPlus className="h-3.5 w-3.5" />
              <span>Create Free Account</span>
            </div>

            <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">Join Trade View</h1>
            <p className="text-xs text-neutral-400">Launch your personal portfolio terminal in seconds</p>
          </div>

          {/* Registration Form */}
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold rounded-xl text-center animate-in fade-in duration-200">
                {state.error}
              </div>
            )}

            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Full Name</label>
              <Input
                name="name"
                type="text"
                placeholder="Alex Quant"
                required
                className="w-full bg-neutral-900 text-white rounded-xl text-xs py-2.5"
              />
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Email Address</label>
              <Input
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="w-full bg-neutral-900 text-white rounded-xl text-xs py-2.5"
              />
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Password</label>
              <Input
                name="password"
                type="password"
                placeholder="••••••••"
                minLength={6}
                required
                className="w-full bg-neutral-900 text-white rounded-xl text-xs py-2.5"
              />
            </div>

            <Button
              type="submit"
              isLoading={isPending}
              className="w-full py-3.5 mt-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs sm:text-sm rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Launch Free Account</span>
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </Button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 pt-5 border-t border-neutral-800/80 text-center text-xs text-neutral-400">
            Already have an account?{' '}
            <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-bold transition">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
