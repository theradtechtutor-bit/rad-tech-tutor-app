type Attempt = {
  bankId?: number;       // 1..3
  score?: number;        // 0..100
  finishedAt?: string;   // ISO
  category?: string;     // full exam or specific category
};

const ATTEMPTS_KEY = 'rtt_mock_attempts';

function readAttempts(): Attempt[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(ATTEMPTS_KEY) || window.sessionStorage.getItem(ATTEMPTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function lastScoreForBank(bankId: number): number | null {
  const attempts = readAttempts().filter(a => (a.bankId ?? 1) === bankId);

  attempts.sort((a, b) => {
    const da = a.finishedAt ? Date.parse(a.finishedAt) : 0;
    const db = b.finishedAt ? Date.parse(b.finishedAt) : 0;
    return db - da;
  });

  const s = attempts[0]?.score;
  return typeof s === 'number' ? s : null;
}

export function averageLastScores(bankIds: number[]): number | null {
  const scores = bankIds
    .map(id => lastScoreForBank(id))
    .filter((n): n is number => typeof n === 'number');

  if (!scores.length) return null;

  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return Math.round(avg);
}
