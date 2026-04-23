'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getBankMasterySummary } from '@/lib/progressStore';

type Bank = { id: 1 | 2 | 3 | 4 | 5; label: string; locked: boolean };
type AccessRow = { is_pro: boolean };

type ResumeLinkState = {
  href: string;
  label: string;
  sublabel?: string;
};

type SavedPracticeSession = {
  setId?: string;
  mode?: 'all' | 'missed';
  cat?: string;
  mini?: number | 'all';
  queueIds?: string[];
  currentId?: string | null;
  answeredCount?: number;
  totalCount?: number;
  savedAt?: number;
};

type SavedFlashSession = {
  setId?: string;
  mode?: 'all' | 'missed';
  cat?: string;
  mini?: number | 'all';
  deck?: Array<{ id: string }>;
  mastered?: Array<{ id: string }>;
  cursor?: number;
  savedAt?: number;
};

type SavedMockSession = {
  questions?: Array<{ id: string }>;
  answers?: Record<string, string>;
  savedAt?: number;
  scope?: 'mini' | 'full' | 'category';
  miniId?: number;
  categoryFilter?: string;
};

function readStorageJson<T>(store: Storage, key: string): T | null {
  try {
    const raw = store.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function getNewestSession<T>(prefix: string, predicate: (value: T) => boolean) {
  if (typeof window === 'undefined') return null as T | null;

  let best: T | null = null;
  let bestSavedAt = -1;

  for (const store of [window.localStorage, window.sessionStorage]) {
    for (const key of Object.keys(store)) {
      if (!key.startsWith(prefix)) continue;
      const value = readStorageJson<T & { savedAt?: number }>(store, key);
      if (!value || !predicate(value)) continue;
      const savedAt = Number((value as any).savedAt || 0);
      if (savedAt >= bestSavedAt) {
        best = value;
        bestSavedAt = savedAt;
      }
    }
  }

  return best;
}

function buildPracticeResume(bankId: number): ResumeLinkState {
  const setId = `qbank${bankId}`;
  const saved = getNewestSession<SavedPracticeSession>('rtt_practice_session_', (value) => (
    value?.setId === setId &&
    Array.isArray(value.queueIds) &&
    value.queueIds.length > 0 &&
    !!value.currentId
  ));

  if (!saved) {
    return {
      href: `/app/practice/${setId}?mode=all&cat=all&flow=free`,
      label: 'Practice Questions',
      sublabel: 'Open the full question bank, then narrow by Mini Mock or category whenever you want targeted review.',
    };
  }

  const params = new URLSearchParams();
  params.set('mode', saved.mode || 'all');
  params.set('flow', 'free');
  params.set('filter', saved.cat || 'all');

  return {
    href: `/app/practice/${setId}?${params.toString()}`,
    label: 'Resume Practice Questions',
    sublabel: `Continue where you left off${saved.answeredCount ? ` — ${saved.answeredCount}/${saved.totalCount || saved.answeredCount} answered.` : '.'}`,
  };
}

function buildFlashResume(bankId: number): ResumeLinkState {
  const setId = `qbank${bankId}`;
  const saved = getNewestSession<SavedFlashSession>('rtt_flash_session_', (value) => (
    value?.setId === setId &&
    ((value.deck?.length || 0) + (value.mastered?.length || 0)) > 0
  ));

  if (!saved) {
    return {
      href: `/app/flashcards?set=${setId}&mode=all`,
      label: 'Review Flashcards',
      sublabel: 'Study every flashcard in this bank or filter down to missed concepts that need extra repetition.',
    };
  }

  const params = new URLSearchParams();
  params.set('set', setId);
  params.set('mode', saved.mode || 'all');
  params.set('filter', saved.cat || 'all');

  return {
    href: `/app/flashcards?${params.toString()}`,
    label: 'Resume Flashcards',
    sublabel: `Continue your saved ${saved.mode === 'missed' ? 'missed deck' : 'flashcard deck'}.`,
  };
}

function buildMockResume(bankId: number): ResumeLinkState {
  const setId = `qbank${bankId}`;

  let saved: SavedMockSession | null = null;
  let bestSavedAt = -1;

  if (typeof window !== 'undefined') {
    for (const store of [window.localStorage, window.sessionStorage]) {
      for (const key of Object.keys(store)) {
        if (!key.startsWith(`rtt_mock_session_free_${setId}_`)) continue;
        const value = readStorageJson<SavedMockSession>(store, key);
        if (!value || !Array.isArray(value.questions) || value.questions.length === 0) continue;
        const savedAt = Number(value.savedAt || 0);
        if (savedAt >= bestSavedAt) {
          saved = value;
          bestSavedAt = savedAt;
        }
      }
    }
  }

  if (!saved) {
    return {
      href: `/app/mock-exam?qbank=${setId}&flow=free`,
      label: 'Mock Exams',
      sublabel: 'Simulate full-length exam pressure anytime to check retention and build confidence.',
    };
  }

  const params = new URLSearchParams();
  params.set('qbank', setId);
  params.set('flow', 'free');
  params.set('scope', saved.scope || 'mini');
  if ((saved.scope || 'mini') === 'mini') {
    params.set('mini', String(saved.miniId || 1));
  }
  if ((saved.scope || 'mini') === 'category' && saved.categoryFilter) {
    params.set('category', saved.categoryFilter);
  }

  const answered = Object.keys(saved.answers || {}).length;

  return {
    href: `/app/mock-exam?${params.toString()}`,
    label: 'Resume Mock Exam',
    sublabel: `Continue your saved ${(saved.scope || 'mini') === 'mini' ? `Mini Mock ${saved.miniId || 1}` : (saved.scope || 'mock')} ${answered ? `— ${answered}/${saved.questions?.length || answered} answered.` : ''}`.trim(),
  };
}


function PillLink({
  href,
  children,
  variant = 'neutral',
  className = '',
}: {
  href: string;
  children: ReactNode;
  variant?: 'neutral' | 'pro' | 'start';
  className?: string;
}) {
  const cls =
    variant === 'start'
      ? 'bg-yellow-400 text-black hover:brightness-95 shadow-[0_10px_30px_rgba(250,204,21,0.18)]'
      : variant === 'pro'
        ? 'bg-yellow-400 text-black hover:brightness-95 shadow-[0_10px_30px_rgba(250,204,21,0.16)]'
        : 'border border-white/10 bg-white/[0.04] text-white/85 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06]';

  return (
    <Link
      href={href}
      className={[
        'inline-flex items-center justify-center rounded-2xl px-4 py-2 text-xs font-semibold transition',
        cls,
        className,
      ].join(' ')}
    >
      {children}
    </Link>
  );
}

function PracticeActions({ bankId }: { bankId: number }) {
  const [resumeLinks, setResumeLinks] = useState<{
    practice: ResumeLinkState;
    flashcards: ResumeLinkState;
    mock: ResumeLinkState;
  } | null>(null);

  useEffect(() => {
    const update = () => {
      setResumeLinks({
        practice: buildPracticeResume(bankId),
        flashcards: buildFlashResume(bankId),
        mock: buildMockResume(bankId),
      });
    };

    update();
    window.addEventListener('rtt-progress-updated', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('rtt-progress-updated', update);
      window.removeEventListener('storage', update);
    };
  }, [bankId]);

  const practiceLink = resumeLinks?.practice || buildPracticeResume(bankId);
  const flashLink = resumeLinks?.flashcards || buildFlashResume(bankId);
  const mockLink = resumeLinks?.mock || buildMockResume(bankId);

  return (
    <div data-tour="practice-free" className="mt-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link
          href={practiceLink.href}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.05]"
        >
          <div className="text-sm font-semibold text-white">{practiceLink.label}</div>
          <div className="mt-1 text-xs leading-5 text-white/70">{practiceLink.sublabel}</div>
        </Link>

        <Link
          href={flashLink.href}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.05]"
        >
          <div className="text-sm font-semibold text-white">{flashLink.label}</div>
          <div className="mt-1 text-xs leading-5 text-white/60">{flashLink.sublabel}</div>
        </Link>

        <Link
          href={mockLink.href}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.05]"
        >
          <div className="text-sm font-semibold text-white">{mockLink.label}</div>
          <div className="mt-1 text-xs leading-5 text-white/60">{mockLink.sublabel}</div>
        </Link>
      </div>
    </div>
  );
}

