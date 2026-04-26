'use client';
import Link from 'next/link';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { buildRationale } from '@/lib/masteryContent';
import { normalizeChoices } from '@/lib/normalizeChoices';
import {
  appendAttempt,
  getClientStorage,
  recordMiniMockResult,
  recordFullMockResult,
  recordFullQbankExamResult,
  syncMockResult,
  getMiniMockChallengeStats,
} from '@/lib/progressStore';
import MasteryFlowSteps from '@/app/app/_components/MasteryFlowSteps';
import StartHereTour from '@/app/app/_components/StartHereTour';
import SaveProgressPrompt from '@/app/app/_components/SaveProgressPrompt';
import { useSupabaseSession } from '@/app/app/_hooks/useSupabaseSession';
import { usePro } from '@/app/app/_lib/usePro';
import {
  buildMiniMocks,
  mapToArrtMajorCategory,
  selectQuestionsForScope,
  shuffleQuestionChoices,
  type MockScope,
} from '@/lib/mockPlan';

import posthog from 'posthog-js';

type Choice =
  | string
  | { key?: string; label?: string; text?: string; value?: string };

type Question = {
  id: string;
  question?: string;
  stem?: string;
  prompt?: string;
  choices: Choice[] | Record<string, string>;
  answer?: string;
  correct?: string;
  correctKey?: string;
  correctAnswer?: string;
  rationale?: string;
  explanation?: string;
  whyCorrect?: string;
  category?: string;
  subcategory?: string;
};

type ReviewItem = {
  selectedKey: string;
  selectedText: string;
  correctKey: string;
  correctText: string;
  wrongWhy: string;
  correctWhy: string;
};

type SavedMockSession = {
  questions: Question[];
  idx: number;
  selected: string | null;
  answers: Record<string, string>;
  missed: string[];
  reviewById?: Record<string, ReviewItem>;
  savedAt: number;
  categoryFilter: string;
  answeredCount: number;
  startedAt: number;
  timeLeft: number | null;
  scope: MockScope;
  miniId: number;
};

type SavedMockResults = {
  questions: Question[];
  answers: Record<string, string>;
  reviewById: Record<string, ReviewItem>;
  missed: string[];
  categoryFilter: string;
  scope: MockScope;
  miniId: number;
};

function getStem(q: Question) {
  return q.stem || q.question || q.prompt || '';
}

function getCorrectKey(q: Question & Record<string, any>) {
  return (
    q.correctKey ||
    q.correct ||
    q.correctAnswer ||
    q.answerKey ||
    q.answer ||
    ''
  )
    .toString()
    .trim();
}

function bankIdFromSet(setId: string) {
  const m = String(setId).match(/qbank(\d+)/i);
  return m ? Number(m[1]) : 1;
}

function sessionKey(
  flow: 'mastery' | 'free',
  setId: string,
  scope: MockScope,
  miniId: number,
  category: string,
) {
  return `rtt_mock_session_${flow}_${setId}_${scope}_${miniId}_${category}`;
}

function loadSession(
  flow: 'mastery' | 'free',
  setId: string,
  scope: MockScope,
  miniId: number,
  category: string,
): SavedMockSession | null {
  try {
    const key = sessionKey(flow, setId, scope, miniId, category);

    const rawLocal = window.localStorage.getItem(key);
    const rawSession = window.sessionStorage.getItem(key);
    const raw = rawLocal || rawSession;

    if (!raw) return null;
    return JSON.parse(raw) as SavedMockSession;
  } catch {
    return null;
  }
}
function saveSession(
  flow: 'mastery' | 'free',
  setId: string,
  scope: MockScope,
  miniId: number,
  category: string,
  payload: SavedMockSession,
) {
  try {
    const key = sessionKey(flow, setId, scope, miniId, category);
    const raw = JSON.stringify(payload);

    window.localStorage.setItem(key, raw);
    window.sessionStorage.setItem(key, raw);
  } catch {}
}
function clearSession(
  flow: 'mastery' | 'free',
  setId: string,
  scope: MockScope,
  miniId: number,
  category: string,
) {
  try {
    window.localStorage.removeItem(
      sessionKey(flow, setId, scope, miniId, category),
    );
  } catch {}
  try {
    window.sessionStorage.removeItem(
      sessionKey(flow, setId, scope, miniId, category),
    );
  } catch {}
}

function resultsKey(
  flow: 'mastery' | 'free',
  setId: string,
  scope: MockScope,
  miniId: number,
  category: string,
) {
  return `rtt_mock_results_${flow}_${setId}_${scope}_${miniId}_${category}`;
}

function saveResults(
  flow: 'mastery' | 'free',
  setId: string,
  scope: MockScope,
  miniId: number,
  category: string,
  payload: SavedMockResults,
) {
  try {
    sessionStorage.setItem(
      resultsKey(flow, setId, scope, miniId, category),
      JSON.stringify(payload),
    );
  } catch {}
}

