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
    title: 'QBank 1 — Core Skills',
    access: 'free',
    size: 200,
    description:
      '200 ARRT-style questions covering core skills across Safety, Image Production, Procedures, and Patient Care.',
    tags: ['qbank', 'core', '200Q'],
  },
  {
    id: 'qbank2',
    title: 'QBank 2 — Advanced',
    access: 'paid',
    size: 200,
    description:
      '200 additional ARRT-style questions to continue building depth and confidence.',
    tags: ['qbank', 'advanced', '200Q'],
  },
  {
    id: 'qbank3',
    title: 'QBank 3 — Registry Ready',
    access: 'paid',
    size: 200,
    description:
      'Final track set focused on registry-ready questions and final readiness checks.',
    tags: ['qbank', 'registry-ready', '200Q'],
  },
];

export function getSet(id: string) {
  return questionSets.find((s) => s.id === id) ?? null;
}
