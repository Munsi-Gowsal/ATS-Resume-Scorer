'use client';

/**
 * RequireAuth Route Protection Component
 */

import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export interface RequireAuthProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function RequireAuth({
  children,
  redirectTo = '/login',
}: RequireAuthProps): React.ReactNode {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [mounted, setMounted] = useState<boolean>(false);
  const isRedirectingRef = useRef<boolean>(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Compute redirect target URL preserving search query parameters
  const targetRedirectUrl = useMemo(() => {
    if (!pathname || pathname === redirectTo) {
      return redirectTo;
    }
    const queryString = searchParams?.toString();
    const fullPath = queryString ? `${pathname}?${queryString}` : pathname;
    return `${redirectTo}?redirect=${encodeURIComponent(fullPath)}`;
  }, [pathname, redirectTo, searchParams]);

  useEffect(() => {
    if (!mounted || isLoading) {
      return;
    }

    if (!isAuthenticated && pathname !== redirectTo && !isRedirectingRef.current) {
      isRedirectingRef.current = true;
      router.replace(targetRedirectUrl);
    }
  }, [mounted, isAuthenticated, isLoading, pathname, redirectTo, router, targetRedirectUrl]);

  const loadingState = useMemo(
    () => (
      <div
        className="flex min-h-[60vh] w-full items-center justify-center p-6"
        role="status"
        aria-live="polite"
        aria-label="Restoring session"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-sm font-medium text-muted-foreground">
            Restoring session...
          </span>
        </div>
      </div>
    ),
    []
  );

  if (!mounted || isLoading) {
    return loadingState;
  }

  if (!isAuthenticated) {
    return loadingState;
  }

  return children;
}

export default RequireAuth;
