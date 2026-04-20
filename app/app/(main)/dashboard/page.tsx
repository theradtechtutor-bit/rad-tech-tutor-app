'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import StartHereTour from '@/app/app/_components/StartHereTour';
import { usePro } from '@/app/app/_lib/usePro';
import {
  readFlashSession,
  readMasteryMiniStep,
  readPracticeSession,
  readFullQbankMastery,
  readFullQbankStep,
  getBankMasterySummary,
  resetMiniMockFull,
  resetFullQbank,
  getCategoryCumulative,
  getMasterySummary,
  readAttempts,
  saveFullQbankStep,
  getMiniMockChallengeStats,
} from '@/lib/progressStore';

const BANKS = ['qbank1', 'qbank2', 'qbank3'] as const;

type BankId = (typeof BANKS)[number];
type LessonKey = `mini-${number}` | 'full-qbank';

type Attempts = ReturnType<typeof readAttempts>;
type Summary = ReturnType<typeof getMasterySummary>;
type Cumulative = ReturnType<typeof getCategoryCumulative>;
type BankSummary = ReturnType<typeof getBankMasterySummary>;

type StepKey = 'practice' | 'flashcards' | 'exam';

type StepConfig = {
  key: StepKey;
  title: string;
  body: string;
  href: string;
  badge: string;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function labelForBank(setId: string) {
  const id = Number(setId.replace('qbank', ''));

  if (id === 1) return 'Core Skills';
  if (id === 2) return 'Advanced Training';
  if (id === 3) return 'Registry Ready';

  return 'Practice Bank';
}

function tierForBank(setId: string) {
  const id = Number(setId.replace('qbank', ''));

  if (id === 1) return 'Free';
  return 'Pro';
}

function scrollToElementById(id: string) {
  const node =
    typeof document !== 'undefined'
      ? (document.getElementById(id) ??
        document.querySelector(`[data-step-id="${id}"]`))
      : null;
  if (!node) return;
  node.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function stepSectionId(mini: number, step: StepKey) {
  return `mini-${mini}-step-${step}`;
}

function scrollToMiniStep(mini: number, step: StepKey) {
  const id = stepSectionId(mini, step);
  scrollToElementById(id);
}

function getSavedMiniMockSessionMeta(setId: string, mini: number) {
  if (typeof window === 'undefined') return null;

  try {
    const storageSources = [window.localStorage, window.sessionStorage];
    const prefixes = [
      `rtt_mock_session_mastery_${setId}_mini_${mini}_`,
      `rtt_mock_session_${setId}_mini_${mini}`,
    ];

    for (const storage of storageSources) {
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (!key) continue;
        if (!prefixes.some((prefix) => key.startsWith(prefix))) continue;

        const raw = storage.getItem(key);
        if (!raw) continue;

        const parsed = JSON.parse(raw);
        return {
          answeredCount:
            Number(
              parsed?.answeredCount ??
                Object.keys(parsed?.answers || {}).length,
            ) || 0,
          total: Array.isArray(parsed?.questions) ? parsed.questions.length : 0,
          key,
        };
      }
    }
  } catch {}

  return null;
}

function hasSavedMiniMockSession(setId: string, mini: number) {
  return !!getSavedMiniMockSessionMeta(setId, mini);
}

function getSavedPracticeMeta(setId: string, mini: number) {
  if (typeof window === 'undefined') return null;

  const keys = [
    `mastery__${setId}__all__all__${mini}`,
    `${setId}__all__all__${mini}`,
  ];

  for (const scopeKey of keys) {
    const parsed = readPracticeSession(scopeKey);
    if (!parsed) continue;

    return {
      answeredCount: Number(parsed?.answeredCount || 0),
      total:
        Number(parsed?.totalCount || 0) ||
        Number(
          (parsed?.answeredCount || 0) + ((parsed?.queueIds || []).length || 0),
        ),
      currentId: parsed?.currentId || null,
      queueIds: Array.isArray(parsed?.queueIds) ? parsed.queueIds : [],
      savedAt: Number(parsed?.savedAt || 0),
    };
  }

  return null;
}

function getSavedFullPracticeMeta(setId: string) {
  if (typeof window === 'undefined') return null;

const keys = [
  `mastery__${setId}__full`,
  `mastery__${setId}__all__all__full`,
  `${setId}__all__all__full`,
];

let parsed = null;

for (const key of keys) {
  const attempt = readPracticeSession(key);
  if (attempt) {
    parsed = attempt;
    break;
  }
}

if (!parsed) return null;  if (!parsed) return null;

  return {
    answeredCount: Number(parsed?.answeredCount || 0),
    total:
      Number(parsed?.totalCount || 0) ||
      Number(
        (parsed?.answeredCount || 0) + ((parsed?.queueIds || []).length || 0),
      ),
    currentId: parsed?.currentId || null,
    queueIds: Array.isArray(parsed?.queueIds) ? parsed.queueIds : [],
    savedAt: Number(parsed?.savedAt || 0),
  };
}

function getSavedFullMockSessionMeta(setId: string) {
  if (typeof window === 'undefined') return null;

  try {
    const storageSources = [window.localStorage, window.sessionStorage];
    const prefix = `rtt_mock_session_mastery_${setId}_full_0_`;

    for (const storage of storageSources) {
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (!key) continue;
        if (!key.startsWith(prefix)) continue;

        const raw = storage.getItem(key);
        if (!raw) continue;

        const parsed = JSON.parse(raw);
        return {
          answeredCount:
            Number(
              parsed?.answeredCount ??
                Object.keys(parsed?.answers || {}).length,
            ) || 0,
          total: Array.isArray(parsed?.questions) ? parsed.questions.length : 0,
          key,
        };
      }
    }
  } catch {}

  return null;
}

function hasPracticeAttemptForMini(
  attempts: Attempts,
  bank: BankSummary,
  mini: number,
) {
  const bankNumber = Number(bank.setId.replace('qbank', ''));
  return attempts.some((item) => {
    const probe = `${item.label || ''} ${item.category || ''}`.toLowerCase();
    const matchesMini = probe.includes(`mini mock ${mini}`);
    return (
      item.type === 'practice' && item.bankId === bankNumber && matchesMini
    );
  });
}

function getSavedFlashcardsMeta(setId: string, mini: number) {
  if (typeof window === 'undefined') return null;

  try {
    const exact = readFlashSession(`${setId}__missed__all__${mini}`);
    if (exact) {
      const deckCount = Array.isArray(exact?.deck) ? exact.deck.length : 0;
      const masteredCount = Array.isArray(exact?.mastered)
        ? exact.mastered.length
        : 0;
      const total = deckCount + masteredCount;

      return {
        reviewed:
          masteredCount + Math.min(Number(exact?.cursor || 0), deckCount),
        total,
        remaining: deckCount,
        key: `rtt_flash_session_${setId}__missed__all__${mini}`,
      };
    }

    const storageSources = [window.localStorage, window.sessionStorage];
    const prefix = `rtt_flash_session_${setId}__missed__all__${mini}`;

    for (const storage of storageSources) {
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (!key) continue;
        if (!key.startsWith(prefix)) continue;

        const raw = storage.getItem(key);
        if (!raw) continue;

        const parsed = JSON.parse(raw);
        const deckCount = Array.isArray(parsed?.deck) ? parsed.deck.length : 0;
        const masteredCount = Array.isArray(parsed?.mastered)
          ? parsed.mastered.length
          : 0;
        const total = deckCount + masteredCount;

        return {
          reviewed:
            masteredCount + Math.min(Number(parsed?.cursor || 0), deckCount),
          total,
          remaining: deckCount,
          key,
        };
      }
    }
  } catch {}

  return null;
}

function hasFlashcardsForMini(setId: string, mini: number) {
  return !!getSavedFlashcardsMeta(setId, mini);
}

function getCurrentMiniStep(
  summary: Summary,
  bank: BankSummary,
  attempts: Attempts,
) {
  const status = bank.miniStatus[String(bank.currentMini)];
  const savedPractice = getSavedPracticeMeta(bank.setId, bank.currentMini);
  const savedFlash = getSavedFlashcardsMeta(bank.setId, bank.currentMini);
  const savedExam = getSavedMiniMockSessionMeta(bank.setId, bank.currentMini);
  const savedStep = readMasteryMiniStep(bank.setId, bank.currentMini);

    console.log('getCurrentMiniStep', {
      mini: bank.currentMini,
      status,
      savedPractice,
      savedFlash,
      savedExam,
      savedStep,
    });

  if (status?.attempts) return 'exam' as const;
  if (savedExam && savedExam.answeredCount > 0) return 'exam' as const;
  if (savedStep === 'exam') return 'exam' as const;

  if (savedFlash) {
    if (savedFlash.remaining > 0) return 'flashcards' as const;
    return 'exam' as const;
  }

  if (savedStep === 'flashcards') return 'flashcards' as const;

  if (
    savedPractice ||
    hasPracticeAttemptForMini(attempts, bank, bank.currentMini)
  ) {
    return 'practice' as const;
  }

  return 'practice' as const;
  
}

