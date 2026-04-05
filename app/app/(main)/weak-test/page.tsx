'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Weak-only Practice Test (Training Mode)
 *
 * For now, this is implemented as the "mastery route":
 * it runs only missed questions from your most recent mock exam (if any).
 */
export default function WeakOnlyPracticeTestPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/app/practice/qbank1?mode=mastery');
  }, [router]);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="text-sm text-white/70">Loading weak-only practice…</div>
    </div>
  );
}