function BankCard({ bank, isPro, mounted }: { bank: Bank; isPro: boolean; mounted: boolean }) {
  const locked = bank.locked && !isPro;
  const unlocked = !locked;

  const mastery = useMemo(
    () =>
      mounted && unlocked ? getBankMasterySummary(`qbank${bank.id}`) : null,
    [mounted, unlocked, bank.id],
  );

  const BANK_COPY: Record<number, { title: string; description: string }> = {
    1: {
      title: 'Question Bank 1 – Start (Free)',
      description: 'Begin your journey to earning RT(R) behind your name.',
    },
    2: {
      title: 'Question Bank 2 – Building',
      description: 'Increase exposure and start closing knowledge gaps.',
    },
    3: {
      title: 'Question Bank 3 – Applying',
      description: 'The patterns are becoming familiar.',
    },
    4: {
      title: 'Question Bank 4 – Mastering',
      description: "You've seen it asked enough ways to feel confident.",
    },
    5: {
      title: 'Question Bank 5 – Registry Ready',
      description:
        "You've seen it all. Walk in knowing nothing will surprise you",
    },
  };

  const { title, description } = BANK_COPY[bank.id];

  return (
    <div className="group rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5 hover:border-white/15 hover:shadow-[0_24px_60px_rgba(0,0,0,0.24)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white">{title}</div>
          <div className="mt-1 text-xs text-white/60">{description}</div>
        </div>

        {locked ? (
          <PillLink href="/app/upgrade" variant="pro">
            Get Pro
          </PillLink>
        ) : null}
      </div>

      {unlocked ? (
        <>
          <PracticeActions bankId={bank.id} />
        </>
      ) : (
        <div className="mt-4 text-xs text-white/55">
          Locked in Free. Upgrade to unlock this Practice Bank.
        </div>
      )}
    </div>
  );
}

