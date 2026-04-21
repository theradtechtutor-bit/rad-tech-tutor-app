export type Access = 'free' | 'paid';

export type QuestionSet = {
  id: string;
  title: string;
  access: Access;
  size: number;
  description: string;
  tags: string[];
};

export const questionSets: QuestionSet[] = [
  {
    id: 'essential-100',
    title: 'Essential 100 (Free)',
    access: 'free',
    size: 100,
    description:
      'The “must-know” questions that cover the highest-yield ARRT patterns across the big buckets.',
    tags: ['high-yield', 'core', 'free'],
  },
  {
    id: 'qbank1',
    title: 'QBank 1 — Starting',
    access: 'free',
    size: 200,
    description:
      '200 ARRT-style questions covering core skills across Safety, Image Production, Procedures, and Patient Care.',
    tags: ['qbank', 'Starting', '200Q'],
  },
  {
    id: 'qbank2',
    title: 'QBank 2 — Building',
    access: 'paid',
    size: 200,
    description:
      '200 additional ARRT-style questions to continue building depth and confidence.',
    tags: ['qbank', 'Building', '200Q'],
  },
  {
    id: 'qbank3',
    title: 'QBank 3 — Applying',
    access: 'paid',
    size: 200,
    description:
      'Final track set focused on registry-ready questions and final readiness checks.',
    tags: ['qbank', 'Applying', '200Q'],
  },
  {
    id: 'qbank4',
    title: 'QBank 4 — Mastering',
    access: 'paid',
    size: 200,
    description:
      '200 additional ARRT-style questions for deeper review and broader exposure.',
    tags: ['qbank', 'Mastering', '200Q'],
  },
  {
    id: 'qbank5',
    title: 'QBank 5 — Registry Ready',
    access: 'paid',
    size: 200,
    description:
      '200 final ARRT-style questions for last-stage prep and confidence building.',
    tags: ['qbank', 'registry-ready', '200Q'],
  },
];

export function getSet(id: string) {
  return questionSets.find((s) => s.id === id) ?? null;
}
