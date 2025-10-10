'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Reset loading state when navigation completes
    setLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    // Start loading animation
    if (loading) {
      document.body.style.cursor = 'wait';
    } else {
      document.body.style.cursor = '';
    }
  }, [loading]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-primary/20">
      <div className="h-full bg-primary animate-progress-bar" />
    </div>
  );
}

