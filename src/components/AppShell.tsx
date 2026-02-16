'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { browserClient } from '@/lib/supabase/browserClient';
import { TopNav } from '@/components/top-nav';

interface AppShellProps {
  children: ReactNode;
}

const PUBLIC_ROUTES = ['/login'];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const isPublicRoute = useMemo(() => PUBLIC_ROUTES.includes(pathname), [pathname]);

  useEffect(() => {
    let active = true;

    browserClient.auth.getSession().then(({ data }) => {
      if (!active) return;
      const hasSession = Boolean(data.session);
      setIsAuthenticated(hasSession);
      setLoading(false);

      if (!hasSession && !PUBLIC_ROUTES.includes(pathname)) {
        router.replace('/login');
      }
    });

    const {
      data: { subscription },
    } = browserClient.auth.onAuthStateChange((_event, session) => {
      const hasSession = Boolean(session);
      setIsAuthenticated(hasSession);
      if (!hasSession && !PUBLIC_ROUTES.includes(pathname)) {
        router.replace('/login');
      }
      if (hasSession && pathname === '/login') {
        router.replace('/dashboard');
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (loading && !isPublicRoute) {
    return <div className="p-6">Loading…</div>;
  }

  if (!isAuthenticated && !isPublicRoute) {
    return <div className="p-6">Redirecting to login…</div>;
  }

  return (
    <>
      {!isPublicRoute ? <TopNav /> : null}
      {children}
    </>
  );
}
