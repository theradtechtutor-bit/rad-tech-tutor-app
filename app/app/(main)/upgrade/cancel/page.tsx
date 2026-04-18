'use client';

import { Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { captureEvent } from '@/lib/analytics';

function UpgradeCancelPageInner() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'unknown';

  useEffect(() => {
    captureEvent('checkout_abandoned', {
      source: 'stripe_cancel_page',
      plan,
    });

    fetch('/api/events/checkout-abandoned', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    }).catch(() => {});
  }, [plan]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
          CHECKOUT CANCELED
        </div>

        <h1 className="mt-4 text-3xl font-semibold text-white">No worries</h1>

        <p className="mt-3 text-sm text-white/70">
          Your checkout was canceled before payment completed. You can come back
          any time.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/app/upgrade"
            className="rounded-xl bg-yellow-400 px-4 py-3 text-sm font-semibold text-black hover:brightness-95"
          >
            Back to Upgrade
          </Link>

          <Link
            href="/app/practice"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            Keep Practicing
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function UpgradeCancelPage() {
  return (
    <Suspense fallback={null}>
      <UpgradeCancelPageInner />
    </Suspense>
  );
}
