'use client';

import React, { useState } from 'react';

interface StockLogoProps {
  ticker: string;
  className?: string;
  size?: number;
}

// Generate deterministic background color hue based on ticker string
const getTickerHue = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
};

export const StockLogo: React.FC<StockLogoProps> = ({ ticker, className = '', size = 32 }) => {
  const [imgIndex, setImgIndex] = useState(0);

  const clean = ticker ? ticker.toUpperCase().trim().replace(/\.(TO|V|CN)$/i, '') : 'STK';

  // Multi-tier logo URLs
  const sources = [
    `https://assets.parqet.com/logos/symbol/${clean}?format=png`,
    `https://financialmodelingprep.com/image-stock/${clean}.png`,
    `https://logo.clearbit.com/${clean.toLowerCase()}.com`,
  ];

  const handleImgError = () => {
    if (imgIndex < sources.length - 1) {
      setImgIndex((prev) => prev + 1);
    } else {
      setImgIndex(sources.length); // Trigger fallback avatar badge
    }
  };

  if (imgIndex >= sources.length || !clean) {
    const hue = getTickerHue(clean);
    return (
      <div
        className={`${className} rounded-xl flex items-center justify-center font-black text-xs text-white shrink-0 border border-white/20 select-none shadow-md font-mono`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: `linear-gradient(135deg, hsl(${hue}, 70%, 30%), hsl(${(hue + 40) % 360}, 80%, 15%))`,
        }}
      >
        {clean.slice(0, 3)}
      </div>
    );
  }

  return (
    <div
      className={`relative shrink-0 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-md p-0.5 ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <img
        src={sources[imgIndex]}
        alt={`${ticker} logo`}
        onError={handleImgError}
        className="w-full h-full object-contain rounded-lg"
        loading="lazy"
      />
    </div>
  );
};

export default StockLogo;
