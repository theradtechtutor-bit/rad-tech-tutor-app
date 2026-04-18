'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { captureEvent } from '@/lib/analytics';
import { getMiniMockChallengeStats } from '@/lib/progressStore';

type PlanKey = 'pro_1m' | 'pro_3m' | 'pro_6m';

const plans: Array<{
  key: PlanKey;
  name: string;
  price: string;
  // oldPrice: string;
  monthly?: string;
  detail: string;
  border: string;
  badge?: string;
  helper?: string;
}> = [
  {
    key: 'pro_1m',
    name: '1 Month',
    price: '$49',
    // oldPrice: '$49',
    detail: 'Focused short-term prep.',
    border: 'border-white/10',
  },
  {
    key: 'pro_3m',
    name: '3 Months',
    price: '$99',
    // oldPrice: '$99',
    monthly: 'Only $33/month',
    detail: 'Used by most students for ideal prep time.',
    border: 'border-blue-400/80',
    badge: 'MOST POPULAR',
    helper: 'Best balance of time and value.',
  },
  {
    key: 'pro_6m',
    name: '6 Months',
    price: '$149',
    // oldPrice: '$149',
    monthly: 'Only $25/month',
    detail: 'Lowest monthly cost.',
    border: 'border-teal-400/80',
  },
];

function UnlockCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_40px_-24px_rgba(45,212,191,0.30)]">
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="mt-2 text-sm leading-7 text-white/65">{desc}</div>
    </div>
  );
}

