import fs from "node:fs/promises";
import path from "node:path";

const STORE_PATH = path.join(process.cwd(), "data", "validator-ce-store.json");

type Attempt = { created_at: string; score_pct: number; passed: boolean };
type Cert = { cert_number: string; issued_at: string; score_pct: number };

type Store = {
  attempts: Record<string, number>;
  lastAttempt: Record<string, Attempt>;
  certificates: Record<string, Cert>;
};


function keyFor(courseId: string, reviewerUser: string) {
  return `${reviewerUser}::${courseId}`;
}
async function readStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return {
      attempts: parsed.attempts || {},
      lastAttempt: parsed.lastAttempt || {},
      certificates: parsed.certificates || {},
    };
  } catch {
    return { attempts: {}, lastAttempt: {}, certificates: {} };
  }
}

async function writeStore(s: Store) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(s, null, 2), "utf8");
}

export async function getValidatorSummary(courseId: string, reviewerUser: string) {
  const s = await readStore();
  const k = keyFor(courseId, reviewerUser);
  const attemptsUsed = s.attempts[k] || 0;
  const maxAttempts = 3;
  return {
    attemptsUsed,
    attemptsRemaining: Math.max(0, maxAttempts - attemptsUsed),
    maxAttempts,
    lastAttempt: s.lastAttempt[k] || null,
    certificate: s.certificates[k] || null,
  };
}

export async function recordValidatorAttempt(
  courseId: string,
  reviewerUser: string,
  score_pct: number,
  passed: boolean
) {
  const s = await readStore();
  const k = keyFor(courseId, reviewerUser);
  s.attempts[k] = (s.attempts[k] || 0) + 1;
  s.lastAttempt[k] = { created_at: new Date().toISOString(), score_pct, passed };
  await writeStore(s);
  return s.attempts[k];
}

export async function ensureValidatorCertificate(
  courseId: string,
  reviewerUser: string,
  score_pct: number
) {
  const s = await readStore();
  const k = keyFor(courseId, reviewerUser);

  if (!s.certificates[k]) {
    const dateStamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
    const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
    s.certificates[k] = {
      cert_number: `RTT-${courseId.toUpperCase()}-${dateStamp}-${rand}`,
      issued_at: new Date().toISOString(),
      score_pct,
    };
    await writeStore(s);
  }

  return s.certificates[k];
}
