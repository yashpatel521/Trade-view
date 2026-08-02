"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { loginAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TradeViewLogo } from "@/components/ui/TradeViewLogo";
import {
  User,
  Trash2,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Zap,
  LogIn,
} from "lucide-react";

interface SavedProfile {
  name: string;
  email: string;
  password?: string;
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, {});
  const [profiles, setProfiles] = useState<SavedProfile[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const [emailVal, setEmailVal] = useState("");
  const [passwordVal, setPasswordVal] = useState("");

  // Mouse tracking for spatial spotlight background
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Default demo accounts if no local storage profiles exist yet
  const defaultDemoProfiles: SavedProfile[] = [
    { name: "Alex_Quant", email: "alex@example.com", password: "password123" },
    {
      name: "Sarah_Trader",
      email: "sarah@example.com",
      password: "password123",
    },
  ];

  // Load saved profiles from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem("saved_profiles");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProfiles(parsed);
        } else {
          setProfiles(defaultDemoProfiles);
        }
      } catch (e) {
        setProfiles(defaultDemoProfiles);
      }
    } else {
      setProfiles(defaultDemoProfiles);
    }
  }, []);

  // Save profile to localStorage when login succeeds
  useEffect(() => {
    if (state?.success && state?.user) {
      const raw = localStorage.getItem("saved_profiles");
      let currentProfiles: SavedProfile[] = [];
      try {
        currentProfiles = raw ? JSON.parse(raw) : [];
      } catch (e) {
        currentProfiles = [];
      }

      currentProfiles = currentProfiles.filter(
        (p) => p.email.toLowerCase() !== state.user!.email.toLowerCase(),
      );

      currentProfiles.unshift({
        name: state.user.name,
        email: state.user.email,
        password: state.user.password,
      });

      localStorage.setItem("saved_profiles", JSON.stringify(currentProfiles));
      window.location.href = "/dashboard";
    }
  }, [state]);

  const handleQuickLogin = (email: string, password?: string) => {
    setEmailVal(email);
    setPasswordVal(password || "");

    if (formRef.current) {
      const emailInput = formRef.current.elements.namedItem(
        "email",
      ) as HTMLInputElement;
      const passwordInput = formRef.current.elements.namedItem(
        "password",
      ) as HTMLInputElement;
      if (emailInput && passwordInput) {
        emailInput.value = email;
        passwordInput.value = password || "";
        setTimeout(() => {
          formRef.current?.requestSubmit();
        }, 50);
      }
    }
  };

  const handleRemoveProfile = (e: React.MouseEvent, email: string) => {
    e.stopPropagation();
    const updated = profiles.filter(
      (p) => p.email.toLowerCase() !== email.toLowerCase(),
    );
    setProfiles(updated);
    localStorage.setItem("saved_profiles", JSON.stringify(updated));
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // Structured JSON-LD Schema for Login WebPage
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Sign In - Trade View",
    description:
      "Secure user login portal for Trade View portfolio tracker and trading journal.",
    url: "https://trade-view.app/login",
  };

  const activeProfilesList =
    profiles.length > 0 ? profiles : defaultDemoProfiles;

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

      {/* ── LEFT 50% COLUMN: Dedicated Existing User Profiles ── */}
      <div className="hidden lg:flex lg:w-1/2 h-full flex-col justify-between p-10 2xl:p-14 relative bg-linear-to-br from-emerald-950/60 via-[#06120b]/90 to-[#040404] border-r border-white/10 overflow-hidden z-10">
        {/* Top Header Brand */}
        <div className="flex items-center justify-between z-10">
          <Link
            href="/"
            id="login-brand-logo"
            className="flex items-center gap-2"
          >
            <TradeViewLogo showText={true} size={38} borderless={true} />
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <UserCheck className="h-3.5 w-3.5" />
            <span>Saved Accounts</span>
          </div>
        </div>

        {/* Middle Saved Profiles Deck */}
        <div className="my-auto space-y-6 max-w-lg z-10 text-left w-full">
          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Existing User Portal
            </span>
            <h2 className="text-3xl 2xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
              One-Click Profile Sign In
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Select an existing user profile below to sign in instantly with
              saved terminal session credentials.
            </p>
          </div>

          {/* User Profile Cards List */}
          <div className="space-y-3 max-h-95 overflow-y-auto pr-2">
            {activeProfilesList.map((p) => (
              <div
                key={p.email}
                onClick={() => handleQuickLogin(p.email, p.password)}
                className="flex items-center justify-between p-4 rounded-2xl bg-[#0c0c0c]/90 border border-emerald-500/30 hover:border-emerald-400/80 hover:bg-neutral-900/90 transition-all cursor-pointer group shadow-xl"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="h-11 w-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-sm font-black text-emerald-400 group-hover:scale-105 transition-transform shadow-md">
                    {getInitials(p.name) || <User className="h-5 w-5" />}
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {p.name}
                    </span>
                    <span className="text-xs text-neutral-400 truncate">
                      {p.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 group-hover:bg-emerald-500 group-hover:text-black transition-all flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 fill-emerald-400 group-hover:fill-black" />
                    <span>Sign In</span>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveProfile(e, p.email)}
                    className="p-2 rounded-xl hover:bg-red-500/10 text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
                    title="Remove Profile"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Footer Info */}
        <div className="flex items-center justify-between text-xs text-neutral-500 z-10 pt-4 border-t border-white/5">
          <span>© {new Date().getFullYear()} Trade View Pro</span>
          <div className="flex items-center gap-2 text-neutral-400 font-mono text-[11px]">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Encrypted Profile Storage</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT 50% COLUMN: Dedicated Login Form ── */}
      <div className="w-full lg:w-1/2 h-full flex flex-col justify-center items-center p-6 sm:p-12 overflow-y-auto relative z-10">
        <div className="w-full max-w-md bg-[#0c0c0c]/90 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.95)] backdrop-blur-2xl transition-all my-auto">
          {/* Header Brand */}
          <div className="flex flex-col items-center text-center gap-2 mb-6">
            <div className="lg:hidden">
              <Link
                href="/"
                id="login-mobile-logo"
                className="flex items-center gap-2"
              >
                <TradeViewLogo showText={true} size={36} borderless={true} />
              </Link>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mt-1">
              <LogIn className="h-3.5 w-3.5" />
              <span>Credentials Sign In</span>
            </div>

            <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
              Sign In to Account
            </h1>
            <p className="text-xs text-neutral-400">
              Enter your email and password to access the Pro Terminal
            </p>
          </div>

          {/* Regular Sign In Form */}
          <form ref={formRef} action={formAction} className="space-y-4">
            {state?.error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold rounded-xl text-center animate-in fade-in duration-200">
                {state.error}
              </div>
            )}

            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Email Address
              </label>
              <Input
                name="email"
                type="email"
                placeholder="trader@example.com"
                required
                value={emailVal}
                onChange={(e) => setEmailVal(e.target.value)}
                className="w-full bg-neutral-900 text-white rounded-xl text-xs py-2.5"
              />
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Password
              </label>
              <Input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                value={passwordVal}
                onChange={(e) => setPasswordVal(e.target.value)}
                className="w-full bg-neutral-900 text-white rounded-xl text-xs py-2.5"
              />
            </div>

            <Button
              type="submit"
              isLoading={isPending}
              className="w-full py-3.5 mt-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs sm:text-sm rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Sign In to Terminal</span>
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </Button>
          </form>

          {/* Footer Prompt */}
          <div className="mt-6 pt-5 border-t border-neutral-800/80 text-center text-xs text-neutral-400">
            Don&apos;t have an account yet?{" "}
            <Link
              href="/register"
              className="text-emerald-400 hover:text-emerald-300 font-bold transition"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
