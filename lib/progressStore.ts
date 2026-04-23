import supabase from '@/lib/supabaseClient';
import type { ChoiceLetter } from '@/lib/normalizeChoices';

let cachedUserId: string | null = null;
let userIdLoaded = false;
let userIdPromise: Promise<string | null> | null = null;
let hydrationPromise: Promise<void> | null = null;
let hydratedForUserId: string | null = null;
let authSyncInitialized = false;

const ATTEMPTS_KEY = 'rtt_mock_attempts';
const EXAM_DATE_KEY = 'rtt_exam_date';

function progressKey(setId: string) {
  return `rtt_progress_${(setId || 'qbank1').toLowerCase()}`;
}

function flashSessionKey(scopeKey: string) {
  return `rtt_flash_session_${String(scopeKey || 'qbank1').toLowerCase()}`;
}

function practiceSessionKey(scopeKey: string) {
  return `rtt_practice_session_${String(scopeKey || 'qbank1').toLowerCase()}`;
}

function masteryKey(setId: string) {
  return `rtt_bank_mastery_${(setId || 'qbank1').toLowerCase()}`;
}

function masteryStepKey(setId: string, miniId: number) {
  return `rtt_mastery_step_${setId}_${miniId}`;
}

function fullQbankKey(setId: string) {
  return `rtt_full_qbank_${(setId || 'qbank1').toLowerCase()}`;
}

function fullQbankStepKey(setId: string) {
  return `rtt_full_qbank_step_${(setId || 'qbank1').toLowerCase()}`;
}

function ensureAuthSync() {
  if (typeof window === 'undefined') return;
  if (authSyncInitialized) return;
  authSyncInitialized = true;

  supabase.auth.onAuthStateChange((_event, session) => {
    const nextUserId = session?.user?.id ?? null;
    cachedUserId = nextUserId;
    userIdLoaded = true;
    userIdPromise = null;
    hydrationPromise = null;
    hydratedForUserId = null;

    if (nextUserId) {
      window.setTimeout(() => {
        void hydrateProgressFromDBOnce();
      }, 0);
    }
  });
}

function hasAuthToken() {
  if (typeof window === 'undefined') return false;
  try {
    const hasIn = (store: Storage) =>
      Object.keys(store).some(
        (key) => /^sb-.*-auth-token$/i.test(key) && !!store.getItem(key),
      );
    return hasIn(window.localStorage) || hasIn(window.sessionStorage);
  } catch {
    return false;
  }
}

