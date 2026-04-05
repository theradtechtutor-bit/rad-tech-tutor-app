export type CourseModule = { id: string; title: string; content?: string };
export type Course = { id: string; title: string; modules: CourseModule[] };

const COURSES: Course[] = [];

export function getCourse(courseId: string): Course | null {
  return COURSES.find((c) => c.id === courseId) ?? null;
}
