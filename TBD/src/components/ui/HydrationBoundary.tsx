"use client";

import { useEffect, useState, ReactNode } from "react";

interface HydrationBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function HydrationBoundary({
  children,
  fallback = <div style={{ minHeight: '1px' }} />
}: HydrationBoundaryProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Wait for next tick to ensure DOM is ready and extensions have loaded
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // During SSR and initial hydration, show fallback
  if (!isHydrated) {
    return <>{fallback}</>;
  }

  // After hydration, show actual content
  return <>{children}</>;
}
