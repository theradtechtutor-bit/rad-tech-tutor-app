import { notFound } from 'next/navigation';
import { getCourse } from '../../_data/courses';

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = getCourse(courseId);
  if (!course) return notFound();

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold">{course.title}</h1>
      <div className="mt-4 text-white/70">
        Modules: {course.modules.length}
      </div>
    </div>
  );
}
