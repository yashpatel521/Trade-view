'use client';

import { useActionState, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { loginAction } from '@/lib/actions/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TrendingUp, User, Trash2 } from 'lucide-react';

interface SavedProfile {
  name: string;
  email: string;
  password?: string;
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, {});
  const [profiles, setProfiles] = useState<SavedProfile[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const [emailVal, setEmailVal] = useState('');
  const [passwordVal, setPasswordVal] = useState('');

  // Load saved profiles from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem('saved_profiles');
    if (raw) {
      try {
        setProfiles(JSON.parse(raw));
      } catch (e) {
        console.error('Failed to parse saved profiles:', e);
      }
    }
  }, []);

  // Save profile to localStorage when login succeeds
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

  const handleQuickLogin = (email: string, password?: string) => {
    setEmailVal(email);
    setPasswordVal(password || '');
    
    // Direct DOM manipulation to bypass state batching delays and submit instantly
    if (formRef.current) {
      const emailInput = formRef.current.elements.namedItem('email') as HTMLInputElement;
      const passwordInput = formRef.current.elements.namedItem('password') as HTMLInputElement;
      if (emailInput && passwordInput) {
        emailInput.value = email;
        passwordInput.value = password || '';
        setTimeout(() => {
          formRef.current?.requestSubmit();
        }, 50);
      }
    }
  };

  const handleRemoveProfile = (e: React.MouseEvent, email: string) => {
    e.stopPropagation(); // prevent triggering login
    const updated = profiles.filter((p) => p.email.toLowerCase() !== email.toLowerCase());
    setProfiles(updated);
    localStorage.setItem('saved_profiles', JSON.stringify(updated));
  };

  // Get initials for profile avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="flex flex-col items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-white" />
            <span className="font-bold text-lg tracking-tight text-white">Trade View</span>
          </Link>
          <div className="text-center mt-2">
            <h2 className="text-xl font-semibold text-white">Welcome back</h2>
            <p className="text-sm text-neutral-500 mt-1">Sign in to your account</p>
          </div>
        </div>

        {/* Saved Profiles List */}
        {profiles.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Sign in with a saved profile
            </p>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
              {profiles.map((p) => (
                <div
                  key={p.email}
                  onClick={() => handleQuickLogin(p.email, p.password)}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#141414] border border-[#222] hover:border-neutral-700 transition duration-150 cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-300 border border-neutral-700">
                      {getInitials(p.name) || <User className="h-4 w-4" />}
                    </div>
                    <div className="flex flex-col text-left min-w-0">
                      <span className="text-xs font-semibold text-neutral-200 group-hover:text-white transition-colors">
                        {p.name}
                      </span>
                      <span className="text-[10px] text-neutral-500 truncate">
                        {p.email}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveProfile(e, p.email)}
                    className="h-8 w-8 rounded-lg hover:bg-neutral-800 text-neutral-600 hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                    title="Remove Profile"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Login Form */}
        <div className="bg-[#141414] border border-[#222] rounded-xl p-6">
          <form ref={formRef} action={formAction} className="flex flex-col gap-4">
            {state?.error && (
              <div className="p-3 bg-red-500/5 border border-red-500/10 text-red-400 text-xs font-medium rounded-lg text-center">
                {state.error}
              </div>
            )}

            <Input
              name="email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              required
              value={emailVal}
              onChange={(e) => setEmailVal(e.target.value)}
            />
            <Input
              name="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              required
              value={passwordVal}
              onChange={(e) => setPasswordVal(e.target.value)}
            />

            <Button type="submit" className="w-full mt-2" isLoading={isPending}>
              Sign in
            </Button>
          </form>

          <div className="mt-5 text-center text-sm text-neutral-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-white hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
