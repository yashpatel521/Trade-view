'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { searchStocksAction } from '@/lib/actions/trading';
import { StockSearchResult } from '@/types/trading';
import { Search, Loader2, TrendingUp, ChevronRight } from 'lucide-react';

interface StockSearchAutocompleteProps {
  placeholder?: string;
  onSelectSymbol?: (symbol: string) => void;
  className?: string;
  inputClassName?: string;
}

export function StockSearchAutocomplete({
  placeholder = 'Search stocks (e.g. NVDA, AAPL)...',
  onSelectSymbol,
  className = '',
  inputClassName = '',
}: StockSearchAutocompleteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 300ms Debounce Logic
  useEffect(() => {
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      setResults([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await searchStocksAction(cleanQuery);
        setResults(data);
        setIsOpen(data.length > 0);
      } catch (err) {
        console.error('Debounced search failed:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click Outside to Close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (symbol: string) => {
    setIsOpen(false);
    setQuery('');
    if (onSelectSymbol) {
      onSelectSymbol(symbol);
    } else {
      router.push(`/dashboard/stocks/${symbol.toUpperCase()}`);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <Search className="h-4 w-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setIsOpen(false);
          }}
          placeholder={placeholder}
          className={`w-full pl-9 pr-9 py-1.5 text-xs bg-[#141414] border border-[#222] rounded-lg placeholder-neutral-500 focus:outline-none transition ${inputClassName}`}
        />
        {isLoading && (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400 absolute right-3 top-1/2 -translate-y-1/2" />
        )}
      </div>

      {/* Floating Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#141414] border border-[#262626] rounded-xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-bold text-neutral-500 uppercase tracking-wider bg-[#0d0d0d] flex items-center justify-between">
            <span>Finnhub Live Symbol Search</span>
            <span className="text-emerald-400">300ms Debounced</span>
          </div>

          {results.map((item) => (
            <button
              key={item.symbol + item.description}
              type="button"
              onClick={() => handleSelect(item.symbol)}
              className="w-full text-left px-3.5 py-2.5 hover:bg-[#1f1f1f] transition-colors flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-emerald-400 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition">
                  <TrendingUp className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-white group-hover:text-emerald-400 transition-colors">
                      {item.symbol}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                      {item.type}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5 font-medium">
                    {item.description}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-neutral-600 group-hover:text-white transition-colors" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
export default StockSearchAutocomplete;