function getMiniState(bank: BankSummary, attempts: Attempts, mini: number) {
  const status = bank.miniStatus[String(mini)];
  const completed = Boolean(status?.attempts);

  const practiceMeta = getSavedPracticeMeta(bank.setId, mini);
  const flashMeta = getSavedFlashcardsMeta(bank.setId, mini);
  const examMeta = getSavedMiniMockSessionMeta(bank.setId, mini);
  const savedStep = readMasteryMiniStep(bank.setId, mini);

  const practiceAnswered = Number(practiceMeta?.answeredCount || 0);
  const practiceHasWork =
    practiceAnswered > 0 || hasPracticeAttemptForMini(attempts, bank, mini);

  const flashTotal = Number(flashMeta?.total || 0);
  const flashRemaining = Number(flashMeta?.remaining || 0);
  const flashReviewed = Math.max(0, flashTotal - flashRemaining);
  const flashHasWork = flashTotal > 0 || flashReviewed > 0;

  const examAnswered = Number(examMeta?.answeredCount || 0);
  const examHasWork = savedStep === 'exam' || examAnswered > 0 || !!examMeta;

  const practiceComplete =
    completed ||
    savedStep === 'flashcards' ||
    (practiceHasWork && flashHasWork);

  const flashcardsComplete =
    completed || (flashMeta ? flashTotal > 0 && flashRemaining === 0 : false);

  const practiceSkipped = !practiceComplete && !practiceHasWork && examHasWork;

  const flashcardsSkipped = !flashcardsComplete && !flashHasWork && examHasWork;

  let activeStep: StepKey = 'practice';

  if (completed) {
    activeStep = 'exam';
  } else if (savedStep === 'exam' || examMeta) {
    activeStep = 'exam';
  } else if (flashMeta) {
    activeStep = flashRemaining > 0 ? 'flashcards' : 'exam';
  } else if (savedStep === 'flashcards') {
    activeStep = 'flashcards';
  } else {
    activeStep = 'practice';
  }

  return {
    status,
    completed,
    practiceMeta,
    flashMeta,
    examMeta,
    savedStep,
    practiceComplete,
    flashcardsComplete,
    practiceSkipped,
    flashcardsSkipped,
    activeStep,
  };
}

function lessonForCurrentProgress(
  summary: Summary,
  bank: BankSummary,
): LessonKey {
if (bank.bankMastered) {
  return 'full-qbank';
}
  return `mini-${bank.currentMini}`;
}

function progressPercent(completed: number, total: number) {
  return Math.max(0, Math.min(100, Math.round((completed / total) * 100)));
}

function buildMiniStepConfigs(bank: BankSummary, mini: number): StepConfig[] {
  return [
    {
      key: 'practice',
      title: 'Step 1 — Practice Test',
      body: 'Take the baseline attempt for this Mini Mock before reviewing anything that you may miss.',
      href: `/app/practice/${bank.setId}?mode=all&cat=all&flow=mastery&mini=${mini}`,
      badge: 'Start here',
    },
    {
      key: 'flashcards',
      title: 'Step 2 — Missed Flashcards',
      body: 'Review the concepts you missed so you close your weak spots.',
      href: `/app/flashcards?set=${bank.setId}&mode=missed&cat=all&flow=mastery&mini=${mini}`,
      badge: 'Review',
    },
    {
      key: 'exam',
      title: 'Step 3 — Mini Mock Exam',
      body: 'Take the Mini Mock Exam after Practice test and Flashcards. This score becomes your official Mini Mock score.',
      href: `/app/mock-exam?qbank=${bank.setId}&scope=mini&mini=${mini}&flow=mastery&autostart=1`,
      badge: 'Official score',
    },
  ];
}

