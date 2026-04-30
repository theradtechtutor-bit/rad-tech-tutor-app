'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSupabaseSession } from '@/app/app/_hooks/useSupabaseSession';
import { getBankMasterySummary } from '@/lib/progressStore';
import { captureEvent } from '@/lib/analytics';


function getResumeHref() {
  const bank = getBankMasterySummary('qbank1');
  const nextMini = Math.max(1, Math.min(10, Number(bank.currentMini || 1)));
  return `/app/practice/qbank1?mode=all&cat=all&flow=mastery&mini=${nextMini}`;
}

function SectionHeading({
  eyebrow,
  title,
  desc,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow ? (
        <div className="mb-3 inline-flex rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">
          {eyebrow}
        </div>
      ) : null}
      <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
      {desc ? (
        <p className="mt-4 text-sm leading-7 text-[color:var(--rtt-muted)] md:text-base">
          {desc}
        </p>
      ) : null}
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rtt-card rounded-3xl p-6">
      <div className="text-base font-semibold text-white">{title}</div>
      <p className="mt-3 text-sm leading-7 text-[color:var(--rtt-muted)]">
        {desc}
      </p>
    </div>
  );
}

function TestimonialCard({ quote, name }: { quote: string; name: string }) {
  return (
    <div className="rtt-card rounded-3xl p-6">
      <div className="text-sm leading-7 text-white/90">“{quote}”</div>
      <div className="mt-5 text-xs font-medium uppercase tracking-[0.14em] text-white/45">
        {name}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { session, loading } = useSupabaseSession();
  const [resumeHref, setResumeHref] = useState('/app/practice/qbank1?mode=all&cat=all&flow=mastery&mini=1');
  const [hasResumeProgress, setHasResumeProgress] = useState(false);

  useEffect(() => {
    try {
      const href = getResumeHref();
      setResumeHref(href);
      setHasResumeProgress(!href.endsWith('mini=1'));
    } catch {}
  }, []);

  const isReturning = !!session && hasResumeProgress;
  const primaryCta = isReturning ? 'Continue RTT Mastery Method' : 'Start Free — No Signup Required';
  const primaryHref = isReturning ? resumeHref : '/app/practice/qbank1?mode=all&cat=all&flow=mastery&mini=1';

  return (
    <div className="min-h-screen bg-[color:var(--rtt-bg)] text-[color:var(--rtt-text)]">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(700px circle at 18% 18%, rgba(20,184,166,0.20), transparent 42%), radial-gradient(700px circle at 82% 20%, rgba(250,204,21,0.10), transparent 38%), radial-gradient(900px circle at 50% 100%, rgba(20,184,166,0.10), transparent 45%)',
          }}
        />

        <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-12 px-5 pb-6 pt-6 md:grid-cols-2 md:items-start md:pb-8 md:pt-16">
          {' '}
          <div>
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
              ARRT® Radiography Exam Prep
            </div>

            <h1 className="mt-2 text-5xl font-bold leading-[1.02] tracking-tight md:text-6xl">
              Study smarter.
              <br />
              Pass the ARRT® on your first try.
            </h1>

            <p className="mt-2 max-w-xl text-sm text-white/75 md:text-base">
           <span className="font-extrabold text-white"> Everything </span> 
           you need to pass — no wasted studying, no guesswork.
            </p>

                        {/* <p className="mt-2 max-w-xl text-sm text-white/75 md:text-base">
              Go from overwhelmed to registry-ready in as little as
              <span className="font-extrabold text-white"> one month.</span>
            </p> */}

            <div className="mt-5 space-y-3">
              {/* Hook */}
              <p className="text-base font-semibold text-white sm:text-lg">
                Stop rereading. Start improving your score.
              </p>

              {/* Checklist */}
              <ul className="space-y-2.5 text-md font-semibold text-white/80 sm:text-base">
                {[
                  '1,000+ ARRT®-style practice questions',
                  '5 full-length 200-question mock exams (designed to mirror the real ARRT® exam)',
                  'Auto-generated flashcards from what you miss to target your weak areas',
                  'Based on official ARRT® exam categories',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-[0.35rem] text-white/70 text-sm">
                      ✓
                    </span>
                    <span className="leading-6">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={primaryHref}
                className="rtt-btn rtt-btn-cta px-6 py-3 text-base"
              >
                {primaryCta}
              </Link>
              <Link
                href="/app/practice"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 transition hover:bg-white/10"
              >
                Practice Freely
              </Link>
              <a
                href="#what-you-get"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 transition hover:bg-white/10"
              >
                View Content
              </a>
            </div>
            <div className="mt-3 text-sm text-white/70">
              Practice freely without an account. Create a free account when you
              want your progress saved and resumed later.
            </div>
            {isReturning ? (
              <div className="mt-2 text-xs text-emerald-200/80">
                You're already in progress — we'll pick you up where you left
                off.
              </div>
            ) : null}

            {/* <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rtt-card rounded-2xl p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
                  Step 01
                </div>
                <div className="mt-2 text-sm font-semibold text-white">
                  Diagnostic Test
                </div>
                <div className="mt-2 text-sm text-white/65">
                  Take a short diagnostic test to uncover your weak areas.
                </div>
              </div>

              <div className="rtt-card rounded-2xl p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
                  Step 02
                </div>
                <div className="mt-2 text-sm font-semibold text-white">
                  Weak-Point Flashcards
                </div>
                <div className="mt-2 text-sm text-white/65">
                  Missed questions automatically become flashcards so you can
                  master the concepts you struggled with.
                </div>
              </div>

              <div className="rtt-card rounded-2xl p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
                  Step 03
                </div>
                <div className="mt-2 text-sm font-semibold text-white">
                  Mock Exams
                </div>
                <div className="mt-2 text-sm text-white/65">
                  Take a mock exam to test what you’ve learned and confirm the
                  concepts are truly understood.
                </div>
              </div>
            </div> */}
          </div>
          <div className="relative">
            <div className="rtt-card rounded-[28px] p-7 md:p-8">
              <div className="text-xs uppercase tracking-[0.18em] text-teal-300/80">
                How Rad Tech Tutor Works
              </div>

              <div className="mt-3 text-xl font-semibold text-white">
                A simple path to passing the ARRT®.
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="text-sm font-semibold text-white">
                  1. What this is
                </div>
                <div className="mt-1 text-sm text-white/70">
                  ARRT® exam prep for radiography students and technologists
                  preparing for CQR and CE requirements.
                </div>
                <div className="mt-1 text-sm text-white/60">
                  Practice questions, flashcards, mock exams, and targeted
                  review built around real ARRT® exam categories.
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="text-sm font-semibold text-white">
                    2. Who this is for
                  </div>
                  <div className="mt-1 text-sm text-white/70">
                    ARRT® Students → Pass your registry exam
                  </div>
                  <div className="mt-1 text-sm text-white/70">
                    CQR Techs → Prepare for your assessment and fix weak areas
                  </div>
                  <div className="mt-1 text-sm text-white/70">
                    CE (Renewal & CQR) → Earn credits and stay sharp
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="text-sm font-semibold text-white">
                    3. Why it's different
                  </div>
                  <div className="mt-1 text-sm text-white/70">
                    It finds your weak spots automatically.
                  </div>
                  <div className="mt-1 text-sm text-white/60">
                    Missed questions become your study plan so you focus on what
                    actually improves your score.
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="text-sm font-semibold text-white">
                    4. What to do first
                  </div>
                  <div className="mt-1 text-sm text-white/70">
                    Start with the RTT Mastery Method.
                  </div>
                  <div className="mt-1 text-sm text-white/60">
                    Follow the structured path: Practice Test → Flashcards →
                    Mini Mock Exam to build mastery and raise your score step by
                    step.
                  </div>
                </div>
              </div>

              <div className="mt-6"></div>
            </div>
          </div>
        </div>
      </section>

      {/* HOMEPAGE PRICING TEST */}
      <section className="relative mx-auto max-w-6xl px-5 pb-4">
        {' '}
        <div className="mt-6 mb-4 flex items-center gap-3 md:mt-8">
          {' '}
          <div className="h-px flex-1 bg-teal-300/20" />
          <div className="text-center text-[11px] font-bold uppercase tracking-[0.22em] text-teal-300">
            Unlock the full RTT Mastery Method
          </div>
          <div className="h-px flex-1 bg-teal-300/20" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Link
            href="/app/upgrade?autobuy=pro_2w"
            onClick={() => captureEvent('checkout_started', { plan: 'pro_2w' })}
            className="relative rounded-3xl border border-white/10 bg-white/[0.04] p-5 min-h-[220px] shadow-[0_0_25px_rgba(20,184,166,0.25)] transition hover:border-teal-300/40 hover:shadow-[0_0_40px_rgba(20,184,166,0.4)]"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-blue-500 px-3 py-1 text-[10px] font-bold uppercase text-white">
              TEST SOON?
            </div>

            <div className="flex h-full flex-col justify-between text-center">
              {' '}
              <div className="text-base font-bold text-teal-300">2 Weeks Access</div>
              <div className="mt-2 text-xs text-white/65">
                Short on time? Raise your score fast.
              </div>
              <div className="mt-4 text-4xl font-black text-white">$29</div>
              <div className="text-xs text-white/60">one-time</div>
            </div>
          </Link>

          <Link
            href="/app/upgrade?autobuy=pro_1m"
            onClick={() => captureEvent('checkout_started', { plan: 'pro_1m' })}
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 min-h-[220px] shadow-[0_0_25px_rgba(20,184,166,0.25)] transition hover:border-teal-300/40 hover:shadow-[0_0_40px_rgba(20,184,166,0.4)]"
          >
            <div className="flex h-full flex-col justify-between text-center">
              {' '}
              <div className="text-base font-bold text-teal-300">
                1 Month Access
              </div>
              <div className="mt-2 text-xs text-white/65">
                Focused short-term preparation.
              </div>
              <div className="mt-4 text-4xl font-black text-white">$49</div>
              <div className="text-xs text-white/60">one-time</div>
            </div>
          </Link>

          <Link
            href="/app/upgrade?autobuy=pro_3m"
            onClick={() => captureEvent('checkout_started', { plan: 'pro_3m' })}
            className="relative rounded-3xl border border-yellow-400/70 bg-yellow-400/[0.06] p-5 min-h-[220px] shadow-[0_0_25px_rgba(250,204,21,0.25)] transition hover:shadow-[0_0_40px_rgba(250,204,21,0.45)]"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-yellow-400 px-3 py-1 text-[10px] font-bold uppercase text-black">
              MOST POPULAR
            </div>
            <div className="flex h-full flex-col justify-between text-center">
              {' '}
              <div className="text-base font-bold text-yellow-300">
                3 Month Access
              </div>
              <div className="mt-2 text-xs text-white/65">
                Best balance of time and value.
              </div>
              <div className="mt-2 text-xs text-white/65">
                Used by most students for ideal prep time.
              </div>
              <div className="mt-4 text-4xl font-black text-yellow-300">
                $99
              </div>
              <div className="mt-1 text-sm font-semibold text-yellow-300">
                Only $33/month
              </div>
              <div className="text-xs text-white/60">one-time</div>
            </div>
          </Link>

          <Link
            href="/app/upgrade?autobuy=pro_6m"
            onClick={() => captureEvent('checkout_started', { plan: 'pro_6m' })}
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 min-h-[220px] shadow-[0_0_25px_rgba(20,184,166,0.25)] transition hover:border-teal-300/40 hover:shadow-[0_0_40px_rgba(20,184,166,0.4)]"
          >
            <div className="flex h-full flex-col justify-between text-center">
              {' '}
              <div className="text-base font-bold text-teal-300">
                6 Month Access
              </div>
              <div className="mt-2 text-xs text-white/65">
                Lowest monthly cost.
              </div>
              <div className="mt-2 text-xs text-white/65">
                Start early and stay ready.
              </div>
              <div className="mt-4 text-4xl font-black text-white">$149</div>
              <div className="mt-1 text-sm font-semibold text-teal-300">
                Only $25/month
              </div>
              <div className="text-xs text-white/60">one-time</div>
            </div>
          </Link>
        </div>
      </section>

      {/* METHOD */}
      <section className="mx-auto max-w-6xl px-5 pt-6 pb-18 md:pt-8 md:pb-24">
        {' '}
        <SectionHeading
          eyebrow="Why It Works"
          title="A smarter way to prepare for the ARRT® exam."
          desc="Rereading and highlighting feel productive, but they rarely improve exam performance. What works is targeted practice, feedback, and focused review."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rtt-card rounded-[28px] p-7">
            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-white/40">
              How most students study
            </div>
            <ul className="mt-6 space-y-4 text-sm text-white/70">
              <li className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                Read random chapters
              </li>
              <li className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                Watch videos without a clear plan
              </li>
              <li className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                Take notes on everything
              </li>
              <li className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                Still feel unsure by exam day
              </li>
            </ul>
          </div>

          <div className="rounded-[28px] border border-teal-400/20 bg-[linear-gradient(180deg,rgba(45,212,191,0.10),rgba(255,255,255,0.03))] p-7">
            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-200/80">
              How Rad Tech Tutor trains you
            </div>
            <ul className="mt-6 space-y-4 text-sm text-white/80">
              <li className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                Identify weak areas with targeted testing
              </li>
              <li className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                Practice by category and focus where points are being lost
              </li>
              <li className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                Repeat weak concepts until they become strengths
              </li>
              <li className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                Build confidence through structured mastery
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-5 pt-18 pb-8 md:pt-24 md:pb-10">
        <div id="what-you-get">
          <SectionHeading
            eyebrow="What You Get"
            title="Everything organized around passing the registry."
            desc="A premium study tool should do more than give you random questions. It should guide your improvement."
          />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          <FeatureCard
            title="Practice ARRT®-style Question Banks"
            desc="High-yield practice designed around the exam categories you actually need to master."
          />
          <FeatureCard
            title="Flashcards"
            desc="Turn missed questions into focused repetition so weak spots don’t stay weak."
          />
          <FeatureCard
            title="Mock Exams"
            desc="Simulate exam pressure and build readiness before test day."
          />
        </div>
      </section>

      {/* AUTHORITY + TESTIMONIALS */}
      <section className="mx-auto max-w-6xl px-5 pt-8 pb-18 md:pt-10 md:pb-24">
        <div className="grid gap-6 md:grid-cols-[1.05fr_1fr]">
          <div className="rtt-card rounded-[28px] p-7 md:p-8">
            <div className="text-xs uppercase tracking-[0.18em] text-yellow-200/75">
              Built by someone who understands the exam
            </div>
            <h3 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">
              Built for radiography students, CQR technologists, and working
              techs who want a smarter path to improving performance and staying
              certified.
            </h3>
            <p className="mt-5 max-w-xl text-sm leading-8 text-[color:var(--rtt-muted)] md:text-base">
              Rad Tech Tutor is built around a mastery-first approach: identify
              weak areas, train those weak areas deliberately, and improve
              performance through structure instead of overload.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-2xl font-bold text-white">Targeted</div>
                <div className="mt-1 text-xs text-white/50">
                  Practice that focuses where you need it most
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-2xl font-bold text-white">Structured</div>
                <div className="mt-1 text-xs text-white/50">
                  A real system instead of random studying
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-2xl font-bold text-white">Focused</div>
                <div className="mt-1 text-xs text-white/50">
                  Built to reduce overwhelm and build confidence
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <TestimonialCard
              quote="I passed the ARRT on my first attempt after using the Essential 100 and mastery system. It helped me focus on exactly what I was missing."
              name="Alyssa Martinez"
            />
            <TestimonialCard
              quote="The weak-spot repetition system forced me to actually learn the material instead of memorizing answers."
              name="Danielle Brooks"
            />
            <TestimonialCard
              quote="This felt different from other prep tools. It showed me where I was weak and helped me close those gaps."
              name="Michael Carter"
            />
          </div>
        </div>
      </section>

      {/* PRICING / CTA */}
      <section className="mx-auto max-w-6xl px-5 py-18 md:py-24">
        <div className="overflow-hidden rounded-[32px] border border-yellow-400/20 bg-[linear-gradient(180deg,rgba(250,204,21,0.10),rgba(255,255,255,0.03))]">
          <div className="grid gap-8 px-6 py-8 md:grid-cols-[1.15fr_0.85fr] md:px-10 md:py-10">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-200/80">
                Upgrade to Pro
              </div>
              <h3 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                Unlock the full system.
              </h3>
              <p className="mt-4 max-w-2xl text-sm leading-8 text-white/75 md:text-base">
                Go beyond basic practice and study with a more complete,
                high-yield preparation system designed around weak-spot
                training, confidence building, and exam readiness.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">
                  Full question bank access
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">
                  Advanced practice flow
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">
                  Targeted category study
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">
                  Structured exam prep experience
                </div>
              </div>
            </div>

            <div className="rtt-card rounded-[28px] p-6 md:p-7">
              <div className="text-sm font-semibold uppercase tracking-[0.14em] text-white/45">
                Start now
              </div>
              <div className="mt-4 text-4xl font-bold">$49</div>
              <div className="mt-1 text-sm text-white/50">1 month access</div>

              <div className="mt-6 space-y-3 text-sm text-white/75">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  Built for ARRT®, CQR prep, and CE renewal
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  Clean, focused, premium study experience
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  Structured around mastery instead of overload
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-3">
                <Link
                  href="/app/upgrade"
                  className="rtt-btn rtt-btn-cta w-full text-center"
                >
                  Get Pro
                </Link>
                <Link
                  href="/app/practice"
                  className="rtt-btn w-full rounded-full border border-white/10 bg-white/5 text-center text-white/85 transition hover:bg-white/10"
                >
                  Start Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CE */}
      <section className="mx-auto max-w-6xl px-5 pb-20 pt-18 md:pb-24 md:pt-24">
        <div className="grid gap-6 md:grid-cols-[0.95fr_1.05fr]">
          <div className="rtt-card rounded-[28px] p-7 md:p-8">
            <div className="text-xs uppercase tracking-[0.18em] text-teal-300/80">
              For Certified Technologists
            </div>
            <h3 className="mt-4 text-3xl font-bold tracking-tight">
              Already a certified X-ray Tech?
            </h3>
            <p className="mt-4 text-sm leading-8 text-[color:var(--rtt-muted)] md:text-base">
              Complete your ARRT® continuing education and support your CQR
              requirements through simple, focused modules designed for working
              technologists
            </p>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="text-sm font-semibold text-white">
                ARRT® CE and CQR Support Made Simple
              </div>
              <div className="mt-2 text-sm text-white/65">
                Complete CE modules, pass the test, and download your
                certificate—while reinforcing knowledge for CQR and renewal
                requirements.
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <FeatureCard
              title="Straightforward Learning Modules"
              desc="Focused CE content built to help technologists complete credits without unnecessary filler."
            />
            <FeatureCard
              title="Simple End-of-Course Test"
              desc="Finish the module and complete one clear post-test to verify completion."
            />
            <FeatureCard
              title="Immediate Certificate After Passing"
              desc="Download your certificate after successfully completing the course test."
            />
            <div className="rounded-3xl border border-yellow-400/20 bg-yellow-400/10 p-6">
              <div className="text-lg font-semibold text-white">
                ARRT® Continuing Education and CQR Support
              </div>
              <div className="mt-2 text-sm text-white/70">
                Complete CE modules, pass the post-test, and download your
                certificate while staying prepared for CQR assessments
              </div>
              <div className="mt-5">
                <Link href="/app/ce" className="rtt-btn rtt-btn-cta">
                  Get Continuing Education
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// import Link from 'next/link';
// // import MarketingNav from './_components/MarketingNav';

// function Stat({ value, label }: { value: string; label: string }) {
//   return (
//     <div className="rounded-2xl border border-[color:var(--rtt-border)] bg-[color:var(--rtt-card)] px-5 py-4">
//       <div className="text-2xl font-semibold">{value}</div>
//       <div className="mt-1 text-sm text-[color:var(--rtt-muted)]">{label}</div>
//     </div>
//   );
// }

// function Feature({ title, desc }: { title: string; desc: string }) {
//   return (
//     <div className="rounded-2xl border border-[color:var(--rtt-border)] bg-[color:var(--rtt-card)] p-5">
//       <div className="text-sm font-semibold">{title}</div>
//       <div className="mt-2 text-sm text-[color:var(--rtt-muted)]">{desc}</div>
//     </div>
//   );
// }

// export default function HomePage() {
//   return (
//     <div className="min-h-screen bg-[color:var(--rtt-bg)] text-[color:var(--rtt-text)]">
//       {/* <MarketingNav /> */}

//       {/* Hero */}
//       <section className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-5 py-12 md:grid-cols-2 md:py-16 relative z-10">
//         <div>
//           <div className="relative inline-block">
//             {/* Glow behind hero text */}
//             <div
//               aria-hidden="true"
//               className="pointer-events-none absolute -inset-x-16 -inset-y-12 -z-10 blur-2xl"
//               style={{
//                 background:
//                   'radial-gradient(closest-side, rgba(20, 184, 166, 0.40), rgba(20, 184, 166, 0.24), rgba(0,0,0,0))',
//               }}
//             />

//             <h1 className="text-5xl font-bold leading-tight md:text-5xl">
//               A Better Way
//               <br />
//               to Prepare for the
//               <br />
//               ARRT Radiography
//               <br />
//               Registry Exam
//             </h1>
//           </div>
//           {/* <p className="mt-4 max-w-xl text-base text-[color:var(--rtt-muted)] md:text-lg">
//             Stop over-studying and focus on what actually moves your score.
//             Practice the essentials, identify weak areas, and strengthen them to
//             quickly pass the ARRT Radiography exam with confidence.
//           </p> */}
//           <p className="mt-4 max-w-xl text-base text-[color:var(--rtt-muted)] md:text-lg">
//             Preparation doesn’t have to feel overwhelming. With structured,
//             targeted practice, you can identify weak areas early, improve your
//             score, and walk into the ARRT exam confident and prepared.
//           </p>

//           <div className="mt-7 flex flex-wrap items-center gap-3">
//             <a href="/app/upgrade" className="rtt-btn rtt-btn-cta">
//               Get Pro
//             </a>
//             <Link
//               href="/app/practice"
//               className="rtt-btn rounded-full border  border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-teal-200/10"
//             >
//               Start Free
//             </Link>
//           </div>
//           {/* <div className="mt-5 text-sm text-[color:var(--rtt-muted)]">
//             Free: Essential 100 + 20Q diagnostic. Paid: mastery engine (200Q) +
//             full bank (600Q).
//           </div> */}
//           {/* RTT_PROGRESS_START */}
//           <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
//             <div className="rtt-card relative rounded-2xl p-4 sm:after:content-['→'] sm:after:absolute sm:after:-right-5 sm:after:top-1/2 sm:after:-translate-y-1/2 sm:after:text-xl sm:after:text-white/30">
//               <div className="flex items-center justify-center gap-2">
//                 <span className="text-xs font-semibold text-white/50">01</span>
//                 <span className="text-sm font-semibold text-white">
//                   Baseline
//                 </span>
//               </div>
//               <div className="mt-2 text-center text-sm text-white/70">
//                 Identify your starting score and expose weak spots.
//               </div>
//             </div>

//             <div className="rtt-card relative rounded-2xl p-4 sm:after:content-['→'] sm:after:absolute sm:after:-right-5 sm:after:top-1/2 sm:after:-translate-y-1/2 sm:after:text-xl sm:after:text-white/30">
//               <div className="flex items-center justify-center gap-2">
//                 <span className="text-xs font-semibold text-white/50">02</span>
//                 <span className="text-sm font-semibold text-white">Train</span>
//               </div>
//               <div className="mt-2 text-center text-sm text-white/70">
//                 Systematically eliminate weak spots with the Mastery Engine.
//               </div>
//             </div>

//             <div className="rtt-card rounded-2xl p-4">
//               <div className="flex items-center justify-center gap-2">
//                 <span className="text-xs font-semibold text-white/50">03</span>
//                 <span className="text-sm font-semibold text-white">
//                   Test-Ready
//                 </span>
//               </div>
//               <div className="mt-2 text-center text-sm text-white/70">
//                 Walk into the ARRT exam confident, prepared, and test-ready.
//               </div>
//             </div>
//           </div>
//           {/* RTT_PROGRESS_END */}
//         </div>

//         {/* Simple “roadmap” visual */}
//         <div className="relative">
//           <div className="absolute inset-0 pointer-events-none rounded-3xl bg-[radial-gradient(600px_circle_at_30%_30%,rgba(45,212,191,0.10),transparent_60%),radial-gradient(600px_circle_at_70%_70%,rgba(250,204,21,0.08),transparent_55%)]" />

//           <div className="rtt-card rtt-glow rounded-2xl p-6">
//             <div className="text-sm font-semibold">
//               Already a certified X-ray Tech?
//             </div>
//             <div className="mt-1 text-xs rtt-muted">
//               Complete your ARRT continuing education requirements quickly and
//               efficiently.
//             </div>
//             <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
//               <div className="text-sm font-semibold">
//                 ARRT Continuing Education Made Simple
//               </div>
//               <div className="mt-1 text-xs rtt-muted">
//                 Complete CE modules, pass the test, and download your
//                 certificate.
//               </div>
//             </div>
//             <div className="mt-4 grid gap-3">
//               <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
//                 <div className="text-sm font-semibold">
//                   Built for Renewal Season
//                 </div>
//                 <div className="mt-1 text-xs rtt-muted">
//                   Designed for technologists who need credits done fast —
//                   without overpaying.
//                 </div>
//               </div>

//               {/* <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
//                 <div className="text-sm font-semibold">
//                   Multi-Credit Modules
//                 </div>
//                 <div className="mt-1 text-xs rtt-muted">
//                   Earn multiple credits per course to finish faster.
//                 </div>
//               </div> */}

//               <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
//                 <div className="text-sm font-semibold">
//                   Simple End-of-Course Test
//                 </div>
//                 <div className="mt-1 text-xs rtt-muted">
//                   Straightforward assessment with no unnecessary steps.
//                 </div>
//               </div>

//               <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
//                 <div className="text-sm font-semibold">
//                   Instant Completion Certificate
//                 </div>
//                 <div className="mt-1 text-xs rtt-muted">
//                   Download your certificate immediately after passing.
//                 </div>
//               </div>
//             </div>
//             {/* <div className="mt-4 rounded-2xl border border-yellow-400/25 bg-yellow-400/10 p-4">
//               <div className="text-sm font-semibold">
//                 24-Credit Continuing Education Biennium Bundle — $100
//               </div>
//               <div className="mt-1 text-xs rtt-muted">
//                 Or choose individual modules to complete only the credits you
//                 need.
//               </div>
//             </div> */}

//             <div className="mt-4 rounded-2xl border border-yellow-400/25 bg-yellow-400/10 p-4">
//               <div className="text-sm font-semibold">
//                 Complete Your ARRT Continuing Education Online
//               </div>
//               <div className="mt-1 text-xs rtt-muted">
//                 Structured modules with simple end-of-course tests.
//               </div>
//             </div>
//             <div className="mt-5">
//               <Link
//                 href="/app/ce"
//                 className="rtt-btn rtt-btn-cta w-full justify-center"
//               >
//                 Get Continuing Education
//               </Link>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ARRT Testimonials */}
//       {/* <div className="mx-auto max-w-6xl px-5 pb-16">
//         <div className="text-2xl pb-16 font-semibold text-center">
//           Students Who Used Rad Tech Tutor
//         </div>

//         <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
//           <div className="rtt-card rounded-2xl p-6">
//             <div className="text-sm text-white/90">
//               “I passed the ARRT on my first attempt after using the Essential
//               100 and mastery system. It helped me focus on exactly what I was
//               missing.”
//             </div>
//             <div className="mt-4 text-xs rtt-muted">— Alyssa Martinez</div>
//           </div>

//           <div className="rtt-card rounded-2xl p-6">
//             <div className="text-sm text-white/90">
//               “The weak-spot repetition system forced me to actually learn the
//               material instead of memorizing answers.”
//             </div>
//             <div className="mt-4 text-xs rtt-muted">— Danielle Brooks</div>
//           </div>

//           <div className="rtt-card rounded-2xl p-6">
//             <div className="text-sm text-white/90">
//               “This felt different from other prep tools. It showed me where I
//               was weak and helped me close those gaps.”
//             </div>
//             <div className="mt-4 text-xs rtt-muted">— Michael Carter</div>
//           </div>
//         </div>
//       </div> */}

//       {/* Feature grid */}
//       {/* <section className="mx-auto max-w-6xl px-5 pb-16">
//         <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
//           <Feature
//             title="Teal = Correct"
//             desc="I passed the ARRT on my first attempt after using the Essential
//               100 and mastery system. It helped me focus on exactly what I was
//               missing."
//           />
//           <Feature
//             title="Yellow = Next step"
//             desc="CTAs and neutral prompts stay yellow so your eye always finds the action."
//           />
//           <Feature
//             title="Red = Wrong / risk"
//             desc="Mistakes and locked boundaries use red when needed—clear, not noisy."
//           />
//         </div>

//         <div className="mt-10 rounded-3xl border border-[color:var(--rtt-border)] bg-[color:var(--rtt-card)] p-6">
//           <div className="text-lg font-semibold">Start Practicing for Free</div>
//           <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[color:var(--rtt-muted)]">
//             <li>Free diagnostic flow with results + breakdown.</li>
//             <li>
//               Organized study plans: Essential 100 Questions, Mastery 250
//               Questions, 500+ High Yield Question Bank
//             </li>
//             <li>Track your progress from Day 1 of studying till Test date</li>
//           </ul>
//           <div className="mt-5 flex flex-wrap gap-3">
//             <Link href="/diagnostic/free" className="rtt-btn rtt-btn-cta">
//               Take the Free Diagnostic
//             </Link>
//             <Link href="/app/practice" className="rtt-btn rtt-btn-secondary">
//               Go to Practice
//             </Link>
//           </div>
//         </div>
//       </section> */}
//     </div>
//   );
// }