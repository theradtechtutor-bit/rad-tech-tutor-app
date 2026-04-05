'use client';

export const CE_MAX_ATTEMPTS_DEFAULT = 3;

type Completion = {
  courseId: string;
  passed: boolean;
  scorePct: number;
  finishedAt: string;
  perQuestionCorrect?: Record<string, boolean>;
  maxAttempts: number;
  attemptsUsed: number;
};

function getAnonKey(): string {
  try {
    const k = localStorage.getItem('ceAnonKey');
    if (k) return k;
    const nk = (crypto as any)?.randomUUID ? (crypto as any).randomUUID() : String(Date.now());
    localStorage.setItem('ceAnonKey', nk);
    return nk;
  } catch {
    return 'anon';
  }
}

function keyFor(courseId: string, userKey?: string | null) {
  const u = userKey && String(userKey).trim() ? String(userKey).trim() : getAnonKey();
  return `ceCompletion:${u}:${courseId}`;
}

export function getCompletion(courseId: string, userKey?: string | null): Completion | null {
  try {
    const raw = localStorage.getItem(keyFor(courseId, userKey));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveCompletion(courseId: string, comp: Completion, userKey?: string | null) {
  try {
    localStorage.setItem(keyFor(courseId, userKey), JSON.stringify(comp));
  } catch {}
}

export function recordAttempt(input: {
  courseId: string;
  passed: boolean;
  scorePct: number;
  finishedAt: string;
  perQuestionCorrect?: Record<string, boolean>;
  maxAttempts?: number;
  userKey?: string | null;
}) {
  const maxAttempts = input.maxAttempts ?? CE_MAX_ATTEMPTS_DEFAULT;
  const prev = getCompletion(input.courseId, input.userKey);

  const attemptsUsed = (prev?.attemptsUsed ?? 0) + 1;

  const next: Completion = {
    courseId: input.courseId,
    passed: Boolean(input.passed),
    scorePct: input.scorePct,
    finishedAt: input.finishedAt,
    perQuestionCorrect: input.perQuestionCorrect,
    maxAttempts,
    attemptsUsed,
  };

  saveCompletion(input.courseId, next, input.userKey);
}

export function attemptsRemaining(courseId: string, userKey?: string | null) {
  const comp = getCompletion(courseId, userKey);
  const maxAttempts = comp?.maxAttempts ?? CE_MAX_ATTEMPTS_DEFAULT;
  const used = comp?.attemptsUsed ?? 0;
  if (comp?.passed) return maxAttempts;
  return Math.max(0, maxAttempts - used);
}
