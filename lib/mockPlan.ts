export type MockScope = 'mini' | 'full' | 'category';

export type QuestionLike = {
  id: string;
  category?: string;
  choices?: Record<string, string> | any[];
  correctAnswer?: string;
  correct?: string;
  answer?: string;
  correctKey?: string;
  question?: string;
  stem?: string;
  prompt?: string;
};

export const ARRT_CATEGORY_ORDER = ['Patient Care', 'Safety', 'Image Production', 'Procedures'] as const;

export function mapToArrtMajorCategory(raw: string): string {
  const v = (raw || '').toLowerCase().trim();
  if (!v) return 'Other';
  if (v.includes('patient care') || v.includes('patient interaction') || v.includes('patient assessment') || v.includes('assessment') || v.includes('infection') || v.includes('consent') || v === 'patient') return 'Patient Care';
  if (v.includes('radiobiology') || v.includes('radiation physics') || v.includes('radiation protection') || v.includes('safety') || v.includes('dose') || v.includes('dosimetry') || v.includes('physics') || v.includes('grid') || v.includes('beam') || v.includes('collimation') || v.includes('scatter')) return 'Safety';
  if (v.includes('image production') || v.includes('image evaluation') || v.includes('quality') || v.includes('artifact') || v.includes('processing') || v.includes('digital') || v.includes('detector') || v.includes('image') || v.includes('ei') || v.includes('di')) return 'Image Production';
  if (v.includes('position') || v.includes('positioning') || v.includes('procedure') || v.includes('exam') || v.includes('trauma') || v.includes('portable') || v.includes('c-arm') || v.includes('fluoro') || v.includes('contrast') || v.includes('anatomy') || v.includes('pathology') || v.includes('skeletal') || v.includes('respiratory') || v.includes('gi') || v.includes('cardiac')) return 'Procedures';
  return 'Other';
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleArray<T>(arr: T[], seed = Date.now()): T[] {
  const rand = mulberry32(seed);
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function letterForIndex(i: number) {
  return ['A', 'B', 'C', 'D'][i] || 'A';
}

function getCorrectKey(q: QuestionLike) {
  return String(q.correctAnswer || q.correct || q.answer || q.correctKey || '').trim().toUpperCase();
}

export function shuffleQuestionChoices<T extends QuestionLike>(questions: T[], seed = Date.now()): T[] {
  return questions.map((q, idx) => {
    const rawChoices = q.choices;
    if (!rawChoices || Array.isArray(rawChoices)) return q;
    const entries = Object.entries(rawChoices)
      .filter(([k]) => ['A', 'B', 'C', 'D'].includes(String(k).toUpperCase()))
      .map(([k, v]) => ({ key: String(k).toUpperCase(), text: String(v) }));
    if (entries.length < 2) return q;
    const shuffled = shuffleArray(entries, seed + idx + 11);
    const nextChoices: Record<string, string> = {};
    let nextCorrect = getCorrectKey(q);
    shuffled.forEach((choice, choiceIdx) => {
      const newKey = letterForIndex(choiceIdx);
      nextChoices[newKey] = choice.text;
      if (choice.key === getCorrectKey(q)) nextCorrect = newKey;
    });
    return {
      ...q,
      choices: nextChoices,
      correctAnswer: nextCorrect,
      correct: nextCorrect,
      correctKey: nextCorrect,
      answer: nextCorrect,
    };
  });
}

export function buildMiniMocks<T extends QuestionLike>(questions: T[]) {
  const buckets: Record<string, T[]> = {
    'Patient Care': [],
    Safety: [],
    'Image Production': [],
    Procedures: [],
    Other: [],
  };
  for (const q of questions) {
    const cat = mapToArrtMajorCategory(String(q.category || ''));
    (buckets[cat] ||= []).push(q);
  }

  const allocations: Record<string, number[]> = {
    'Patient Care': [4, 4, 4, 3, 3, 3, 3, 3, 3, 3],
    Safety: [6, 6, 6, 5, 5, 5, 5, 5, 5, 5],
    'Image Production': [5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
    Procedures: [7, 7, 7, 7, 6, 6, 6, 6, 6, 6],
  };

  const plans: Record<number, T[]> = {};
  const cursors: Record<string, number> = {
    'Patient Care': 0,
    Safety: 0,
    'Image Production': 0,
    Procedures: 0,
  };

  for (let mini = 1; mini <= 10; mini += 1) {
    const chunk: T[] = [];
    for (const cat of ARRT_CATEGORY_ORDER) {
      const take = allocations[cat][mini - 1] || 0;
      const source = buckets[cat] || [];
      const start = cursors[cat] || 0;
      const end = Math.min(source.length, start + take);
      chunk.push(...source.slice(start, end));
      cursors[cat] = end;
    }
    plans[mini] = chunk;
  }

  return plans;
}

export function selectQuestionsForScope<T extends QuestionLike>(questions: T[], scope: MockScope, opts: { miniId?: number; category?: string; isPro?: boolean } = {}) {
  if (scope === 'full') return questions;
  if (scope === 'category') {
    const wanted = String(opts.category || '').toLowerCase();

    const miniMap = buildMiniMocks(questions);

    // Build unlocked pool (Mini 1–5)
    const unlocked = new Set(
      [1, 2, 3, 4, 5]
        .flatMap((m) => miniMap[m] || [])
        .map((q) => q.id)
    );

    const pool = opts.isPro
      ? questions
      : questions.filter((q) => unlocked.has(q.id));

    return pool.filter(
      (q) =>
        mapToArrtMajorCategory(String(q.category || '')).toLowerCase() === wanted
    );
  }
  const miniId = Math.min(10, Math.max(1, Number(opts.miniId || 1)));
  const miniMap = buildMiniMocks(questions);
  return miniMap[miniId] || [];
}
