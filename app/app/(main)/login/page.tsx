'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

function LoginPageInner() {
  const searchParams = useSearchParams();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHelp, setShowHelp] = useState(false);

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
      options: { redirectTo },
    });

    setGoogleLoading(false);

    if (error) setError(error.message);
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
          <div className="w-full max-w-md rounded-[30px] border border-teal-400/35 bg-white/[0.03] p-6 shadow-[0_0_80px_-28px_rgba(20,184,166,0.45)] md:p-8">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-teal-300">
              Account
            </p>

            <h1 className="text-2xl font-semibold text-white md:text-4xl">
              Sign in
            </h1>

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

            <button
              type="button"
              onClick={() => setShowHelp(true)}
              className="mt-4 text-sm font-medium text-white/55 underline underline-offset-4 transition hover:text-white"
            >
              Need help?
            </button>

            {error ? (
              <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            ) : null}
          </div>
        </section>
      </div>

      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4">
          <div className="w-full max-w-xl rounded-[30px] border border-teal-400/35 bg-white/[0.03] p-6 shadow-[0_0_80px_-28px_rgba(20,184,166,0.45)] backdrop-blur md:p-8">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-teal-300">
              Account access
            </p>

            <h2 className="text-2xl font-semibold text-white md:text-3xl">
              Having trouble logging in?
            </h2>

            <p className="mt-4 text-sm leading-7 text-white/65">
              If you recently became a Pro member using a non-Gmail email,
              recent updates may prevent that old email from logging in
              correctly.
            </p>

            <div className="mt-5 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-4 text-sm leading-6 text-yellow-50">
              <p className="font-semibold text-yellow-200">Quick fix:</p>

              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>Sign in using a Gmail account.</li>
                <li>Email us with your new Gmail address.</li>
                <li>We’ll grant Pro access immediately.</li>
              </ol>
            </div>

            <p className="mt-5 text-sm leading-7 text-white/60">
              If you were not a Pro member, please create a new account using
              Gmail.
            </p>

            <p className="mt-4 text-xs text-white/45">
              Support:{' '}
              <a
                href="mailto:contact@theradtechtutor.com"
                className="text-white/80 underline underline-offset-4 hover:text-white"
              >
                contact@theradtechtutor.com
              </a>
            </p>

            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="mt-6 w-full rounded-2xl bg-yellow-400 px-4 py-4 font-semibold text-black transition hover:bg-yellow-300"
            >
              Got it
            </button>
          </div>
        </div>
      )}
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
            <div className="mx-auto max-w-md text-sm text-white/70">
              Loading…
            </div>
          </div>
        </div>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}