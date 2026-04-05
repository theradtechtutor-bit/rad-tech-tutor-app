import { notFound } from 'next/navigation';
import { getCourse } from '../../../_data/courses';

export default async function CourseModulePage({
  params,
}: {
  params: Promise<{ courseId: string; moduleId: string }>;
}) {
  const { courseId, moduleId } = await params;
  const course = getCourse(courseId);
  if (!course) return notFound();

  const mod = course.modules.find((m) => m.id === moduleId);
  if (!mod) return notFound();

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="text-xs text-white/60">{course.title}</div>
      <h1 className="mt-1 text-2xl font-semibold">{mod.title}</h1>
      {mod.content ? <p className="mt-4 text-white/70">{mod.content}</p> : null}
    </div>
  );
}