function UpgradePageInner() {
  const searchParams = useSearchParams();
  const autobuy = searchParams.get('autobuy') as PlanKey | null;
  const autoStartedRef = useRef(false);

  const [busyPlan, setBusyPlan] = useState<PlanKey | null>(null);
  const [error, setError] = useState('');

  const [challenge, setChallenge] = useState({ qualifies: false });


  useEffect(() => {
    captureEvent('upgrade_viewed', {
      source: 'upgrade_page',
    });

    fetch('/api/events/upgrade-viewed', {
      method: 'POST',
    }).catch(() => {});
  }, []);

  useEffect(() => {
    try {
const stored = JSON.parse(localStorage.getItem('rtt-progress') || '{}');
      const result = getMiniMockChallengeStats(stored);
      setChallenge(result);
    } catch {
      setChallenge({ qualifies: false });
    }
  }, []);

  async function startCheckout(plan: PlanKey) {
    captureEvent('clicked_get_pro', {
      plan,
      source: autobuy === plan ? 'upgrade_page_autobuy' : 'upgrade_page',
    });

    setBusyPlan(plan);
    setError('');

    try {
const res = await fetch('/api/stripe/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    plan,
    challengeQualified: challenge?.qualifies ?? false, // 👈 ADD THIS
  }),
});

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        window.location.href = `/app/login?next=${encodeURIComponent(`/app/upgrade?autobuy=${plan}`)}`;
        return;
      }

      if (!res.ok || !data?.url) {
        setError(data?.error || 'Unable to start checkout.');
        return;
      }

      captureEvent('checkout_started', {
        plan,
        source: autobuy === plan ? 'upgrade_page_autobuy' : 'upgrade_page',
      });

      window.location.href = data.url;
    } catch {
      setError('Unable to connect to Stripe right now.');
    } finally {
      setBusyPlan(null);
    }
  }

  useEffect(() => {
    if (!autobuy || autoStartedRef.current) return;

    if (autobuy !== 'pro_1m' && autobuy !== 'pro_3m' && autobuy !== 'pro_6m') {
      return;
    }

    autoStartedRef.current = true;
    startCheckout(autobuy);
  }, [autobuy]);

  return (
    <div className="relative min-h-[calc(100vh-73px)] overflow-hidden bg-[color:var(--rtt-bg)] text-[color:var(--rtt-text)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(900px circle at 18% 16%, rgba(20,184,166,0.18), transparent 42%), radial-gradient(900px circle at 82% 18%, rgba(250,204,21,0.10), transparent 40%), radial-gradient(1000px circle at 50% 100%, rgba(20,184,166,0.10), transparent 48%)',
        }}
      />

      <div className="relative px-6 pb-20 pt-12 md:px-10">
        <section className="mx-auto max-w-4xl text-center">
          <div className="inline-flex rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-yellow-300">
            Pro Access
          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-white md:text-6xl">
            Unlock the Full ARRT® Readiness System
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-white/65 md:text-lg">
            Get the full question bank, deeper category coverage, score-building
            flashcards, and readiness tracking built around the RTT Mastery
            Method.
          </p>
        </section>

        <section className="mt-12">
          <div className="mx-auto max-w-6xl rounded-[30px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_0_60px_-28px_rgba(45,212,191,0.28)] md:p-8">
            <div className="text-center">
              {/* <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-yellow-300">
                ⚡ Limited Offer — Discounted Access Available
              </p> */}
              {/* <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-yellow-300">
                ⚡ Limited Offer — Discounted Access Available
              </p> */}
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-yellow-300">
                ⚡ Master just 20 questions per day to be ready for the
                Radiography ARRT® in as little as 30 days ⚡
              </p>

              <p className="mb-4 text-sm text-white/60">
                Everything you need to pass — without overpaying
              </p>

              <h2 className="text-2xl font-semibold text-white">
                Choose Your Prep Timeline
              </h2>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.key}
                  className={`relative rounded-[28px] border ${plan.border} bg-white/[0.04] p-6 text-center shadow-[0_0_45px_-26px_rgba(45,212,191,0.28)] ${
                    plan.key === 'pro_3m' ? 'scale-[1.03]' : ''
                  }`}
                >
                  {plan.badge ? (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-4 py-1 text-xs font-semibold tracking-[0.08em] text-white">
                      {plan.badge}
                    </div>
                  ) : null}

                  <h3 className="text-2xl font-semibold text-white">
                    {plan.name}
                  </h3>

                  <div className="mt-4">
                    <div className="text-lg text-white/35 line-through">
                      {/* {plan.oldPrice} */}
                    </div>

                    <div className="text-5xl font-bold tracking-tight text-white">
                      {plan.price}
                    </div>

                    {plan.monthly && (
                      <div className="mt-2 text-base font-semibold text-yellow-300">
                        {plan.monthly}
                      </div>
                    )}

                    {plan.helper && (
                      <div className="mt-2 text-sm text-white/50">
                        {plan.helper}
                      </div>
                    )}
                  </div>

                  <p className="mt-4 text-sm text-white/55">{plan.detail}</p>

                  <button
                    onClick={() => startCheckout(plan.key)}
                    disabled={busyPlan === plan.key}
                    className="mt-8 w-full rounded-2xl bg-yellow-400 px-4 py-4 text-base font-semibold text-black transition hover:bg-yellow-300 disabled:opacity-60"
                  >
                    {busyPlan === plan.key
                      ? 'Redirecting…'
                      : `Get ${plan.name} Access`}
                  </button>
                </div>
              ))}
            </div>

            {error ? (
              <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            ) : null}
          </div>
        </section>

        <section className="mt-10">
          <div className="mx-auto max-w-6xl rounded-[30px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_0_60px_-28px_rgba(45,212,191,0.28)] md:p-8">
            <h2 className="text-center text-2xl font-semibold text-white">
              What Pro Helps You Do
            </h2>

            <div className="mx-auto mt-8 grid max-w-5xl gap-4 md:grid-cols-2">
              <UnlockCard
                title="Master More Questions"
                desc="Unlock the full 600-question readiness system across every ARRT® category."
              />
              <UnlockCard
                title="Fix Weak Areas Faster"
                desc="Auto-made flashcards from missed questions help raise your next score."
              />
              <UnlockCard
                title="Stay on Track"
                desc="Track progress across categories and monitor your readiness over time."
              />
              <UnlockCard
                title="Study with a System"
                desc="Follow the RTT method: Practice, Flashcards, and Mini Mock progression."
              />
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/app/login"
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
              >
                Sign In First
              </Link>
              <Link
                href="/app/practice"
                className="rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-yellow-300"
              >
                Back to Practice
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function UpgradePage() {
  return (
    <Suspense fallback={null}>
      <UpgradePageInner />
    </Suspense>
  );
}
