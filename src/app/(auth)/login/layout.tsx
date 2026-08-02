import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In to Trade View | Pro Portfolio Tracker & Trading Journal',
  description:
    'Log in to your Trade View account to access real-time stock quotes, automated CAD/USD multi-currency trading journal, and Gemini AI pattern predictions.',
  keywords: [
    'Trade View login',
    'trading journal login',
    'portfolio tracker sign in',
    'CAD USD trading journal',
    'stock market journal',
    'Gemini AI stock signals',
  ],
  openGraph: {
    title: 'Sign In to Trade View | Pro Portfolio Tracker & Trading Journal',
    description:
      'Log in to your Trade View account to access real-time stock quotes, automated CAD/USD multi-currency trading journal, and Gemini AI pattern predictions.',
    url: 'https://trade-view.app/login',
    siteName: 'Trade View',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sign In to Trade View | Pro Portfolio Tracker',
    description:
      'Log in to your Trade View account to access real-time stock quotes, automated CAD/USD multi-currency trading journal.',
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
