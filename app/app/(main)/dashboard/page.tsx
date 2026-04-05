'use client';

import {
  readFlashSession,
  readMasteryMiniStep,
} from '@/lib/progressStore';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import StartHereTour from '@/app/app/_components/StartHereTour';
import { usePro } from '@/app/app/_lib/usePro';
import {
  getBankMasterySummary,
  resetMiniMock,
  getCategoryCumulative,
  getMasterySummary,
  readAttempts,
} from '@/lib/progressStore';

const BANKS = ['qbank1', 'qbank2', 'qbank3'] as const;

type BankId = (typeof BANKS)[number];
type LessonKey =
  | `mini-${number}`
  | 'full-practice'
  | 'full-flashcards'
  | 'full-mock';

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
  return setId.toUpperCase().replace('QBANK', 'Practice Bank ');
}

function scrollToElementById(id: string) {
  const node =
    typeof document !== 'undefined' ? document.getElementById(id) : null;
  if (!node) return;
  node.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

  try {
    const storageSources = [window.localStorage, window.sessionStorage];
    const prefixes = [
      `rtt_practice_session_mastery__${setId}__all__all__${mini}`,
      `rtt_practice_session_${setId}__all__all__${mini}`,
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
          answeredCount: Number(parsed?.answeredCount || 0),
          total: Number(
            parsed?.totalCount ||
              parsed?.answeredCount + (parsed?.queueIds?.length || 0) ||
              parsed?.queueIds?.length ||
              0,
          ),
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
        reviewed: masteredCount + Math.min(Number(exact?.cursor || 0), deckCount),
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

  if (status?.attempts) return 'exam' as const;
  if (savedExam && savedExam.answeredCount > 0) return 'exam' as const;
  if (savedStep === 'exam') return 'exam' as const;
  if (savedFlash || savedStep === 'flashcards') return 'flashcards' as const;
  if (
    savedPractice ||
    hasPracticeAttemptForMini(attempts, bank, bank.currentMini)
  ) {
    return 'practice' as const;
  }
  return 'practice' as const;
}

function lessonForCurrentProgress(
  summary: Summary,
  bank: BankSummary,
): LessonKey {
  if (bank.bankMastered) {
    if (summary.flashRemaining > 0) return 'full-flashcards';
    const attempts = readAttempts();
    const hasFull = attempts.some(
      (item) =>
        item.type === 'full' &&
        item.bankId === Number(bank.setId.replace('qbank', '')),
    );
    return hasFull ? 'full-mock' : 'full-practice';
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
      body: 'Take the baseline attempt for this Mini Mock before reviewing anything.',
      href: `/app/practice/${bank.setId}?mode=all&cat=all&flow=mastery&mini=${mini}`,
      badge: 'Start here',
    },
    {
      key: 'flashcards',
      title: 'Step 2 — Missed Flashcards',
      body: 'Review only the concepts you missed so your study time stays focused.',
      href: `/app/flashcards?set=${bank.setId}&mode=missed&cat=all&flow=mastery&mini=${mini}`,
      badge: 'Review',
    },
    {
      key: 'exam',
      title: 'Step 3 — Mini Mock Exam',
      body: 'Retake the Mini Mock after review. This score becomes your official Mini Mock score.',
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
  currentMiniStep,
  isPro,
}: {
  mini: number;
  bank: BankSummary;
  isActive: boolean;
  isCurrent: boolean;
  currentMiniStep: 'practice' | 'flashcards' | 'exam';
  isPro: boolean;
}) {
  const isLocked = mini > 5 && !isPro;
  const status = bank.miniStatus[String(mini)];
  const completed = Boolean(status?.attempts);
  const practiceMeta = getSavedPracticeMeta(bank.setId, mini);
  const flashMeta = getSavedFlashcardsMeta(bank.setId, mini);
  const examMeta = getSavedMiniMockSessionMeta(bank.setId, mini);

  const practiceComplete =
    completed ||
    !!practiceMeta ||
    !!flashMeta ||
    !!examMeta ||
    (isCurrent &&
      (currentMiniStep === 'flashcards' || currentMiniStep === 'exam'));

  const flashcardsComplete =
    completed ||
    !!flashMeta ||
    !!examMeta ||
    (isCurrent &&
      (currentMiniStep === 'flashcards' || currentMiniStep === 'exam'));

  const practiceAnswered = Number(practiceMeta?.answeredCount || 0);
  const practiceTotal = Number(practiceMeta?.total || 0);
  const practicePct =
    practiceMeta && practiceTotal > 0
      ? Math.max(0, Math.min(100, Math.round((practiceAnswered / practiceTotal) * 100)))
      : practiceComplete
        ? 100
        : 0;

  const flashRemaining = Number(flashMeta?.remaining || 0);
  const flashTotal = Number(flashMeta?.total || 0);
  const flashDone = flashMeta ? Math.max(0, flashTotal - flashRemaining) : flashcardsComplete ? 1 : 0;
  const flashPct =
    flashMeta && flashTotal > 0
      ? Math.max(0, Math.min(100, Math.round((flashDone / flashTotal) * 100)))
      : flashcardsComplete
        ? 100
        : 0;

  const examAnswered = completed
    ? Number(examMeta?.total || 20)
    : Number(examMeta?.answeredCount || 0);

  const examTotal = Number(examMeta?.total || (completed ? 20 : 0));

  const examPct =
    completed
      ? 100
      : examMeta && examTotal > 0
        ? Math.max(0, Math.min(100, Math.round((examAnswered / examTotal) * 100)))
        : 0;
    const hasResume = !!practiceMeta || !!flashMeta || !!examMeta;
    const canRestartMini =
      completed ||
      practiceComplete ||
      flashcardsComplete ||
      !!practiceMeta ||
      !!flashMeta ||
      !!examMeta;


    const totalStagePct = completed
      ? 100
      : Math.round(
          Math.min(
            99,
            practicePct * 0.34 +
              flashPct * 0.33 +
              examPct * 0.33,
          ),
        );
  return (
    <div
      className={cx(
        'rounded-2xl border transition',
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
  {canRestartMini ? (
    <span
      onClick={(e) => {
        e.stopPropagation();
        if (!confirm('Restart this Mini Mock? This will clear all progress for it.')) return;
        localStorage.removeItem(`rtt_mock_results_${bank.setId}_mini_${mini}`);
window.dispatchEvent(new Event('rtt-progress-updated'));
      }}
      className="shrink-0 cursor-pointer rounded-md bg-red-500/20 px-2 py-1 text-[10px] font-semibold text-red-300 hover:bg-red-500/30"
    >
      Restart
    </span>
  ) : null}
</div>
              <div className="flex items-center gap-2">
                {hasResume && !completed ? (
                  <span className="rounded-full border border-emerald-300/25 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                    Resume
                  </span>
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

            {!isActive ? (
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
  <span className="font-semibold text-emerald-300">Complete</span>
) : examMeta ? (
  <span>Exam: {examAnswered} / {examTotal}</span>
) : status?.attempts ? (
  <span>Score: {status.lastScore}%</span>
) : null}
              </div>
            ) : null}

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
                    {flashMeta ? (
                      <span className="font-semibold text-yellow-300">
                        {flashDone} / {flashTotal}
                      </span>
                    ) : flashcardsComplete ? (
                      <span className="font-semibold text-emerald-300">
                        Complete
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
                  {/* <div className="mb-1 flex items-center justify-between gap-2">
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
                  </div> */}
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span>Mini Mock Exam</span>
{completed ? (
  <div className="flex items-center gap-2">
    <span className="font-semibold text-emerald-300">
      Complete • {status?.lastScore ?? 0}%
    </span>
  </div>
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
                    {/* <div
                      className="h-full rounded-full bg-white/70"
                      style={{ width: `${examPct}%` }}
                    /> */}
                    <div
                      className="h-full rounded-full bg-white/70"
                      style={{
                        width: `${
                          completed
                            ? 100
                            : examMeta && examTotal > 0
                              ? Math.max(
                                  0,
                                  Math.min(
                                    100,
                                    Math.round(
                                      (examAnswered / examTotal) * 100,
                                    ),
                                  ),
                                )
                              : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : null}
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

  useEffect(() => {
    if (!currentBank) return;
    const nextLesson = lessonForCurrentProgress(summary, currentBank);
    const lockedFullPhase =
      !isPro &&
      (nextLesson === 'full-practice' ||
        nextLesson === 'full-flashcards' ||
        nextLesson === 'full-mock');

    setSelectedLesson(
      lockedFullPhase ? `mini-${currentBank.currentMini}` : nextLesson,
    );
  }, [currentBank, summary, isPro]);

  const currentMiniStep = currentBank
    ? getCurrentMiniStep(summary, currentBank, attempts)
    : 'practice';

  const selectedMini = selectedLesson.startsWith('mini-')
    ? Number(selectedLesson.replace('mini-', ''))
    : null;

  const currentMiniAction = useMemo(() => {
    if (!currentBank) return null;
    const mini = currentBank.currentMini;
    return (
      buildMiniStepConfigs(currentBank, mini).find(
        (step) => step.key === currentMiniStep,
      ) ?? null
    );
  }, [currentBank, currentMiniStep]);

  const selectedLessonData = useMemo(() => {
    if (!currentBank) return null;

    if (selectedLesson === 'full-practice') {
      return {
        title: 'Full Practice Test',
        subtitle: 'Phase 2 — Full Practice',
        description:
          'After finishing all 10 Mini Mocks, take the full practice test to identify final weak points across the entire bank.',
        steps: [
          {
            key: 'practice' as const,
            title: 'Full Practice Test',
            body: 'Take the long-form baseline practice test across the full practice bank.',
            href: `/app/practice/${currentBank.setId}?mode=all&cat=all`,
            badge: 'Current lesson',
          },
        ],
        ctaLabel: 'Start Full Practice Test',
        ctaHref: `/app/practice/${currentBank.setId}?mode=all&cat=all`,
        ctaBody: 'Begin the full-practice review phase for this Practice Bank.',
      };
    }

    if (selectedLesson === 'full-flashcards') {
      return {
        title: 'Full-Test Flashcards',
        subtitle: 'Phase 2 — Full Practice',
        description:
          'Review the concepts you missed on the full practice test before moving into the registry simulation.',
        steps: [
          {
            key: 'flashcards' as const,
            title: 'Review Full-Test Flashcards',
            body: 'Clear the remaining missed concepts from the full-practice phase.',
            href: `/app/flashcards?set=${currentBank.setId}&mode=missed&cat=all`,
            badge: `${summary.flashRemaining} remaining`,
          },
        ],
        ctaLabel: 'Review Full-Test Flashcards',
        ctaHref: `/app/flashcards?set=${currentBank.setId}&mode=missed&cat=all`,
        ctaBody:
          'Finish this review deck before starting the full registry simulation.',
      };
    }

    if (selectedLesson === 'full-mock') {
      return {
        title: 'Full Mock Exam',
        subtitle: 'Phase 3 — Registry Simulation',
        description:
          'Simulate the full registry after completing your Mini Mock curriculum and full-practice review cycle.',
        steps: [
          {
            key: 'exam' as const,
            title: 'Start Full Mock Exam',
            body: 'Use this as your final checkpoint before test day.',
            href: `/app/mock-exam?qbank=${currentBank.setId}&scope=full`,
            badge: 'Final simulation',
          },
        ],
        ctaLabel: 'Start Full Mock Exam',
        ctaHref: `/app/mock-exam?qbank=${currentBank.setId}&scope=full`,
        ctaBody: 'Complete the full registry simulation when you are ready.',
      };
    }

    const mini = selectedMini ?? currentBank.currentMini;
    const stepConfigs = buildMiniStepConfigs(currentBank, mini);
    const status = currentBank.miniStatus[String(mini)];

    const savedPractice = getSavedPracticeMeta(currentBank.setId, mini);
    const savedFlash = getSavedFlashcardsMeta(currentBank.setId, mini);
    const savedExam = getSavedMiniMockSessionMeta(currentBank.setId, mini);

    const savedStep = readMasteryMiniStep(currentBank.setId, mini);

    const activeStep =
      mini === currentBank.currentMini
        ? savedExam || savedStep === 'exam'
          ? 'exam'
          : savedFlash || savedStep === 'flashcards'
            ? 'flashcards'
            : currentMiniStep === 'exam'
              ? 'exam'
              : currentMiniStep === 'flashcards'
                ? 'flashcards'
                : savedPractice
                  ? 'practice'
                  : 'practice'
        : status?.attempts || savedExam || savedStep === 'exam'
          ? 'exam'
          : savedFlash || savedStep === 'flashcards'
            ? 'flashcards'
            : savedPractice
              ? 'practice'
              : 'practice';
    const activeConfig =
      stepConfigs.find((step) => step.key === activeStep) ?? stepConfigs[0];

    const stepsWithStatus = stepConfigs.map((step) => {
      const completed =
        step.key === 'practice'
          ? activeStep === 'flashcards' || activeStep === 'exam'
          : step.key === 'flashcards'
            ? activeStep === 'exam'
            : Boolean(status?.attempts);

      const badge = completed
        ? 'Complete'
        : step.key === activeStep
          ? step.key === 'exam'
            ? (savedExam ? `Continue Mini Mock ${mini}` : 'Official score')
            : step.key === 'flashcards'
              ? (savedFlash ? `Continue Flashcards ${mini}` : 'Review')
              : (savedPractice
                  ? `Continue Practice Test ${mini}`
                  : 'Click card to start')
          : step.badge;

      return { ...step, completed, badge };
    });

    return {
      title: `Mini Mock ${mini}`,
      subtitle: 'Phase 1 — Mini Mock Mastery',
      description:
        'Complete this Mini Mock in the recommended RTT order: Practice Test, Missed Flashcards, then Mini Mock Exam.',
      steps: stepsWithStatus,
      activeStep,
      ctaLabel: activeConfig.title.replace(/^Step \d+ — /, ''),
      ctaHref: activeConfig.href,
      ctaBody:
        activeStep === 'practice'
          ? 'Begin the baseline attempt for this Mini Mock.'
          : activeStep === 'flashcards'
            ? 'Review the missed concepts from this Mini Mock before retesting.'
            : 'Retake the Mini Mock and lock in your official score for this lesson.',
      lessonNumber: mini,
    };
  }, [
    currentBank,
    currentMiniStep,
    selectedLesson,
    selectedMini,
    summary.flashRemaining,
  ]);

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

  if (!mounted || !currentBank || !selectedLessonData || !currentMiniAction) {
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
            </div>

            <div className="flex flex-col gap-3 xl:items-end">
              <div className="flex w-full max-w-[380px] flex-col gap-3">
                {bankSummaries.map((bank, idx) => {
                  const locked = idx > 0 && !isPro;
                  return (
                    <button
                      key={bank.setId}
                      type="button"
                      onClick={() => {
                        if (locked) return;
                        setSelectedBank(bank.setId as BankId);
                      }}
                      className={cx(
                        'flex items-center justify-between rounded-full border px-4 py-3 text-left text-sm transition',
                        selectedBank === bank.setId
                          ? 'border-emerald-400/30 bg-emerald-500/10 text-white'
                          : 'border-white/10 bg-black/15 text-white/60',
                        locked && 'opacity-80',
                      )}
                    >
                      <span className="font-semibold">
                        {labelForBank(bank.setId)}
                      </span>
                      <span className="flex items-center gap-2 text-xs font-semibold text-white/60">
                        {bank.completedMiniMocks}/10
                        {locked ? (
                          <span className="text-yellow-400">PRO</span>
                        ) : null}
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

        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
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

            <div className="max-h-[820px] space-y-6 overflow-y-auto px-4 py-5">
              <div>
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">
                  Phase 1 — Mini Mock Mastery
                </div>
                <div className="space-y-2">
                  {Array.from({ length: 10 }, (_, idx) => {
                    const mini = idx + 1;
                    return (
                      <button
                        key={mini}
                        type="button"
                        onClick={() => {
                          if (mini > 5 && !isPro) {
                            window.location.href = '/app/upgrade';
                            return;
                          }
                          setSelectedLesson(`mini-${mini}`);
                        }}
                        className="block w-full text-left"
                      >
                        <SidebarMiniMock
                          mini={mini}
                          bank={currentBank}
                          isActive={selectedLesson === `mini-${mini}`}
                          isCurrent={mini === currentBank.currentMini}
                          currentMiniStep={currentMiniStep}
                          isPro={isPro}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">
                  Phase 2 — Full Practice
                </div>
                <div className="space-y-2">
                  {[
                    ['full-practice', 'Full Practice Test'],
                    ['full-flashcards', 'Full-Test Flashcards'],
                  ].map(([key, label]) => {
                    const active = selectedLesson === key;
                    const locked = !isPro;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          if (locked) return;
                          setSelectedLesson(key as LessonKey);
                        }}
                        className={cx(
                          'block w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition',
                          locked
                            ? 'cursor-not-allowed border-white/5 bg-white/[0.02] text-white/45'
                            : active
                              ? 'border-emerald-400/30 bg-emerald-500/10 text-white'
                              : 'border-transparent bg-white/[0.03] text-white/80 hover:border-white/10 hover:bg-white/[0.05]',
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span>{label}</span>
                          {locked ? (
                            <span className="text-yellow-400">PRO 🔒</span>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">
                  Phase 3 — Registry Simulation
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!isPro) return;
                    setSelectedLesson('full-mock');
                  }}
                  className={cx(
                    'block w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition',
                    !isPro
                      ? 'cursor-not-allowed border-white/5 bg-white/[0.02] text-white/45'
                      : selectedLesson === 'full-mock'
                        ? 'border-emerald-400/30 bg-emerald-500/10 text-white'
                        : 'border-transparent bg-white/[0.03] text-white/80 hover:border-white/10 hover:bg-white/[0.05]',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>Full Mock Exam</span>
                    {!isPro ? (
                      <span className="text-yellow-400">PRO 🔒</span>
                    ) : null}
                  </div>
                </button>
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
                    const activeStepKey =
                      selectedLesson.startsWith('mini-') &&
                      'activeStep' in selectedLessonData
                        ? selectedLessonData.activeStep
                        : currentMiniStep;

                    const isHighlighted =
                      selectedLesson.startsWith('mini-') &&
                      'activeStep' in selectedLessonData &&
                      selectedLessonData.activeStep === step.key;

                    const isMiniLesson = selectedLesson.startsWith('mini-');
                    const isClickable = !isMiniLesson || isHighlighted;

                    const stepState =
                      step.key === activeStepKey
                        ? 'active'
                        : step.key === 'practice' && activeStepKey !== 'practice'
                          ? 'completed'
                          : step.key === 'flashcards' && activeStepKey === 'exam'
                            ? 'completed'
                            : step.key === 'exam' && activeStepKey === 'exam'
                              ? 'active'
                              : 'locked';

                    const lockedReason =
                        isMiniLesson && !isClickable
                          ? step.key === 'practice'
                            ? 'Completed. Restart Mini Mock to retake.'
                            : step.key === 'flashcards'
                              ? 'Completed. Restart Mini Mock to review again.'
                              : step.key === 'exam'
                                ? 'Complete Practice Test and Flashcards first'
                                : null
                          : null;

                      const className = cx(
                        'group relative rounded-3xl border p-5 transition focus:outline-none',
                        stepState === 'active'
                          ? 'hover:border-white/20 hover:bg-white/[0.04] cursor-pointer'
                          : stepState === 'completed'
                            ? 'opacity-75 cursor-default'
                            : 'opacity-55 cursor-not-allowed saturate-75',
                        isHighlighted
                          ? 'border-emerald-400/35 bg-emerald-500/10 shadow-[0_0_0_1px_rgba(45,212,191,0.16),0_0_24px_rgba(16,185,129,0.12)]'
                          : stepState === 'locked'
                            ? 'border-white/8 bg-black/30'
                            : 'border-white/10 bg-black/20',
                      );

                    const displayTitle =
                      step.key === 'practice'
                        ? 'Practice Test'
                        : step.key === 'flashcards'
                          ? 'Missed Flashcards'
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
                                      {step.badge === 'Complete' ? 'Restart' : 'Ready'}
                                    </div>
                                  ) : stepState === 'completed' ? (
                                    <div className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200">
                                      Completed
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
                                      ? 'Ready to take Mini Mock Exam.'
                                      : step.key === 'flashcards'
                                        ? 'Continue with Missed Flashcards.'
                                        : 'Start with the Practice Test.'}
                                </div>
                              ) : stepState === 'completed' ? (
                                <div className="text-yellow-300/78">
                                  {step.key === 'practice'
                                    ? 'Completed. Restart Mini Mock to retake.'
                                    : step.key === 'flashcards'
                                      ? 'Completed. Restart Mini Mock to review again.'
                                      : 'Complete Practice Test and Flashcards first.'}
                                </div>
                              ) : (
                                <div className="text-yellow-300/78">
                                  {step.key === 'flashcards'
                                    ? 'Complete Practice Test first.'
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

                    if (stepState !== 'active') {
                      return (
                        <button
                          key={step.title}
                          type="button"
                          className={className}
                          onClick={(e) => e.preventDefault()}
                        >
                          {content}
                        </button>
                      );
                    }

                    return (
                      <Link
                        key={step.title}
                        id={isHighlighted ? 'current-step-card' : undefined}
                        href={step.href}
                        data-tour={isHighlighted ? 'current-step' : undefined}
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

                  <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
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
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