export default function QBankSection() {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadAccess() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) return;

      if (!user) {
        setIsPro(false);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('user_access')
        .select('is_pro')
        .eq('user_id', user.id)
        .maybeSingle<AccessRow>();

      if (!active) return;
      setIsPro(Boolean(data?.is_pro));
      setLoading(false);
    }

    loadAccess();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadAccess();
    });

    setMounted(true);

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

const banks: Bank[] = useMemo(
  () => [
    { id: 1, label: 'Starting', locked: false },
    { id: 2, label: 'Building', locked: true },
    { id: 3, label: 'Applying', locked: true },
    { id: 4, label: 'Mastering', locked: true },
    { id: 5, label: 'Registry Ready', locked: true },
  ],
  [],
);

  return (
    <div data-tour="practice-banks" className="mt-6 overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(45,212,191,0.05),rgba(255,255,255,0.02))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)] md:p-8">
      {/* {!loading && !isPro ? (
        <div className="mb-6 flex justify-end">
          <div className="flex flex-col items-end gap-2">
            <PillLink href="/app/upgrade" variant="pro">
              Unlock Practice Bank 2–3 (Get Pro)
            </PillLink>
            <div className="text-xs text-white/55">Best next step after you finish the free starter bank.</div>
          </div>
        </div>
      ) : null} */}

      <div className="grid grid-cols-1 gap-4">
        {banks.map((b) => (
          <BankCard key={b.id} bank={b} isPro={isPro} mounted={mounted} />
        ))}
      </div>

      {/* <div data-tour="practice-explainer" className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-5 text-sm text-white/75">
        <div className="font-semibold text-white">What this means</div>
        <div className="mt-2 leading-7 text-white/70">
          Practice is your free-study toolbox, so you can review by category, by Mini Mock, or across the full bank whenever you want.
          <br />
          Every question, flashcard, and full mock in Practice Bank 1 is open for flexible review.
          <br />
          Each additional Practice Bank increases exposure and reduces surprise on test day.
        </div>
      </div> */}
    </div>
  );
}
