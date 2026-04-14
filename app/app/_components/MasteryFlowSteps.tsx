'use client';

import Link from 'next/link';
import { useState } from 'react';
import { readMasteryMiniStep, saveMasteryMiniStep } from '@/lib/progressStore';

type Step = 1 | 2 | 3 | 4;

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

function getRemainingFlashcardsForMini(setId: string, mini: number) {
  if (typeof window === 'undefined') return 0;

  try {
    const storageSources = [window.localStorage, window.sessionStorage];
    const prefix = `rtt_flash_session_${setId}__missed__all__${mini}`;

    for (const storage of storageSources) {
      for (let i = 0; i < storage.length; i += 1) {
        const key = storage.key(i);
        if (!key) continue;
        if (!key.startsWith(prefix)) continue;

        const raw = storage.getItem(key);
        if (!raw) continue;

        const parsed = JSON.parse(raw);
        return Array.isArray(parsed?.deck) ? parsed.deck.length : 0;
      }
    }
  } catch {}

  return 0;
}

export default function MasteryFlowSteps({
  currentStep,
  currentBankLabel,
  currentMini,
  compact = false,
  showIntro = true,
  showUpgrade = true,
}: {
  currentStep: Step;
  currentBankLabel?: string;
  currentMini?: number;
  compact?: boolean;
  showIntro?: boolean;
  showUpgrade?: boolean;
}) {
  const activeStep = currentStep >= 3 ? 3 : currentStep;

  const setId = (currentBankLabel || 'QBank 1')
    .toLowerCase()
    .includes('qbank 2')
    ? 'qbank2'
    : (currentBankLabel || 'QBank 1').toLowerCase().includes('qbank 3')
      ? 'qbank3'
      : 'qbank1';

  const mini = currentMini || 1;

  const savedStep = readMasteryMiniStep(setId, mini);

  const practiceStarted = hasSavedPracticeSession(setId, mini);
  const remainingFlashcardsForMini = getRemainingFlashcardsForMini(setId, mini);

  const skippedToExam =
    activeStep === 3 &&
    savedStep === 'exam' &&
    !practiceStarted &&
    remainingFlashcardsForMini === 0;

const [showSkipModal, setShowSkipModal] = useState(false);
const [pendingHref, setPendingHref] = useState<string | null>(null);
const [skipMode, setSkipMode] = useState<'to_exam' | 'to_flashcards' | null>(null);
const [remainingFlashcards, setRemainingFlashcards] = useState(0);

  const steps = [
    {
      id: 1,
      title: currentMini
        ? hasSavedPracticeSession(
            currentBankLabel?.toLowerCase()?.includes('qbank2')
              ? 'qbank2'
              : currentBankLabel?.toLowerCase()?.includes('qbank3')
                ? 'qbank3'
                : 'qbank1',
            currentMini,
          )
          ? `Continue Practice Test ${currentMini}`
          : `Take Practice Test ${currentMini}`
        : 'Take Practice Test',
      desc: 'Pre-test to assess what you know',
      href: `/app/practice/${setId}?mode=all&cat=all&flow=mastery&mini=${mini}`,
    },
    {
      id: 2,
      title: 'Flashcards',
      desc: 'Clear your missed concepts',
      href: `/app/flashcards?set=${setId}&mode=missed&cat=all&flow=mastery&mini=${mini}`,
    },
    {
      id: 3,
      title: currentMini ? `Mini Mock Exam ${currentMini}` : 'Mini Mock Exam',
      desc: 'Post-test to apply what you just reviewed',
      href: `/app/mock-exam?qbank=${setId}&scope=mini&mini=${mini}&flow=mastery&autostart=1`,
    },
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      {showIntro ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
              RTT Mastery Method
            </div>
            <div className="mt-2 text-sm text-white/70">
              Follow the Rad Tech Tutor Mastery Method and go from overwhelmed
              to registry ready in as little as one month.
            </div>
          </div>
        </div>
      ) : null}

      <div className={`${showIntro ? 'mt-4' : ''} grid gap-3 md:grid-cols-3`}>
        {steps.map((step) => {
          const active = step.id === activeStep;
          const completed = false;
          const locked =
            activeStep === 3
              ? step.id !== 3
              : step.id === 1
                ? step.id !== activeStep
                : step.id === 2
                  ? activeStep === 1
                  : false;

          const className = [
            'block w-full rounded-2xl border p-4 text-left transition duration-200',
            locked
              ? 'cursor-not-allowed opacity-50 bg-black/40'
              : 'cursor-pointer hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-[0_10px_30px_rgba(0,0,0,0.22)]',
            active
              ? 'border-emerald-400/50 bg-emerald-500/10 shadow-[0_0_0_1px_rgba(16,185,129,0.35),0_0_24px_rgba(16,185,129,0.14)]'
              : completed
                ? 'border-white/15 bg-white/8'
                : 'border-white/10 bg-black/20',
          ].join(' ');

          const content = (
            <>
              <div className="text-xs text-white/55">Step {step.id}</div>
              <div className="mt-2 font-semibold text-white">{step.title}</div>
              <div className="mt-2 text-xs text-white/60">{step.desc}</div>
            </>
          );

          if (locked) {
const lockedReason =
  activeStep === 3 && step.id === 1
    ? 'Practice Test is locked once you reach the Mini Mock Exam. Restart this Mini Mock to begin again from Step 1.'
    : activeStep === 3 && step.id === 2
      ? 'Flashcards are locked once you reach the Mini Mock Exam. Restart this Mini Mock to unlock the full study flow again.'
      : step.id === 2
        ? 'Flashcards are made from the questions you get wrong in the Practice Test. Complete the Practice Test first to generate your flashcards.'
        : step.id === 3
          ? 'Complete Practice Test and Flashcards first.'
          : 'Start with the Practice Test.';

            return (
              <button
                key={step.id}
                type="button"
                className={`${className} group relative`}
                onClick={(e) => e.preventDefault()}
              >
                {content}

                <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-black/70 opacity-0 transition duration-200 group-hover:opacity-100 group-active:opacity-100">
                  <div className="max-w-[200px] text-center text-xs font-semibold text-yellow-200">
                    {lockedReason}
                  </div>
                </div>
              </button>
            );
          }

          const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault();

            // Practice or Flashcards -> Mini Mock
            if (step.id === 3 && activeStep < 3) {
              setPendingHref(step.href);
              setSkipMode('to_exam');
              setShowSkipModal(true);
              return;
            }

            // Mini Mock -> Flashcards
            if (step.id === 2 && activeStep === 3) {
              if (skippedToExam) return;

              const remaining = getRemainingFlashcardsForMini(setId, mini);

              if (remaining > 0) {
                setPendingHref(step.href);
                setRemainingFlashcards(remaining);
                setSkipMode('to_flashcards');
                setShowSkipModal(true);
                return;
              }

              window.location.href = step.href;
              return;
            }

            // Mini Mock -> anything else allowed
if (activeStep === 3) {
  if (step.id !== 3) return;

  window.location.href = step.href;
  return;
}

            const distance =
              typeof window !== 'undefined' && window.innerWidth < 768
                ? Math.round(window.innerHeight * 1.05)
                : Math.round(window.innerHeight * 0.9);

            window.scrollBy({
              top: distance,
              behavior: 'smooth',
            });
          };

          return (
            <Link
              key={step.id}
              href={step.href}
              onClick={handleClick}
              className={className}
            >
              {content}
            </Link>
          );
        })}
      </div>

      {showSkipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 p-6">
            <h2 className="text-lg font-semibold text-white">
              {skipMode === 'to_flashcards'
                ? 'Return to Flashcards?'
                : activeStep === 1
                  ? 'Skip Ahead to Mini Mock Exam?'
                  : 'Skip Flashcards?'}
            </h2>

            <p className="mt-3 text-sm text-white/70">
              {skipMode === 'to_flashcards'
                ? `You still have ${remainingFlashcards} flashcards left to review. Going back now will pause your Mini Mock. Are you sure you want to return to Flashcards?`
                : activeStep === 1
                  ? 'You can skip ahead to the Mini Mock Exam, but without completing the Practice Test and Flashcards first, your score may be lower since your weak areas won’t be reviewed.'
                  : 'You can skip ahead to the Mini Mock Exam, but without completing the Practice Test and Flashcards first, your score may be lower since your weak areas won’t be reviewed.'}
            </p>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowSkipModal(false);
                  setPendingHref(null);
                  setSkipMode(null);
                  setRemainingFlashcards(0);
                }}
                className="rounded-lg bg-white/10 px-4 py-2 text-white"
              >
                {skipMode === 'to_flashcards' ? 'Stay in Mini Mock' : 'Go Back'}
              </button>

              <button
                type="button"
                onClick={() => {
                  const href = pendingHref;
                  const mode = skipMode;

                  if (mode === 'to_exam') {
                    saveMasteryMiniStep(setId, mini, 'exam');
                  }

                  setShowSkipModal(false);
                  setPendingHref(null);
                  setSkipMode(null);
                  setRemainingFlashcards(0);

                  if (href) window.location.href = href;
                }}
                className="rounded-lg bg-yellow-400 px-4 py-2 font-semibold text-black"
              >
                {skipMode === 'to_flashcards'
                  ? 'Go to Flashcards'
                  : 'Continue to Mini Mock Exam'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
