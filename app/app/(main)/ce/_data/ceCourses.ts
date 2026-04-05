export type CeQuestion = {
  id: string;
  prompt: string;
  choices: { A: string; B: string; C: string; D: string };
  correct: 'A' | 'B' | 'C' | 'D';
  rationale: string;
};

export type CeLesson = {
  id: string;
  title: string;
  bullets: string[];
};

export type CeCourse = {
  id: string;
  title: string;
  credits: number;
  category: string;
  minutesEstimate: number;
  description: string;

  // NEW (for real CE courses)
  priceUsd?: number;
  coverImage?: string;
  pdfPath?: string;
  questionJsonPath?: string;
  totalQuestions?: number;
  lessons: CeLesson[];
  test: {
    passPct: number;
    questions: CeQuestion[];

    // NEW: if source === 'json', questions are loaded server-side and NOT embedded
    source?: "embedded" | "json";
  };
  approvalStatus?: 'pending' | 'approved';
  isForSale?: boolean;
};

export const CE_COURSES: CeCourse[] = [
  {
    id: 'optimizing-patient-dose',
  approvalStatus: 'pending',
  isForSale: false,
    title: 'Optimizing Patient Dose in Digital Radiography',
    credits: 3.0,
    category: 'Category A',
    minutesEstimate: 150,
    description: 'EI, DI & ALARA strategies to reduce unnecessary exposure while maintaining diagnostic quality.',

    priceUsd: 29,
    coverImage: '/ce/ce01-cover.png',
    pdfPath: 'ce/ce01/course.pdf',
    questionJsonPath: 'data/ce/ce01/questions.asrt.full.json',
    totalQuestions: 24,

    lessons: [],

    test: {
      passPct: 75.0,
      questions: [],
      source: "json",
    },
  }

];

export function getCeCourse(courseId: string) {
  return CE_COURSES.find((c) => c?.id === courseId) ?? null;
}
