'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef } from 'react';

export default function SaveProgressPrompt({
  nextPath,
  title = 'Create a free account to save your progress',
  body = 'You can keep practicing for free right now. Create a free account to save your place and continue where you left off later.',
}: {
  nextPath: string;
  title?: string;
  body?: string;
}) {
  const href = useMemo(() => `/app/login?next=${encodeURIComponent(nextPath)}`, [nextPath]);
  const promptRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = promptRef.current;
    if (!node) return;
    const t = window.setTimeout(() => {
      // node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div
      ref={promptRef}
      className="rounded-2xl border border-emerald-400/20 bg-emerald-400/8 p-4 text-white/90 shadow-[0_0_0_1px_rgba(16,185,129,0.08)]"
    >
      <div className="text-sm font-semibold text-white">{title}</div>
      <p className="mt-2 text-sm leading-6 text-white/70">{body}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Link
          href={href}
          className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:brightness-95"
        >
          Create free account
        </Link>
        <div className="text-xs text-white/50">No payment required to save your spot.</div>
      </div>
    </div>
  );
}
