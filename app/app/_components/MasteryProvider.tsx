'use client';

import React, { createContext, useContext, useMemo, useReducer, useEffect } from 'react';
import type { Question } from '@/lib/questions';
import type { FlashcardState } from '@/lib/mastery/flashcards';
import { stageAfterAnswer, toFlashcard } from '@/lib/mastery/flashcards';
import type { MasteryPersistState } from '@/lib/mastery/persist';
import { saveState } from '@/lib/mastery/persist';

type MasteryState = MasteryPersistState;

type Action =
  | { type: 'INIT_BANK'; questions: Question[]; shuffledIds: string[] }
  | { type: 'LOAD_SAVED'; saved: MasteryPersistState }
  | { type: 'PRACTICE_CORRECT'; qid: string }
  | { type: 'PRACTICE_WRONG'; qid: string }
  | { type: 'FLASH_GOT_IT'; id: string }
  | { type: 'FLASH_MISSED_IT'; id: string };

const initialState: MasteryState = {
  practiceRemaining: [],
  mustClear: [],
  flashDeck: [],
  mastered: [],
  questionById: {},
};

function uniquePush(arr: string[], id: string) {
  return arr.includes(id) ? arr : [...arr, id];
}

function reducer(state: MasteryState, action: Action): MasteryState {
  switch (action.type) {
    case 'LOAD_SAVED': {
      return action.saved || initialState;
    }

    case 'INIT_BANK': {
      const byId: Record<string, any> = {};
      for (const q of action.questions) byId[q.id] = q;

      return {
        practiceRemaining: action.shuffledIds,
        mustClear: [],
        flashDeck: [],
        mastered: [],
        questionById: byId,
      };
    }

    case 'PRACTICE_CORRECT': {
      const qid = action.qid;

      return {
        ...state,
        practiceRemaining: state.practiceRemaining.filter((id) => id !== qid),
        mustClear: state.mustClear.filter((id) => id !== qid),
      };
    }

    case 'PRACTICE_WRONG': {
      const qid = action.qid;
      const q = state.questionById[qid];
      if (!q) return state;

      // mustClear gets it, and flashDeck gets the cloze card (if not already active/mastered)
      const existingActive = state.flashDeck.find((c) => c.id === qid);
      const existingMastered = state.mastered.find((c) => c.id === qid);

      const nextFlash = existingActive || existingMastered ? state.flashDeck : [...state.flashDeck, toFlashcard(q)];

      return {
        ...state,
        practiceRemaining: state.practiceRemaining.filter((id) => id !== qid),
        mustClear: uniquePush(state.mustClear, qid),
        flashDeck: nextFlash,
      };
    }

    case 'FLASH_GOT_IT': {
      const id = action.id;
      const idx = state.flashDeck.findIndex((c) => c.id === id);
      if (idx === -1) return state;

      const card = state.flashDeck[idx];
      const res = stageAfterAnswer(card.stage as any, true);

      // remove from active deck
      const deckWithout = state.flashDeck.filter((c) => c.id !== id);

      if (res.mastered) {
        return {
          ...state,
          flashDeck: deckWithout,
          mastered: [...state.mastered, { ...card, stage: card.stage }],
        };
      }

      const updated: FlashcardState = { ...card, stage: res.stage as any };

      // correct: send to back (so user cycles)
      return {
        ...state,
        flashDeck: [...deckWithout, updated],
      };
    }

    case 'FLASH_MISSED_IT': {
      const id = action.id;
      const idx = state.flashDeck.findIndex((c) => c.id === id);
      if (idx === -1) return state;

      const card = state.flashDeck[idx];
      const res = stageAfterAnswer(card.stage as any, false);

      const deckWithout = state.flashDeck.filter((c) => c.id !== id);
      const updated: FlashcardState = { ...card, stage: res.stage as any };

      // wrong: send to back
      return {
        ...state,
        flashDeck: [...deckWithout, updated],
      };
    }

    default:
      return state;
  }
}

type Ctx = {
  state: MasteryState;
  dispatch: React.Dispatch<Action>;
  currentPracticeQuestion: Question | null;
};

const MasteryContext = createContext<Ctx | null>(null);

export function MasteryProvider({
  children,
  setId,
}: {
  children: React.ReactNode;
  setId?: string;
}) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // autosave (only if setId is provided)
  useEffect(() => {
    if (!setId) return;
    saveState(setId, state);
  }, [setId, state]);

  const currentPracticeQuestion = useMemo(() => {
    const nextId = state.practiceRemaining[0] || state.mustClear[0];
    return nextId ? (state.questionById[nextId] as Question) : null;
  }, [state.mustClear, state.practiceRemaining, state.questionById]);

  const value = useMemo(() => ({ state, dispatch, currentPracticeQuestion }), [state, dispatch, currentPracticeQuestion]);

  return <MasteryContext.Provider value={value}>{children}</MasteryContext.Provider>;
}

export function useMastery() {
  const ctx = useContext(MasteryContext);
  if (!ctx) throw new Error('useMastery must be used within MasteryProvider');
  return ctx;
}
