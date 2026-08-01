'use client';

import React from 'react';

interface TradeViewLogoProps {
  size?: number;
  showText?: boolean;
  borderless?: boolean;
  className?: string;
}

export const TradeViewLogo: React.FC<TradeViewLogoProps> = ({
  size = 32,
  showText = true,
  borderless = false,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Logo Image */}
      <img
        src="/logo.png"
        alt="Trade View Logo"
        className={`object-contain shrink-0 bg-transparent ${
          borderless
            ? 'p-0 border-0 rounded-none shadow-none'
            : 'rounded-xl border border-emerald-500/30 p-1 shadow-md'
        }`}
        style={{ width: `${size}px`, height: `${size}px` }}
      />

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-extrabold text-lg tracking-tight text-white">
            Trade<span className="text-emerald-400">View</span>
          </span>
          <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-semibold mt-0.5">
            Pro Terminal
          </span>
        </div>
      )}
    </div>
  );
};

export default TradeViewLogo;
