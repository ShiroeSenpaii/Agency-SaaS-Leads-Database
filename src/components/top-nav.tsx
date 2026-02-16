'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { browserClient } from '@/lib/supabase/browserClient';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/opportunities', label: 'Opportunities' },
  { href: '/clients', label: 'Clients' },
  { href: '/settings', label: 'Settings' },
];

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await browserClient.auth.signOut();
    router.replace('/login');
  };

  return (
    <nav className="mb-6 rounded-lg bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ul className="flex flex-wrap gap-2">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`inline-block rounded-md px-3 py-2 text-sm font-medium ${
                    active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <button className="bg-slate-900 text-sm text-white" onClick={logout} type="button">
          Logout
        </button>
      </div>
    </nav>
  );
}
