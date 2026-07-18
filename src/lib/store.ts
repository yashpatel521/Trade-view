import { create } from 'zustand';

interface CurrencyState {
  currency: 'CAD' | 'USD';
  setCurrency: (currency: 'CAD' | 'USD') => void;
}

export const useCurrencyStore = create<CurrencyState>((set) => ({
  currency: 'CAD',
  setCurrency: (currency) => set({ currency }),
}));