function SidebarMiniMock({
  mini,
  bank,
  isActive,
  isCurrent,
  isPro,
  summary,
  attempts,
  onSelect,
  onStart,
  onResume,
  onRestart,
}: {
  mini: number;
  bank: BankSummary;
  isActive: boolean;
  isCurrent: boolean;
  isPro: boolean;
  summary: Summary;
  attempts: Attempts;
  onSelect: () => void;
  onStart: () => void;
  onResume: () => void;
  onRestart: () => void;
}) {
  const isLocked = mini > 5 && !isPro;
  const status = bank.miniStatus[String(mini)];
  const completed = Boolean(status?.attempts);
  const miniState = getMiniState(bank, attempts, mini);
  
const practiceMeta = miniState.practiceMeta;
const flashMeta = miniState.flashMeta;
const examMeta = miniState.examMeta;
const savedStep = miniState.savedStep;
const practiceComplete = miniState.practiceComplete;
const flashcardsComplete = miniState.flashcardsComplete;
const practiceSkipped = miniState.practiceSkipped;
const flashcardsSkipped = miniState.flashcardsSkipped;

  const practiceAnswered = Number(practiceMeta?.answeredCount || 0);
  const practiceTotal = Number(practiceMeta?.total || 0);
  const practicePct =
    practiceMeta && practiceTotal > 0
      ? Math.max(
          0,
          Math.min(100, Math.round((practiceAnswered / practiceTotal) * 100)),
        )
      : practiceComplete
        ? 100
        : 0;

  const flashRemaining = Number(flashMeta?.remaining || 0);
  const flashTotal = Number(flashMeta?.total || 0);
  const flashDone = flashMeta
    ? Math.max(0, flashTotal - flashRemaining)
    : flashcardsComplete
      ? 1
      : 0;
  const flashPct = flashcardsComplete
    ? 100
    : flashMeta && flashTotal > 0
      ? Math.max(0, Math.min(100, Math.round((flashDone / flashTotal) * 100)))
      : 0;

  const examAnswered = completed
    ? Number(examMeta?.total || 20)
    : Number(examMeta?.answeredCount || 0);
  const examTotal = Number(examMeta?.total || (completed ? 20 : 0));
  const examPct = completed
    ? 100
    : examMeta && examTotal > 0
      ? Math.max(0, Math.min(100, Math.round((examAnswered / examTotal) * 100)))
      : 0;

  const hasStarted =
    completed ||
    !!practiceMeta ||
    !!flashMeta ||
    !!examMeta ||
    savedStep === 'practice' ||
    savedStep === 'flashcards' ||
    savedStep === 'exam' ||
    practiceComplete ||
    flashcardsComplete;

  const showStart = !isLocked && !hasStarted;
  const showResume = !isLocked && !completed && hasStarted;
  const showRestart = !isLocked && hasStarted;

  const totalStagePct = completed
    ? 100
    : Math.round(
        Math.min(99, practicePct * 0.34 + flashPct * 0.33 + examPct * 0.33),
      );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        if (isLocked) {
          window.location.href = '/app/upgrade';
          return;
        }
        onSelect();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cx(
        'cursor-pointer rounded-2xl border transition',
        isActive
          ? 'border-emerald-400/35 bg-emerald-500/10 shadow-[0_0_0_1px_rgba(45,212,191,0.16)]'
          : 'border-transparent bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.05]',
      )}
    >
      <div className="px-3 py-3">
        <div className="flex items-center gap-3">
          <div
            className={cx(
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
              completed
                ? 'bg-emerald-400/15 text-emerald-200'
                : isCurrent
                  ? 'bg-white/10 text-white'
                  : 'bg-white/8 text-white/70',
            )}
          >
            {completed ? '✓' : mini}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 truncate text-sm font-semibold text-white">
                <span className="truncate">
                  Mini Mock {mini}{' '}
                  {isLocked ? (
                    <span className="ml-2 text-yellow-400">PRO 🔒</span>
                  ) : null}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {showRestart ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRestart();
                    }}
                    className="shrink-0 rounded-md bg-red-500/20 px-2 py-1 text-[10px] font-semibold text-red-300 hover:bg-red-500/30"
                  >
                    Restart
                  </button>
                ) : null}

                {showResume ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onResume();
                    }}
                    className="xl:hidden rounded-full border border-emerald-300/25 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-200"
                  >
                    Resume
                  </button>
                ) : null}

                {showStart ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStart();
                    }}
                    className="xl:hidden rounded-full border border-emerald-300/25 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-200"
                  >
                    Start
                  </button>
                ) : null}

                {status?.attempts ? (
                  <div className="text-xs font-semibold text-emerald-200">
                    {status.lastScore}%
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/25">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,rgba(45,212,191,0.98),rgba(16,185,129,0.65))]"
                style={{ width: `${totalStagePct}%` }}
              />
            </div>

            {isActive ? (
              <div className="mt-3 space-y-3 text-xs text-white/65">
                <div>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span>Practice Test</span>
                    {practiceMeta ? (
                      <span className="font-semibold text-emerald-300">
                        {practiceAnswered} / {practiceTotal}
                      </span>
                    ) : practiceComplete ? (
                      <span className="font-semibold text-emerald-300">
                        Complete
                      </span>
                    ) : practiceSkipped ? (
                      <span className="font-semibold text-yellow-300">
                        Skipped
                      </span>
                    ) : (
                      <span className="text-white/40">Not started</span>
                    )}
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-black/25">
                    <div
                      className="h-full rounded-full bg-white/70"
                      style={{ width: `${practicePct}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span>Missed Flashcards</span>
                    {flashcardsComplete ? (
                      <span className="font-semibold text-emerald-300">
                        Complete
                      </span>
                    ) : flashMeta ? (
                      <span className="font-semibold text-yellow-300">
                        {flashDone} / {flashTotal}
                      </span>
                    ) : flashcardsSkipped ? (
                      <span className="font-semibold text-yellow-300">
                        Skipped
                      </span>
                    ) : (
                      <span className="text-white/40">Not started</span>
                    )}
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-black/25">
                    <div
                      className="h-full rounded-full bg-white/70"
                      style={{ width: `${flashPct}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span>Mini Mock Exam</span>
                    {completed ? (
                      <span className="font-semibold text-emerald-300">
                        Complete • {status?.lastScore ?? 0}%
                      </span>
                    ) : examMeta ? (
                      <span className="font-semibold text-blue-300">
                        {examAnswered} / {examTotal}
                      </span>
                    ) : status?.attempts ? (
                      <span className="font-semibold text-emerald-300">
                        Score: {status.lastScore}%
                      </span>
                    ) : (
                      <span className="text-white/40">Not started</span>
                    )}
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-black/25">
                    <div
                      className="h-full rounded-full bg-white/70"
                      style={{ width: `${examPct}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-white/55">
                {practiceMeta ? (
                  <span>
                    Practice {practiceAnswered}/{practiceTotal}
                  </span>
                ) : practiceComplete ? (
                  <span>Practice: Done</span>
                ) : null}
                {flashMeta ? (
                  <span>
                    Flashcards: {flashDone}/{flashTotal}
                  </span>
                ) : flashcardsComplete ? (
                  <span>Flashcards: Done</span>
                ) : null}
                {completed ? (
                  <span className="font-semibold text-emerald-300">
                    Complete
                  </span>
                ) : examMeta ? (
                  <span>
                    Exam: {examAnswered} / {examTotal}
                  </span>
                ) : status?.attempts ? (
                  <span>Score: {status.lastScore}%</span>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarFullQbank({
  bank,
  isActive,
  isPro,
  onSelect,
  onStart,
  onResume,
  onRestart,
}: {
  bank: BankSummary;
  isActive: boolean;
  isPro: boolean; // ✅ ADD THIS LINE

  onSelect: () => void;
  onStart: () => void;
  onResume: () => void;
  onRestart: () => void;
}) {
  const full = readFullQbankMastery(bank.setId);
  const isLocked = !isPro;
  const savedStep = readFullQbankStep(bank.setId);
  const practiceMeta = getSavedFullPracticeMeta(bank.setId);

  const flashMeta = readFlashSession(`${bank.setId}__missed__all__full`);
  const examMeta = getSavedFullMockSessionMeta(bank.setId);
  const examAnswered = Number(examMeta?.answeredCount || 0);
  const examTotal = Number(examMeta?.total || 0);
  const examInProgress = savedStep === 'exam';

  const practiceComplete = full.practice.completed;
  const practiceAnswered = Number(practiceMeta?.answeredCount || 0);
  const practiceTotal = Number(practiceMeta?.total || 0);
  const flashcardsComplete = full.flashcards.completed;
  const completed = full.exam.completed;
  console.log('FULL MOCK STATE:', {
    completed,
    lastScore: full.exam.lastScore,
    exam: full.exam,
  });

  const practiceSkipped = examInProgress && !practiceComplete && !practiceMeta;
  const flashcardsSkipped = examInProgress && !flashcardsComplete && !flashMeta;

  const hasStarted =
    completed ||
    practiceComplete ||
    flashcardsComplete ||
    !!practiceMeta ||
    !!examMeta ||
    savedStep === 'practice' ||
    savedStep === 'flashcards' ||
    savedStep === 'exam';

  const showStart = !isLocked && !hasStarted;
  const showResume = !isLocked && hasStarted && !completed;
  const showRestart = !isLocked && hasStarted;

const activeStep: StepKey = completed
  ? 'exam'
  : savedStep === 'exam'
    ? 'exam'
    : flashcardsComplete || savedStep === 'flashcards'
      ? 'flashcards'
      : 'practice';

  const practicePct =
    practiceMeta && practiceTotal > 0
      ? Math.max(
          0,
          Math.min(100, Math.round((practiceAnswered / practiceTotal) * 100)),
        )
      : practiceComplete
        ? 100
        : 0;

  const flashPct = flashcardsComplete ? 100 : 0;
  const examPct = completed
    ? 100
    : examMeta && examTotal > 0
      ? Math.max(0, Math.min(100, Math.round((examAnswered / examTotal) * 100)))
      : 0;

  const totalStagePct = completed
    ? 100
    : Math.round(
        Math.min(99, practicePct * 0.34 + flashPct * 0.33 + examPct * 0.33),
      );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        if (isLocked) {
          window.location.href = '/app/upgrade';
          return;
        }
        onSelect();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();

          if (isLocked) {
            window.location.href = '/app/upgrade';
            return;
          }

          onSelect();
        }
      }}
      className={cx(
        'cursor-pointer rounded-2xl border transition',
        isActive
          ? 'border-yellow-400/40 bg-yellow-500/10 shadow-[0_0_0_1px_rgba(250,204,21,0.18)]'
          : 'border-transparent bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.05]',
      )}
    >
      <div className="px-3 py-3">
        <div className="flex items-center gap-3">
          <div
            className={cx(
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
              completed
                ? 'bg-yellow-400/20 text-yellow-300'
                : isActive
                  ? 'bg-yellow-400/15 text-yellow-300'
                  : 'bg-yellow-400/10 text-yellow-200/70',
            )}
          >
            {completed ? '✓' : '★'}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 truncate text-sm font-semibold text-white">
                <span className="truncate text-yellow-300">
                  Full Mock
                  {isLocked && (
                    <span className="ml-2 text-yellow-400">PRO 🔒</span>
                  )}
                </span>

                <span className="ml-2 rounded-full bg-yellow-400/20 px-2 py-0.5 text-[10px] font-semibold text-yellow-300">
                  200Qs
                </span>
              </div>

              <div className="flex items-center gap-2">
                {showRestart ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isLocked) {
                        window.location.href = '/app/upgrade';
                        return;
                      }
                      onRestart();
                    }}
                    className="shrink-0 rounded-md bg-red-500/20 px-2 py-1 text-[10px] font-semibold text-red-300 hover:bg-red-500/30"
                  >
                    Restart
                  </button>
                ) : null}

                {showResume ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isLocked) {
                        window.location.href = '/app/upgrade';
                        return;
                      }
                      onResume();
                    }}
                    className="xl:hidden rounded-full border border-yellow-300/25 bg-yellow-400/10 px-2 py-0.5 text-[10px] font-semibold text-yellow-200"
                  >
                    Resume
                  </button>
                ) : null}

                {showStart ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isLocked) {
                        window.location.href = '/app/upgrade';
                        return;
                      }
                      onStart();
                    }}
                    className="xl:hidden rounded-full border border-yellow-300/25 bg-yellow-400/10 px-2 py-0.5 text-[10px] font-semibold text-yellow-200"
                  >
                    Start
                  </button>
                ) : null}
              </div>
            </div>

            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/25">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,rgba(250,204,21,0.95),rgba(234,179,8,0.65))]"
                style={{ width: `${totalStagePct}%` }}
              />
            </div>

            {isActive ? (
              <div className="mt-3 space-y-3 text-xs text-white/65">
                <div>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span>Practice Test</span>
                    {practiceMeta ? (
                      <span className="font-semibold text-yellow-300">
                        {practiceAnswered} / {practiceTotal}
                      </span>
                    ) : practiceComplete ? (
                      <span className="font-semibold text-yellow-300">
                        Complete
                      </span>
                    ) : practiceSkipped ? (
                      <span className="font-semibold text-yellow-300">
                        Skipped
                      </span>
                    ) : (
                      <span className="text-white/40">Not started</span>
                    )}
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-black/25">
                    <div
                      className="h-full rounded-full bg-yellow-300/80"
                      style={{ width: `${practicePct}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span>Missed Flashcards</span>
                    {flashcardsComplete ? (
                      <span className="font-semibold text-yellow-300">
                        Complete
                      </span>
                    ) : flashMeta ? (
                      <span className="font-semibold text-yellow-300">
                        In progress
                      </span>
                    ) : flashcardsSkipped ? (
                      <span className="font-semibold text-yellow-300">
                        Skipped
                      </span>
                    ) : savedStep === 'flashcards' ? (
                      <span className="font-semibold text-yellow-300">
                        In progress
                      </span>
                    ) : (
                      <span className="text-white/40">Not started</span>
                    )}
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-black/25">
                    <div
                      className="h-full rounded-full bg-yellow-300/80"
                      style={{ width: `${flashPct}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span>Full Mock Exam</span>
                    {completed ? (
                      <span className="font-semibold text-yellow-300">
                        Complete
                        {full.exam.lastScore != null
                          ? ` • ${full.exam.lastScore}%`
                          : ''}
                      </span>
                    ) : examMeta ? (
                      <span className="font-semibold text-yellow-300">
                        {examAnswered} / {examTotal}
                      </span>
                    ) : savedStep === 'exam' ? (
                      <span className="font-semibold text-yellow-300">
                        In progress
                      </span>
                    ) : (
                      <span className="text-white/40">Not started</span>
                    )}
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-black/25">
                    <div
                      className="h-full rounded-full bg-yellow-300/80"
                      style={{ width: `${examPct}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-white/55">
                {practiceComplete ? (
                  <span>Practice: Done</span>
                ) : practiceSkipped ? (
                  <span className="text-yellow-300">Practice: Skipped</span>
                ) : null}

                {flashcardsComplete ? (
                  <span>Flashcards: Done</span>
                ) : flashcardsSkipped ? (
                  <span className="text-yellow-300">Flashcards: Skipped</span>
                ) : null}
                {completed ? (
                  <span className="font-semibold text-yellow-300">
                    Complete
                  </span>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function hasSavedPracticeSession(setId: string, mini?: number) {
  if (typeof window === 'undefined') return false;

  try {
    const keys = Object.keys(localStorage);
    return keys.some((key) => {
      if (!key.startsWith('rtt_practice_session_')) return false;
      if (!key.includes(setId)) return false;
      if (mini && !key.includes(`__${mini}`)) return false;

      const raw = localStorage.getItem(key);
      if (!raw) return false;

      const parsed = JSON.parse(raw);
      return parsed?.queueIds?.length > 0;
    });
  } catch {
    return false;
  }
}
export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const proStatus = usePro();
  const isPro = proStatus ?? false;
  const [attempts, setAttempts] = useState<Attempts>([]);
  const [summary, setSummary] = useState<Summary>(getMasterySummary('qbank1'));
  const [cumulative, setCumulative] = useState<Cumulative>(
    getCategoryCumulative(),
  );
  const [bankSummaries, setBankSummaries] = useState<BankSummary[]>(
    BANKS.map((setId) => getBankMasterySummary(setId)),
  );
  const [selectedBank, setSelectedBank] = useState<BankId>('qbank1');
  const [selectedLesson, setSelectedLesson] = useState<LessonKey>('mini-1');
  const [showSkipExamModal, setShowSkipExamModal] = useState(false);
  const [pendingExamHref, setPendingExamHref] = useState<string | null>(null);
  const [lockedStepMessage, setLockedStepMessage] = useState<string | null>(
    null,
  );

function handleRestartMini(mini: number) {
  if (!currentBank) return;

  resetMiniMockFull(currentBank.setId, mini);
  setSelectedLesson(`mini-${mini}`);
}

  function handleRestartFull() {
    if (!currentBank) return;

    resetFullQbank(currentBank.setId);
    setSelectedLesson('full-qbank');
  }

  function openSkipExamModal(href: string) {
    setPendingExamHref(href);
    setShowSkipExamModal(true);
  }

  function closeSkipExamModal() {
    setShowSkipExamModal(false);
    setPendingExamHref(null);
  }

function confirmSkipExam() {
  if (!pendingExamHref) return;

  if (selectedLesson === 'full-qbank' && currentBank) {
    saveFullQbankStep(currentBank.setId, 'exam');
  }

  window.location.href = pendingExamHref;
}

  const [pendingScrollTarget, setPendingScrollTarget] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const refresh = () => {
      const nextAttempts = readAttempts();
      const nextSummary = getMasterySummary();
      const nextCumulative = getCategoryCumulative();
      const nextBanks = BANKS.map((setId) => getBankMasterySummary(setId));

      setAttempts(nextAttempts);
      setSummary(nextSummary);
      setCumulative(nextCumulative);
      setBankSummaries(nextBanks);
      setMounted(true);
    };

    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('rtt-progress-updated', refresh as EventListener);

    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener(
        'rtt-progress-updated',
        refresh as EventListener,
      );
    };
  }, []);

  const currentBank = useMemo(
    () =>
      bankSummaries.find((item) => item.setId === selectedBank) ??
      bankSummaries[0],
    [bankSummaries, selectedBank],
  );

  const challenge = currentBank
    ? getMiniMockChallengeStats(currentBank.setId)
    : { completed: 0, avg: 0, qualifies: false };

useEffect(() => {
  if (!currentBank) return;

  const nextLesson = lessonForCurrentProgress(summary, currentBank);
  const lockedFullPhase =
    !isPro &&
    (nextLesson === 'full-qbank');

  const fallbackLesson = lockedFullPhase
    ? (`mini-${currentBank.currentMini}` as LessonKey)
    : nextLesson;

  const selectedMiniNumber = selectedLesson.startsWith('mini-')
    ? Number(selectedLesson.replace('mini-', ''))
    : null;

  const isSelectedMiniValid =
    selectedMiniNumber != null &&
    selectedMiniNumber >= 1 &&
    selectedMiniNumber <= 10;

  const isSelectedFullPhase =
    selectedLesson === 'full-qbank';

  if (selectedLesson.startsWith('mini-') && isSelectedMiniValid) {
    return;
  }

  if (isSelectedFullPhase && !lockedFullPhase) {
    return;
  }

  setSelectedLesson(fallbackLesson);
}, [currentBank, summary, isPro, selectedLesson]);

  const currentMiniState = currentBank
    ? getMiniState(currentBank, attempts, currentBank.currentMini)
    : null;

  const currentMiniAction = useMemo(() => {
    if (!currentBank || !currentMiniState) return null;

    return (
      buildMiniStepConfigs(currentBank, currentBank.currentMini).find(
        (step) => step.key === currentMiniState.activeStep,
      ) || null
    );
  }, [currentBank, currentMiniState]);

  const selectedMini = selectedLesson.startsWith('mini-')
    ? Number(selectedLesson.replace('mini-', ''))
    : null;

  const selectedLessonData = useMemo(() => {
    if (!currentBank) return null;

    if (selectedLesson.startsWith('mini-') && selectedMini) {
      const steps = buildMiniStepConfigs(currentBank, selectedMini);
      const miniState = getMiniState(currentBank, attempts, selectedMini);
      const activeStep = miniState.activeStep;

      return {
        subtitle: 'Mini Mock Mastery',
        title: `Mini Mock ${selectedMini}`,
        lessonNumber: selectedMini,
        description:
          'Work through the baseline practice test, review only the missed flashcards, then retake the Mini Mock for your official score.',
        steps,
        activeStep,
      };
    }

if (selectedLesson === 'full-qbank') {
  const full = readFullQbankMastery(currentBank.setId);
  const savedStep = readFullQbankStep(currentBank.setId);

const steps = [
  {
    key: 'practice' as const,
    title: 'Step 1 — Full Practice Test',
    body: 'Take a full-bank practice test to measure readiness.',
    href: `/app/practice/${currentBank.setId}?mode=all&cat=all&flow=mastery&scope=full`,
    badge: 'Start here',
  },
  {
    key: 'flashcards' as const,
    title: 'Step 2 — Missed Flashcards',
    body: 'Review the missed concepts from your full practice test.',
    href: `/app/flashcards?set=${currentBank.setId}&mode=missed&cat=all&flow=mastery&scope=full`,
    badge: 'Review',
  },
  {
    key: 'exam' as const,
    title: 'Step 3 — Full Mock Exam',
    body: 'Take the final full-length registry simulation.',
    href: `/app/mock-exam?qbank=${currentBank.setId}&scope=full&flow=mastery&autostart=1`,
    badge: 'Final',
  },
];

let activeStep: StepKey = 'practice';

if (savedStep === 'exam' || full.exam.completed) {
  activeStep = 'exam';
} else if (savedStep === 'flashcards' || full.flashcards.completed) {
  activeStep = 'flashcards';
} else {
  activeStep = 'practice';
}

  return {
    subtitle: 'Full QBank Mastery',
    title: 'Full QBank Mock',
    description:
      'Complete full practice, review your misses, then take the full mock exam.',
    steps,
    activeStep,
  };
}
  }, [currentBank, selectedLesson, selectedMini, summary, attempts]);

  useEffect(() => {
    if (!pendingScrollTarget) return;

    const timer = window.setTimeout(() => {
      scrollToElementById(pendingScrollTarget);
    }, 80);

    return () => window.clearTimeout(timer);
  }, [pendingScrollTarget]);

  const miniScores = useMemo(() => {
    if (!currentBank)
      return [] as Array<{
        mini: number;
        score: number | null;
        completed: boolean;
        current: boolean;
      }>;

    return Array.from({ length: 10 }, (_, idx) => {
      const mini = idx + 1;
      const status = currentBank.miniStatus[String(mini)];
      return {
        mini,
        score: status?.attempts ? status.lastScore : null,
        completed: Boolean(status?.attempts),
        current: mini === currentBank.currentMini,
      };
    });
  }, [currentBank]);

  const averageMiniScore = useMemo(() => {
    const values = miniScores
      .filter((item) => item.score != null)
      .map((item) => Number(item.score));
    if (!values.length) return null;
    return Math.round(
      values.reduce((sum, value) => sum + value, 0) / values.length,
    );
  }, [miniScores]);

  const weakestCategory = useMemo(() => {
    const entries = Object.entries(cumulative.latest).filter(
      ([, value]) => typeof value === 'number',
    ) as Array<[string, number]>;

    if (
      !entries.length ||
      miniScores.filter((item) => item.score != null).length < 5
    ) {
      return null;
    }

    return entries.reduce((lowest, current) =>
      current[1] < lowest[1] ? current : lowest,
    );
  }, [cumulative.latest, miniScores]);

  if (!mounted || !currentBank || !currentMiniAction || !selectedLessonData) {
    return <div className="max-w-7xl" />;
  }

  const completedCount = currentBank.completedMiniMocks;
  const tourSteps = [
    {
      selector: '[data-tour="course-quick-start"]',
      title: 'Quick start',
      body: 'Click this course summary box any time to jump straight into your current lesson and next recommended step.',
    },
    {
      selector: '[data-tour="course-curriculum"]',
      title: 'Course curriculum',
      body: 'This sidebar is your study path. Work through Mini Mocks 1–10, then move into Full Practice and the final registry simulation.',
    },
    {
      selector: '[data-tour="current-step"]',
      title: 'Current step',
      body: 'The highlighted step card is your recommended next action. Click the highlighted card to start immediately.',
    },
    {
      selector: '[data-tour="metrics"]',
      title: 'Key metrics',
      body: 'These are the key metrics to watch here: your Mini Mock average and weakest category.',
    },
  ];

  return (
    <>
      <StartHereTour storageKey="rtt_mastery_course_player" steps={tourSteps} />

      <div className="max-w-7xl space-y-6">
        <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(45,212,191,0.08),rgba(255,255,255,0.02))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] md:p-8">
          <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <div>
              <div className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-200/90">
                Guided Study Plan
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-5xl">
                RTT Mastery Method
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-white/72">
                A structured step-by-step course that walks students through 10
                Mini Mocks, then full-practice review, then the full registry
                simulation.
              </p>

              <div className="mt-8">
                <div className="mb-2 flex items-center justify-between gap-4 text-sm text-white/65">
                  <span>{labelForBank(currentBank.setId)} progress</span>
                  <span>{completedCount} / 10 Mini Mocks completed</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-black/25">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,rgba(45,212,191,0.98),rgba(16,185,129,0.65))]"
                    style={{
                      width: `${progressPercent(completedCount, 10)}%`,
                    }}
                  />
                </div>
              </div>

              <div
                id="mock-challenge"
                className="mt-6 overflow-hidden rounded-[28px] border border-emerald-300/25 bg-[linear-gradient(135deg,rgba(16,185,129,0.22),rgba(5,8,12,0.96)_55%,rgba(0,0,0,0.98))] shadow-[0_20px_80px_rgba(16,185,129,0.18)]"
              >
                <div className="border-b border-white/10 bg-black/20 px-5 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400/20 text-lg">
                        🎯
                      </span>
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-200/85">
                          Limited-Time Challenge
                        </div>
                        <div className="text-lg font-semibold text-white">
                          5 Mock Challenge
                        </div>
                      </div>
                    </div>

                    <div
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        challenge.qualifies
                          ? 'bg-emerald-400/20 text-emerald-200'
                          : 'bg-yellow-400/15 text-yellow-300'
                      }`}
                    >
                      {challenge.qualifies
                        ? 'Reward Unlocked'
                        : 'Limited Time Only'}
                    </div>
                  </div>
                </div>

                <div className="px-5 py-5 md:px-6 md:py-6">
                  <div className="max-w-3xl">
                    <h3 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
                      Complete 5 Mini Mocks + average 90%
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-white/72 md:text-base">
                      Earn{' '}
                      <span className="font-semibold text-yellow-300">
                        10% off Pro
                      </span>{' '}
                      by averaging 90% across your first 5 Mini Mocks.
                    </p>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                        Mocks Completed
                      </div>
                      <div className="mt-1 text-2xl font-semibold text-white">
                        {challenge.completed}{' '}
                        <span className="text-white/35">/ 5</span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                        Average Score
                      </div>
                      <div className="mt-1 text-2xl font-semibold text-white">
                        {challenge.avg}%
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                        Reward
                      </div>
                      <div className="mt-1 text-2xl font-semibold text-yellow-300">
                        10% OFF
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-white/65">Challenge Progress</span>
                      <span className="font-semibold text-white">
                        {challenge.completed < 5
                          ? `${challenge.completed}/5 complete`
                          : `${challenge.avg}% average`}
                      </span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-black/35">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,rgba(250,204,21,0.95),rgba(16,185,129,0.95))] transition-all duration-500"
                        style={{
                          width: `${
                            challenge.completed < 5
                              ? (challenge.completed / 5) * 100
                              : Math.min(100, (challenge.avg / 90) * 100)
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div>
                      {challenge.qualifies ? (
                        <>
                          <div className="text-lg font-semibold text-white">
                            ✅ Reward unlocked — use code{' '}
                            <span className="text-yellow-300">MINI10</span>
                          </div>
                          <div className="text-sm text-white/65">
                            Get 10% off Pro right now before this offer ends.
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-lg font-semibold text-yellow-300">
                            {challenge.completed < 5
                              ? `${5 - challenge.completed} mocks left to unlock 10% off`
                              : `${90 - challenge.avg}% away from unlocking your reward`}
                          </div>
                          <div className="text-sm text-white/65">
                            Stay consistent — you’re closer than you think.
                          </div>
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (challenge.qualifies) {
                          window.location.href = '/app/upgrade';
                          return;
                        }

                        const nextMiniRaw =
                          currentBank?.currentMini &&
                          currentBank.currentMini <= 10
                            ? currentBank.currentMini
                            : 1;

                        const nextMini = !isPro
                          ? Math.min(nextMiniRaw, 5)
                          : nextMiniRaw;

                        setSelectedLesson(`mini-${nextMini}` as LessonKey);

                        requestAnimationFrame(() => {
                          requestAnimationFrame(() => {
                            document
                              .getElementById(`mini-${nextMini}`)
                              ?.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start',
                              });
                          });
                        });
                      }}
                      className="rounded-xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black hover:bg-yellow-300"
                    >
                      {challenge.qualifies
                        ? 'Upgrade Now'
                        : challenge.completed > 0
                          ? 'Continue Challenge'
                          : 'Start Challenge'}
                    </button>
                  </div>
                </div>
              </div>

              {/* <div className="mt-6 rounded-[24px] border border-emerald-400/15 bg-[linear-gradient(180deg,rgba(16,185,129,0.08),rgba(255,255,255,0.02))] p-5 shadow-[0_12px_36px_rgba(0,0,0,0.22)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200/85">
                      5 Mock Challenge (This Week)
                    </div>
                    <div className="mt-2 text-lg font-semibold text-white">
                      Complete 5 Mini Mocks + average 90%
                    </div>
                    <div className="mt-3 space-y-1 text-sm text-white/68">
                      <div>Mocks Completed: {challenge.completed} / 5</div>
                      <div>Average Score: {challenge.avg}%</div>
                      <div>Target: 90%</div>
                    </div>
                  </div>

                  <div
                    className={cx(
                      'shrink-0 rounded-full px-3 py-1 text-xs font-semibold',
                      challenge.qualifies
                        ? 'bg-emerald-400/15 text-emerald-200'
                        : 'bg-yellow-400/10 text-yellow-200',
                    )}
                  >
                    {challenge.qualifies ? 'Reward Unlocked' : 'In Progress'}
                  </div>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/25">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,rgba(45,212,191,0.98),rgba(16,185,129,0.65))]"
                    style={{ width: `${Math.min(100, Math.round((challenge.completed / 5) * 100))}%` }}
                  />
                </div>

                <div className="mt-3 text-sm font-medium">
                  {challenge.qualifies ? (
                    <span className="text-emerald-300">✅ Reward unlocked — use code MINI10 for 10% off Pro</span>
                  ) : challenge.completed < 5 ? (
                    <span className="text-yellow-300">{5 - challenge.completed} mocks left to unlock your reward.</span>
                  ) : (
                    <span className="text-yellow-300">{90 - challenge.avg}% away from the 90% target.</span>
                  )}
                </div>
              </div> */}
            </div>

            <div className="flex flex-col gap-3 xl:items-end">
              <div className="flex w-full max-w-[380px] flex-col gap-3">
                {bankSummaries.map((bank, idx) => {
                  const locked = idx > 0 && !isPro;
                  const bankMeta =
                    idx === 0
                      ? '200 Questions • Starts Free'
                      : '200 Questions • PRO';

                  return (
                    <button
                      key={bank.setId}
                      type="button"
                      onClick={() => {
                        if (locked) {
                          window.location.href = '/app/upgrade';
                          return;
                        }
                        setSelectedBank(bank.setId as BankId);
                      }}
                      className={cx(
                        'flex items-center justify-between rounded-full border px-4 py-3 text-left text-sm transition',
                        selectedBank === bank.setId
                          ? 'border-emerald-400/30 bg-emerald-500/10 text-white'
                          : 'border-white/10 bg-black/15 text-white/60',
                        locked &&
                          'cursor-pointer opacity-90 hover:border-yellow-400/30 hover:bg-yellow-400/5 hover:text-white',
                      )}
                      title={
                        locked
                          ? 'Unlock 200 more ARRT-style questions'
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-2 font-semibold">
                        <span>{labelForBank(bank.setId)}</span>
                        <span className="text-xs text-yellow-400">
                          {tierForBank(bank.setId)}
                        </span>
                      </div>

                      <span className="flex items-center gap-1 text-xs font-semibold text-white/60">
                        <span>200 Questions</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                data-tour="course-quick-start"
                onClick={() => scrollToElementById('current-step-card')}
                className="w-full max-w-[380px] cursor-pointer rounded-3xl border border-emerald-400/20 bg-emerald-500/8 p-5 text-left transition hover:-translate-y-0.5 hover:border-emerald-400/30 hover:bg-emerald-500/10 hover:shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
              >
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-200/75">
                  Start next step
                </div>
                <div className="mt-2 text-lg font-semibold text-white">
                  Mini Mock {currentBank.currentMini} —{' '}
                  {currentMiniAction.title.replace(/^Step \d+ — /, '')}
                </div>
                <div className="mt-3 text-sm text-white/65">
                  Jump to your highlighted next action below.
                </div>
              </button>
            </div>
          </div>
        </section>

        <div className="grid items-start gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside
            data-tour="course-curriculum"
            className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] shadow-[0_24px_80px_rgba(0,0,0,0.25)]"
          >
            <div className="border-b border-white/10 px-5 py-5">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-white/40">
                Course curriculum
              </div>
              <p className="mt-3 text-sm leading-6 text-white/72">
                Follow the curriculum from Mini Mock 1 through the full registry
                simulation.
              </p>
            </div>

            <div className="space-y-6 px-4 py-5">
              <div>
                {/* <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">
                  Phase 1 — Mini Mock Mastery
                </div> */}
                <div className="space-y-2">
                  {Array.from({ length: 10 }, (_, idx) => {
                    const mini = idx + 1;
                    const miniLessonKey = `mini-${mini}` as LessonKey;
                    const status = currentBank.miniStatus[String(mini)];
                    const savedPractice = getSavedPracticeMeta(
                      currentBank.setId,
                      mini,
                    );
                    const savedFlash = getSavedFlashcardsMeta(
                      currentBank.setId,
                      mini,
                    );
                    const savedExam = getSavedMiniMockSessionMeta(
                      currentBank.setId,
                      mini,
                    );
                    const savedStep = readMasteryMiniStep(
                      currentBank.setId,
                      mini,
                    );
                    const hasStarted =
                      Boolean(status?.attempts) ||
                      !!savedPractice ||
                      !!savedFlash ||
                      !!savedExam ||
                      savedStep === 'practice' ||
                      savedStep === 'flashcards' ||
                      savedStep === 'exam';

                    const resumeStep =
                      savedExam || savedStep === 'exam'
                        ? 'exam'
                        : savedFlash || savedStep === 'flashcards'
                          ? 'flashcards'
                          : 'practice';

                    return (
                      <div key={mini} id={`mini-${mini}`}>
                        {' '}
                        <div className="block w-full text-left">
                          <SidebarMiniMock
                            mini={mini}
                            bank={currentBank}
                            isActive={selectedLesson === miniLessonKey}
                            isCurrent={mini === currentBank.currentMini}
                            isPro={isPro}
                            summary={summary}
                            attempts={attempts}
                            onSelect={() => {
                              if (mini > 5 && !isPro) {
                                window.location.href = '/app/upgrade';
                                return;
                              }
                              setSelectedLesson(miniLessonKey);
                              setPendingScrollTarget(null);
                            }}
                            onStart={() => {
                              if (mini > 5 && !isPro) {
                                window.location.href = '/app/upgrade';
                                return;
                              }
                              setSelectedLesson(miniLessonKey);
                              requestAnimationFrame(() => {
                                requestAnimationFrame(() => {
                                  scrollToMiniStep(mini, 'practice');
                                });
                              });
                            }}
                            onResume={() => {
                              if (mini > 5 && !isPro) {
                                window.location.href = '/app/upgrade';
                                return;
                              }
                              const targetStep = hasStarted
                                ? resumeStep
                                : 'practice';
                              setSelectedLesson(miniLessonKey);
                              requestAnimationFrame(() => {
                                requestAnimationFrame(() => {
                                  scrollToMiniStep(mini, targetStep);
                                });
                              });
                            }}
                            onRestart={() => handleRestartMini(mini)}
                          />
                        </div>
                        {mini === 5 && !isPro && (
                          <div className="mt-2 flex items-center justify-between rounded-lg border border-yellow-400/20 bg-yellow-400/5 px-3 py-2 text-xs">
                            <div className="text-white/70">
                              🔒 Continue your progress — unlock all Mini Mocks
                              and QBanks
                            </div>

                            <button
                              onClick={() => {
                                window.location.href = '/app/upgrade';
                              }}
                              className="ml-3 rounded-md bg-yellow-400 px-3 py-1 text-[11px] font-semibold text-black hover:bg-yellow-300"
                            >
                              Upgrade
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <SidebarFullQbank
                    bank={currentBank}
                    isActive={selectedLesson === 'full-qbank'}
                    isPro={isPro} // ✅ THIS MUST EXIST
                    onSelect={() => {
                      setSelectedLesson('full-qbank');
                    }}
                    onStart={() => {
                      setSelectedLesson('full-qbank');
                      requestAnimationFrame(() => {
                        scrollToElementById('full-step-practice');
                      });
                    }}
                    onResume={() => {
                      setSelectedLesson('full-qbank');
                      requestAnimationFrame(() => {
                        scrollToElementById('full-step-practice');
                      });
                    }}
                    onRestart={() => {
                      handleRestartFull();
                    }}
                  />
                </div>
              </div>
            </div>
          </aside>

          <section className="space-y-6">
            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
              <div className="border-b border-white/10 px-6 py-6 md:px-8">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
                  {selectedLessonData.subtitle}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-semibold tracking-tight text-white">
                    {selectedLessonData.title}
                  </h2>
                  {'lessonNumber' in selectedLessonData &&
                  selectedLessonData.lessonNumber ? (
                    <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold text-white/65">
                      Lesson {selectedLessonData.lessonNumber} of 10
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-white/68 md:text-base">
                  {selectedLessonData.description}
                </p>
              </div>

              <div className="space-y-6 px-6 py-6 md:px-8 md:py-8">
                <div className="grid gap-4 lg:grid-cols-3">
                  {selectedLessonData.steps.map((step, idx) => {
                    const isMiniLesson = selectedLesson.startsWith('mini-');
                    const isFullLesson = selectedLesson === 'full-qbank';

                    const activeStepKey =
                      'activeStep' in selectedLessonData
                        ? selectedLessonData.activeStep
                        : null;

                    const isHighlighted = activeStepKey === step.key;

                    const isClickable =
                      !isMiniLesson ||
                      isHighlighted ||
                      (isMiniLesson &&
                        step.key === 'exam' &&
                        activeStepKey !== 'exam');

                    const miniStateForCard =
                      isMiniLesson && currentBank && selectedMini
                        ? getMiniState(currentBank, attempts, selectedMini)
                        : null;

                    const fullStateForCard =
                      isFullLesson && currentBank
                        ? {
                            full: readFullQbankMastery(currentBank.setId),
                            savedStep: readFullQbankStep(currentBank.setId),
                          }
                        : null;

                    const fullPracticeMeta =
                      isFullLesson && currentBank
                        ? getSavedFullPracticeMeta(currentBank.setId)
                        : null;

                    const fullFlashMeta =
                      isFullLesson && currentBank
                        ? readFlashSession(
                            `${currentBank.setId}__missed__all__full`,
                          )
                        : null;

                    const isFullExamFlow =
                      fullStateForCard?.savedStep === 'exam';

                    const isFullPracticeSkipped =
                      isFullExamFlow &&
                      !fullStateForCard?.full.practice.completed &&
                      !getSavedFullPracticeMeta(currentBank.setId);

                    const isFullFlashcardsSkipped =
                      isFullExamFlow &&
                      !fullStateForCard?.full.flashcards.completed &&
                      !readFlashSession(
                        `${currentBank.setId}__missed__all__full`,
                      );

                    const isSkippedFlow =
                      miniStateForCard?.practiceSkipped === true;

                    const isExamFlow = miniStateForCard?.activeStep === 'exam';

                    const isPracticeClosedAfterExam =
                      isExamFlow &&
                      step.key === 'practice' &&
                      !miniStateForCard?.practiceSkipped &&
                      !!miniStateForCard?.practiceMeta;

                    const isFlashcardsSkippedAfterExam =
                      isExamFlow &&
                      step.key === 'flashcards' &&
                      miniStateForCard?.flashcardsSkipped === true;

                    const isFullPracticeClosedAfterExam =
                      isFullLesson &&
                      isFullExamFlow &&
                      step.key === 'practice' &&
                      !isFullPracticeSkipped &&
                      !!fullPracticeMeta;

                    const isFullFlashcardsSkippedAfterExam =
                      isFullLesson &&
                      step.key === 'flashcards' &&
                      isFullFlashcardsSkipped;

                    const stepState:
                      | 'active'
                      | 'completed'
                      | 'skipped'
                      | 'locked' = (() => {
                      if (!activeStepKey) {
                        if (isFullLesson && step.key === 'practice')
                          return 'active';
                        return 'locked';
                      }

                      if (step.key === activeStepKey) return 'active';

                      if (isFullLesson) {
                        if (step.key === 'practice') {
                          if (fullStateForCard?.full.practice.completed)
                            return 'completed';
                          if (isFullPracticeSkipped) return 'skipped';
                          if (isFullPracticeClosedAfterExam) return 'locked';
                          if (fullStateForCard?.savedStep === 'exam')
                            return 'locked';
                          if (fullPracticeMeta) return 'active';
                          if (fullStateForCard?.savedStep === 'practice')
                            return 'active';
                          return 'locked';
                        }

                        if (step.key === 'flashcards') {
                          if (fullStateForCard?.full.flashcards.completed)
                            return 'completed';
                          if (isFullFlashcardsSkipped) return 'skipped';
                          if (fullFlashMeta) return 'active';
                          if (fullStateForCard?.savedStep === 'flashcards')
                            return 'active';
                          if (
                            !fullStateForCard?.full.practice.completed &&
                            !isFullPracticeSkipped
                          ) {
                            return 'locked';
                          }
                          return 'locked';
                        }

                        if (step.key === 'exam') {
                          if (fullStateForCard?.full.exam.completed)
                            return 'completed';
                          if (fullStateForCard?.savedStep === 'exam')
                            return 'active';
                          return 'locked';
                        }
                      }

                      if (isMiniLesson) {
                        if (step.key === 'practice') {
                          if (miniStateForCard?.practiceComplete)
                            return 'completed';
                          if (miniStateForCard?.practiceSkipped)
                            return 'skipped';
                        }

                        if (step.key === 'flashcards') {
                          if (miniStateForCard?.flashcardsComplete)
                            return 'completed';
                          if (miniStateForCard?.flashcardsSkipped)
                            return 'skipped';
                        }

                        return 'locked';
                      }

                      if (isFullLesson) {
                        if (
                          step.key === 'practice' &&
                          fullStateForCard?.full.practice.completed
                        ) {
                          return 'completed';
                        }

                        if (
                          step.key === 'flashcards' &&
                          fullStateForCard?.full.flashcards.completed
                        ) {
                          return 'completed';
                        }

                        return 'locked';
                      }

                      return 'locked';
                    })();

                    const lockedReason = isPracticeClosedAfterExam
                      ? 'Practice Test is closed after moving to the Mini Mock Exam. Restart this Mini Mock to return to Step 1.'
                      : isFlashcardsSkippedAfterExam
                        ? 'Flashcards were skipped. Restart this Mini Mock to unlock the full study flow again.'
                        : isFullPracticeClosedAfterExam
                          ? 'Practice Test is closed after moving to the Full Mock Exam. Restart Full QBank to return to Step 1.'
                          : isFullFlashcardsSkippedAfterExam
                            ? 'Flashcards were skipped. Restart Full QBank to unlock them.'
                            : isFullPracticeSkipped && step.key === 'practice'
                              ? 'Practice Test was skipped. Restart Full QBank to begin again.'
                              : isFullFlashcardsSkipped &&
                                  step.key === 'flashcards'
                                ? 'Flashcards were skipped. Restart Full QBank to unlock them.'
                                : isSkippedFlow
                                  ? step.key === 'practice'
                                    ? 'Practice Test is locked after skipping. Restart this Mini Mock to begin again.'
                                    : step.key === 'flashcards'
                                      ? 'Flashcards are locked after skipping. Restart this Mini Mock to unlock them.'
                                      : null
                                  : step.key === 'practice' &&
                                      stepState === 'completed'
                                    ? 'Completed. Restart Mini Mock to retake.'
                                    : step.key === 'flashcards'
                                      ? 'Complete the Practice Test first.'
                                      : step.key === 'exam'
                                        ? 'Complete Practice Test and Flashcards first.'
                                        : null;

                    const shouldUseSkipExamModal =
                      step.key === 'exam' &&
                      stepState !== 'active' &&
                      (isMiniLesson || isFullLesson);

                    const canOpenStep = isFullLesson
                      ? stepState === 'active' ||
                        stepState === 'completed' ||
                        shouldUseSkipExamModal
                      : stepState === 'active' ||
                        step.key === 'exam' ||
                        (!isSkippedFlow && stepState === 'completed');

                    const className = cx(
                      'group relative rounded-3xl border p-5 transition focus:outline-none',
                      canOpenStep
                        ? 'cursor-pointer hover:border-white/20 hover:bg-white/[0.04]'
                        : stepState === 'completed'
                          ? 'opacity-75 cursor-default'
                          : stepState === 'skipped'
                            ? 'opacity-80 cursor-pointer'
                            : 'opacity-55 cursor-not-allowed saturate-75',
                      isHighlighted
                        ? 'border-emerald-400/35 bg-emerald-500/10 shadow-[0_0_0_1px_rgba(45,212,191,0.16),0_0_24px_rgba(16,185,129,0.12)]'
                        : stepState === 'skipped'
                          ? 'border-yellow-400/20 bg-yellow-400/5'
                          : stepState === 'locked'
                            ? 'border-white/8 bg-black/30'
                            : 'border-white/10 bg-black/20',
                    );

                    const displayTitle =
                      step.key === 'practice'
                        ? 'Practice Test'
                        : step.key === 'flashcards'
                          ? 'Missed Flashcards'
                          : isFullLesson
                            ? 'Full Mock Exam'
                            : 'Mini Mock Exam';

                    const displayKicker = `Step ${idx + 1}`;

                    const content = (
                      <>
                        <div className="flex h-full min-h-[220px] flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/35">
                                {displayKicker}
                              </div>
                            </div>

                            <div>
                              {stepState === 'active' ? (
                                <div className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200">
                                  {step.badge === 'Complete'
                                    ? 'Restart'
                                    : 'Ready'}
                                </div>
                              ) : stepState === 'completed' ? (
                                <div className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200">
                                  Completed
                                </div>
                              ) : stepState === 'skipped' ? (
                                <div className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-yellow-200/90">
                                  Skipped
                                </div>
                              ) : stepState === 'locked' ? (
                                <div className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-yellow-200/90">
                                  Locked
                                </div>
                              ) : null}
                            </div>
                          </div>

                          <div className="mt-5 text-2xl font-semibold leading-tight text-white">
                            {displayTitle}
                          </div>

                          <div className="mt-3 text-sm leading-6 text-white/62">
                            {step.body}
                          </div>

                          <div className="mt-4 text-xs font-medium">
                            {stepState === 'active' ? (
                              <div className="text-emerald-200/90">
                                {step.badge === 'Complete'
                                  ? 'Restart this step if you want to do it again.'
                                  : step.key === 'exam'
                                    ? isFullLesson
                                      ? 'Ready to take Full Mock Exam.'
                                      : 'Ready to take Mini Mock Exam.'
                                    : step.key === 'flashcards'
                                      ? 'Continue with Missed Flashcards.'
                                      : 'Start with the Practice Test.'}
                              </div>
                            ) : stepState === 'completed' ? (
                              <div className="text-yellow-300/78">
                                {step.key === 'practice'
                                  ? isFullLesson
                                    ? 'Completed. Restart Full QBank to retake.'
                                    : 'Completed. Restart Mini Mock to retake.'
                                  : step.key === 'flashcards'
                                    ? isFullLesson
                                      ? 'Completed. Restart Full QBank to review again.'
                                      : 'Completed. Restart Mini Mock to review again.'
                                    : 'Complete Practice Test and Flashcards first.'}
                              </div>
                            ) : (
                              <div className="text-yellow-300/78">
                                {isPracticeClosedAfterExam
                                  ? 'Practice Test is closed after moving to the Mini Mock Exam. Restart this Mini Mock to return to Step 1.'
                                  : isFlashcardsSkippedAfterExam
                                    ? 'Flashcards were skipped. Restart this Mini Mock to unlock the full study flow again.'
                                    : isSkippedFlow && step.key === 'practice'
                                      ? 'Practice Test is locked after skipping. Restart this Mini Mock to begin again.'
                                      : isSkippedFlow &&
                                          step.key === 'flashcards'
                                        ? 'Flashcards are locked after skipping. Restart this Mini Mock to unlock them.'
                                        : step.key === 'flashcards'
                                          ? 'Flashcards are made from the questions you get wrong in the Practice Test. Complete the Practice Test first to generate your flashcards.'
                                          : step.key === 'exam'
                                            ? 'Complete Practice Test and Flashcards first.'
                                            : 'Locked until this step becomes active.'}
                              </div>
                            )}
                          </div>

                          <div className="mt-auto pt-6">
                            <div
                              className={cx(
                                'inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold',
                                step.badge === 'Complete'
                                  ? 'border-emerald-300/30 bg-emerald-400/10 text-emerald-200'
                                  : isHighlighted
                                    ? 'border-emerald-300/30 bg-emerald-400/10 text-emerald-200'
                                    : 'border-white/10 bg-white/5 text-white/70',
                              )}
                            >
                              {step.badge}
                            </div>
                          </div>
                        </div>
                      </>
                    );

                    const stepCardId =
                      selectedLesson.startsWith('mini-') && selectedMini
                        ? stepSectionId(selectedMini, step.key)
                        : selectedLesson === 'full-qbank'
                          ? `full-step-${step.key}`
                          : undefined;

                    if (!canOpenStep) {
                      return (
                        <button
                          key={step.title}
                          type="button"
                          id={isHighlighted ? 'current-step-card' : undefined}
                          data-step-id={stepCardId}
                          className={`${className} text-left`}
                          onClick={() => {
                            if (lockedReason) {
                              setLockedStepMessage(lockedReason);
                            }
                          }}
                        >
                          {content}

                          {lockedReason ? (
                            <div className="pointer-events-none absolute inset-0 hidden items-center justify-center rounded-3xl bg-black/72 px-5 text-center md:flex md:opacity-0 md:transition md:duration-200 group-hover:md:opacity-100">
                              <div className="max-w-[220px] text-xs font-semibold leading-5 text-yellow-200">
                                {lockedReason}
                              </div>
                            </div>
                          ) : null}
                        </button>
                      );
                    }

                    if (shouldUseSkipExamModal) {
                      return (
                        <div
                          key={step.title}
                          role="button"
                          tabIndex={0}
                          id={isHighlighted ? 'current-step-card' : undefined}
                          data-step-id={stepCardId}
                          className={className}
                          onClick={() => openSkipExamModal(step.href)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              openSkipExamModal(step.href);
                            }
                          }}
                        >
                          {content}
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={step.title}
                        id={isHighlighted ? 'current-step-card' : undefined}
                        data-step-id={stepCardId}
                        href={step.href}
                        data-tour={isHighlighted ? 'current-step' : undefined}
                        data-current-step-card={
                          isHighlighted ? 'true' : undefined
                        }
                        className={className}
                      >
                        {content}
                      </Link>
                    );
                  })}
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-white">
                        Mini Mock progress
                      </div>
                      <div className="mt-1 text-sm text-white/65">
                        Each Mini Mock shows a dash until its Mini Mock Exam is
                        completed. Once finished, the official score appears
                        here.
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-white/70">
                      {completedCount} / 10 completed
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-5 gap-3 sm:grid-cols-10">
                    {miniScores.map((item) => (
                      <button
                        key={item.mini}
                        type="button"
                        onClick={() => setSelectedLesson(`mini-${item.mini}`)}
                        className={cx(
                          'flex min-h-[96px] flex-col items-center justify-center rounded-2xl border p-3 text-center transition',
                          item.score != null
                            ? item.score >= 90
                              ? 'border-yellow-400/40 bg-yellow-400/10 text-white'
                              : 'border-emerald-400/25 bg-emerald-500/10 text-white'
                            : 'border-white/10 bg-white/[0.03] text-white/70 hover:border-white/20 hover:bg-white/[0.05]',
                        )}
                      >
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] leading-none text-white/45">
                          {item.score != null ? 'Score' : 'Pending'}
                        </div>
                        <div className="mt-3 flex items-center justify-center text-base font-semibold leading-none">
                          {item.score != null ? `${item.score}%` : '—'}
                        </div>
                        <div className="mt-3 text-[11px] leading-none text-white/55">
                          Mini {item.mini}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div data-tour="metrics" className="grid gap-4 xl:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
                    <div className="text-sm font-semibold text-white">
                      Average Mini Mock Score
                    </div>
                    <div className="mt-3 text-2xl font-semibold text-white">
                      {averageMiniScore != null
                        ? `${averageMiniScore}%`
                        : 'Not enough data yet'}
                    </div>
                    <div className="mt-2 text-sm leading-6 text-white/65">
                      {averageMiniScore != null
                        ? `Based on ${miniScores.filter((item) => item.score != null).length} Mini Mock Exam score${miniScores.filter((item) => item.score != null).length === 1 ? '' : 's'}.`
                        : 'Take a Mini Mock Exam to calculate average.'}
                    </div>
                  </div>

                  {/* <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
                    <div className="text-sm font-semibold text-white">
                      Weakest Category
                    </div>
                    <div className="mt-3 text-2xl font-semibold text-white">
                      {weakestCategory
                        ? weakestCategory[0]
                        : 'Not enough data yet'}
                    </div>
                    <div className="mt-2 text-sm leading-6 text-white/65">
                      {weakestCategory
                        ? `Current Avg: ${weakestCategory[1]}%`
                        : 'Take at least 5 Mini Mocks to calculate weakest category.'}
                    </div>
                    <div className="mt-2 text-sm text-white/55">
                      Current Avg:{' '}
                      {weakestCategory ? `${weakestCategory[1]}%` : '—'}
                      <br />
                      Goal: 90%+
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {lockedStepMessage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 md:hidden">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-900 p-6">
            <h2 className="text-lg font-semibold text-white">Step Locked</h2>

            <p className="mt-3 text-sm leading-6 text-white/70">
              {lockedStepMessage}
            </p>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setLockedStepMessage(null)}
                className="rounded-lg bg-yellow-400 px-4 py-2 font-semibold text-black"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showSkipExamModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b0b0c] p-6 shadow-2xl">
            <div className="text-lg font-semibold text-white">
              {selectedLesson === 'full-qbank'
                ? 'Skip Ahead to Full Mock Exam?'
                : 'Skip Ahead to Mini Mock Exam?'}{' '}
            </div>

            <p className="mt-3 text-sm leading-6 text-white/70">
              {selectedLesson === 'full-qbank'
                ? 'You can skip ahead to the Full Mock Exam, but without completing the Practice Test and Flashcards first, your score may be lower since your weak areas won’t be reviewed.'
                : 'You can skip ahead to the Mini Mock Exam, but without completing the Practice Test and Flashcards first, your score may be lower since your weak areas won’t be reviewed.'}
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeSkipExamModal}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/75 transition hover:bg-white/10"
              >
                Go Back
              </button>

              <button
                type="button"
                onClick={confirmSkipExam}
                className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-300"
              >
                {selectedLesson === 'full-qbank'
                  ? 'Continue to Full Mock Exam'
                  : 'Continue to Mini Mock Exam'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
