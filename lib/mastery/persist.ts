import type { FlashcardState } from '@/lib/mastery/flashcards';

export type MasteryPersistState = {
  practiceRemaining: string[];
  mustClear: string[];
  flashDeck: FlashcardState[];
  mastered: FlashcardState[];
  questionById: Record<string, any>;
};

const KEY_PREFIX = 'rtt_mastery_v1:';

export function keyFor(setId: string) {
  return `${KEY_PREFIX}${setId || 'default'}`;
}

export function saveState(setId: string, state: MasteryPersistState) {
  try {
    window.localStorage.setItem(keyFor(setId), JSON.stringify(state));
  } catch {}
}

export function loadState(setId: string): MasteryPersistState | null {
  try {
    const raw = window.localStorage.getItem(keyFor(setId));
    if (!raw) return null;
    return JSON.parse(raw) as MasteryPersistState;
  } catch {
    return null;
  }
}

export function clearState(setId: string) {
  try {
    window.localStorage.removeItem(keyFor(setId));
  } catch {}
}
