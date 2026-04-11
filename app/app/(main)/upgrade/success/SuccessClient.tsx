'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { captureEvent } from '@/lib/analytics';

export default function SuccessClient() {
  const searchParams = useSearchParams();

  const [message, setMessage] = useState('Verifying payment...');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      setMessage('Missing session id.');
      return;
    }

    (async () => {
      try {
        const res = await fetch('/api/stripe/verify-session?session_id=' + sessionId);
        const data = await res.json();

        if (data.success) {
          try {
            const purchaseKey = `rtt_purchase_completed_${sessionId}`;
            if (window.sessionStorage.getItem(purchaseKey) !== '1') {
              captureEvent('purchase_completed', {
                source: 'stripe_success_page',
                session_id: sessionId,
              });
              window.sessionStorage.setItem(purchaseKey, '1');
            }
          } catch {
            captureEvent('purchase_completed', {
              source: 'stripe_success_page',
              session_id: sessionId,
            });
          }

          setReady(true);
          setMessage('Your Pro access has been unlocked.');
        } else {
          setMessage('Could not verify payment yet. Refresh this page in a few seconds.');
        }
      } catch (e) {
        setMessage('Verification failed.');
      }
    })();
  }, [searchParams]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <div className="inline-flex rounded-full bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-300">
          PAYMENT COMPLETE
        </div>

        <h1 className="mt-4 text-3xl font-semibold text-white">
          Welcome to Pro
        </h1>

        <p className="mt-3 text-sm text-white/70">
          {message}
        </p>

        <div className="mt-8 flex gap-3">
          <Link href="/app/dashboard" className="rounded-xl bg-yellow-400 px-4 py-3 text-sm font-semibold text-black">
            Go to Dashboard
          </Link>

          <Link href="/app/practice" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white">
            Go to Practice
          </Link>

          {ready && (
            <span className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
              Pro unlocked
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
