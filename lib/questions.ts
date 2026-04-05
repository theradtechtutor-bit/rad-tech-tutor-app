export type ChoiceLetter = 'A' | 'B' | 'C' | 'D';

export type ChoiceMap = Record<ChoiceLetter, string>;

export type QuestionExplanation = {
  whyCorrect?: string;
  whyIncorrect?: Partial<Record<ChoiceLetter, string>>;
};

export type Question = {
  id: string;
  category: string;
  subcategory: string;
  question: string;

  // IMPORTANT: choices are an OBJECT map (not array)
  choices: ChoiceMap;

  // correct answer letter
  correctAnswer: ChoiceLetter;

  explanation?: QuestionExplanation;

  // Flashcard (optional, handcrafted cloze)
  flash_front?: string;
  flash_back?: string;
  flash_hint?: string;
};
