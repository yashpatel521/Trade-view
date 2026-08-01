'use client';

import React from 'react';

interface TradeViewLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export const TradeViewLogo: React.FC<TradeViewLogoProps> = ({
  size = 32,
  showText = true,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Downloaded Brand Logo Image */}
      <img
        src="/logo.png"
        alt="Trade View Logo"
        className="rounded-xl object-contain bg-neutral-900 border border-emerald-500/30 p-1 shadow-md shrink-0"
        style={{ width: `${size + 6}px`, height: `${size + 6}px` }}
      />

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-extrabold text-base tracking-tight text-white">
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
