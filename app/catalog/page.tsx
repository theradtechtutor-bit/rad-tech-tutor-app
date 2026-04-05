import Link from 'next/link';

type Course = {
  slug: string;
  title: string;
  desc: string;
  tag: 'FREE' | 'PRO';
  minutes: string;
};

const courses: Course[] = [
  {
    slug: 'patient-care',
    title: 'Patient Care',
    desc: 'Vitals, infection control, meds, contrast basics.',
    tag: 'PRO',
    minutes: '2–3 hrs',
  },
  {
    slug: 'safety',
    title: 'Safety',
    desc: 'Radiation protection, dose, biology, regulations.',
    tag: 'PRO',
    minutes: '2–3 hrs',
  },
  {
    slug: 'image-production',
    title: 'Image Production',
    desc: 'Exposure factors, grids, processing, artifacts.',
    tag: 'PRO',
    minutes: '3–4 hrs',
  },
  {
    slug: 'procedures',
    title: 'Procedures',
    desc: 'Common exams, protocols, variations, positioning logic.',
    tag: 'PRO',
    minutes: '3–5 hrs',
  },
];

function Pill({ tag }: { tag: Course['tag'] }) {
  if (tag === 'FREE') {
    return (
      <span className="rounded-full bg-[color:rgba(45,212,191,0.12)] px-2 py-1 text-xs font-semibold text-[color:var(--rtt-accent)]">
        FREE
      </span>
    );
  }
  return (
    <span className="rounded-full bg-[color:rgba(250,204,21,0.14)] px-2 py-1 text-xs font-semibold text-[color:rgba(250,204,21,0.95)]">
      PRO
    </span>
  );
}

export default function CoursesPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 pt-6 pb-12 md:pt-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-4xl font-semibold">
            ARRT Radiography Content Categories
          </h1>
          <p className="mt-3 max-w-2xl text-[color:var(--rtt-muted)]">
            These are the four content categories tested on the ARRT Radiography
            exam. Each category is organized into clear, exam-focused lessons
            covering the concepts most likely to appear on the ARRT exam. Every
            lesson connects directly to questions from our Essential 200 so you
            can immediately test and reinforce what you just learned.
          </p>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        {courses.map((c) => (
          <Link
            key={c.slug}
            href={`/courses/${c.slug}`}
            className="group rounded-3xl border border-[color:var(--rtt-border)] bg-[color:var(--rtt-card)] p-6 hover:bg-white/5"
          >
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold group-hover:text-white">
                {c.title}
              </div>
              <Pill tag={c.tag} />
            </div>

            <div className="mt-2 text-sm text-[color:var(--rtt-muted)]">
              {c.desc}
            </div>

            <div className="mt-5 inline-flex items-center gap-2 text-xs text-white/60">
              <span className="rounded-full border border-[color:var(--rtt-border)] bg-black/30 px-2 py-1">
                {c.minutes}
              </span>
              <span className="rounded-full border border-[color:var(--rtt-border)] bg-black/30 px-2 py-1">
                Topics + Questions + Video
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
