"use client";

import { useEffect, useState, ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface HydrationSafeProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

export default function HydrationSafe({
  children,
  fallback = (
    <div className="flex items-center justify-center p-4">
      <Loader2 className="h-4 w-4 animate-spin" />
    </div>
  ),
  className = ""
}: HydrationSafeProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM is fully ready
    const frame = requestAnimationFrame(() => {
      // Add small delay to let browser extensions finish their work
      setTimeout(() => {
        setIsHydrated(true);
      }, 100);
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  if (!isHydrated) {
    return <div className={className}>{fallback}</div>;
  }

  return <div className={className}>{children}</div>;
}
