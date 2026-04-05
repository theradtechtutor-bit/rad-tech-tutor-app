import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getCeCourse } from '@/app/app/(main)/ce/_data/ceCourses';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;

  const course = getCeCourse(courseId);
  if (!course) {
    return NextResponse.json({ ok: false, error: 'Course not found' }, { status: 404 });
  }

  const jsonPath = course.questionJsonPath;
  if (!jsonPath) {
    return NextResponse.json(
      { ok: false, error: 'Course has no questionJsonPath' },
      { status: 400 }
    );
  }

  try {
    const abs = path.join(process.cwd(), jsonPath);
    const raw = await readFile(abs, 'utf8');
    const data = JSON.parse(raw);

    const questions = Array.isArray(data) ? data : Array.isArray(data?.questions) ? data.questions : [];
    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'No questions found in JSON', courseId, jsonPath },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, courseId, questions });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || String(e), courseId, jsonPath },
      { status: 500 }
    );
  }
}
