export type CeCourse = {
  slug: string;
  title: string;
  subtitle: string;
  credits: number;
  category: string;
  priceUsd: number;
  coverImage: string; // public path
  pdfPath: string;    // supabase storage path
  questionJsonPath: string; // local json path
  passPct: number;
  totalQuestions: number;
};

export const CE_COURSES: CeCourse[] = [
  {
    slug: 'optimizing-patient-dose',
    title: 'Optimizing Patient Dose in Digital Radiography',
    subtitle: 'EI, DI & ALARA Strategies',
    credits: 3.0,
    category: 'Category A',
    priceUsd: 29,
    coverImage: '/ce/ce01-cover.png',
    pdfPath: 'ce/ce01/course.pdf',
    questionJsonPath: 'data/ce/ce01/questions.asrt.full.json',
    passPct: 75,
    totalQuestions: 24
  }
];

export function getCeCourse(slug: string) {
  return CE_COURSES.find(c => c.slug === slug) ?? null;
}
