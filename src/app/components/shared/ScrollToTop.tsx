'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Disable smooth scroll temporarily so route navigation jumps instantly
    const html = document.documentElement;
    const originalScrollBehavior = html.style.scrollBehavior;
    
    html.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    
    const timer = setTimeout(() => {
      html.style.scrollBehavior = originalScrollBehavior;
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
