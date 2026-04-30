'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

function LoginPageInner() {
  const searchParams = useSearchParams();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const nextParam = searchParams.get('next') || '/app/dashboard';

  const redirectTo = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextParam)}`;
  }, [nextParam]);

  async function onGoogleLogin() {
    setGoogleLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });

    setGoogleLoading(false);

    if (error) {
      setError(error.message);
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-73px+240px)] overflow-hidden bg-[color:var(--rtt-bg)] text-[color:var(--rtt-text)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(900px circle at 18% 16%, rgba(20,184,166,0.18), transparent 42%), radial-gradient(900px circle at 82% 18%, rgba(250,204,21,0.10), transparent 40%), radial-gradient(1000px circle at 50% 100%, rgba(20,184,166,0.10), transparent 48%)',
        }}
      />

      <div className="relative px-6 pb-32 pt-12 md:px-10 md:pb-40">
        <section className="mx-auto flex min-h-[calc(100vh-180px)] max-w-6xl items-center justify-center">
          <div className="w-full max-w-md rounded-[30px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_0_60px_-28px_rgba(45,212,191,0.28)] md:p-8">
            <h1 className="text-2xl font-semibold text-white md:text-4xl">Sign in</h1>

            <p className="mt-3 text-sm leading-7 text-white/65">
              Continue with Google to access your account
            </p>

            <button
              type="button"
              onClick={onGoogleLogin}
              disabled={googleLoading}
              className="mt-6 w-full rounded-2xl bg-yellow-400 px-4 py-4 text-base font-semibold text-black transition hover:bg-yellow-300 disabled:opacity-60"
            >
              {googleLoading ? 'Redirecting…' : 'Continue with Google'}
            </button>

            {error ? (
              <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="relative min-h-[calc(100vh-73px+240px)] overflow-hidden bg-[color:var(--rtt-bg)] text-[color:var(--rtt-text)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(900px circle at 18% 16%, rgba(20,184,166,0.18), transparent 42%), radial-gradient(900px circle at 82% 18%, rgba(250,204,21,0.10), transparent 40%), radial-gradient(1000px circle at 50% 100%, rgba(20,184,166,0.10), transparent 48%)',
            }}
          />
          <div className="relative px-6 pb-32 pt-12 md:px-10 md:pb-40">
            <div className="mx-auto max-w-md text-sm text-white/70">Loading…</div>
          </div>
        </div>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}
