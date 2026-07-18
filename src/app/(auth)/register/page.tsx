'use client';

import { useActionState, useEffect } from 'react';
import Link from 'next/link';
import { registerAction } from '@/lib/actions/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TrendingUp } from 'lucide-react';

interface SavedProfile {
  name: string;
  email: string;
  password?: string;
}

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, {});

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

      // Redirect client-side
      window.location.href = '/dashboard';
    }
  }, [state]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="flex flex-col items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-white" />
            <span className="font-bold text-lg tracking-tight text-white">Trade View</span>
          </Link>
          <div className="text-center mt-2">
            <h2 className="text-xl font-semibold text-white">Create an account</h2>
            <p className="text-sm text-neutral-500 mt-1">Start tracking your trades</p>
          </div>
        </div>

        <div className="bg-[#141414] border border-[#222] rounded-xl p-6">
          <form action={formAction} className="flex flex-col gap-4">
            {state?.error && (
              <div className="p-3 bg-red-500/5 border border-red-500/10 text-red-400 text-xs font-medium rounded-lg text-center">
                {state.error}
              </div>
            )}

            <Input name="name" type="text" label="Full name" placeholder="John Doe" required />
            <Input name="email" type="email" label="Email" placeholder="you@example.com" required />
            <Input name="password" type="password" label="Password" placeholder="••••••••" minLength={6} required />

            <Button type="submit" className="w-full mt-2" isLoading={isPending}>
              Create account
            </Button>
          </form>

          <div className="mt-5 text-center text-sm text-neutral-500">
            Already have an account?{' '}
            <Link href="/login" className="text-white hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
