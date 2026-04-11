'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';

// const STORAGE_KEY = 'rtt_beta_banner_dismissed_v1';

const ALLOWED_PATHS = [
  '/app/dashboard',
  '/app/practice',
  '/app/flashcards',
  '/app/mock-exam',
];

const MESSAGE =
  '🚧 Improving daily based on real student feedback. We’re aware of a few issues and working to resolve them soon. Your core study tools should still work smoothly. We appreciate your patience. 🚧';

export default function BetaBanner() {
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(true);
  const [mounted, setMounted] = useState(false);

  const shouldShowOnPath = useMemo(() => {
    if (!pathname) return false;
    return ALLOWED_PATHS.some((path) => pathname === path || pathname.startsWith(path + '/'));
  }, [pathname]);

  // useEffect(() => {
  //   setMounted(true);
  //   try {
  //     const saved = window.localStorage.getItem(STORAGE_KEY);
  //     setDismissed(saved === '1');
  //   } catch {
  //     setDismissed(false);
  //   }
  // }, []);

  // const handleDismiss = () => {
  //   try {
  //     window.localStorage.setItem(STORAGE_KEY, '1');
  //   } catch {}
  //   setDismissed(true);
  // };

  useEffect(() => {
    setMounted(true);
    setDismissed(false);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
  };

  if (!mounted || dismissed || !shouldShowOnPath) return null;

  return (
    <div className="border-b border-yellow-400/20 bg-[#12161b]">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-2 md:px-6">
        <div className="relative min-w-0 flex-1 overflow-hidden">
          <div className="rtt-beta-marquee-track">
            <div className="rtt-beta-marquee-content">
              <span className="text-xs font-medium tracking-wide text-amber-300 md:text-sm">
                {MESSAGE}
              </span>
              <span
                className="mx-8 text-xs font-medium tracking-wide text-amber-300 md:text-sm"
                aria-hidden="true"
              >
                {MESSAGE}
              </span>
            </div>

            <div
              className="rtt-beta-marquee-content"
              aria-hidden="true"
            >
              <span className="text-xs font-medium tracking-wide text-amber-300 md:text-sm">
                {MESSAGE}
              </span>
              <span className="mx-8 text-xs font-medium tracking-wide text-amber-300 md:text-sm">
                {MESSAGE}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss beta banner"
          className="shrink-0 rounded-md border border-white/10 px-2 py-1 text-xs text-white/70 transition hover:bg-white/5 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
