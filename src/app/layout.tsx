import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'Opportunity Operator',
  description: 'Opportunity and client manager with Supabase persistence',
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
          <AppShell>{children}</AppShell>
        </main>
      </body>
    </html>
  );
}
