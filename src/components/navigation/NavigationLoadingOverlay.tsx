"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export function NavigationLoadingOverlay() {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsNavigating(true);
    const timeout = setTimeout(() => {
      setIsNavigating(false);
    }, 200);

    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  if (!isNavigating) return null;

  return (
    <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
    </div>
  );
} 