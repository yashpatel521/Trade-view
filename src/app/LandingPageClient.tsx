"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Shield,
  ArrowRight,
  Sparkles,
  BrainCircuit,
  CheckCircle2,
  DollarSign,
  Activity,
  Menu,
  X,
  Calculator,
  Globe,
  Calendar,
  Bot,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import { TradeViewLogo } from "@/components/ui/TradeViewLogo";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";

interface LandingPageClientProps {
  isLoggedIn: boolean;
}

export default function LandingPageClient({
  isLoggedIn,
}: LandingPageClientProps) {
  // Mouse movement parallax for 3D spatial effect
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [rawMouse, setRawMouse] = useState({ x: 0, y: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<"journal" | "currency" | "ai">(
    "journal",
  );

  // Interactive AI Signal Predictor State
  const [selectedTicker, setSelectedTicker] = useState<
    "NVDA" | "GOOGL" | "AAPL" | "TSLA" | "SHOP.TO"
  >("GOOGL");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Real Live Price State from API
  const [liveQuote, setLiveQuote] = useState<{
    price: string;
    change: string;
    up: boolean;
    curr: string;
    high?: string;
    low?: string;
  }>({
    price: "$178.60 USD",
    change: "+2.85%",
    up: true,
    curr: "🇺🇸 USD",
  });

  // Simulated Order Toast State
  const [simulatedOrderToast, setSimulatedOrderToast] = useState<string | null>(
    null,
  );

  // Interactive Calculator State
  const [startingCapital, setStartingCapital] = useState<number>(10000);
  const [targetWinRate, setTargetWinRate] = useState<number>(75);

  // Fetch real-time live stock price from /api/quote
  useEffect(() => {
    let isMounted = true;
    const fetchLiveQuote = async () => {
      try {
        const res = await fetch(`/api/quote?ticker=${selectedTicker}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data && data.price) {
            setLiveQuote({
              price: data.price,
              change: data.change || "+2.85%",
              up: data.up !== false,
              curr: data.curr || "🇺🇸 USD",
              high: data.high,
              low: data.low,
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch live quote:", err);
      }
    };

    fetchLiveQuote();
    const interval = setInterval(fetchLiveQuote, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedTicker]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      setMousePos({ x, y });
      setRawMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const heroEl = heroRef.current;
    if (heroEl) {
      heroEl.addEventListener("mousemove", handleMouseMove);
    }
    return () => {
      if (heroEl) heroEl.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Spatial tilt calculations
  const tiltX = (mousePos.y * -6).toFixed(2);
  const tiltY = (mousePos.x * 10).toFixed(2);

  // Handle Ticker AI Signal Switch
  const handleTickerSelect = (
    ticker: "NVDA" | "GOOGL" | "AAPL" | "TSLA" | "SHOP.TO",
  ) => {
    setSelectedTicker(ticker);
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 400);
  };

  // Handle Simulated Order Test
  const triggerSimulatedOrder = () => {
    setSimulatedOrderToast(
      `✅ Simulating Buy 10 Shares ${selectedTicker} @ CA$2,500.40 CAD (1.40 FX)`,
    );
    setTimeout(() => setSimulatedOrderToast(null), 4000);
  };

  // Calculate estimated returns for interactive calculator
  const estimatedMonthlyProfit = (
    startingCapital *
    (targetWinRate / 100) *
    0.08
  ).toFixed(2);
  const estimatedAnnualValue = (
    startingCapital +
    Number(estimatedMonthlyProfit) * 12
  ).toFixed(2);

  // AI Signals Data Dictionary
  const aiSignalData = {
    GOOGL: {
      price: "$178.60 USD",
      signal: "Cup & Handle Breakout (Alphabet Inc.)",
      confidence: "94%",
      target: "$192.50 USD",
      stop: "$171.20 USD",
      reason:
        "Google Cloud momentum and Gemini AI model acceleration driving bullish breakout above $175 resistance.",
      curr: "🇺🇸 USD",
    },
    NVDA: {
      price: "$128.40 USD",
      signal: "Bullish Double Bottom",
      confidence: "92%",
      target: "$142.50 USD",
      stop: "$121.10 USD",
      reason:
        "Higher lows forming above 20 EMA with bullish volume expansion on 1D timeframe.",
      curr: "🇺🇸 USD",
    },
    AAPL: {
      price: "$224.50 USD",
      signal: "Donchian Breakout",
      confidence: "86%",
      target: "$240.00 USD",
      stop: "$218.00 USD",
      reason: "Upper channel breakout confirmed with RSI momentum cross at 62.",
      curr: "🇺🇸 USD",
    },
    TSLA: {
      price: "$218.80 USD",
      signal: "Ascending Triangle",
      confidence: "78%",
      target: "$235.00 USD",
      stop: "$208.50 USD",
      reason:
        "Consolidating near 50 SMA resistance; volume accumulation detected.",
      curr: "🇺🇸 USD",
    },
    "SHOP.TO": {
      price: "CA$95.20 CAD",
      signal: "EMA 20 Bounce (TSX)",
      confidence: "91%",
      target: "CA$108.00 CAD",
      stop: "CA$89.50 CAD",
      reason:
        "Strong support bounce on Canadian TSX with net positive institutional cashflow.",
      curr: "🇨🇦 CAD",
    },
  };

  // FAQ items
  const faqs = [
    {
      q: "How does the automated CAD/USD multi-currency engine work?",
      a: "Your base cash balance is stored in CAD. When trading US stocks (e.g. NVDA, AAPL), Trade View automatically converts the total trade value using real-time FX rates from Google Finance and Yahoo. Your cash balance is validated in CAD before buy execution and credited on sell orders.",
    },
    {
      q: "How does the 5:00 PM auto-journaling system log daily entries?",
      a: "On weekdays at 5:00 PM (after market close), Trade View automatically evaluates your active portfolio holdings against live market prices and logs today’s net unrealized P&L into your journal. You can also manually add or edit notes anytime.",
    },
    {
      q: "Is my financial data secure?",
      a: "Yes. Trade View uses strict session encryption via JOSE JWT tokens, secure HTTP-only cookies, and supports dual database drivers (SQLite LibSQL and PostgreSQL via Supabase with RLS row-level security).",
    },
    {
      q: "Can I track both Canadian TSX and US stocks?",
      a: "Absolutely. Canadian stocks (tickers ending in .TO, .V, .CN) are quoted natively in CAD (CA$), while US stocks (NASDAQ, NYSE) are quoted in USD ($). Badges display native stock currencies across all views.",
    },
  ];

  // 1D Intraday Recharts Chart Dataset
  const chartDataByTicker: Record<string, { time: string; price: number }[]> = {
    GOOGL: [
      { time: "9:30 AM", price: 174.2 },
      { time: "10:30 AM", price: 175.5 },
      { time: "11:30 AM", price: 177.1 },
      { time: "12:30 PM", price: 176.8 },
      { time: "1:30 PM", price: 179.4 },
      { time: "2:30 PM", price: 182.4 },
      { time: "3:30 PM", price: 180.9 },
      { time: "4:00 PM", price: 178.6 },
    ],
    NVDA: [
      { time: "9:30 AM", price: 121.1 },
      { time: "10:30 AM", price: 123.5 },
      { time: "11:30 AM", price: 125.8 },
      { time: "12:30 PM", price: 124.9 },
      { time: "1:30 PM", price: 127.2 },
      { time: "2:30 PM", price: 129.8 },
      { time: "3:30 PM", price: 128.9 },
      { time: "4:00 PM", price: 128.4 },
    ],
    AAPL: [
      { time: "9:30 AM", price: 218.0 },
      { time: "10:30 AM", price: 220.4 },
      { time: "11:30 AM", price: 222.1 },
      { time: "12:30 PM", price: 221.5 },
      { time: "1:30 PM", price: 223.8 },
      { time: "2:30 PM", price: 225.9 },
      { time: "3:30 PM", price: 224.9 },
      { time: "4:00 PM", price: 224.5 },
    ],
    TSLA: [
      { time: "9:30 AM", price: 208.5 },
      { time: "10:30 AM", price: 212.0 },
      { time: "11:30 AM", price: 215.4 },
      { time: "12:30 PM", price: 214.1 },
      { time: "1:30 PM", price: 17.9 },
      { time: "2:30 PM", price: 221.0 },
      { time: "3:30 PM", price: 219.5 },
      { time: "4:00 PM", price: 218.8 },
    ],
    MSFT: [
      { time: "9:30 AM", price: 440.1 },
      { time: "10:30 AM", price: 443.5 },
      { time: "11:30 AM", price: 446.2 },
      { time: "12:30 PM", price: 445.0 },
      { time: "1:30 PM", price: 447.8 },
      { time: "2:30 PM", price: 450.2 },
      { time: "3:30 PM", price: 449.1 },
      { time: "4:00 PM", price: 448.9 },
    ],
  };

  // Marquee Ticker Items
  const marqueeItems = [
    {
      ticker: "GOOGL",
      price: "$178.60",
      change: "+2.85%",
      up: true,
      curr: "USD",
    },
    {
      ticker: "NVDA",
      price: "$128.40",
      change: "+3.38%",
      up: true,
      curr: "USD",
    },
    {
      ticker: "AAPL",
      price: "$224.50",
      change: "+1.12%",
      up: true,
      curr: "USD",
    },
    {
      ticker: "TSLA",
      price: "$218.80",
      change: "-0.85%",
      up: false,
      curr: "USD",
    },
    {
      ticker: "SHOP.TO",
      price: "CA$95.20",
      change: "+2.40%",
      up: true,
      curr: "CAD",
    },
    {
      ticker: "RY.TO",
      price: "CA$142.10",
      change: "+0.95%",
      up: true,
      curr: "CAD",
    },
    {
      ticker: "USD/CAD",
      price: "1.4025",
      change: "+0.15%",
      up: true,
      curr: "FX",
    },
    {
      ticker: "MSFT",
      price: "$448.90",
      change: "+1.80%",
      up: true,
      curr: "USD",
    },
    {
      ticker: "AMZN",
      price: "$186.20",
      change: "-0.42%",
      up: false,
      curr: "USD",
    },
  ];

  // Top Leaderboard Traders
  const topTraders = [
    {
      rank: 1,
      name: "Alex_Quant",
      profit: "+CA$42,850.00",
      winRate: "88.4%",
      badge: "🇨🇦 CAD",
      strategy: "Breakout Momentum",
    },
    {
      rank: 2,
      name: "Sarah_Trades",
      profit: "+$31,200.00",
      winRate: "82.1%",
      badge: "🇺🇸 USD",
      strategy: "Double Bottom Reversal",
    },
    {
      rank: 3,
      name: "David_V",
      profit: "+CA$24,610.00",
      winRate: "79.5%",
      badge: "🇨🇦 CAD",
      strategy: "EMA Trend Following",
    },
  ];

  // Schema.org JSON-LD structured data for Google SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Trade View",
    operatingSystem: "Web",
    applicationCategory: "FinanceApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "A spatial Wealthsimple-style portfolio tracker and trading journal with real-time market data, CAD/USD multi-currency engine, and AI pattern detection.",
  };

  return (
    <div className="relative min-h-screen bg-[#040404] text-neutral-100 flex flex-col font-sans overflow-x-hidden selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Structured SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Holographic 3D Grid Pattern Background */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-20">
        <div className="w-full h-full grid-bg" />
      </div>

      {/* Ambient Spatial Background Glow Highlights */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-200 sm:w-350 2xl:w-450 h-150 bg-linear-to-b from-emerald-500/20 via-teal-500/8 to-transparent blur-[160px] rounded-full" />
        <div className="absolute top-[40%] left-[-10%] w-100 sm:w-200 2xl:w-250 h-200 bg-emerald-500/8 blur-[180px] rounded-full" />
        <div className="absolute top-[60%] right-[-10%] w-100 sm:w-200 2xl:w-250 h-200 bg-teal-500/8 blur-[180px] rounded-full" />
      </div>

      {/* ── 1. Glass Navigation Header (Responsive sm / md / lg / xl / 2xl / 3xl) ── */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#060606]/85 backdrop-blur-2xl transition-all duration-300">
        <div className="max-w-7xl 2xl:max-w-screen-2xl 3xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-20 h-16 sm:h-20 2xl:h-24 flex items-center justify-between">
          <Link
            href="/"
            id="header-logo-link"
            className="flex items-center gap-2 group shrink-0"
          >
            <TradeViewLogo showText={true} size={36} borderless={true} />
          </Link>

          {/* Desktop Links (lg, xl, 2xl, 3xl) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-10 2xl:gap-14 text-xs xl:text-sm 2xl:text-base font-semibold text-neutral-400">
            <a
              href="#features"
              className="hover:text-emerald-400 transition-colors"
            >
              Features
            </a>
            <a
              href="#preview"
              className="hover:text-emerald-400 transition-colors"
            >
              Terminal Preview
            </a>
            <a
              href="#ai-signals"
              className="hover:text-emerald-400 transition-colors"
            >
              AI Signals
            </a>
            <a
              href="#calculator"
              className="hover:text-emerald-400 transition-colors"
            >
              P&amp;L Calculator
            </a>
            <a
              href="#community"
              className="hover:text-emerald-400 transition-colors"
            >
              Leaderboards
            </a>
            <a href="#faq" className="hover:text-emerald-400 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Header Action CTAs */}
          <div className="hidden sm:flex items-center gap-3 xl:gap-4 2xl:gap-6">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                id="header-dashboard-cta"
                className="px-4 sm:px-5 2xl:px-6 py-2.5 2xl:py-3 text-xs sm:text-sm 2xl:text-base font-bold bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5 2xl:h-4 2xl:w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  id="header-login-btn"
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm 2xl:text-base font-semibold text-neutral-300 hover:text-white transition cursor-pointer"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  id="header-register-cta"
                  className="px-4 sm:px-5 2xl:px-6 py-2.5 2xl:py-3 text-xs sm:text-sm 2xl:text-base font-bold bg-white text-black hover:bg-neutral-200 rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Launch Terminal</span>
                  <ArrowRight className="h-3.5 w-3.5 2xl:h-4 2xl:w-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-neutral-400 hover:text-white rounded-xl bg-neutral-900/80 border border-neutral-800 transition cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-emerald-400" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-neutral-800 bg-[#0c0c0c]/95 backdrop-blur-2xl px-5 py-6 space-y-4 animate-in slide-in-from-top-3 duration-200">
            <nav className="flex flex-col gap-3.5 text-sm font-semibold text-neutral-300">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-emerald-400 py-1.5"
              >
                Features
              </a>
              <a
                href="#preview"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-emerald-400 py-1.5"
              >
                Terminal Preview
              </a>
              <a
                href="#ai-signals"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-emerald-400 py-1.5"
              >
                AI Signals
              </a>
              <a
                href="#calculator"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-emerald-400 py-1.5"
              >
                P&amp;L Calculator
              </a>
              <a
                href="#community"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-emerald-400 py-1.5"
              >
                Leaderboards
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-emerald-400 py-1.5"
              >
                FAQ
              </a>
            </nav>

            <div className="pt-4 border-t border-neutral-800 flex flex-col gap-3">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 text-center text-sm font-bold bg-emerald-500 text-black rounded-xl"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 text-center text-sm font-bold bg-white text-black rounded-xl"
                  >
                    Launch Free Terminal
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 text-center text-sm font-semibold text-neutral-300 bg-neutral-900 border border-neutral-800 rounded-xl"
                  >
                    Log in
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Live Continuous Sliding Market Marquee Bar ── */}
        <div className="w-full bg-[#080808]/90 border-t border-b border-white/5 py-2.5 overflow-hidden text-xs 2xl:text-sm font-mono select-none">
          <div className="flex items-center gap-8 2xl:gap-12 whitespace-nowrap animate-marquee">
            {marqueeItems.concat(marqueeItems).map((item, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-neutral-900/80 border border-neutral-800/80"
              >
                <span className="font-bold text-white">{item.ticker}</span>
                <span className="text-neutral-400">{item.price}</span>
                <span
                  className={`font-semibold ${item.up ? "text-emerald-400" : "text-red-400"}`}
                >
                  {item.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── 2. 50-50 Split Spatial Hero Section (Fits Screen Viewport) ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center w-full">
        <section
          ref={heroRef}
          className="w-full min-h-[calc(100vh-5rem)] lg:min-h-[calc(100vh-6rem)] flex items-center justify-center bg-linear-to-b from-emerald-950/45 via-[#06120b]/90 to-[#040404] border-b border-emerald-500/20 py-6 sm:py-10 lg:py-12 2xl:py-14 relative overflow-hidden"
        >
          {/* Rich Emerald Radial Mesh Aura Background Glow */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-full max-w-7xl h-125 bg-emerald-500/25 blur-[170px] rounded-full" />
            <div className="absolute top-[30%] left-[-15%] w-125 h-125 bg-emerald-400/15 blur-[180px] rounded-full" />
            <div className="absolute top-[30%] right-[-15%] w-125 h-125 bg-teal-400/15 blur-[180px] rounded-full" />
          </div>

          <div className="max-w-7xl 2xl:max-w-screen-2xl 3xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-20 relative z-10 w-full">
            {/* Dynamic Mouse Spotlight Glow Effect */}
            <div
              className="pointer-events-none absolute -inset-px rounded-3xl opacity-80 transition-opacity duration-300"
              style={{
                background: `radial-gradient(900px circle at ${rawMouse.x}px ${rawMouse.y}px, rgba(16,185,129,0.18), transparent 80%)`,
              }}
            />

            {/* 50-50 Split Grid Container */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-14 2xl:gap-16 items-center text-left w-full">
              {/* Left 50% Column: Hero Content */}
              <div className="flex flex-col items-start space-y-4 sm:space-y-5 lg:space-y-6">
                {/* Floating Dual Pill Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs 2xl:text-sm font-semibold shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    <Sparkles className="h-3.5 w-3.5 2xl:h-4 2xl:w-4 shrink-0" />
                    <span>Yahoo &amp; Finnhub v2.0 Live</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0 ml-0.5" />
                  </div>

                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs 2xl:text-sm font-semibold">
                    <DollarSign className="h-3.5 w-3.5 2xl:h-4 2xl:w-4 shrink-0 text-teal-400" />
                    <span>Real-Time USD Currency Engine</span>
                  </div>
                </div>

                {/* Main Headline */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-[72px] font-extrabold tracking-tight leading-[1.06] text-white">
                  Spatial Terminal for{" "}
                  <span className="bg-linear-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
                    High-Performance Traders
                  </span>
                </h1>

                <p className="text-xs sm:text-sm lg:text-base 2xl:text-lg text-neutral-400 leading-relaxed max-w-xl">
                  The Wealthsimple-style portfolio manager. Track US stock
                  positions, auto-log 5:00 PM market-close journal entries, and
                  get live Gemini AI technical signals.
                </p>

                {/* Hero CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto pt-1">
                  <Link
                    href={isLoggedIn ? "/dashboard" : "/register"}
                    id="hero-primary-cta"
                    className="px-6 py-3 font-bold bg-emerald-500 hover:bg-emerald-400 text-black text-xs sm:text-sm 2xl:text-base rounded-xl shadow-[0_0_35px_rgba(16,185,129,0.45)] transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>
                      {isLoggedIn
                        ? "Open Pro Dashboard"
                        : "Launch Free Terminal"}
                    </span>
                    <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                  </Link>

                  <a
                    href="#preview"
                    id="hero-secondary-cta"
                    className="px-6 py-3 font-semibold border border-neutral-800 hover:border-neutral-700 bg-neutral-900/60 hover:bg-neutral-800/80 text-neutral-200 text-xs sm:text-sm 2xl:text-base rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 backdrop-blur-md"
                  >
                    <Activity className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Terminal Preview</span>
                  </a>
                </div>

                {/* Ticker Quick Switcher Bar */}
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-[11px] text-neutral-500 font-mono uppercase tracking-wider">
                    Live Tickers:
                  </span>
                  {(["GOOGL", "NVDA", "AAPL", "TSLA", "SHOP.TO"] as const).map(
                    (t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleTickerSelect(t)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
                          selectedTicker === t
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                            : "bg-neutral-900/80 text-neutral-400 border border-neutral-800 hover:text-white"
                        }`}
                      >
                        {t}
                      </button>
                    ),
                  )}
                </div>

                {/* Quick Proof Counters */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-neutral-800/80 w-full font-mono">
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase">
                      Platform Fees
                    </span>
                    <p className="text-sm sm:text-base 2xl:text-lg font-bold text-white mt-0.5">
                      $0.00 Free
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase">
                      Market Sync
                    </span>
                    <p className="text-sm sm:text-base 2xl:text-lg font-bold text-emerald-400 mt-0.5">
                      5:00 PM Auto
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase">
                      Dual DB Engine
                    </span>
                    <p className="text-sm sm:text-base 2xl:text-lg font-bold text-teal-300 mt-0.5">
                      Postgres &amp; SQLite
                    </p>
                  </div>
                </div>

                {/* Simulated Order Notification Toast */}
                {simulatedOrderToast && (
                  <div className="w-full px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-in fade-in zoom-in-95 duration-200">
                    {simulatedOrderToast}
                  </div>
                )}
              </div>

              {/* Right 50% Column: Full-Height 3D Spatial Glass Terminal Deck Showcase */}
              <div
                className="w-full h-full relative"
                style={{ perspective: "1200px" }}
              >
                <div
                  className="relative w-full h-full min-h-120 sm:min-h-130 lg:min-h-140 2xl:min-h-150 rounded-3xl bg-[#0c0c0c]/95 border border-emerald-500/30 p-4 sm:p-6 2xl:p-8 shadow-[0_35px_100px_rgba(0,0,0,0.95)] backdrop-blur-2xl transition-transform duration-300 ease-out transform-gpu group flex flex-col justify-between"
                  style={{
                    transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Glass Top Bar */}
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                      <span className="text-[10px] sm:text-[11px] font-mono text-neutral-400 ml-1.5">
                        trade-view-pro.v2.0
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        ● Live Feed
                      </span>
                      <button
                        type="button"
                        onClick={triggerSimulatedOrder}
                        className="text-[9px] sm:text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition cursor-pointer"
                      >
                        ⚡ Test CAD Order
                      </button>
                    </div>
                  </div>

                  {/* Main Interactive 1D Intraday Chart Box */}
                  <div className="bg-[#050505] border border-neutral-800 rounded-2xl p-4 sm:p-5 2xl:p-6 flex-1 flex flex-col justify-between relative overflow-hidden group/chart mb-4 min-h-65 sm:min-h-75 lg:min-h-85">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between z-10 gap-2 sm:gap-0">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-base sm:text-lg 2xl:text-xl tracking-tight">
                            {selectedTicker}
                          </span>
                          <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                            {aiSignalData[selectedTicker].curr}
                          </span>
                        </div>
                        <p className="text-xl sm:text-2xl 2xl:text-3xl font-black text-white mt-1 flex items-center gap-2">
                          <span>{liveQuote.price}</span>
                          <span
                            className={`text-xs 2xl:text-sm font-bold ${liveQuote.up ? "text-emerald-400" : "text-red-400"}`}
                          >
                            {liveQuote.change}
                          </span>
                        </p>
                      </div>

                      {/* 1D Intraday Timeframe Pills */}
                      <div className="flex items-center gap-1 bg-neutral-900/90 p-1 rounded-xl border border-neutral-800">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold font-mono bg-emerald-500 text-black shadow-md">
                          1D Intraday
                        </span>
                        <span className="px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-semibold font-mono text-neutral-400 hover:text-white cursor-pointer">
                          1W
                        </span>
                        <span className="px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-semibold font-mono text-neutral-400 hover:text-white cursor-pointer">
                          1M
                        </span>
                        <span className="px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-semibold font-mono text-neutral-400 hover:text-white cursor-pointer">
                          1Y
                        </span>
                      </div>
                    </div>

                    {/* High / Low Peak Reference Dots (Rule 4) */}
                    <div className="absolute top-20 right-10 z-10 flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-emerald-500/40 shadow-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>Peak High: {liveQuote.high || "$182.40 USD"}</span>
                    </div>

                    <div className="absolute bottom-16 left-12 z-10 flex items-center gap-1.5 bg-red-500/20 text-red-300 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-red-500/40 shadow-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      <span>Trough Low: {liveQuote.low || "$174.20 USD"}</span>
                    </div>

                    {/* Interactive Recharts 1D Area Chart Engine */}
                    <div className="w-full h-44 sm:h-52 2xl:h-64 mt-4 relative z-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={
                            chartDataByTicker[selectedTicker] ||
                            chartDataByTicker.GOOGL
                          }
                          margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient
                              id="colorPrice"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#10b981"
                                stopOpacity={0.5}
                              />
                              <stop
                                offset="95%"
                                stopColor="#10b981"
                                stopOpacity={0.0}
                              />
                            </linearGradient>
                          </defs>
                          <XAxis
                            dataKey="time"
                            stroke="#444"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            domain={["auto", "auto"]}
                            stroke="#444"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v) => `$${v}`}
                          />
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: "#0a0a0a",
                              borderColor: "#10b981",
                              borderRadius: "12px",
                              color: "#fff",
                              fontSize: "12px",
                              fontWeight: "bold",
                            }}
                            formatter={(val: any) => [
                              `$${Number(val).toFixed(2)} USD`,
                              "Price",
                            ]}
                          />
                          <Area
                            type="monotone"
                            dataKey="price"
                            stroke="#10b981"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorPrice)"
                          />
                          <ReferenceDot
                            x="2:30 PM"
                            y={182.4}
                            r={5}
                            fill="#10b981"
                            stroke="#ffffff"
                            strokeWidth={2}
                          />
                          <ReferenceDot
                            x="9:30 AM"
                            y={174.2}
                            r={5}
                            fill="#ef4444"
                            stroke="#ffffff"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Order Book & Journal Summary Row (Bottom Anchored) */}
                  <div className="grid grid-cols-2 gap-3 text-left shrink-0">
                    <div className="bg-[#050505] border border-neutral-800 rounded-xl p-3 text-xs">
                      <span className="text-[10px] text-neutral-500 uppercase font-bold">
                        Today&apos;s Net P&amp;L
                      </span>
                      <p className="text-base sm:text-lg font-black text-emerald-400 mt-0.5">
                        +$845.20 USD
                      </p>
                    </div>
                    <div className="bg-[#050505] border border-neutral-800 rounded-xl p-3 text-xs">
                      <span className="text-[10px] text-neutral-500 uppercase font-bold">
                        5:00 PM Auto-Log
                      </span>
                      <p className="text-xs font-bold text-white mt-1 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Sync Enabled</span>
                      </p>
                    </div>
                  </div>

                  {/* Floating Spatial Elements popping out on Z-axis */}
                  <div
                    className="absolute -top-4 -right-2 sm:-top-5 sm:-right-4 hidden md:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#141414]/95 border border-emerald-500/40 text-white text-xs font-bold shadow-[0_15px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all group-hover:translate-z-10"
                    style={{ transform: "translateZ(40px)" }}
                  >
                    <span className="text-base">🇺🇸</span>
                    <div className="flex flex-col text-left">
                      <span className="text-[9px] uppercase tracking-wider text-neutral-400 leading-none">
                        Available Cash
                      </span>
                      <span className="text-xs font-black text-emerald-400 leading-tight mt-0.5">
                        $24,850.00 USD
                      </span>
                    </div>
                  </div>

                  <div
                    className="absolute -bottom-4 -left-2 sm:-bottom-5 sm:-left-4 hidden md:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#141414]/95 border border-teal-500/40 text-white text-xs font-bold shadow-[0_15px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all group-hover:translate-z-12"
                    style={{ transform: "translateZ(50px)" }}
                  >
                    <BrainCircuit className="h-4 w-4 text-emerald-400 shrink-0" />
                    <div className="flex flex-col text-left">
                      <span className="text-[9px] uppercase tracking-wider text-neutral-400 leading-none">
                        Gemini AI Forecast
                      </span>
                      <span className="text-xs font-bold text-white leading-tight mt-0.5">
                        Double Bottom (89%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. Core Capabilities Grid ── */}
        <section
          id="features"
          className="w-full max-w-7xl 2xl:max-w-screen-2xl 3xl:max-w-screen-2xl px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-20 py-16 sm:py-24 2xl:py-32 border-t border-white/5"
        >
          <div className="text-center max-w-3xl 2xl:max-w-4xl mx-auto mb-12 sm:mb-16 2xl:mb-20">
            <span className="text-xs 2xl:text-sm font-bold uppercase tracking-widest text-emerald-400">
              Architected for Speed &amp; Accuracy
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl 2xl:text-6xl font-extrabold text-white tracking-tight mt-2 sm:mt-3">
              Everything You Need to Master Your Trading Performance
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 2xl:gap-10">
            {/* Feature 1 */}
            <div className="bg-[#0e0e0e] border border-white/10 hover:border-emerald-500/40 rounded-2xl sm:rounded-3xl p-5 sm:p-7 2xl:p-9 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.4)] group">
              <div>
                <div className="h-10 sm:h-12 2xl:h-14 w-10 sm:w-12 2xl:w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5 sm:mb-6 group-hover:scale-110 transition-transform">
                  <Globe className="h-5 sm:h-6 2xl:h-7 w-5 sm:w-6 2xl:w-7" />
                </div>
                <h3 className="text-base sm:text-lg 2xl:text-xl font-bold text-white mb-2">
                  Real-Time Market Engine
                </h3>
                <p className="text-xs 2xl:text-sm text-neutral-400 leading-relaxed">
                  Multi-tier fallback architecture querying Yahoo Finance v8
                  real-time chart APIs, Finnhub quote endpoints, and Google
                  Finance TSE scrapers.
                </p>
              </div>
              <div className="mt-6 sm:mt-8 pt-4 border-t border-neutral-800 text-[11px] 2xl:text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <span>Yahoo + Finnhub + Google</span>
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#0e0e0e] border border-white/10 hover:border-emerald-500/40 rounded-2xl sm:rounded-3xl p-5 sm:p-7 2xl:p-9 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.4)] group">
              <div>
                <div className="h-10 sm:h-12 2xl:h-14 w-10 sm:w-12 2xl:w-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-5 sm:mb-6 group-hover:scale-110 transition-transform">
                  <DollarSign className="h-5 sm:h-6 2xl:h-7 w-5 sm:w-6 2xl:w-7" />
                </div>
                <h3 className="text-base sm:text-lg 2xl:text-xl font-bold text-white mb-2">
                  Multi-Currency FX Ledger
                </h3>
                <p className="text-xs 2xl:text-sm text-neutral-400 leading-relaxed">
                  Wealthsimple-style base CAD balance with instant FX conversion
                  on US stock purchases. Badges natively render 🇨🇦 CAD and 🇺🇸
                  USD prices.
                </p>
              </div>
              <div className="mt-6 sm:mt-8 pt-4 border-t border-neutral-800 text-[11px] 2xl:text-xs font-bold text-teal-400 flex items-center gap-1.5">
                <span>Instant Settlement in CAD</span>
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#0e0e0e] border border-white/10 hover:border-emerald-500/40 rounded-2xl sm:rounded-3xl p-5 sm:p-7 2xl:p-9 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.4)] group">
              <div>
                <div className="h-10 sm:h-12 2xl:h-14 w-10 sm:w-12 2xl:w-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5 sm:mb-6 group-hover:scale-110 transition-transform">
                  <Calendar className="h-5 sm:h-6 2xl:h-7 w-5 sm:w-6 2xl:w-7" />
                </div>
                <h3 className="text-base sm:text-lg 2xl:text-xl font-bold text-white mb-2">
                  5:00 PM Auto-Journaling
                </h3>
                <p className="text-xs 2xl:text-sm text-neutral-400 leading-relaxed">
                  Automated weekday market-close P&amp;L logging with holdings
                  breakdown. Includes interactive monthly calendar heatmaps and
                  win-rate analytics.
                </p>
              </div>
              <div className="mt-6 sm:mt-8 pt-4 border-t border-neutral-800 text-[11px] 2xl:text-xs font-bold text-purple-400 flex items-center gap-1.5">
                <span>Automated Market Close</span>
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#0e0e0e] border border-white/10 hover:border-emerald-500/40 rounded-2xl sm:rounded-3xl p-5 sm:p-7 2xl:p-9 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.4)] group">
              <div>
                <div className="h-10 sm:h-12 2xl:h-14 w-10 sm:w-12 2xl:w-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-5 sm:mb-6 group-hover:scale-110 transition-transform">
                  <BrainCircuit className="h-5 sm:h-6 2xl:h-7 w-5 sm:w-6 2xl:w-7" />
                </div>
                <h3 className="text-base sm:text-lg 2xl:text-xl font-bold text-white mb-2">
                  AI Strategy Forecasts
                </h3>
                <p className="text-xs 2xl:text-sm text-neutral-400 leading-relaxed">
                  Algorithmic Technical Pattern Engine detecting Double
                  Tops/Bottoms, Donchian Channels, EMA/RSI momentum, and Gemini
                  AI stock strategy forecasts.
                </p>
              </div>
              <div className="mt-6 sm:mt-8 pt-4 border-t border-neutral-800 text-[11px] 2xl:text-xs font-bold text-blue-400 flex items-center gap-1.5">
                <span>Gemini AI + Technical Models</span>
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. Interactive AI Signal Predictor Widget ── */}
        <section
          id="ai-signals"
          className="w-full max-w-7xl 2xl:max-w-screen-2xl 3xl:max-w-screen-2xl px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-20 py-16 sm:py-24 2xl:py-32 border-t border-white/5"
        >
          <div className="text-center max-w-3xl 2xl:max-w-4xl mx-auto mb-12">
            <span className="text-xs 2xl:text-sm font-bold uppercase tracking-widest text-emerald-400">
              Powered by Gemini AI
            </span>
            <h2 className="text-2xl sm:text-4xl 2xl:text-5xl font-extrabold text-white tracking-tight mt-2">
              Test Real-Time AI Stock Pattern Analysis
            </h2>
            <p className="text-xs sm:text-sm 2xl:text-base text-neutral-400 mt-2">
              Click a ticker symbol below to run instant Gemini AI strategy
              predictions on live chart data.
            </p>
          </div>

          {/* Ticker Selector Bar */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8 sm:mb-10">
            {(["NVDA", "AAPL", "TSLA", "SHOP.TO"] as const).map((ticker) => (
              <button
                key={ticker}
                type="button"
                onClick={() => handleTickerSelect(ticker)}
                className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm 2xl:text-base transition cursor-pointer flex items-center gap-2 ${
                  selectedTicker === ticker
                    ? "bg-emerald-500 text-black shadow-[0_0_25px_rgba(16,185,129,0.4)]"
                    : "bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white"
                }`}
              >
                <Bot className="h-4 w-4 2xl:h-5 2xl:w-5" />
                <span>{ticker}</span>
              </button>
            ))}
          </div>

          {/* AI Signal Output Glass Card */}
          <div className="max-w-3xl 2xl:max-w-4xl mx-auto bg-[#0d0d0d] border border-emerald-500/30 rounded-3xl p-6 sm:p-8 2xl:p-10 text-left shadow-2xl relative overflow-hidden backdrop-blur-2xl">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-emerald-400">
                <BrainCircuit className="h-8 w-8 2xl:h-10 2xl:w-10 animate-spin" />
                <span className="text-xs 2xl:text-sm font-bold">
                  Analyzing {selectedTicker} Technical Candlesticks…
                </span>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                  <div>
                    <span className="text-xs 2xl:text-sm font-bold text-neutral-400 uppercase">
                      Selected Ticker
                    </span>
                    <h3 className="text-2xl 2xl:text-3xl font-black text-white mt-0.5">
                      {selectedTicker}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs 2xl:text-sm font-bold text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                      {aiSignalData[selectedTicker].confidence} Confidence
                    </span>
                    <p className="text-xs 2xl:text-sm text-neutral-400 mt-1 font-mono">
                      {aiSignalData[selectedTicker].price}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 2xl:p-5 bg-neutral-900/80 rounded-2xl border border-neutral-800">
                    <span className="text-[10px] 2xl:text-xs text-neutral-500 uppercase tracking-wider font-bold">
                      Predicted Target Breakout
                    </span>
                    <p className="text-xl 2xl:text-2xl font-extrabold text-emerald-400 mt-1">
                      {aiSignalData[selectedTicker].target}
                    </p>
                  </div>
                  <div className="p-4 2xl:p-5 bg-neutral-900/80 rounded-2xl border border-neutral-800">
                    <span className="text-[10px] 2xl:text-xs text-neutral-500 uppercase tracking-wider font-bold">
                      Stop Loss Level
                    </span>
                    <p className="text-xl 2xl:text-2xl font-extrabold text-red-400 mt-1">
                      {aiSignalData[selectedTicker].stop}
                    </p>
                  </div>
                </div>

                <p className="text-xs 2xl:text-sm text-neutral-300 bg-neutral-900 p-4 2xl:p-5 rounded-2xl border border-neutral-800 leading-relaxed">
                  🤖{" "}
                  <strong className="text-white font-semibold">
                    Gemini AI Model:
                  </strong>{" "}
                  {aiSignalData[selectedTicker].reason}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── 5. Interactive P&L Return Calculator Section ── */}
        <section
          id="calculator"
          className="w-full max-w-7xl 2xl:max-w-screen-2xl 3xl:max-w-screen-2xl px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-20 py-16 sm:py-24 2xl:py-32 border-t border-white/5"
        >
          <div className="bg-linear-to-b from-[#121212] to-[#0a0a0a] border border-white/10 rounded-3xl p-6 sm:p-10 md:p-14 2xl:p-16 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-10 2xl:gap-16">
              {/* Left Column: Sliders */}
              <div className="lg:w-1/2 w-full space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs 2xl:text-sm font-bold">
                  <Calculator className="h-3.5 w-3.5 2xl:h-4 2xl:w-4" />
                  <span>Interactive Growth Model</span>
                </div>
                <h2 className="text-2xl sm:text-4xl 2xl:text-5xl font-extrabold text-white tracking-tight">
                  Calculate Your Trading Portfolio Growth
                </h2>
                <p className="text-xs sm:text-sm 2xl:text-base text-neutral-400 leading-relaxed">
                  Adjust your starting capital and target win-rate to estimate
                  potential portfolio returns using Trade View auto-journaling
                  discipline.
                </p>

                {/* Capital Slider */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-xs 2xl:text-sm font-bold">
                    <span className="text-neutral-300 uppercase tracking-wider">
                      Starting CAD Capital
                    </span>
                    <span className="text-emerald-400 font-mono text-base 2xl:text-lg">
                      CA${startingCapital.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="100000"
                    step="1000"
                    value={startingCapital}
                    onChange={(e) => setStartingCapital(Number(e.target.value))}
                    className="w-full accent-emerald-400 bg-neutral-800 h-2 2xl:h-3 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] 2xl:text-xs text-neutral-500 font-mono">
                    <span>CA$1,000</span>
                    <span>CA$50,000</span>
                    <span>CA$100,000</span>
                  </div>
                </div>

                {/* Win Rate Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs 2xl:text-sm font-bold">
                    <span className="text-neutral-300 uppercase tracking-wider">
                      Target Strategy Win-Rate
                    </span>
                    <span className="text-emerald-400 font-mono text-base 2xl:text-lg">
                      {targetWinRate}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="95"
                    step="5"
                    value={targetWinRate}
                    onChange={(e) => setTargetWinRate(Number(e.target.value))}
                    className="w-full accent-emerald-400 bg-neutral-800 h-2 2xl:h-3 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] 2xl:text-xs text-neutral-500 font-mono">
                    <span>50% (Break Even)</span>
                    <span>75% (Target)</span>
                    <span>95% (Pro)</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Output Card */}
              <div className="lg:w-1/2 w-full bg-[#080808] border border-emerald-500/30 rounded-2xl p-6 sm:p-8 2xl:p-10 space-y-6 text-left shadow-[0_0_50px_rgba(16,185,129,0.15)]">
                <div>
                  <span className="text-[10px] 2xl:text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Estimated Monthly Net Gain
                  </span>
                  <p className="text-3xl sm:text-4xl 2xl:text-5xl font-black text-emerald-400 mt-1">
                    +CA${Number(estimatedMonthlyProfit).toLocaleString()}
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-800">
                  <span className="text-[10px] 2xl:text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Projected 12-Month Portfolio Value
                  </span>
                  <p className="text-2xl sm:text-3xl 2xl:text-4xl font-extrabold text-white mt-1">
                    CA${Number(estimatedAnnualValue).toLocaleString()}
                  </p>
                </div>

                <div className="p-4 2xl:p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs 2xl:text-sm text-emerald-300 leading-relaxed flex items-start gap-2.5">
                  <Sparkles className="h-4 w-4 2xl:h-5 2xl:w-5 shrink-0 mt-0.5 text-emerald-400" />
                  <span>
                    Consistently logging your daily P&amp;L improves win rates
                    by revealing key strategy weaknesses early.
                  </span>
                </div>

                <p className="text-[10px] 2xl:text-xs text-neutral-500 leading-normal pt-1">
                  * Note: Growth model outputs are mathematical simulations
                  based on hypothetical input parameters. Trade View provides no
                  guarantee of monetary profits or real trading returns.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. Community & Public Leaderboard Showcase ── */}
        <section
          id="community"
          className="w-full max-w-7xl 2xl:max-w-screen-2xl 3xl:max-w-screen-2xl px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-20 py-16 2xl:py-24 border-t border-white/5"
        >
          <div className="text-center max-w-3xl 2xl:max-w-4xl mx-auto mb-12">
            <span className="text-xs 2xl:text-sm font-bold uppercase tracking-widest text-emerald-400">
              Public Community Leaderboard
            </span>
            <h2 className="text-2xl sm:text-4xl 2xl:text-5xl font-extrabold text-white tracking-tight mt-2">
              Learn from Top-Performing Traders
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 2xl:gap-8">
            {topTraders.map((trader) => (
              <div
                key={trader.rank}
                className="bg-[#0e0e0e] border border-white/10 hover:border-emerald-500/40 rounded-2xl p-6 2xl:p-8 flex flex-col justify-between transition-all group shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 2xl:w-8 2xl:h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs 2xl:text-sm flex items-center justify-center border border-emerald-500/30">
                        #{trader.rank}
                      </span>
                      <span className="font-bold text-white text-sm 2xl:text-base">
                        {trader.name}
                      </span>
                    </div>
                    <span className="text-xs 2xl:text-sm font-mono px-2.5 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-800">
                      {trader.badge}
                    </span>
                  </div>

                  <p className="text-2xl 2xl:text-3xl font-black text-emerald-400">
                    {trader.profit}
                  </p>
                  <p className="text-xs 2xl:text-sm text-neutral-400 mt-1">
                    Win Rate:{" "}
                    <span className="text-white font-bold">
                      {trader.winRate}
                    </span>
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs 2xl:text-sm">
                  <span className="text-neutral-500">Strategy</span>
                  <span className="text-emerald-400 font-semibold">
                    {trader.strategy}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 7. Interactive Terminal Feature Switcher ── */}
        <section
          id="preview"
          className="w-full max-w-7xl 2xl:max-w-screen-2xl 3xl:max-w-screen-2xl px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-20 py-16 sm:py-24 2xl:py-32 border-t border-white/5"
        >
          <div className="flex flex-col lg:flex-row xl:flex-row items-center justify-between gap-8 sm:gap-12 lg:gap-16 2xl:gap-20">
            <div className="lg:w-1/2 w-full space-y-4 sm:space-y-6 text-left">
              <span className="text-xs 2xl:text-sm font-bold uppercase tracking-widest text-emerald-400">
                Interactive Preview
              </span>
              <h2 className="text-2xl sm:text-4xl md:text-5xl 2xl:text-6xl font-extrabold text-white tracking-tight">
                Designed for Absolute Clarity Under Fast Market Conditions
              </h2>
              <p className="text-xs sm:text-sm 2xl:text-base text-neutral-400 leading-relaxed">
                Switch between core terminal systems below to experience how
                Trade View streamlines your everyday trading workflow.
              </p>

              {/* Tab Selector Buttons */}
              <div className="flex flex-col gap-3 pt-2 sm:pt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("journal")}
                  className={`p-3.5 sm:p-4 2xl:p-5 rounded-xl sm:rounded-2xl text-left border transition-all cursor-pointer ${
                    activeTab === "journal"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-white shadow-lg"
                      : "bg-neutral-900/50 border-neutral-800 text-neutral-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm 2xl:text-base">
                      1. P&amp;L Journal &amp; Calendar Heatmaps
                    </span>
                    <BookOpen
                      className={`h-4 w-4 2xl:h-5 2xl:w-5 ${activeTab === "journal" ? "text-emerald-400" : "text-neutral-500"}`}
                    />
                  </div>
                  <p className="text-[11px] sm:text-xs 2xl:text-sm text-neutral-400 mt-1">
                    Track winning and red sessions with automated weekday logs
                    and instant notes.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("currency")}
                  className={`p-3.5 sm:p-4 2xl:p-5 rounded-xl sm:rounded-2xl text-left border transition-all cursor-pointer ${
                    activeTab === "currency"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-white shadow-lg"
                      : "bg-neutral-900/50 border-neutral-800 text-neutral-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm 2xl:text-base">
                      2. Wealthsimple Dual Currency Engine
                    </span>
                    <DollarSign
                      className={`h-4 w-4 2xl:h-5 2xl:w-5 ${activeTab === "currency" ? "text-emerald-400" : "text-neutral-500"}`}
                    />
                  </div>
                  <p className="text-[11px] sm:text-xs 2xl:text-sm text-neutral-400 mt-1">
                    Seamlessly trade US stocks in USD with real-time conversion
                    deducted from your base CAD balance.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("ai")}
                  className={`p-3.5 sm:p-4 2xl:p-5 rounded-xl sm:rounded-2xl text-left border transition-all cursor-pointer ${
                    activeTab === "ai"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-white shadow-lg"
                      : "bg-neutral-900/50 border-neutral-800 text-neutral-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm 2xl:text-base">
                      3. Gemini AI &amp; 3D Stock Chart Visualizer
                    </span>
                    <BrainCircuit
                      className={`h-4 w-4 2xl:h-5 2xl:w-5 ${activeTab === "ai" ? "text-emerald-400" : "text-neutral-500"}`}
                    />
                  </div>
                  <p className="text-[11px] sm:text-xs 2xl:text-sm text-neutral-400 mt-1">
                    Permanent peak/trough dots, target price levels, and AI
                    confidence scores for any ticker.
                  </p>
                </button>
              </div>
            </div>

            {/* Display Screen Preview Panel */}
            <div className="lg:w-1/2 w-full bg-[#0e0e0e] border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 2xl:p-8 shadow-2xl backdrop-blur-xl relative">
              {activeTab === "journal" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <span className="text-xs 2xl:text-sm font-bold text-white uppercase tracking-wider">
                      P&amp;L Journal Heatmap
                    </span>
                    <span className="text-[10px] 2xl:text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Active Session
                    </span>
                  </div>
                  <div className="grid grid-cols-7 gap-1 sm:gap-2 py-2 text-center text-[9px] sm:text-[10px] 2xl:text-xs text-neutral-500 font-mono">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                    <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      +CA$420
                    </div>
                    <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      +CA$180
                    </div>
                    <div className="p-2 sm:p-2.5 rounded-xl bg-red-500/20 text-red-400 font-bold border border-red-500/30">
                      -CA$90
                    </div>
                    <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      +CA$650
                    </div>
                    <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      +CA$310
                    </div>
                    <div className="p-2 sm:p-2.5 rounded-xl bg-neutral-900/40 text-neutral-600 border border-neutral-800/40 opacity-40">
                      Off
                    </div>
                    <div className="p-2 sm:p-2.5 rounded-xl bg-neutral-900/40 text-neutral-600 border border-neutral-800/40 opacity-40">
                      Off
                    </div>
                  </div>
                  <p className="text-xs 2xl:text-sm text-neutral-400 bg-neutral-900 p-3 rounded-xl border border-neutral-800">
                    ⚡ Auto-logged 5:00 PM Market Close:{" "}
                    <span className="text-emerald-400 font-bold">
                      +CA$1,470.00 Net P&amp;L
                    </span>{" "}
                    (80% Win Rate)
                  </p>
                </div>
              )}

              {activeTab === "currency" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <span className="text-xs 2xl:text-sm font-bold text-white uppercase tracking-wider">
                      Multi-Currency Execution Ledger
                    </span>
                    <span className="text-[10px] 2xl:text-xs font-mono text-neutral-400">
                      Rate: 1.40 CAD/USD
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="p-3 bg-neutral-900/90 rounded-xl border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0 text-xs 2xl:text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🇺🇸</span>
                        <span className="font-bold text-white">
                          NVDA Buy Order
                        </span>
                      </div>
                      <span className="font-mono text-neutral-300">
                        10 Shares @ $128.40 USD (CA$1,797.60)
                      </span>
                    </div>
                    <div className="p-3 bg-neutral-900/90 rounded-xl border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0 text-xs 2xl:text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🇨🇦</span>
                        <span className="font-bold text-white">
                          SHOP.TO Buy Order
                        </span>
                      </div>
                      <span className="font-mono text-neutral-300">
                        25 Shares @ CA$95.20 CAD
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "ai" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <span className="text-xs 2xl:text-sm font-bold text-white uppercase tracking-wider">
                      Gemini AI Technical Model
                    </span>
                    <span className="text-[10px] 2xl:text-xs font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      92% Signal Confidence
                    </span>
                  </div>
                  <div className="p-4 bg-neutral-900/90 rounded-2xl border border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between text-xs 2xl:text-sm">
                      <span className="text-neutral-400">
                        Target Breakout Level:
                      </span>
                      <span className="font-bold text-emerald-400">
                        $142.50 USD
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs 2xl:text-sm">
                      <span className="text-neutral-400">
                        Invalidation Stop Loss:
                      </span>
                      <span className="font-bold text-red-400">
                        $121.10 USD
                      </span>
                    </div>
                    <p className="text-xs 2xl:text-sm text-neutral-300 pt-2 border-t border-neutral-800 leading-relaxed">
                      🤖 Gemini AI Strategy: Higher lows forming above 20 EMA
                      with bullish volume expansion on intraday timeframe.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── 8. Frequently Asked Questions (FAQ) ── */}
        <section
          id="faq"
          className="w-full max-w-4xl 2xl:max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 2xl:py-32 border-t border-white/5"
        >
          <div className="text-center mb-12 sm:mb-16">
            <span className="text-xs 2xl:text-sm font-bold uppercase tracking-widest text-emerald-400">
              Everything Explained
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl 2xl:text-6xl font-extrabold text-white tracking-tight mt-2 sm:mt-3">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-[#0e0e0e] border border-white/10 rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-4 sm:p-6 2xl:p-7 text-left font-bold text-white text-sm sm:text-base 2xl:text-lg flex items-center justify-between cursor-pointer gap-3"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 sm:h-5 2xl:h-6 w-4 sm:w-5 2xl:w-6 text-emerald-400 shrink-0 transition-transform duration-300 ${
                      activeFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-4 sm:px-6 2xl:px-7 pb-4 sm:pb-6 2xl:pb-7 text-xs 2xl:text-sm text-neutral-400 leading-relaxed border-t border-neutral-800/80 pt-3 sm:pt-4 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── 9. High Conversion Glass CTA Banner ── */}
        <section className="w-full max-w-7xl 2xl:max-w-screen-2xl 3xl:max-w-screen-2xl px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-20 py-12 sm:py-20 my-6 sm:my-12">
          <div className="relative rounded-2xl sm:rounded-3xl bg-linear-to-r from-emerald-950/60 via-[#0e0e0e] to-emerald-950/60 border border-emerald-500/40 p-6 sm:p-10 md:p-14 lg:p-16 2xl:p-20 text-center overflow-hidden shadow-[0_0_90px_rgba(16,185,129,0.2)] backdrop-blur-2xl">
            <div className="relative z-10 max-w-2xl 2xl:max-w-3xl mx-auto space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-4xl md:text-5xl 2xl:text-6xl font-extrabold text-white tracking-tight">
                Ready to Upgrade Your Portfolio Tracking?
              </h2>
              <p className="text-xs sm:text-sm 2xl:text-base text-neutral-300 leading-relaxed">
                Join thousands of Canadian &amp; US traders logging daily
                P&amp;L, calculating average costs, and tracking multi-currency
                stock performance.
              </p>

              <div className="pt-2 sm:pt-4 flex justify-center">
                <Link
                  href={isLoggedIn ? "/dashboard" : "/register"}
                  id="banner-cta-btn"
                  className="w-full sm:w-auto px-6 sm:px-8 2xl:px-10 py-3.5 sm:py-4 2xl:py-5 font-bold bg-emerald-500 hover:bg-emerald-400 text-black text-xs sm:text-sm 2xl:text-base rounded-2xl shadow-[0_0_35px_rgba(16,185,129,0.4)] transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <span>
                    {isLoggedIn
                      ? "Launch Dashboard Now"
                      : "Create Free Account"}
                  </span>
                  <ArrowRight className="h-4 w-4 2xl:h-5 2xl:w-5 stroke-[2.5]" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── 10. Glass Footer ── */}
      <footer className="w-full py-8 sm:py-12 2xl:py-16 border-t border-white/5 bg-[#060606] text-xs 2xl:text-sm text-neutral-500 z-10 relative">
        <div className="max-w-7xl 2xl:max-w-screen-2xl 3xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-20 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <TradeViewLogo showText={true} size={30} borderless={true} />
            <span className="text-[10px] 2xl:text-xs text-neutral-600 font-mono ml-2">
              © {new Date().getFullYear()} Trade View Pro
            </span>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 2xl:gap-8 text-neutral-400 text-xs 2xl:text-sm font-semibold">
            <Link
              href="/dashboard"
              className="hover:text-emerald-400 transition"
            >
              Terminal
            </Link>
            <Link
              href="/dashboard/watchlist"
              className="hover:text-emerald-400 transition"
            >
              Watchlist
            </Link>
            <Link
              href="/dashboard/journal"
              className="hover:text-emerald-400 transition"
            >
              Journal
            </Link>
            <Link href="/login" className="hover:text-emerald-400 transition">
              Sign In
            </Link>
          </div>

          <div className="flex items-center gap-2 text-neutral-500 font-mono text-[10px] 2xl:text-xs">
            <Shield className="h-3.5 w-3.5 2xl:h-4 2xl:w-4 text-emerald-400" />
            <span>SQLite &amp; Supabase Multi-DB</span>
          </div>
        </div>

        {/* Risk & Profit Guarantee Disclaimer Bar */}
        <div className="w-full max-w-7xl 2xl:max-w-screen-2xl 3xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-20 mt-8 pt-6 border-t border-neutral-900 text-center">
          <p className="text-[11px] sm:text-xs text-neutral-500 leading-relaxed max-w-4xl mx-auto">
            <strong className="text-neutral-400 font-semibold">
              ⚠️ Financial &amp; Profit Disclaimer:
            </strong>{" "}
            Trade View is a tracking, analytical journal, and educational
            platform only. It does not provide financial, investment, or legal
            advice. All metrics, calculator simulations, live ticker previews,
            and AI technical pattern predictions are for hypothetical modeling
            purposes only and{" "}
            <strong className="text-neutral-400 font-semibold">
              do not guarantee real-world monetary profit or trading returns
            </strong>
            . Trading stocks involves real financial risk.
          </p>
        </div>
      </footer>
    </div>
  );
}