export function getClientStorage() {
  if (typeof window === 'undefined') return null;
  try {
    return hasAuthToken() ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

function parseStoredValue(key: string, raw: string): unknown {
  if (key === EXAM_DATE_KEY) return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function encodeStoredValue(key: string, value: unknown): string {
  if (key === EXAM_DATE_KEY && typeof value === 'string') return value;
  return JSON.stringify(value);
}

function getGuestRttEntries(): Array<{ key: string; value: unknown }> {
  if (typeof window === 'undefined') return [];

  const entries: Array<{ key: string; value: unknown }> = [];
  const seen = new Set<string>();

  try {
    for (const key of Object.keys(window.sessionStorage)) {
      if (!key.startsWith('rtt_')) continue;
      const raw = window.sessionStorage.getItem(key);
      if (raw == null) continue;
      entries.push({ key, value: parseStoredValue(key, raw) });
      seen.add(key);
    }
  } catch {}

  try {
    for (const key of Object.keys(window.localStorage)) {
      if (!key.startsWith('rtt_')) continue;
      if (seen.has(key)) continue;
      const raw = window.localStorage.getItem(key);
      if (raw == null) continue;
      entries.push({ key, value: parseStoredValue(key, raw) });
    }
  } catch {}

  return entries;
}

function getCachedUserId(): Promise<string | null> {
  ensureAuthSync();

  if (userIdLoaded) return Promise.resolve(cachedUserId);
  if (userIdPromise) return userIdPromise;

  userIdPromise = supabase.auth
    .getSession()
    .then(({ data }) => {
      cachedUserId = data.session?.user?.id ?? null;
      userIdLoaded = true;
      return cachedUserId;
    })
    .finally(() => {
      userIdPromise = null;
    });

  return userIdPromise;
}

function saveToDB(key: string, value: unknown) {
  void getCachedUserId().then((userId) => {
    if (!userId) return;

    return supabase.from('user_progress').upsert({
      user_id: userId,
      key,
      value,
      updated_at: new Date().toISOString(),
    });
  });
}

function removeFromDB(key: string) {
  void getCachedUserId().then((userId) => {
    if (!userId) return;

    return supabase
      .from('user_progress')
      .delete()
      .eq('user_id', userId)
      .eq('key', key);
  });
}

export function hydrateProgressFromDBOnce(): Promise<void> {
  ensureAuthSync();

  if (typeof window === 'undefined') return Promise.resolve();
  if (hydrationPromise) return hydrationPromise;

  hydrationPromise = getCachedUserId()
    .then(async (userId) => {
      if (!userId) return;
      if (hydratedForUserId === userId) return;

      const storage = getClientStorage();
      if (!storage) return;

      const { data, error } = await supabase
        .from('user_progress')
        .select('key,value')
        .eq('user_id', userId);

      if (error || !data) return;

      const dbMap = new Map<string, unknown>();
      for (const row of data) {
        if (!row?.key) continue;
        dbMap.set(row.key, row.value);
      }

      // 🔥 decide source of truth
      const dbHasProgress = dbMap.size > 0;

      if (!dbHasProgress) {
        // FIRST TIME USER → import guest into DB
        const guestEntries = getGuestRttEntries();

        if (guestEntries.length > 0) {
          await Promise.all(
            guestEntries.map(({ key, value }) =>
              supabase.from('user_progress').upsert({
                user_id: userId,
                key,
                value,
                updated_at: new Date().toISOString(),
              }),
            ),
          );

          // reload DB after import
          const { data: newData } = await supabase
            .from('user_progress')
            .select('key,value')
            .eq('user_id', userId);

          dbMap.clear();
          for (const row of newData || []) {
            if (row?.key) dbMap.set(row.key, row.value);
          }
        }
      }

      // 🚫 DO NOT merge guest if DB already exists

      for (const [key, value] of dbMap.entries()) {
        storage.setItem(key, encodeStoredValue(key, value));
      }

      hydratedForUserId = userId;
      window.dispatchEvent(new CustomEvent('rtt-progress-updated'));
    })
    .finally(() => {
      hydrationPromise = null;
    });

  return hydrationPromise;
}

function removeKeyFromBoth(key: string) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch {}
  try {
    window.sessionStorage.removeItem(key);
  } catch {}
  removeFromDB(key);
}

ensureAuthSync();

export type QuestionProgress = {
  questionId: string;
  category?: string;
  mockMissed: boolean;
  practiceMissed: boolean;
  flashcardCleared: boolean;
  practiceCleared: boolean;
  updatedAt?: string;
};

export type ProgressMap = Record<string, QuestionProgress>;

export type ExamAttempt = {
  attempt: number;
  label: string;
  score: number;
  correct: number;
  total: number;
  dateISO: string;
  registryReady?: boolean;
  categoryBreakdown?: Record<string, number>;
  bankId?: number;
  category?: string;
  type?: 'practice' | 'mini' | 'full' | 'category';
  miniId?: number;
  questionsTaken?: number;
  timeSpentSeconds?: number;
};

export type FlashSession = {
  setId: string;
  mode: 'all' | 'missed';
  cat: string;
  mini?: number | 'all' | 'full';
  cursor: number;
  deck: any[];
  mastered: any[];
  savedAt: number;
};

export type PracticeSession = {
  setId: string;
  mode: 'all' | 'missed';
  cat: string;
  mini: number | 'all';
  queueIds: string[];
  currentId: string | null;

  // 🔥 ADD THESE
  picked?: ChoiceLetter | null;
  revealed?: boolean;

  answeredCount: number;
  correctCount: number;
  missedCount: number;
  totalCount: number;
  savedAt: number;
};

export function clearRttClientState() {
  if (typeof window === 'undefined') return;
  try {
    const shouldClear = (key: string) =>
      key.startsWith('rtt_') ||
      key.startsWith('sb-') ||
      key.startsWith('supabase.');

    for (const key of Object.keys(window.localStorage)) {
      if (shouldClear(key)) window.localStorage.removeItem(key);
    }

    for (const key of Object.keys(window.sessionStorage)) {
      if (shouldClear(key)) window.sessionStorage.removeItem(key);
    }

    window.dispatchEvent(new CustomEvent('rtt-progress-updated'));
  } catch {}
}

export function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  try {
    const active = getClientStorage();
    const raw =
      active?.getItem(key) ??
      window.localStorage.getItem(key) ??
      window.sessionStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try {
    const active = getClientStorage();
    active?.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('rtt-progress-updated'));
    saveToDB(key, value);
  } catch {}
}

export function readAttempts(): ExamAttempt[] {
  const parsed = readJson<any[]>(ATTEMPTS_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

export function appendAttempt(
  attempt: Omit<
    ExamAttempt,
    'attempt' | 'label' | 'dateISO' | 'registryReady'
  > & { dateISO?: string; label?: string },
) {
  const prev = readAttempts();
  const next: ExamAttempt = {
    attempt: prev.length + 1,
    label:
      attempt.label ||
      (prev.length === 0 ? 'Baseline Mock' : `Retest ${prev.length}`),
    dateISO: attempt.dateISO || new Date().toISOString(),
    registryReady: attempt.score >= 85,
    ...attempt,
  };
  writeJson(ATTEMPTS_KEY, [...prev, next]);
}

export function readExamDate(): string {
  if (typeof window === 'undefined') return '';

  try {
    return getClientStorage()?.getItem(EXAM_DATE_KEY) || '';
  } catch {
    return '';
  }
}

export function writeExamDate(value: string) {
  if (typeof window === 'undefined') return;
  try {
    const active = getClientStorage();
    if (value) {
      active?.setItem(EXAM_DATE_KEY, value);
      saveToDB(EXAM_DATE_KEY, value);
    } else {
      removeKeyFromBoth(EXAM_DATE_KEY);
    }
    window.dispatchEvent(new CustomEvent('rtt-progress-updated'));
  } catch {}
}

export function readProgress(setId: string): ProgressMap {
  const parsed = readJson<ProgressMap>(progressKey(setId), {});
  return parsed && typeof parsed === 'object' ? parsed : {};
}

export function writeProgress(setId: string, value: ProgressMap) {
  writeJson(progressKey(setId), value);
}

export function syncMockResult(
  setId: string,
  questions: Array<{ id: string; category?: string }>,
  missedIds: string[],
) {
  const current = readProgress(setId);
  const missed = new Set(missedIds);
  const next: ProgressMap = { ...current };

  for (const q of questions) {
    const prev = current[q.id] || {
      questionId: q.id,
      category: q.category,
      mockMissed: false,
      practiceMissed: false,
      flashcardCleared: true,
      practiceCleared: true,
    };
    const isMissed = missed.has(q.id);
    next[q.id] = {
      questionId: q.id,
      category: q.category || prev.category,
      mockMissed: isMissed,
      practiceMissed: prev.practiceMissed,
      flashcardCleared: isMissed ? false : prev.flashcardCleared,
      practiceCleared: isMissed ? false : prev.practiceCleared,
      updatedAt: new Date().toISOString(),
    };
  }

  writeProgress(setId, next);
  writeJson(`rtt_mock_wrong_ids_${setId}`, Array.from(missed));
}

export function markFlashcardCleared(setId: string, qid: string) {
  const current = readProgress(setId);
  const prev = current[qid];
  if (!prev) return;
  current[qid] = {
    ...prev,
    flashcardCleared: true,
    updatedAt: new Date().toISOString(),
  };
  writeProgress(setId, current);
}

export function markPracticeCleared(setId: string, qid: string) {
  const current = readProgress(setId);
  const prev = current[qid];
  if (!prev) return;
  current[qid] = {
    ...prev,
    practiceCleared: true,
    updatedAt: new Date().toISOString(),
  };
  writeProgress(setId, current);
}

export function markWrongFromPractice(
  setId: string,
  qid: string,
  category?: string,
) {
  const current = readProgress(setId);
  const prev = current[qid] || {
    questionId: qid,
    category,
    mockMissed: false,
    practiceMissed: false,
    flashcardCleared: false,
    practiceCleared: false,
  };

  current[qid] = {
    ...prev,
    questionId: qid,
    category: category || prev.category,
    mockMissed: prev.mockMissed ?? false,
    practiceMissed: true,
    flashcardCleared: false,
    practiceCleared: false,
    updatedAt: new Date().toISOString(),
  };

  writeProgress(setId, current);
}

export function getFlashcardRemainingIds(setId: string, cat = 'all'): string[] {
  const entries = Object.values(readProgress(setId)).filter(
    (item) => item.practiceMissed && !item.flashcardCleared,
  );
  return entries
    .filter(
      (item) =>
        cat === 'all' || String(item.category || '').toLowerCase() === cat,
    )
    .map((item) => item.questionId);
}

export function getPracticeRemainingIds(setId: string, cat = 'all'): string[] {
  const entries = Object.values(readProgress(setId)).filter(
    (item) => item.practiceMissed && !item.practiceCleared,
  );
  return entries
    .filter(
      (item) =>
        cat === 'all' || String(item.category || '').toLowerCase() === cat,
    )
    .map((item) => item.questionId);
}

export function getMasterySummary(setId?: string) {
  const attempts = readAttempts();
  const ids = setId
    ? [setId]
    : ['qbank1', 'qbank2', 'qbank3', 'qbank4', 'qbank5'];
  let flashRemaining = 0;
  let practiceRemaining = 0;
  let totalMissed = 0;

  for (const id of ids) {
    const values = Object.values(readProgress(id));
    totalMissed += values.filter((v) => v.practiceMissed).length;
    flashRemaining += values.filter(
      (v) => v.practiceMissed && !v.flashcardCleared,
    ).length;
    practiceRemaining += values.filter(
      (v) => v.practiceMissed && !v.practiceCleared,
    ).length;
  }

  return {
    attempts,
    hasBaseline: attempts.length > 0,
    totalMissed,
    flashRemaining,
    practiceRemaining,
  };
}

export function readFlashSession(scopeKey: string): FlashSession | null {
  return readJson<FlashSession | null>(flashSessionKey(scopeKey), null);
}

export function saveFlashSession(scopeKey: string, value: FlashSession) {
  writeJson(flashSessionKey(scopeKey), value);
}

export function clearFlashSession(scopeKey: string) {
  if (typeof window === 'undefined') return;
  removeKeyFromBoth(flashSessionKey(scopeKey));
  window.dispatchEvent(new CustomEvent('rtt-progress-updated'));
}

export function readPracticeSession(scopeKey: string): PracticeSession | null {
  return readJson<PracticeSession | null>(practiceSessionKey(scopeKey), null);
}

export function savePracticeSession(scopeKey: string, value: PracticeSession) {
  writeJson(practiceSessionKey(scopeKey), value);
}

export function clearPracticeSession(scopeKey: string) {
  if (typeof window === 'undefined') return;
  removeKeyFromBoth(practiceSessionKey(scopeKey));
}

export type MiniMockStatus = {
  miniId: number;
  bestScore: number;
  lastScore: number;
  attempts: number;
  completed: boolean;
  completedAt?: string;
};

export type BankMastery = {
  setId: string;
  miniStatus: Record<string, MiniMockStatus>;
};

export function readBankMastery(setId: string): BankMastery {
  return readJson<BankMastery>(masteryKey(setId), {
    setId,
    miniStatus: {},
  });
}

export function recordMiniMockResult(
  setId: string,
  miniId: number,
  score: number,
) {
  const current = readBankMastery(setId);
  const prev = current.miniStatus[String(miniId)] || {
    miniId,
    bestScore: 0,
    lastScore: 0,
    attempts: 0,
    completed: false,
  };

  const next: MiniMockStatus = {
    miniId,
    attempts: prev.attempts + 1,
    lastScore: score,
    bestScore: Math.max(prev.bestScore, score),
    completed: true,
    completedAt: prev.completedAt || new Date().toISOString(),
  };

  writeJson(masteryKey(setId), {
    setId,
    miniStatus: { ...current.miniStatus, [String(miniId)]: next },
  });
}

export function recordFullMockResult(setId: string, score: number) {
  const current = readFullQbankMastery(setId);

  const next = {
    ...current,
    exam: {
      completed: true,
      lastScore: score,
      attempts: (current.exam?.attempts || 0) + 1,
    },
  };

  writeJson(fullQbankKey(setId), next);

  // 🔥 clear step so it doesn't say "in progress"
  removeKeyFromBoth(fullQbankStepKey(setId));

  window.dispatchEvent(new CustomEvent('rtt-progress-updated'));
}

export function getBankMasterySummary(setId: string) {
  const current = readBankMastery(setId);
  const values = Object.values(current.miniStatus);
  const completed = values.filter((v) => v.completed).length;

  const currentMini = (() => {
    for (let i = 1; i <= 10; i += 1) {
      if (!current.miniStatus[String(i)]?.completed) return i;
    }
    return 10;
  })();

  return {
    setId,
    completedMiniMocks: completed,
    totalMiniMocks: 10,
    currentMini,
    bankMastered: completed >= 10,
    miniStatus: current.miniStatus,
  };
}

export function getBanksMasteredCount() {
    return ['qbank1', 'qbank2', 'qbank3', 'qbank4', 'qbank5'].filter(
      (id) => getBankMasterySummary(id).bankMastered,
    ).length;
}

export function estimatePassProbability() {
  const banksMastered = getBanksMasteredCount();
  const attempts = readAttempts().slice(-6);

  if (!attempts.length || banksMastered === 0) {
    return {
      probability: null as number | null,
      readiness: 'Not enough data yet',
      banksMastered,
    };
  }

  const caps = [0, 70, 85, 95];
  const floor = [0, 55, 70, 85];
  const avgRecent =
    attempts.reduce((sum, item) => sum + Number(item.score || 0), 0) /
    attempts.length;

  const values = attempts.map((item) => Number(item.score || 0));
  const mean = avgRecent || 0;
  const variance = values.length
    ? values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length
    : 0;

  const consistency = Math.max(0, 1 - Math.min(variance ** 0.5 / 20, 1));
  const perfComponent = Math.max(0, Math.min(1, (avgRecent - 50) / 45));
  const raw =
    floor[banksMastered] +
    (caps[banksMastered] - floor[banksMastered]) *
      (0.7 * perfComponent + 0.3 * consistency);

  const probability = Math.max(
    floor[banksMastered],
    Math.min(caps[banksMastered], Math.round(raw)),
  );

  const readiness =
    probability >= 93
      ? 'Strong Pass Range'
      : probability >= 85
        ? 'Test Ready'
        : probability >= 75
          ? 'Near Ready'
          : probability >= 65
            ? 'Developing'
            : 'Not Ready Yet';

  return { probability, readiness, banksMastered };
}

export function getCategoryCumulative() {
  const wanted = ['Patient Care', 'Safety', 'Image Production', 'Procedures'];
  const attempts = readAttempts();

  const latest: Record<string, number | null> = {
    'Patient Care': null,
    Safety: null,
    'Image Production': null,
    Procedures: null,
  };

  for (const category of wanted) {
    const miniValues = attempts
      .filter(
        (item) =>
          item.type === 'mini' &&
          item.categoryBreakdown &&
          typeof item.categoryBreakdown[category] === 'number',
      )
      .map((item) => Number(item.categoryBreakdown?.[category]));

    if (miniValues.length > 0) {
      latest[category] = Math.round(
        miniValues.reduce((a, b) => a + b, 0) / miniValues.length,
      );
      continue;
    }

    const hit = [...attempts]
      .reverse()
      .find((item) => item.type === 'category' && item.category === category);

    latest[category] = hit ? Number(hit.score || 0) : null;
  }

  const values = wanted
    .map((k) => latest[k])
    .filter((v): v is number => typeof v === 'number');

  return {
    latest,
    complete: values.length === wanted.length,
    cumulative:
      values.length === wanted.length
        ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
        : null,
  };
}

export function saveMasteryMiniStep(
  setId: string,
  miniId: number,
  step: 'practice' | 'flashcards' | 'exam',
) {
  writeJson(masteryStepKey(setId, miniId), step);
}

export function readMasteryMiniStep(
  setId: string,
  miniId: number,
): 'practice' | 'flashcards' | 'exam' | null {
  const raw = readJson<string | null>(masteryStepKey(setId, miniId), null);
  return raw === 'practice' || raw === 'flashcards' || raw === 'exam'
    ? raw
    : null;
}

export function clearMasteryMiniStep(setId: string, miniId: number) {
  if (typeof window === 'undefined') return;
  removeKeyFromBoth(masteryStepKey(setId, miniId));
  window.dispatchEvent(new CustomEvent('rtt-progress-updated'));
}

export function resetMiniMockFull(setId: string, miniId: number) {
  if (typeof window === 'undefined') return;

  const stepKey = `rtt_mastery_step_${setId}_${miniId}`;

  for (const store of [window.localStorage, window.sessionStorage]) {
    try {
      const keys = Object.keys(store);

      for (const key of keys) {
        const isPracticeKey =
          key.startsWith('rtt_practice_session_') &&
          key.includes(setId) &&
          key.includes(`__${miniId}`);

        const isFlashKey =
          key.startsWith('rtt_flash_session_') &&
          key.includes(setId) &&
          key.includes(`__${miniId}`);

        const isMockKey =
          key.startsWith('rtt_mock_session_') &&
          key.includes(setId) &&
          (key.includes(`_mini_${miniId}_`) || key.includes(`_${miniId}_`));

        const isMockResultsKey =
          key.startsWith('rtt_mock_results_') &&
          key.includes(setId) &&
          (key.includes(`_mini_${miniId}_`) || key.includes(`_${miniId}_`));

        if (isPracticeKey || isFlashKey || isMockKey || isMockResultsKey) {
          store.removeItem(key);
          removeFromDB(key);
        }
      }

      store.removeItem(stepKey);
      removeFromDB(stepKey);
    } catch {}
  }

  const mastery = readBankMastery(setId);

  if (mastery.miniStatus[String(miniId)]) {
    delete mastery.miniStatus[String(miniId)];
    writeJson(masteryKey(setId), mastery);
  }

  window.dispatchEvent(new CustomEvent('rtt-progress-updated'));
}

type FullQbankStep = 'practice' | 'flashcards' | 'exam';

type FullQbankStatus = {
  completed: boolean;
  completedAt?: string;
  bestScore?: number;
  lastScore?: number;
  attempts?: number;
};

type FullQbankMastery = {
  setId: string;
  practice: FullQbankStatus;
  flashcards: FullQbankStatus;
  exam: FullQbankStatus;
};

export function readFullQbankMastery(setId: string): FullQbankMastery {
  return readJson<FullQbankMastery>(fullQbankKey(setId), {
    setId,
    practice: { completed: false },
    flashcards: { completed: false },
    exam: { completed: false },
  });
}

export function saveFullQbankStep(setId: string, step: FullQbankStep) {
  writeJson(fullQbankStepKey(setId), step);
}

export function readFullQbankStep(setId: string): FullQbankStep | null {
  const raw = readJson<string | null>(fullQbankStepKey(setId), null);
  return raw === 'practice' || raw === 'flashcards' || raw === 'exam'
    ? raw
    : null;
}

export function clearFullQbankStep(setId: string) {
  if (typeof window === 'undefined') return;
  removeKeyFromBoth(fullQbankStepKey(setId));
  window.dispatchEvent(new CustomEvent('rtt-progress-updated'));
}

export function recordFullQbankPracticeDone(setId: string) {
  const current = readFullQbankMastery(setId);
  writeJson(fullQbankKey(setId), {
    ...current,
    practice: {
      ...current.practice,
      completed: true,
      completedAt: current.practice.completedAt || new Date().toISOString(),
    },
  });
}

export function recordFullQbankFlashcardsDone(setId: string) {
  const current = readFullQbankMastery(setId);
  writeJson(fullQbankKey(setId), {
    ...current,
    flashcards: {
      ...current.flashcards,
      completed: true,
      completedAt: current.flashcards.completedAt || new Date().toISOString(),
    },
  });
}

export function recordFullQbankExamResult(setId: string, score: number) {
  const current = readFullQbankMastery(setId);
  const prevAttempts = current.exam.attempts || 0;

  writeJson(fullQbankKey(setId), {
    ...current,
    exam: {
      completed: true,
      completedAt: current.exam.completedAt || new Date().toISOString(),
      attempts: prevAttempts + 1,
      lastScore: score,
      bestScore: Math.max(current.exam.bestScore || 0, score),
    },
  });
}

export function resetFullQbank(setId: string) {
  if (typeof window === 'undefined') return;

  const normalized = (setId || 'qbank1').toLowerCase();

  // 🔥 Remove full mastery + step
  removeKeyFromBoth(fullQbankKey(normalized));
  removeKeyFromBoth(fullQbankStepKey(normalized));

  // 🔥 Remove FULL practice session
  removeKeyFromBoth(practiceSessionKey(`mastery__${normalized}__FULL`));

  // 🔥 Remove FULL flashcards session
  removeKeyFromBoth(flashSessionKey(`${normalized}__missed__all__full`));

  // 🔥 Remove FULL mock session + results
  removeKeyFromBoth(`rtt_mock_session_mastery_${normalized}_full_0_all`);
  removeKeyFromBoth(`rtt_mock_results_mastery_${normalized}_full_0_all`);

  // 🔥 SAFETY: wipe anything related to FULL
  for (const store of [window.localStorage, window.sessionStorage]) {
    try {
      for (const key of Object.keys(store)) {
        if (key.includes(normalized) && key.includes('full')) {
          store.removeItem(key);
          removeFromDB(key);
        }
      }
    } catch {}
  }

  window.dispatchEvent(new CustomEvent('rtt-progress-updated'));
}

function miniMockChallengeUnlockKey(setId: string) {
  return `rtt_mini_mock_challenge_unlocked_${(setId || 'qbank1').toLowerCase()}`;
}

export function hasMiniMockChallengeUnlocked(setId: string) {
  return readJson<boolean>(miniMockChallengeUnlockKey(setId), false);
}

export function unlockMiniMockChallenge(setId: string) {
  writeJson(miniMockChallengeUnlockKey(setId), true);
}

export function clearMiniMockChallengeUnlock(setId: string) {
  if (typeof window === 'undefined') return;
  removeKeyFromBoth(miniMockChallengeUnlockKey(setId));
  window.dispatchEvent(new CustomEvent('rtt-progress-updated'));
}

export function getMiniMockChallengeStats(setId: string) {
  const bank = readBankMastery(setId);
  const alreadyUnlocked = hasMiniMockChallengeUnlocked(setId);

  const firstFive = [1, 2, 3, 4, 5];

  let completedNow = 0;
  let totalScoreNow = 0;

  for (const id of firstFive) {
    const mock = bank.miniStatus[String(id)];

    if (mock && mock.bestScore != null) {
      completedNow++;
      totalScoreNow += mock.bestScore;
    }
  }

  const avgNow =
    completedNow > 0 ? Math.round(totalScoreNow / completedNow) : 0;
  const qualifiesNow = completedNow >= 5 && avgNow >= 90;

  if (qualifiesNow && !alreadyUnlocked) {
    unlockMiniMockChallenge(setId);
  }

  const unlocked = alreadyUnlocked || qualifiesNow;

  return {
    completed: unlocked ? 5 : completedNow,
    avg: unlocked ? Math.max(avgNow, 90) : avgNow,
    qualifies: unlocked,
    unlocked,
  };
}
