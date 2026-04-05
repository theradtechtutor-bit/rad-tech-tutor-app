import Link from 'next/link';

export default function RoadmapPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 pt-6 pb-12 md:pt-8">
      <h1 className="text-4xl font-semibold">Study Plan</h1>

      <p className="mt-3 max-w-2xl text-[color:var(--rtt-muted)]">
        This will become your “enter your exam date → weekly targets → on-track
        indicator” feature.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-[color:var(--rtt-border)] bg-[color:var(--rtt-card)] p-6">
          <div className="text-sm font-semibold">
            Phase 1 — Essential 100 (free)
          </div>

          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[color:var(--rtt-muted)]">
            <li>Build the base across every category.</li>
            <li>Don’t over-study. Find gaps fast.</li>
            <li>Teal = correct wins. Track what stays red.</li>
          </ul>

          <div className="mt-5">
            <Link
              href="/courses/essentials-100"
              className="rtt-btn rtt-btn-cta"
            >
              Start Essentials
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-[color:var(--rtt-border)] bg-[color:var(--rtt-card)] p-6">
          <div className="text-sm font-semibold">
            Phase 2 — Mastery Engine (pro)
          </div>

          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[color:var(--rtt-muted)]">
            <li>3-correct mastery removes cards from the pile.</li>
            <li>Auto-generate “weak point” review loops.</li>
            <li>Scale from 200Q → 600Q bank.</li>
          </ul>

          <div className="mt-5">
            <Link href="/upgrade" className="rtt-btn rtt-btn-secondary">
              See Pro
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
