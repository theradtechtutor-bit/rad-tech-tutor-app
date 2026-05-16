'use client';

import { ReactNode, useEffect, useState } from 'react';
import posthog from 'posthog-js';

function getOrCreateLocalDeviceId() {
  if (typeof window === 'undefined') return '';

  const key = 'rtt_device_id';
  const existing = window.localStorage.getItem(key);

  if (existing) return existing;

  const next =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  window.localStorage.setItem(key, next);
  return next;
}

export default function AccessBlockGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<'checking' | 'allowed' | 'blocked'>('checking');

  useEffect(() => {
    let cancelled = false;

    async function checkAccess() {
      try {
        const deviceId = getOrCreateLocalDeviceId();

        const distinctId =
          typeof posthog?.get_distinct_id === 'function' ? posthog.get_distinct_id() : '';

        const posthogDeviceId =
          typeof posthog?.get_property === 'function'
            ? String(posthog.get_property('$device_id') || '')
            : '';

        const res = await fetch('/api/access/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            device_id: deviceId,
            distinct_id: distinctId,
            posthog_device_id: posthogDeviceId,
          }),
        });

        const data = await res.json();

        if (cancelled) return;

        if (data?.blocked) {
  posthog.capture('blocked_access_hit', {
    matched_type: data?.matched_type || null,
    reason: data?.reason || null,
    device_id: deviceId || null,
    distinct_id: distinctId || null,
    posthog_device_id: posthogDeviceId || null,
    page: window.location.pathname,
  });

  setStatus('blocked');
} else {
  setStatus('allowed');
}
      } catch (error) {
        console.error('Access block check failed:', error);

        // Fail open so this feature never locks everyone out if something breaks.
        if (!cancelled) setStatus('allowed');
      }
    }

    checkAccess();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-5 text-center shadow-2xl">
          <div className="text-sm font-semibold text-white">Loading The Rad Tech Tutor...</div>
          <div className="mt-2 text-xs text-white/50">Checking access status.</div>
        </div>
      </div>
    );
  }

  if (status === 'blocked') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="max-w-md rounded-3xl border border-red-500/30 bg-red-950/20 p-7 text-center shadow-2xl">
          <h1 className="text-xl font-bold text-white">Access Restricted</h1>

          <p className="mt-3 text-sm leading-6 text-white/70">
            Access to this device has been restricted due to suspicious activity or violation
            of our terms.
          </p>

          <p className="mt-4 text-sm text-white/60">
            If you believe this is a mistake, contact{' '}
            <a
              href="mailto:contact@theradtechtutor.com"
              className="font-semibold text-emerald-300 underline underline-offset-4"
            >
              contact@theradtechtutor.com
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
