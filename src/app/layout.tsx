import type { Metadata } from 'next';
import './globals.css';
const title = 'DealZephyr | Finance Decision Demo';
const description = 'See how hiring, revenue, and operating assumptions change cash, burn, and runway using DealZephyr’s illustrative finance decision model.';

export const metadata: Metadata = {
  metadataBase: new URL('https://demo.dealzephyr.com'),
  title,
  description,
  robots: { index: false, follow: false },
  icons: { icon: '/dealzephyr-logo.png' },
  openGraph: {
    title,
    description,
    url: 'https://demo.dealzephyr.com',
    siteName: 'DealZephyr',
    type: 'website',
    images: [{ url: '/dealzephyr-logo.png', width: 1254, height: 1254, alt: 'DealZephyr logo' }],
  },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
