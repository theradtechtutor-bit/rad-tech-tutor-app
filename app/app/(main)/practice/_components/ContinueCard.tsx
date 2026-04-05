'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Attempts = Array<{
  attempt: number;
  score: number;
  correct: number;
  total: number;
  date: string;
}>;

const KEYS = {
  attempts: 'rtt_mock_attempts',                 // JSON Attempts[]
  weakCount: 'rtt_weak_deck_count',              // number
  recentlyMasteredCount: 'rtt_recent_mastered_count', // number (since last mock)
  lastStep: 'rtt_last_step',                     // string
};

function readNumber(key: string, fallback = 0) {
  if (typeof window === 'undefined') return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function readAttempts(): Attempts {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(KEYS.attempts);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function computeNextHref(opts: {
  hasBaseline: boolean;
  weakCount: number;
  recentlyMasteredCount: number;
}) {
  const { hasBaseline, weakCount, recentlyMasteredCount } = opts;

  // 1) No baseline yet → start mock
  if (!hasBaseline) return { href: '/app/mock-exam', label: 'Take Baseline Mock' };

  // 2) Weak deck active → flashcards
  if (weakCount > 0) return { href: '/app/flashcards', label: `Continue Weak Deck (${weakCount})` };

  // 3) Weak deck cleared + you mastered cards in this cycle → weak-only test
  if (recentlyMasteredCount > 0) {
    return { href: '/app/weak-test', label: 'Take Weak-Only Practice Test' };
  }

  // 4) Otherwise → retake same mock
  return { href: '/app/mock-exam', label: 'Retake Mock (Same Questions)' };
}

export default function ContinueCard() {
  const router = useRouter();
  const [attempts, setAttempts] = useState<Attempts>([]);
  const [weakCount, setWeakCount] = useState(0);
  const [recentlyMasteredCount, setRecentlyMasteredCount] = useState(0);

  useEffect(() => {
    // initial load
    const a = readAttempts();
    setAttempts(a);
    setWeakCount(readNumber(KEYS.weakCount, 0));
    setRecentlyMasteredCount(readNumber(KEYS.recentlyMasteredCount, 0));

    // keep in sync if user has multiple tabs open
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key === KEYS.attempts) setAttempts(readAttempts());
      if (e.key === KEYS.weakCount) setWeakCount(readNumber(KEYS.weakCount, 0));
      if (e.key === KEYS.recentlyMasteredCount) setRecentlyMasteredCount(readNumber(KEYS.recentlyMasteredCount, 0));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const stats = useMemo(() => {
    const hasBaseline = attempts.length > 0;
    const first = attempts[0];
    const last = attempts[attempts.length - 1];
    const best = attempts.reduce((acc, cur) => (cur.score > acc.score ? cur : acc), attempts[0] ?? null);

    const delta =
      attempts.length >= 2 ? (attempts[attempts.length - 1].score - attempts[attempts.length - 2].score) : 0;

    return {
      hasBaseline,
      start: first?.score ?? null,
      current: last?.score ?? null,
      best: best?.score ?? null,
      delta: attempts.length >= 2 ? delta : null,
      attemptsCount: attempts.length,
    };
  }, [attempts]);

  const next = useMemo(
    () =>
      computeNextHref({
        hasBaseline: stats.hasBaseline,
        weakCount,
        recentlyMasteredCount,
      }),
    [stats.hasBaseline, weakCount, recentlyMasteredCount]
  );

  const subtitle = useMemo(() => {
    if (!stats.hasBaseline) return 'Start with a baseline mock. We’ll generate your Weak Point Deck automatically.';
    if (weakCount > 0) return 'Keep shrinking the deck: 3 correct streak = mastered.';
    if (recentlyMasteredCount > 0) return 'Confirm mastery under pressure (Training Mode), then retake the mock.';
    return 'Your weak deck is clear. Retake the same mock to see your score jump.';
  }, [stats.hasBaseline, weakCount, recentlyMasteredCount]);

  return (
    <div className="mt-6 rounded-2xl rtt-card p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm font-semibold">Continue where you left off</div>
          <div className="mt-1 text-sm text-white/70">{subtitle}</div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Attempts: <span className="font-semibold text-white">{stats.attemptsCount}</span>
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Weak cards: <span className="font-semibold text-white">{weakCount}</span>
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Recently mastered: <span className="font-semibold text-white">{recentlyMasteredCount}</span>
            </span>
            {stats.start !== null ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                Start: <span className="font-semibold text-white">{stats.start}%</span>
              </span>
            ) : null}
            {stats.current !== null ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                Current: <span className="font-semibold text-white">{stats.current}%</span>
              </span>
            ) : null}
            {stats.best !== null ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                Best: <span className="font-semibold text-white">{stats.best}%</span>
              </span>
            ) : null}
            {stats.delta !== null ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                Since last:{' '}
                <span className="font-semibold text-white">
                  {stats.delta >= 0 ? `+${stats.delta}` : stats.delta}%
                </span>
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() => router.push(next.href)}
            className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:brightness-95"
          >
            {next.label}
          </button>

          <button
            onClick={() => router.push('/app/roadmap')}
            className="inline-flex items-center justify-center rounded-2xl rtt-card px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
          >
            View Roadmap
          </button>
        </div>
      </div>
    </div>
  );
}