function loadResults(
  flow: 'mastery' | 'free',
  setId: string,
  scope: MockScope,
  miniId: number,
  category: string,
): SavedMockResults | null {
  try {
    const raw = sessionStorage.getItem(
      resultsKey(flow, setId, scope, miniId, category),
    );
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function buildReviewItem(q: Question, selectedKeyRaw: string): ReviewItem {
  const choiceRows = normalizeChoices((q as any).choices).map((c) => ({
    key: c.key,
    text: c.text,
  }));

  const selectedKey = String(selectedKeyRaw || '')
    .trim()
    .toUpperCase();
  const selectedText =
    choiceRows.find((c) => c.key.toUpperCase() === selectedKey)?.text || '';

  const correctKey = getCorrectKey(q as any)
    .toString()
    .trim()
    .toUpperCase();
  const correctText =
    choiceRows.find((c) => c.key.toUpperCase() === correctKey)?.text || '';

  const rationale = buildRationale(q).trim();

  const correctMatch = rationale.match(
    /^Correct Answer:\s*(.*?)(?:\n\s*\n|\nIncorrect Answers:|$)([\s\S]*)/i,
  );

  const correctWhy = (correctMatch?.[2] || '')
    .split(/\n\s*Incorrect Answers:/i)[0]
    .trim();

  const incorrectSectionMatch = rationale.match(
    /Incorrect Answers:\s*([\s\S]*)$/i,
  );
  const incorrectSection = incorrectSectionMatch?.[1] || '';

  const normalizedWrongChoice = selectedText.trim().toLowerCase();
  let wrongWhy = '';

  if (incorrectSection && normalizedWrongChoice) {
    const lines = incorrectSection.split(/\n+/).filter(Boolean);

    for (const line of lines) {
      const m = line.match(/^[A-D]\.\s*(.+)$/i);
      if (!m) continue;
      const body = m[1].trim();
      if (body.toLowerCase().startsWith(normalizedWrongChoice)) {
        wrongWhy = body
          .slice(selectedText.length)
          .trim()
          .replace(/^[-:–—]\s*/, '');
        break;
      }
    }
  }

  return {
    selectedKey,
    selectedText,
    correctKey,
    correctText,
    wrongWhy,
    correctWhy,
  };
}

type FeedbackKind = 'free' | 'pro';
type FeedbackAnswer = 'yes' | 'no';

type FeedbackModalProps = {
  kind: FeedbackKind;
  surveyUrl: string;
  onClose: () => void;
};

function MiniMockFeedbackModal({
  kind,
  surveyUrl,
  onClose,
}: FeedbackModalProps) {
  const [freeAnswer, setFreeAnswer] = useState<FeedbackAnswer | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [recommend, setRecommend] = useState<string | null>(null);
  const [helpedMost, setHelpedMost] = useState<string | null>(null);
  const [improvement, setImprovement] = useState('');

const openSurvey = () => {
  posthog.capture(
    kind === 'pro'
      ? 'pro_feedback_survey_clicked'
      : 'free_feedback_survey_clicked',
  );

  if (kind === 'pro') {
    localStorage.setItem('rtt_pro_feedback_completed', 'true');
  } else {
    localStorage.setItem('rtt_free_feedback_completed', 'true');
  }

  window.open(surveyUrl, '_blank', 'noopener,noreferrer');
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#10131a] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-300/80">
              Quick feedback
            </div>
            <h2 className="mt-2 text-xl font-semibold text-white">
              {kind === 'free'
                ? 'Quick question 👋'
                : 'Quick feedback (5 seconds)'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/8 px-3 py-1 text-sm font-semibold text-white/70 hover:bg-white/12 hover:text-white"
          >
            ×
          </button>
        </div>

        {kind === 'free' ? (
          <div className="mt-5">
            {!freeAnswer ? (
              <>
                <p className="text-sm leading-6 text-white/75">
                  Are you enjoying studying with The Rad Tech Tutor so far?
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem('rtt_enjoying', 'yes');
                      posthog.capture('rtt_enjoying', { answer: 'yes' });

                      setFreeAnswer('yes');
                    }}
                    className="rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-black hover:brightness-95"
                  >
                    Yes, it’s helping
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem('rtt_enjoying', 'no');
                      posthog.capture('rtt_enjoying', { answer: 'no' });

                      setFreeAnswer('no');
                    }}
                    className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/15"
                  >
                    Not really yet
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm leading-6 text-white/75">
                  {freeAnswer === 'yes'
                    ? 'That’s great to hear. Would you take a quick 1-minute survey and tell us why this has been helpful for you so far?'
                    : 'Thanks for being honest. Would you take a quick 1-minute survey and tell us what we can improve?'}
                </p>
                <div className="mt-4 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm text-white/75">
                  As a thank-you, you’ll get{' '}
                  <span className="font-semibold text-yellow-300">
                    10% off Pro
                  </span>{' '}
                  after completing it.
                  {/* <div className="mt-2 text-xs text-white/55">
                    Coupon code:{' '}
                    <span className="font-semibold text-yellow-300">
                      FEEDBACK10
                    </span>
                  </div> */}
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={openSurvey}
                    className="rounded-2xl bg-yellow-400 px-4 py-3 text-sm font-semibold text-black hover:brightness-95"
                  >
                    Take Survey & Get 10% Off
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/15"
                  >
                    Maybe later
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="mt-5">
            <p className="text-sm leading-6 text-white/75">
              How would you rate The Rad Tech Tutor so far?
            </p>

            <div className="mt-4 flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => {
                    setRating(star);
                    posthog.capture('pro_feedback_rating', { rating: star });
                  }}
                  className={`text-3xl transition hover:scale-110 ${
                    rating && star <= rating
                      ? 'text-yellow-300'
                      : 'text-white/25'
                  }`}
                  aria-label={`Rate ${star} stars`}
                >
                  ★
                </button>
              ))}
            </div>

            {rating && (
              <div className="mt-5">
                <p className="text-sm text-white/70 mb-3">
                  Help us improve this for future students
                </p>

                <button
                  type="button"
                  onClick={openSurvey}
                  className="w-full rounded-2xl bg-yellow-400 px-4 py-3 text-sm font-semibold text-black hover:brightness-95"
                >
                  Take 1-Minute Survey
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 w-full text-sm text-white/50 hover:text-white/70"
                >
                  Skip
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MockExamPageInner() {
  const sp = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { session } = useSupabaseSession();

  const setId = (sp.get('qbank') || 'qbank1').toLowerCase();
  const scope = (sp.get('scope') || 'mini').toLowerCase() as MockScope;
  const testMode = sp.get('test') === '1';
  const miniId =
    scope === 'mini'
      ? Math.max(1, Math.min(10, Number(sp.get('mini') || 1)))
      : 0;
  const autoStart = sp.get('autostart') === '1';
  const flow: 'mastery' | 'free' =
    (sp.get('flow') || '').toLowerCase() === 'mastery' ? 'mastery' : 'free';
  const hasExplicitMini = sp.has('mini');

  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [hasSaved, setHasSaved] = useState(false);
  const [savedMeta, setSavedMeta] = useState<{
    answeredCount: number;
    total: number;
  } | null>(null);
  const [categoryFilter, setCategoryFilter] = useState(
    (sp.get('category') || 'patient care').toLowerCase(),
  );
  const [allCategories, setAllCategories] = useState<
    Array<{ key: string; label: string }>
  >([
    { key: 'patient care', label: 'Patient Care' },
    { key: 'safety', label: 'Safety' },
    { key: 'image production', label: 'Image Production' },
    { key: 'procedures', label: 'Procedures' },
  ]);
  const proStatus = usePro();
  const isPro = proStatus ?? false;

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [reviewById, setReviewById] = useState<Record<string, ReviewItem>>({});
  const [missed, setMissed] = useState<Set<string>>(new Set());
  const [done, setDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState<number>(Date.now());
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [feedbackModalKind, setFeedbackModalKind] =
    useState<FeedbackKind | null>(null);
  const feedbackPromptCheckedRef = useRef(false);

  const examAnchorRef = useRef<HTMLDivElement | null>(null);
  const isPausingRef = useRef(false);

  const q = useMemo(
    () => (questions ? questions[idx] || null : null),
    [questions, idx],
  );
  const activeCategoryKey = scope === 'category' ? categoryFilter : 'all';
  const total = questions?.length || 0;
  const categoryLabel =
    allCategories.find((c) => c.key === categoryFilter)?.label || 'Category';
  const challenge = getMiniMockChallengeStats(setId);

  const categoryCounts = useMemo(() => {
    const totalCount = allQuestions.filter(
      (item) =>
        mapToArrtMajorCategory(String(item.category || '')).toLowerCase() ===
        categoryFilter,
    ).length;

    const miniMap = buildMiniMocks(allQuestions);
    const unlockedIds = new Set(
      [1, 2, 3, 4, 5].flatMap((m) => miniMap[m] || []).map((item) => item.id),
    );

    const unlockedCount = allQuestions.filter(
      (item) =>
        unlockedIds.has(item.id) &&
        mapToArrtMajorCategory(String(item.category || '')).toLowerCase() ===
          categoryFilter,
    ).length;

    return { total: totalCount, unlocked: unlockedCount };
  }, [allQuestions, categoryFilter]);

  useEffect(() => {
    if (sp.get('done') !== '1') return;
    const saved = loadResults(flow, setId, scope, miniId, activeCategoryKey);
    if (!saved) return;

    setQuestions(saved.questions);
    setAnswers(saved.answers);
    setReviewById(saved.reviewById);
    setMissed(new Set(saved.missed));
    setCategoryFilter(saved.categoryFilter);
    setDone(true);
  }, [sp, setId, scope, miniId, activeCategoryKey]);

  useEffect(() => {
    if (done && scope === 'mini' && challenge.qualifies) {
      setShowChallengeModal(true);
    }
  }, [done, scope, challenge.qualifies]);

useEffect(() => {
  if (feedbackPromptCheckedRef.current) return;
  if (!done && sp.get('done') !== '1') return;
  if (scope !== 'mini') return;
  if (!questions?.length) return;

  feedbackPromptCheckedRef.current = true;

  try {
    const countKey = 'rtt_mini_mock_count';
    const currentCount = Number(localStorage.getItem(countKey) || '0') + 1;

    localStorage.setItem(countKey, String(currentCount));

    // 🚨 ONLY SHOW AFTER 2 MINI MOCKS
    if (currentCount < 2) return;

if (isPro) {
  const completed = localStorage.getItem('rtt_pro_feedback_completed');
  if (completed) return;

  const shownKey = 'rtt_pro_feedback_last_shown_count';
  const lastShown = Number(localStorage.getItem(shownKey) || '0');

  if (lastShown === 0 || currentCount - lastShown >= 2) {
    localStorage.setItem(shownKey, String(currentCount));
    setFeedbackModalKind('pro');
  }
} else {
  const completed = localStorage.getItem('rtt_free_feedback_completed');
  if (completed) return;

  const shownKey = 'rtt_free_feedback_last_shown_count';
  const lastShown = Number(localStorage.getItem(shownKey) || '0');

  if (lastShown === 0 || currentCount - lastShown >= 2) {
    localStorage.setItem(shownKey, String(currentCount));
    setFeedbackModalKind('free');
  }
}
  } catch {}
}, [done, sp, scope, questions, isPro]);

  useEffect(() => {
    if (timeLeft === null || done || !questions) return;

    if (timeLeft <= 0) {
      if (q && selected != null) {
        submit();
      } else {
        const uniq = Array.from(missed);
        const totalQ = questions.length;
        const correct = totalQ - uniq.length;
        const pct = totalQ ? Math.round((correct / totalQ) * 100) : 0;
        const scopeLabel =
          scope === 'category'
            ? allCategories.find((c) => c.key === categoryFilter)?.label ||
              'Category'
            : 'All Categories';
        const label =
          scope === 'mini'
            ? `Mini Mock ${miniId}`
            : scope === 'full'
              ? 'Full Mock'
              : `${scopeLabel} Category Mock`;

        if (flow === 'mastery') {
          syncMockResult(
            setId,
            questions.map((item) => ({
              id: item.id,
              category: mapToArrtMajorCategory(String(item.category || '')),
            })),
            uniq,
          );
        }

        const categoryStats: Record<
          string,
          { correct: number; total: number }
        > = {};

        questions.forEach((item, idx) => {
          const cat = mapToArrtMajorCategory(String(item.category || ''));
          if (!categoryStats[cat]) {
            categoryStats[cat] = { correct: 0, total: 0 };
          }

          categoryStats[cat].total += 1;

          const normalizedCorrect =
            typeof item.answer === 'string'
              ? item.answer
              : String(item.answer ?? '');
          const picked = answers[idx];
          if (picked === normalizedCorrect) {
            categoryStats[cat].correct += 1;
          }
        });

        const categoryBreakdown: Record<string, number> = {};
        Object.entries(categoryStats).forEach(([cat, stats]) => {
          categoryBreakdown[cat] =
            stats.total > 0
              ? Math.round((stats.correct / stats.total) * 100)
              : 0;
        });

        if (flow === 'mastery')
          appendAttempt({
            bankId: bankIdFromSet(setId),
            score: pct,
            correct,
            total: totalQ,
            category: scope === 'category' ? scopeLabel : label,
            type: scope,
            miniId: scope === 'mini' ? miniId : undefined,
            questionsTaken: totalQ,
            timeSpentSeconds: Math.max(
              0,
              Math.round((Date.now() - startedAt) / 1000),
            ),
            label,
            categoryBreakdown,
          });

        if (flow === 'mastery' && scope === 'mini') {
          recordMiniMockResult(setId, miniId, pct);
        }

        if (flow === 'mastery' && scope === 'full') {
          recordFullMockResult(setId, pct); // keeps results page working
          recordFullQbankExamResult(setId, pct); // updates dashboard
        }

        saveResults(flow, setId, scope, miniId, activeCategoryKey, {
          questions,
          answers,
          reviewById,
          missed: uniq,
          categoryFilter,
          scope,
          miniId,
        });

        clearSession(flow, setId, scope, miniId, activeCategoryKey);
        setDone(true);
        setHasSaved(false);
        setSavedMeta(null);

        const params = new URLSearchParams(sp.toString());
        params.set('done', '1');
        params.delete('autostart');
        router.replace(`${pathname}?${params.toString()}`);
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((t) => (t !== null ? t - 1 : t));
    }, 1000);

    return () => clearInterval(interval);
  }, [
    timeLeft,
    done,
    questions,
    q,
    selected,
    missed,
    scope,
    miniId,
    categoryFilter,
    allCategories,
    setId,
    activeCategoryKey,
    startedAt,
    answers,
    reviewById,
    pathname,
    router,
    sp,
  ]);

  // useEffect(() => {
  //   if (!questions?.length || done) return;
  //   const t = window.setTimeout(() => {
  //     examAnchorRef.current?.scrollIntoView({
  //       behavior: 'smooth',
  //       block: 'center',
  //     });
  //   }, 250);
  //   return () => window.clearTimeout(t);
  // }, [questions?.length, done]);

  useEffect(() => {
    window.scrollTo(0, 0);
    (async () => {
      try {
        const res = await fetch(`/api/questions/${setId}`, {
          cache: 'no-store',
        });
        const data = await res.json();
        const originalQuestions = Array.isArray(data?.questions)
          ? (data.questions as Question[])
          : [];
        setAllQuestions(originalQuestions);

        const catSet = new Set<string>();
        for (const item of originalQuestions) {
          catSet.add(mapToArrtMajorCategory(String(item.category || '')));
        }

        const options = Array.from(catSet)
          .filter(Boolean)
          .sort()
          .map((label) => ({ key: label.toLowerCase(), label }));

        setAllCategories(options);

        if (
          scope === 'category' &&
          options.length &&
          !options.some(
            (opt) =>
              opt.key === (sp.get('category') || categoryFilter).toLowerCase(),
          )
        ) {
          setCategoryFilter(options[0].key);
        }
      } catch {}
    })();
  }, [setId, scope, sp, categoryFilter]);

  useEffect(() => {
    if (scope === 'mini' && flow === 'free' && !hasExplicitMini) {
      setHasSaved(false);
      setSavedMeta(null);
      return;
    }

    const saved = loadSession(flow, setId, scope, miniId, activeCategoryKey);
    setHasSaved(!!saved);
    setSavedMeta(
      saved
        ? {
            answeredCount:
              saved.answeredCount || Object.keys(saved.answers || {}).length,
            total: saved.questions.length,
          }
        : null,
    );
    if (saved?.categoryFilter && scope === 'category') {
      setCategoryFilter(saved.categoryFilter);
    }
  }, [flow, hasExplicitMini, setId, scope, miniId, activeCategoryKey]);

  useEffect(() => {
    if (!q) return;
    setSelected(answers[q.id] || null);
  }, [q, answers]);

  useEffect(() => {
    if (session || Object.keys(answers).length === 0 || done) return;

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isPausingRef.current) return;
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [session, answers, done]);

  useEffect(() => {
    if (!questions || done) return;

    saveSession(flow, setId, scope, miniId, activeCategoryKey, {
      questions,
      idx,
      selected,
      answers,
      reviewById,
      missed: Array.from(missed),
      savedAt: Date.now(),
      categoryFilter,
      answeredCount: Object.keys(answers).length,
      startedAt,
      timeLeft,
      scope,
      miniId,
    });

    setHasSaved(true);
    setSavedMeta({
      answeredCount: Object.keys(answers).length,
      total: questions.length,
    });
  }, [
    setId,
    scope,
    miniId,
    activeCategoryKey,
    questions,
    idx,
    selected,
    answers,
    reviewById,
    missed,
    done,
    categoryFilter,
    startedAt,
    timeLeft,
  ]);

  async function startNew() {
    setErr(null);
    setLoading(true);

    const params = new URLSearchParams(sp.toString());
    params.delete('done');
    params.set('autostart', '1');
    router.replace(`${pathname}?${params.toString()}`);

    clearSession(flow, setId, scope, miniId, activeCategoryKey);

    try {
      const res = await fetch(`/api/questions/${setId}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Failed to load questions (${res.status})`);

      const data = await res.json();
      const originalQuestions = Array.isArray(data?.questions)
        ? (data.questions as Question[])
        : [];

      let selectedQuestions: Question[] = [];

      if (scope === 'full') {
        selectedQuestions = testMode
          ? originalQuestions.slice(0, 5)
          : originalQuestions;
      } else {
        selectedQuestions = selectQuestionsForScope(originalQuestions, scope, {
          miniId,
          category: categoryFilter,
          isPro,
        });
      }

      if (!selectedQuestions.length) {
        throw new Error('No questions found for that selection.');
      }

      const shuffled = shuffleQuestionChoices(selectedQuestions, Date.now());
      setQuestions(shuffled);
      setIdx(0);
      setSelected(null);
      setAnswers({});
      setReviewById({});
      setMissed(new Set());
      setDone(false);
      setHasSaved(false);
      setSavedMeta(null);
      setStartedAt(Date.now());
      setTimeLeft(shuffled.length * 60);
    } catch (e: any) {
      setErr(e?.message || 'Failed to load.');
    } finally {
      setLoading(false);
    }
  }

  const autostartRanRef = useRef(false);

  useEffect(() => {
    if (sp.get('autostart') !== '1') return;
    if (autostartRanRef.current) return;
    if (loading) return;

    autostartRanRef.current = true;

    const saved = loadSession(flow, setId, scope, miniId, activeCategoryKey);
    const hasSavedProgress =
      !!saved &&
      ((Array.isArray(saved.questions) && saved.questions.length > 0) ||
        Object.keys(saved.answers || {}).length > 0);

    if (hasSavedProgress) {
      resumeSaved();
      return;
    }

    void startNew();
  }, [sp, loading, setId, scope, miniId, activeCategoryKey]);

  function resumeSaved() {
    const saved = loadSession(flow, setId, scope, miniId, activeCategoryKey);
    if (!saved) {
      setHasSaved(false);
      setSavedMeta(null);
      return;
    }

    setQuestions(saved.questions || []);
    setIdx(saved.idx || 0);
    setSelected(saved.selected || null);
    setAnswers(saved.answers || {});
    setReviewById(saved.reviewById || {});
    setMissed(new Set(saved.missed || []));
    setCategoryFilter(saved.categoryFilter || categoryFilter);
    setDone(false);
    setStartedAt(saved.startedAt || Date.now());
    setTimeLeft(
      typeof saved.timeLeft === 'number'
        ? saved.timeLeft
        : (saved.questions || []).length * 60,
    );
  }

  function pauseAndSave() {
    if (!questions) return;

    isPausingRef.current = true;

    saveSession(flow, setId, scope, miniId, activeCategoryKey, {
      questions,
      idx,
      selected,
      answers,
      reviewById,
      missed: Array.from(missed),
      savedAt: Date.now(),
      categoryFilter,
      answeredCount: Object.keys(answers).length,
      startedAt,
      timeLeft,
      scope,
      miniId,
    });

    setHasSaved(true);
    setSavedMeta({
      answeredCount: Object.keys(answers).length,
      total: questions.length,
    });

    const target = (() => {
      if (flow === 'mastery') return '/app/dashboard';
      const params = new URLSearchParams(sp.toString());
      params.delete('autostart');
      params.delete('done');
      return `${pathname}?${params.toString()}`;
    })();

    if (flow === 'free') {
      setQuestions(null);
      setSelected(null);
      setDone(false);
    }

    window.location.assign(target);
  }

  function submit() {
    if (!q || selected == null) return;

    const correctKey = getCorrectKey(q);
    const normChoices = normalizeChoices((q as any).choices).map((c) => ({
      key: c.key,
      text: c.text,
    }));
    const chosenText =
      normChoices.find((c) => c.key === selected)?.text?.trim() || '';

    const isCorrect =
      correctKey.toUpperCase() === selected.toUpperCase() ||
      (correctKey &&
        chosenText &&
        correctKey.trim().toLowerCase() === chosenText.toLowerCase());

    const nextAnswers = { ...answers, [q.id]: selected };
    const nextReviewById = {
      ...reviewById,
      [q.id]: buildReviewItem(q, selected),
    };
    const nextMissed = new Set(missed);

    if (isCorrect) nextMissed.delete(q.id);
    else nextMissed.add(q.id);

    setAnswers(nextAnswers);
    setReviewById(nextReviewById);
    setMissed(nextMissed);
    setSelected(null);

    if (!questions) return;

    if (idx + 1 >= questions.length) {
      const uniq = Array.from(nextMissed);
      const totalQ = questions.length;
      const correct = totalQ - uniq.length;
      const pct = totalQ ? Math.round((correct / totalQ) * 100) : 0;
      const scopeLabel =
        scope === 'category'
          ? allCategories.find((c) => c.key === categoryFilter)?.label ||
            'Category'
          : 'All Categories';
      const label =
        scope === 'mini'
          ? `Mini Mock ${miniId}`
          : scope === 'full'
            ? 'Full Mock'
            : `${scopeLabel} Category Mock`;

      syncMockResult(
        setId,
        questions.map((item) => ({
          id: item.id,
          category: mapToArrtMajorCategory(String(item.category || '')),
        })),
        uniq,
      );

      const categoryStats: Record<string, { correct: number; total: number }> =
        {};

      questions.forEach((item, idx) => {
        const cat = mapToArrtMajorCategory(String(item.category || ''));
        if (!categoryStats[cat]) {
          categoryStats[cat] = { correct: 0, total: 0 };
        }

        categoryStats[cat].total += 1;

        const normalizedCorrect =
          typeof item.answer === 'string'
            ? item.answer
            : String(item.answer ?? '');
        const picked = answers[idx] ?? nextAnswers?.[idx];
        if (picked === normalizedCorrect) {
          categoryStats[cat].correct += 1;
        }
      });

      const categoryBreakdown: Record<string, number> = {};
      Object.entries(categoryStats).forEach(([cat, stats]) => {
        categoryBreakdown[cat] =
          stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
      });

      appendAttempt({
        bankId: bankIdFromSet(setId),
        score: pct,
        correct,
        total: totalQ,
        category: scope === 'category' ? scopeLabel : label,
        type: scope,
        miniId: scope === 'mini' ? miniId : undefined,
        categoryBreakdown,
        questionsTaken: totalQ,
        timeSpentSeconds: Math.max(
          0,
          Math.round((Date.now() - startedAt) / 1000),
        ),
        label,
      });

      if (flow === 'mastery' && scope === 'mini') {
        recordMiniMockResult(setId, miniId, pct);
      }

      if (flow === 'mastery' && scope === 'full') {
        recordFullMockResult(setId, pct);
        recordFullQbankExamResult(setId, pct);
      }

      saveResults(flow, setId, scope, miniId, activeCategoryKey, {
        questions,
        answers: nextAnswers,
        reviewById: nextReviewById,
        missed: uniq,
        categoryFilter,
        scope,
        miniId,
      });

      clearSession(flow, setId, scope, miniId, activeCategoryKey);
      setDone(true);
      setHasSaved(false);
      setSavedMeta(null);

      const params = new URLSearchParams(sp.toString());
      params.set('done', '1');
      params.delete('autostart');
      router.replace(`${pathname}?${params.toString()}`);
      return;
    }

    setIdx((n) => n + 1);
  }

  useEffect(() => {
    // 🚫 DO NOT autostart if user has not explicitly chosen a mini
    if (scope === 'mini' && flow === 'free' && !hasExplicitMini) return;

    if (!autoStart || questions || loading || sp.get('done') === '1') return;

    const saved = loadSession(flow, setId, scope, miniId, activeCategoryKey);
    if (saved) {
      resumeSaved();
      return;
    }

    startNew();
  }, [
    autoStart,
    questions,
    loading,
    setId,
    scope,
    miniId,
    activeCategoryKey,
    sp,
    flow,
    hasExplicitMini,
  ]);

  function formatTime(seconds: number | null) {
    if (seconds === null) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  if (!questions) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="rtt-card rounded-2xl p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Mock Exams</h1>
              <div className="mt-1 text-sm text-white/70">
                Set: {setId.toUpperCase()}
              </div>
            </div>
            <div className="text-sm text-white/70">
              Use mini mocks to run the mastery loop, then full and category
              mocks for coverage.
            </div>
          </div>

          {flow === 'mastery' &&
          scope === 'mini' &&
          autoStart &&
          hasExplicitMini ? (
            <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-white/80">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200/70">
                Step 3 of the RTT Mastery Method
              </div>
              <div className="mt-2 text-base font-semibold text-white">
                Mini Mock Exam {miniId}
              </div>
              <div className="mt-1 text-white/70">
                Apply what you just reviewed in Flashcards.
              </div>
            </div>
          ) : null}

          {hasSaved &&
          !(scope === 'mini' && flow === 'free' && !hasExplicitMini) ? (
            <div className="mt-5 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-5 py-4 text-sm text-yellow-100">
              Saved mock found. You answered up to question{' '}
              {savedMeta?.answeredCount ?? 0} of {savedMeta?.total ?? '—'}.
              <br className="hidden md:block" />
              Resume to continue exactly where you left off.
            </div>
          ) : null}

          {flow !== 'mastery' ||
          scope !== 'mini' ||
          !autoStart ||
          !hasExplicitMini ? (
            <>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <label className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">
                  <div className="mb-2 text-xs font-semibold text-white/60">
                    Mock Type
                  </div>
                  <select
                    value={scope}
                    onChange={(e) => {
                      const val = e.target.value as MockScope;
                      if (val === 'mini') {
                        window.location.assign(
                          `/app/mock-exam?qbank=${setId}&scope=mini&flow=${flow}`,
                        );
                      } else if (val === 'full') {
                        window.location.assign(
                          `/app/mock-exam?qbank=${setId}&scope=full&flow=${flow}`,
                        );
                      } else {
                        window.location.assign(
                          `/app/mock-exam?qbank=${setId}&scope=category&category=${categoryFilter}&flow=${flow}`,
                        );
                      }
                    }}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/85 outline-none"
                  >
                    <option value="mini">Mini Mock</option>
                    <option value="full">Full Mock</option>
                    <option value="category">Category Mock</option>
                  </select>
                </label>

                {scope === 'full' ? (
                  <label className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">
                    <div className="mb-2 text-xs font-semibold text-white/60">
                      Full Mock
                    </div>
                    <select
                      value={setId}
                      onChange={(e) =>
                        window.location.assign(
                          `/app/mock-exam?qbank=${e.target.value}&scope=full`,
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/85 outline-none"
                    >
                      <option value="qbank1">
                        {!isPro ? 'Full Mock 1 PRO 🔒' : 'Full Mock 1'}
                      </option>
                      <option value="qbank2">
                        {!isPro ? 'Full Mock 2 PRO 🔒' : 'Full Mock 2'}
                      </option>
                      <option value="qbank3">
                        {!isPro ? 'Full Mock 3 PRO 🔒' : 'Full Mock 3'}
                      </option>
                      <option value="qbank4">
                        {!isPro ? 'Full Mock 4 PRO 🔒' : 'Full Mock 4'}
                      </option>
                      <option value="qbank5">
                        {!isPro ? 'Full Mock 5 PRO 🔒' : 'Full Mock 5'}
                      </option>
                    </select>
                  </label>
                ) : scope === 'category' ? (
                  <label className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">
                    <div className="mb-2 text-xs font-semibold text-white/60">
                      Category
                    </div>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/85 outline-none"
                    >
                      {allCategories.map((opt) => (
                        <option key={opt.key} value={opt.key}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <label className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">
                    <div className="mb-2 text-xs font-semibold text-white/60">
                      Mini Mock
                    </div>
                    <select
                      value={miniId}
                      onChange={(e) =>
                        window.location.assign(
                          `/app/mock-exam?qbank=${setId}&scope=mini&mini=${e.target.value}`,
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/85 outline-none"
                    >
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n} disabled={!isPro && n > 5}>
                          {!isPro && n > 5
                            ? `Mini Mock ${n} PRO 🔒`
                            : `Mini Mock ${n}`}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
                  {scope === 'full'
                    ? `Choose a full mock bank.${!isPro ? ' Upgrade to unlock.' : ''}`
                    : scope === 'category'
                      ? !isPro
                        ? `Free version: ${categoryCounts.unlocked} unlocked questions. Pro version: ${categoryCounts.total} total questions in this category.`
                        : `Pro version: ${categoryCounts.total} total questions in this category.`
                      : `Mini Mock Exam ${miniId} is your post-test after Practice Test and Flashcards.`}
                </div>
              </div>

              {scope === 'category' ? (
                <div className="mt-4 text-sm text-white/70">
                  {!isPro
                    ? `Free category mocks use unlocked questions from Mini Mocks 1–5 only.`
                    : `Pro includes the full category question pool.`}
                </div>
              ) : null}
            </>
          ) : null}

          {err ? <div className="mt-4 text-sm text-red-300">{err}</div> : null}

          {flow === 'mastery' &&
          scope === 'mini' &&
          autoStart &&
          hasExplicitMini ? (
            <div className="mt-6">
              <MasteryFlowSteps
                currentStep={3}
                currentBankLabel={setId.toUpperCase()}
                currentMini={miniId}
                compact
              />
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-2">
            {hasSaved ? (
              <>
                <button
                  onClick={resumeSaved}
                  className="cursor-pointer rounded-2xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:brightness-95"
                >
                  Resume Saved{' '}
                  {scope === 'mini' ? `Mini Mock ${miniId}` : 'Mock'}
                </button>
                {flow === 'free' ? (
                  <button
                    onClick={startNew}
                    disabled={loading}
                    className="cursor-pointer rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 disabled:opacity-60"
                  >
                    {loading ? 'Loading…' : 'Start New Instead'}
                  </button>
                ) : null}
              </>
            ) : scope === 'full' && !isPro ? (
              <Link
                href="/app/upgrade"
                className="rounded-2xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:brightness-95"
              >
                Upgrade to Unlock Full Mock
              </Link>
            ) : (
              <>
                <button
                  onClick={startNew}
                  disabled={loading}
                  className="cursor-pointer rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 disabled:opacity-60"
                >
                  {loading
                    ? 'Loading…'
                    : scope === 'mini'
                      ? `Take Mini Mock Exam ${miniId}`
                      : scope === 'category'
                        ? 'Start Category Mock'
                        : 'Start Full Mock'}
                </button>

                <Link
                  href="/app/dashboard"
                  className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
                >
                  Go to Dashboard
                </Link>
              </>
            )}
          </div>
        </div>

        {showChallengeModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/72 p-4">
            <div className="w-full max-w-md rounded-3xl border border-emerald-400/20 bg-zinc-950 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200/85">
                Challenge Completed
              </div>
              <div className="mt-2 text-2xl font-semibold text-white">
                You unlocked 10% off Pro
              </div>
              <div className="mt-3 text-sm leading-6 text-white/70">
                You completed the 5 Mock Challenge at a 90% average or higher.
                Use code{' '}
                <span className="font-semibold text-yellow-300">MINI10</span> at
                checkout.
              </div>
              <div className="mt-2 text-sm font-medium text-red-300">
                Expires in 24 hours
              </div>

              <div className="mt-5 flex flex-col gap-2">
                <Link
                  href="/app/upgrade"
                  className="rounded-2xl bg-emerald-400 px-4 py-3 text-center text-sm font-semibold text-black hover:brightness-95"
                >
                  Upgrade Now
                </Link>
                <button
                  type="button"
                  onClick={() => setShowChallengeModal(false)}
                  className="rounded-2xl bg-white/8 px-4 py-3 text-sm font-semibold text-white hover:bg-white/12"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  if (done || sp.get('done') === '1') {
    const missedCount = missed.size;
    const correctCount = total - missedCount;
    const pct = total ? Math.round((correctCount / total) * 100) : 0;

    return (
      <div className="mx-auto max-w-4xl">
        {feedbackModalKind ? (
          <MiniMockFeedbackModal
            kind={feedbackModalKind}
            surveyUrl={
              isPro
                ? 'https://forms.gle/6WNGxk8d4TLgqtELA'
                : 'https://forms.gle/39kTfpVSGB3j6pC57'
            }
            onClose={() => setFeedbackModalKind(null)}
          />
        ) : null}
        <div className="rtt-card rounded-3xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
            Mock Exam Results
          </div>
          <h1 className="mt-2 text-2xl font-semibold">Mock Complete</h1>
          <div className="mt-2 text-sm text-white/70">
            {scope === 'mini'
              ? `Mini Mock Exam ${miniId}`
              : scope === 'category'
                ? `${categoryLabel} Category Mock`
                : 'Full Mock'}{' '}
            • {setId.toUpperCase()}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-[1.2fr_1fr]">
            <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-5">
              <div className="text-sm text-white/70">Score</div>
              <div className="mt-2 text-4xl font-bold text-yellow-300">
                {pct}%
              </div>
              <div className="mt-2 text-sm text-white/65">
                This is your post-test score after review.
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs text-white/55">Correct</div>
                <div className="mt-1 text-2xl font-semibold text-white">
                  {correctCount} / {total}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs text-white/55">Missed</div>
                <div className="mt-1 text-2xl font-semibold text-white">
                  {missedCount}
                </div>
              </div>
            </div>
          </div>

          {scope === 'mini' ? (
            <div className="mt-5">
              <MasteryFlowSteps
                currentStep={3}
                currentBankLabel={setId.toUpperCase()}
                currentMini={miniId}
                compact
              />
            </div>
          ) : null}

          {scope === 'mini' ? (
            <div className="mt-5 rounded-2xl border border-emerald-400/15 bg-[linear-gradient(180deg,rgba(16,185,129,0.08),rgba(255,255,255,0.02))] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200/85">
                    5 Mock Challenge
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
                  className={
                    challenge.qualifies
                      ? 'rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200'
                      : 'rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-semibold text-yellow-200'
                  }
                >
                  {challenge.qualifies ? 'Reward Unlocked' : 'In Progress'}
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/25">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,rgba(45,212,191,0.98),rgba(16,185,129,0.65))]"
                  style={{
                    width: `${Math.min(100, Math.round((challenge.completed / 5) * 100))}%`,
                  }}
                />
              </div>

              <div className="mt-3 text-sm font-medium">
                {challenge.qualifies ? (
                  <span className="text-yellow-300">
                    ✅ Challenge completed — use code MINI10 for 10% off Pro.
                  </span>
                ) : challenge.completed < 5 ? (
                  <span className="text-yellow-300">
                    {5 - challenge.completed} mocks left to unlock your reward.
                  </span>
                ) : (
                  <span className="text-yellow-300">
                    {90 - challenge.avg}% away from the 90% target.
                  </span>
                )}
              </div>
            </div>
          ) : null}

          {scope === 'mini' && pct >= 70 ? (
            <div className="mt-5 rounded-2xl border border-emerald-400/15 bg-emerald-400/10 p-4 text-sm font-medium text-emerald-100">
              You’re improving. Most students who pass the ARRT reach this level
              by continuing through the mock exams and reviewing what they miss.
            </div>
          ) : null}

          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
            Flow: Practice Test → Flashcards → Mini Mock Exam. Finish all 10
            mini mock sessions in the bank, then run full and category mocks for
            broader coverage.
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/app/dashboard"
              className="cursor-pointer rounded-2xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:brightness-95"
            >
              Continue RTT Mastery Method
            </Link>
            {/* {scope === 'mini' ? (
              // <button
              //   onClick={startNew}
              //   className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
              // >
              //   Retake Mini Mock Exam
              // </button>
              // <button
              //   // onClick={() => {
              //   //   const params = new URLSearchParams(window.location.search);
              //   //   params.delete('done'); // remove results state
              //   //   window.location.href = `${window.location.pathname}?${params.toString()}`;
              //   // }}
              //   onClick={startNew}
              //   className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
              // >
              //   Retake Mini Mock Exam
              // </button>
             ) : null} */}
            <Link
              href="/app/roadmap"
              className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
            >
              View Roadmap
            </Link>
          </div>

          {missedCount > 0 ? (
            <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-red-200/70">
                Review what you missed
              </div>
              <div className="mt-2 text-lg font-semibold text-white">
                Missed Questions
              </div>

              <div className="mt-4 space-y-4">
                {questions
                  .filter((item) => missed.has(item.id))
                  .map((item, i) => {
                    const review =
                      reviewById[item.id] ||
                      buildReviewItem(item, answers[item.id] || '');
                    const userAnswer = review.selectedKey
                      ? `${review.selectedKey}. ${review.selectedText}`
                      : '—';
                    const correctAnswer = review.correctKey
                      ? `${review.correctKey}. ${review.correctText}`
                      : '—';

                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-white/10 bg-black/20 p-4"
                      >
                        <div className="text-sm font-semibold text-white">
                          #{i + 1} • {getStem(item)}
                        </div>

                        <div className="mt-3 text-sm text-white/70">
                          Your answer:{' '}
                          <span className="font-semibold text-red-300">
                            {userAnswer}
                          </span>
                        </div>

                        {review.wrongWhy ? (
                          <div className="mt-1 text-sm leading-relaxed text-white/65">
                            Why your answer was wrong:{' '}
                            <span className="text-white/80">
                              {review.wrongWhy}
                            </span>
                          </div>
                        ) : null}

                        <div className="mt-3 text-sm text-white/70">
                          Correct answer:{' '}
                          <span className="font-semibold text-emerald-300">
                            {correctAnswer}
                          </span>
                        </div>

                        {review.correctWhy ? (
                          <div className="mt-1 text-sm leading-relaxed text-white/65">
                            Why this is correct:{' '}
                            <span className="text-white/80">
                              {review.correctWhy}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (!q) return null;

  const stem = getStem(q);
  const choices = normalizeChoices((q as any).choices).map((c) => ({
    key: c.key,
    text: c.text,
  }));

  return (
    <div className="mx-auto max-w-4xl">
      <StartHereTour
        storageKey="rtt_tour_mock"
        steps={[
          {
            selector: '[data-tour="mock-flow"]',
            title: 'Where you are now',
            body: 'This is your post-test. After practice questions and flashcards, you take the mini mock to measure improvement.',
          },
          {
            selector: '[data-tour="mock-info"]',
            title: 'How this page works',
            body: 'There is no instant feedback here. You answer the mini mock first, then review results after.',
          },
          {
            selector: '[data-tour="mock-question"]',
            title: 'Answer here',
            body: 'This is the live mock exam area. Pick an answer and submit to move through the test.',
          },
        ]}
      />

      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            {scope === 'mini'
              ? `Mini Mock Exam ${miniId}`
              : scope === 'category'
                ? `${categoryLabel} Category Mock`
                : 'Full Mock'}
          </h1>
          <div className="mt-1 text-sm text-white/70">
            Question {idx + 1} / {total}
          </div>
        </div>
        <div className="text-sm text-white/70">
          {mapToArrtMajorCategory(String(q.category || '—'))}
          {q.subcategory ? ` / ${q.subcategory}` : ''}
        </div>
      </div>

      {flow === 'mastery' && scope === 'mini' ? (
        <div data-tour="mock-flow" className="mt-4">
          <MasteryFlowSteps
            currentStep={3}
            currentBankLabel={setId.toUpperCase()}
            currentMini={miniId}
            compact
          />
        </div>
      ) : null}

      {!session &&
      Object.keys(answers).length >= Math.min(15, Math.ceil(total * 0.6)) &&
      !done ? (
        <div className="mt-4">
          <SaveProgressPrompt
            nextPath={`${pathname}?${sp?.toString() || ''}`}
            title="Create a free account to save this mock exam"
            body="You can finish this mock for free right now. Create a free account if you want your score and progress saved so you can pick back up later."
          />
        </div>
      ) : null}

      {flow === 'mastery' &&
      scope === 'mini' &&
      autoStart &&
      hasExplicitMini ? (
        <div
          data-tour="mock-info"
          className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-5"
        >
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
            How mock exam works
          </div>
          <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/70">
            This is your{' '}
            <span className="font-semibold text-white">post-test</span>. There
            is no instant feedback while you answer.
          </div>
          <div className="mt-2 text-sm text-white/60">
            Use this after{' '}
            <span className="font-semibold text-white">Practice Test</span> and{' '}
            <span className="font-semibold text-white">Flashcards</span> to
            measure how much you improved.
          </div>
        </div>
      ) : null}

      <div
        data-tour="mock-question"
        ref={examAnchorRef}
        className="mt-4 rtt-card rounded-2xl p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3 text-xs text-white/55">
          <div className="w-full md:w-auto">
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10 md:w-64">
              <div
                className="h-full rounded-full bg-yellow-400 transition-all"
                style={{
                  width: `${
                    total
                      ? Math.min(
                          100,
                          Math.round(
                            (Object.keys(answers).length / total) * 100,
                          ),
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
            <div className="mt-3 space-y-1">
              <div>
                Progress: {Object.keys(answers).length} / {total}
              </div>
              {/* <div>Correct: {Object.keys(answers).length - missed.size}</div> */}
              {/* <div>Missed: {missed.size}</div> */}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-3 py-2 text-sm font-semibold text-yellow-300">
              Time Remaining: {formatTime(timeLeft)}
            </div>
            {/* <div>Keyboard: A-D • Enter = submit</div> */}
          </div>
        </div>

        <div className="mt-6 whitespace-pre-wrap text-sm text-white/85">
          {stem}
        </div>

        <div className="mt-4 grid gap-2">
          {choices.map((c) => (
            <button
              key={c.key}
              onClick={() => setSelected(c.key)}
              className={[
                'w-full rounded-2xl px-4 py-3 text-left text-sm transition',
                selected === c.key
                  ? 'bg-white/15 ring-1 ring-white/25'
                  : 'bg-white/5 hover:bg-white/10',
              ].join(' ')}
            >
              <span className="mr-2 inline-block w-5 text-white/70">
                {c.key}.
              </span>
              <span className="text-white/90">{c.text}</span>
            </button>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => idx > 0 && setIdx((n) => n - 1)}
              className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 disabled:opacity-50"
              disabled={idx === 0}
            >
              Back
            </button>
            <button
              onClick={pauseAndSave}
              className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
            >
              Save & Exit
            </button>
          </div>

          <button
            onClick={submit}
            disabled={selected == null}
            className="cursor-pointer rounded-2xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:brightness-95 disabled:opacity-60"
          >
            Submit →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MockExamPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl text-sm text-white/70">Loading…</div>
      }
    >
      <MockExamPageInner />
    </Suspense>
  );
}
