import { notFound } from 'next/navigation';
import { getLesson } from '../../_data/lessons';

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const lesson = getLesson(lessonId);
  if (!lesson) return notFound();

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold">{lesson.title}</h1>
      {lesson.body ? <p className="mt-4 text-white/70">{lesson.body}</p> : null}
    </div>
  );
}
