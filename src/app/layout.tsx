import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'DealZephyr | Auralane Decision Demo', description: 'An illustrative finance decision demo for DealZephyr.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
