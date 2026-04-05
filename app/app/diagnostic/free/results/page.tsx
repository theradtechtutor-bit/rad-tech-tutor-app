'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'rtt_free_diag_result';

// Mastery engine keys
const ATTEMPTS_KEY = 'rtt_mock_attempts';
const WEAK_COUNT_KEY = 'rtt_weak_deck_count';
const RECENT_MASTERED_KEY = 'rtt_recent_mastered_count';

type Breakdown = Record<string, { correct: number; total: number }>;
type ResultPayload = {
  total: number;
  correct: number;
  finalCorrect?: number;
  breakdown: Breakdown;
  finishedAt: string;
};

type Attempt = {
  attempt: number;
  score: number; // percent
  correct: number;
  total: number;
  date: string;
  bank?: number; // for future use
};

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function FreeDiagnosticResultsPage() {
  const [data, setData] = useState<ResultPayload | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    setData(safeParse<ResultPayload | null>(raw, null));
  }, []);

  const computed = useMemo(() => {
    if (!data) return null;

    const correct =
      typeof data.finalCorrect === 'number' ? data.finalCorrect : data.correct;

    const total = data.total || 0;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const missed = Math.max(0, total - correct);

    return { correct, total, pct, missed };
  }, [data]);

  // ✅ Write “Last Mock” + attempt trend + weak count (QBank 1 for now)
  useEffect(() => {
    if (!computed) return;

    try {
      const bank = 1; // Free diagnostic maps to QBank 1 until mock-exam is wired
      localStorage.setItem(`rtt_last_mock_pct_bank_${bank}`, String(computed.pct));

      // Save attempt (for Roadmap + trend)
      const prev = safeParse<Attempt[]>(localStorage.getItem(ATTEMPTS_KEY), []);
      const nextAttemptNum = prev.length + 1;

      const nextAttempt: Attempt = {
        attempt: nextAttemptNum,
        score: computed.pct,
        correct: computed.correct,
        total: computed.total,
        date: new Date().toISOString(),
        bank,
      };

      localStorage.setItem(ATTEMPTS_KEY, JSON.stringify([...prev, nextAttempt]));

      // Weak deck count = missed
      localStorage.setItem(WEAK_COUNT_KEY, String(computed.missed));

      // Reset recently mastered count each new mock attempt
      localStorage.setItem(RECENT_MASTERED_KEY, '0');
    } catch {
      // ignore
    }
  }, [computed]);

  if (!data || !computed) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-2xl font-semibold">Results</h1>
        <p className="mt-2 text-sm text-white/70">No results found yet.</p>
        <div className="mt-6">
          <Link href="/app/practice" className="rtt-btn rtt-btn-cta">
            Back to Practice
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm text-white/60">Free Diagnostic</div>
          <h1 className="mt-1 text-2xl font-semibold">Your Score: {computed.pct}%</h1>
          <p className="mt-2 text-sm text-white/70">
            Correct: {computed.correct} / {computed.total} • Missed: {computed.missed}
          </p>
        </div>

        <Link href="/app/practice" className="rtt-btn rtt-btn-cta">
          Continue
        </Link>
      </div>

      {/* Optional: show breakdown if you already had UI for it */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="text-sm font-semibold">Category Breakdown</div>

        <div className="mt-3 grid gap-2">
          {Object.entries(data.breakdown || {}).map(([k, v]) => {
            const pct = v.total ? Math.round((v.correct / v.total) * 100) : 0;
            return (
              <div key={k} className="flex items-center justify-between text-sm">
                <div className="text-white/80">{k}</div>
                <div className="text-white/70">
                  {v.correct}/{v.total} • {pct}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <Link href="/app/practice" className="rtt-btn rtt-btn-ghost">
          Back to Practice
        </Link>
      </div>
    </div>
  );
}
