import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Free Account | Trade View Pro Portfolio Tracker',
  description:
    'Sign up for a free Trade View account. Get instant access to real-time stock quotes, automated CAD/USD multi-currency trading journal, and Gemini AI pattern predictions.',
  keywords: [
    'Trade View register',
    'create trading journal account',
    'free portfolio tracker sign up',
    'CAD USD trading journal',
    'stock market journal',
    'Gemini AI stock signals',
  ],
  openGraph: {
    title: 'Create Free Account | Trade View Pro Portfolio Tracker',
    description:
      'Sign up for a free Trade View account. Get instant access to real-time stock quotes, automated CAD/USD multi-currency trading journal, and Gemini AI pattern predictions.',
    url: 'https://trade-view.app/register',
    siteName: 'Trade View',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Create Free Account | Trade View Pro Portfolio Tracker',
    description:
      'Sign up for a free Trade View account. Access real-time stock quotes and automated CAD/USD multi-currency trading journal.',
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
