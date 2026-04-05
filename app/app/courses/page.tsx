import Link from 'next/link';
import Badge from '../_components/Badge';
import Card from '../_components/Card';
import { courses } from '@/lib/courses';

function accessBadge(access: 'free' | 'paid') {
  return access === 'free' ? (
    <Badge variant="success">Free</Badge>
  ) : (
    <Badge variant="paid">Paid</Badge>
  );
}

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">ARRT Courses</h1>
          <p className="mt-1 text-sm text-white/70">
            Structured by ARRT buckets → broken down into the exact sub-skills
            the exam tests.
          </p>
        </div>
        <Link
          href="/upgrade"
          className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300"
        >
          Unlock Mastery
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {courses.map((c) => (
          <Card key={c.id} className="group">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold group-hover:text-white">
                    {c.shortTitle}
                  </h2>
                  {accessBadge(c.access)}
                </div>
                <p className="mt-1 text-sm text-white/70">{c.description}</p>
              </div>
              <Badge
                variant={c.examWeightHint === 'High' ? 'warning' : 'neutral'}
              >
                Weight: {c.examWeightHint}
              </Badge>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-white/60">
                {c.modules.length} modules •{' '}
                {c.modules.reduce((sum, m) => sum + m.lessons.length, 0)} lessons
              </div>
              <Link
                href={`/courses/${c.id}`}
                className="text-sm font-semibold text-emerald-200 hover:text-emerald-100"
              >
                Open →
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <Card className="border-emerald-400/15 bg-emerald-400/5">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold">How the paid membership works</div>
            <div className="mt-1 text-sm text-white/70">
              Paid unlocks deeper lessons, full explanations, mastery tracking,
              weak-point drills, and the full bank.
            </div>
          </div>
          <Link
            href="/upgrade"
            className="inline-flex w-fit rounded-xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300"
          >
            See pricing
          </Link>
        </div>
      </Card>
    </div>
  );
}
