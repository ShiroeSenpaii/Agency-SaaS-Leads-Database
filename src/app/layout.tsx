import type { Metadata } from 'next';
import './globals.css';
import { TopNav } from '@/components/top-nav';

export const metadata: Metadata = {
  title: 'Opportunity Operator',
  description: 'Local-first opportunity and client manager',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main className="mx-auto max-w-6xl px-4 py-6">
          <h1 className="mb-3 text-2xl font-bold">Opportunity Operator</h1>
          <TopNav />
          {children}
        </main>
      </body>
    </html>
  );
}
