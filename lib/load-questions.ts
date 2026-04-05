import type { Question } from './questions';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

function stripGarbage(text: string): string {
  return String(text || '')
    .replace(/My ARRT Challenge Test\s*\d+\s*Radiography Exam Prep Page\s*\d+\s*\|\s*Original content\s*—\s*not for resale/gi, '')
    .replace(/My ARRT Challenge Test\s*\d+\s*Radiography Exam Prep Page\s*\d+\s*\|\s*Original content\s*\u2014\s*not for resale/gi, '')
    .replace(/My ARRT Challenge Test\s*\d+\s*Radiography Exam Prep Page\s*\d+\s*\|\s*Original content\s*[^\n\r]*/gi, '')
    .replace(/PROCEDURES Questions\s*\d+[–-]\d+/gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([?.!,;:])/g, '$1')
    .trim();
}

function sanitizeQuestion(q: any): Question {
  const next: any = { ...q };
  for (const key of ['question', 'stem', 'prompt', 'rationale', 'whyCorrect', 'correctText', 'correctAnswerText']) {
    if (typeof next[key] === 'string') next[key] = stripGarbage(next[key]);
  }
  if (next.explanation) {
    if (typeof next.explanation === 'string') next.explanation = stripGarbage(next.explanation);
    else if (typeof next.explanation === 'object') {
      next.explanation = Object.fromEntries(
        Object.entries(next.explanation).map(([k, v]) => [k, typeof v === 'string' ? stripGarbage(v) : v])
      );
    }
  }
  if (Array.isArray(next.choices)) {
    next.choices = next.choices.map((choice: any) => {
      if (typeof choice === 'string') return stripGarbage(choice);
      if (choice && typeof choice === 'object') {
        const out = { ...choice };
        for (const k of ['text', 'label', 'value']) if (typeof out[k] === 'string') out[k] = stripGarbage(out[k]);
        return out;
      }
      return choice;
    });
  } else if (next.choices && typeof next.choices === 'object') {
    next.choices = Object.fromEntries(
      Object.entries(next.choices).map(([k, v]) => [k, typeof v === 'string' ? stripGarbage(v) : v])
    );
  }
  return next as Question;
}

function seededNumber(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function reshuffleChoices(q: Question): Question {
  const raw = (q as any).choices;
  if (!raw || Array.isArray(raw) || typeof raw !== 'object') return q;
  const entries = Object.entries(raw).filter(([k]) => /^[A-D]$/i.test(k));
  if (entries.length !== 4) return q;

  const correctKey = String((q as any).correctAnswer || (q as any).correct || (q as any).answer || '').trim().toUpperCase();
  if (!correctKey || !entries.some(([k]) => k.toUpperCase() === correctKey)) return q;

  const letters = ['A', 'B', 'C', 'D'];
  const seed = seededNumber(String((q as any).id || (q as any).question || 'q'));
  const rotated = entries
    .map((item, idx) => ({ item, order: (seed + idx * 17) % 1000 }))
    .sort((a, b) => a.order - b.order)
    .map((x) => x.item);

  const newChoices: Record<string, any> = {};
  let newCorrect = correctKey;
  rotated.forEach(([oldKey, value], idx) => {
    const newKey = letters[idx];
    newChoices[newKey] = value;
    if (oldKey.toUpperCase() === correctKey) newCorrect = newKey;
  });

  return {
    ...(q as any),
    choices: newChoices,
    correctAnswer: newCorrect,
    correct: newCorrect,
    answer: newCorrect,
    correctKey: newCorrect,
  } as Question;
}

function normalizeQuestionsPayload(data: any): Question[] {
  const arr =
    Array.isArray(data)
      ? data
      : Array.isArray(data?.questions)
      ? data.questions
      : null;

  if (!arr) throw new Error('Invalid questions JSON shape. Expected [] or { questions: [] }.');
  return (arr as Question[]).map((q) => reshuffleChoices(sanitizeQuestion(q)));
}

export async function loadQuestionsFromJson(filePath: string): Promise<Question[]> {
  const abs = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  const raw = await readFile(abs, 'utf8');
  return normalizeQuestionsPayload(JSON.parse(raw));
}

export async function loadQuestions(setOrPath: string): Promise<Question[]> {
  const s = (setOrPath || '').trim();

  if (s.endsWith('.json') || s.includes('/') || s.includes('\\')) return loadQuestionsFromJson(s);

  const candidates = [
    `data/questions/${s}.json`,
    `data/${s}.json`,
    `data/questions/${s}/questions.json`,
    `data/${s}/questions.json`,
  ];

  let lastErr: any = null;
  for (const rel of candidates) {
    try {
      return await loadQuestionsFromJson(rel);
    } catch (e) {
      lastErr = e;
    }
  }

  throw new Error(
    `Could not resolve questions set "${s}". Tried:\n- ${candidates.join('\n- ')}\nLast error: ${
      lastErr?.message || lastErr
    }`
  );
}
