import type { Question } from '@/lib/questions';
import { buildRationale, cleanStudyText, flashcardBackForQuestion, flashcardFrontForQuestion } from '@/lib/masteryContent';

export type FlashStage = 0 | 1 | 2 | 3;

export type FlashcardState = {
  id: string;
  category?: string;
  subcategory?: string;
  front: string;
  back: string;
  hint?: string;
  explanation?: string;
  stage: FlashStage;
};

export function stageAfterAnswer(
  stage: FlashStage,
  correct: boolean
): { stage: FlashStage; mastered: boolean } {
  if (correct) {
    // 0 → yellow, red → yellow, yellow → green, green → mastered
    if (stage === 3) return { stage, mastered: true };
    if (stage === 2) return { stage: 3, mastered: false };
    return { stage: 2, mastered: false }; // stage 0 or 1 → 2
  } else {
    // 0 → red, red → red, yellow → red, green → yellow
    if (stage === 3) return { stage: 2, mastered: false };
    return { stage: 1, mastered: false }; // 0/1/2 → red
  }
}

export function stageBorderClass(stage: FlashStage): string {
  if (stage === 0) return 'border border-transparent';
  if (stage === 1) return 'border-2 border-red-500/70';
  if (stage === 2) return 'border-2 border-yellow-400/70';
  return 'border-2 border-emerald-400/70';
}

type Choice =
  | string
  | {
      key?: string;
      label?: string;
      text?: string;
      value?: string;
    };

function normalizeChoice(c: any, i: number) {
  const key = ['A', 'B', 'C', 'D', 'E', 'F'][i] ?? String(i + 1);
  if (typeof c === 'string') return { key, text: c };
  const k = String((c?.key || c?.label || key) ?? key).trim();
  const t = String((c?.text || c?.value || '') ?? '').trim();
  return { key: k, text: t || k };
}

function getCorrectKey(q: any) {
  return String(
    q?.correctKey ||
      q?.correct_key ||
      q?.correct ||
      q?.correctAnswer ||
      q?.correct_answer ||
      q?.answerKey ||
      q?.answer_key ||
      q?.answer ||
      q?.bestAnswer ||
      q?.best_answer ||
      q?.rightAnswer ||
      q?.right_answer ||
      ''
  ).trim();
}

function getCorrectText(q: any): string {
  const explicitText = String(
    q?.correctText ||
      q?.correct_text ||
      q?.correctAnswerText ||
      q?.correct_answer_text ||
      q?.answerText ||
      q?.answer_text ||
      q?.bestAnswerText ||
      q?.best_answer_text ||
      ''
  ).trim();
  if (explicitText) return explicitText;

  const ck = getCorrectKey(q);
  const rawChoices = q?.choices;
  let norm: Array<{ key: string; text: string }> = [];

  if (Array.isArray(rawChoices)) {
    norm = rawChoices.map((c: any, i: number) => normalizeChoice(c, i));
  } else if (rawChoices && typeof rawChoices === 'object') {
    norm = Object.entries(rawChoices).map(([k, v]) => {
      if (v && typeof v === 'object') {
        const vv = v as any;
        return {
          key: String(vv.key || k).trim(),
          text: String(vv.text || vv.label || vv.value || '').trim(),
        };
      }
      return {
        key: String(k).trim(),
        text: String(v ?? '').trim(),
      };
    });
  }

  const byKey = norm.find((c: any) => String(c.key || '').toUpperCase() === ck.toUpperCase());
  if (byKey?.text) return String(byKey.text).trim();

  const ckLower = ck.trim().toLowerCase();
  const byText = norm.find((c: any) => String(c.text || '').trim().toLowerCase() == ckLower);
  if (byText?.text) return String(byText.text).trim();

  if (/^[A-F]$/i.test(ck)) return '';

  return ck;
}


/**
 * Prefer explicit flash fields when present.
 * Fallback: generate a simple cloze using correct choice text.
 */
export function toFlashcard(q: Question): FlashcardState {
  const explicitHint = (q as any).flash_hint ? String((q as any).flash_hint).trim() : '';

  return {
    id: q.id,
    category: cleanStudyText(String((q as any).category || (q as any).majorCategory || '')).trim(),
    subcategory: cleanStudyText(String((q as any).subcategory || '')).trim(),
    front: flashcardFrontForQuestion(q),
    back: flashcardBackForQuestion(q),
    hint: explicitHint || undefined,
    explanation: buildRationale(q),
    stage: 0,
  };
}
