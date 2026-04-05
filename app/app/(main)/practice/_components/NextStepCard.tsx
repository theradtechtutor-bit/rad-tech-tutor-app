'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMasterySummary, readAttempts } from '@/lib/progressStore';

type Stage = 'mock' | 'flashcards' | 'practice' | 'retake';

function StepPill({ label, active }: { label: string; active?: boolean }) {
  return (
    <div
      className={[
        'inline-flex items-center justify-center rounded-full border px-4 py-2 text-xs font-semibold tracking-wide',
        active ? 'border-emerald-400/40 bg-emerald-400/15 text-emerald-100 shadow-[0_8px_30px_rgba(16,185,129,0.18)]' : 'border-white/10 bg-white/5 text-white/75',
      ].join(' ')}
    >
      {label}
    </div>
  );
}

function getStage(summary: ReturnType<typeof getMasterySummary>): Stage {
  if (!summary.hasBaseline) return 'mock';
  if (summary.flashRemaining > 0) return 'flashcards';
  if (summary.practiceRemaining > 0) return 'practice';
  return 'retake';
}

export default function NextStepCard() {
  const router = useRouter();
  const [summary, setSummary] = useState(() => getMasterySummary('qbank1'));
  const [attempts, setAttempts] = useState(readAttempts());

  useEffect(() => {
    const refresh = () => {
      setSummary(getMasterySummary('qbank1'));
      setAttempts(readAttempts());
    };
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('rtt-progress-updated', refresh as EventListener);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('rtt-progress-updated', refresh as EventListener);
    };
  }, []);

  const stage = useMemo(() => getStage(summary), [summary]);
  const lastScore = attempts[attempts.length - 1]?.score ?? null;

  const next = useMemo(() => {
    if (stage === 'mock') return { href: '/app/mock-exam', cta: 'Take Baseline Mock' };
    if (stage === 'flashcards') return { href: '/app/flashcards?set=qbank1&mode=missed&cat=all', cta: 'Start Flashcards' };
    if (stage === 'practice') return { href: '/app/practice/qbank1?mode=missed&cat=all', cta: 'Start Practice Test' };
    return { href: '/app/mock-exam', cta: 'Retake Mock' };
  }, [stage]);

  const headline = useMemo(() => {
    if (stage === 'mock') return 'Start with a baseline mock';
    if (stage === 'flashcards') return `Clear ${summary.flashRemaining} flashcards`;
    if (stage === 'practice') return `Clear ${summary.practiceRemaining} practice questions`;
    return 'Retake the mock';
  }, [stage, summary.flashRemaining, summary.practiceRemaining]);

  return (
    <div className="mt-6 rounded-3xl border border-emerald-400/30 bg-gradient-to-b from-emerald-400/10 to-white/4 p-6 shadow-[0_20px_60px_rgba(16,185,129,0.16)] ring-1 ring-emerald-400/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-white">The Rad Tech Tutor Mastery Method</div>
          <div className="mt-1 text-xs text-white/55">Mock misses should clear in both flashcards and practice before this moves forward.</div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <StepPill label="1. Mock" active={stage === 'mock'} />
        <div className="text-white/25">→</div>
        <StepPill label="2. Flashcards" active={stage === 'flashcards'} />
        <div className="text-white/25">→</div>
        <StepPill label="3. Practice Test" active={stage === 'practice'} />
        <div className="text-white/25">→</div>
        <StepPill label="4. Retake Mock" active={stage === 'retake'} />
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Your next step</div>
        <div className="mt-2 text-2xl font-semibold tracking-tight text-white">{headline}</div>

        <button onClick={() => router.push(next.href)} className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black hover:brightness-95">
          {next.cta}
        </button>

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/65">
          {lastScore !== null ? <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Last Mock: <span className="font-semibold text-white">{lastScore}%</span></span> : null}
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Flashcards left: <span className="font-semibold text-white">{summary.flashRemaining}</span></span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Practice left: <span className="font-semibold text-white">{summary.practiceRemaining}</span></span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Total missed on latest loop: <span className="font-semibold text-white">{summary.totalMissed}</span></span>
        </div>
      </div>
    </div>
  );
}
