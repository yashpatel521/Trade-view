'use client';

import React, { useState } from 'react';

interface StockLogoProps {
  ticker: string;
  className?: string;
  size?: number;
}

export const StockLogo: React.FC<StockLogoProps> = ({ ticker, className = 'h-7 w-7', size = 28 }) => {
  const [hasError, setHasError] = useState(false);

  const clean = ticker ? ticker.toUpperCase().trim().replace(/\.(TO|V|CN)$/i, '') : '';
  const logoUrl = `https://assets.parqet.com/logos/symbol/${clean}?format=png`;

  if (hasError || !clean) {
    return (
      <div
        className={`${className} rounded-full bg-neutral-800 flex items-center justify-center font-bold text-[10px] text-white shrink-0 border border-neutral-700 select-none`}
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        {clean.slice(0, 2)}
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={ticker}
      onError={() => setHasError(true)}
      className={`${className} rounded-full object-contain bg-white/5 border border-neutral-700 shrink-0`}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
};

export default StockLogo;
