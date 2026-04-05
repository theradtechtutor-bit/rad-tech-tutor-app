export type Lesson = { id: string; title: string; body?: string };

const LESSONS: Lesson[] = [];

export function getLesson(lessonId: string): Lesson | null {
  return LESSONS.find((l) => l.id === lessonId) ?? null;
}
