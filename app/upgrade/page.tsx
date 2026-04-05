import Link from 'next/link';
// import MarketingNav from '../_components/MarketingNav';

export default function UpgradePage() {
  return (
    <div className="min-h-screen bg-[color:var(--rtt-bg)] text-[color:var(--rtt-text)]">
      {/* <MarketingNav /> */}

      <main className="mx-auto max-w-3xl px-5 py-12">
        <div className="rounded-3xl border border-[color:var(--rtt-border)] bg-[color:var(--rtt-card)] p-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-[color:rgba(250,204,21,0.14)] px-3 py-1 text-xs font-semibold text-[color:rgba(250,204,21,0.95)]">
            PRO
          </div>
          <h1 className="mt-4 text-4xl font-semibold">Unlock Full Access</h1>
          <p className="mt-3 text-[color:var(--rtt-muted)]">
            Upgrade to unlock QBank 2 and QBank 3, deeper category coverage, and more variety in the RTT Mastery Method. Follow the system and go from overwhelmed to registry ready in as little as one month.
          </p>

          <div className="mt-8 grid gap-3 text-sm text-[color:var(--rtt-muted)]">
            <div className="rounded-2xl border border-[color:var(--rtt-border)] bg-black/30 p-4">
              <div className="font-semibold text-white">Mastery Engine (200Q)</div>
              <div className="mt-1">3-correct mastery + weak-spot repetition.</div>
            </div>
            <div className="rounded-2xl border border-[color:var(--rtt-border)] bg-black/30 p-4">
              <div className="font-semibold text-white">Full Bank (600Q)</div>
              <div className="mt-1">Targeted practice by subtopic + deeper explanations.</div>
            </div>
            <div className="rounded-2xl border border-[color:var(--rtt-border)] bg-black/30 p-4">
              <div className="font-semibold text-white">Courses</div>
              <div className="mt-1">Structured lessons + practice sets + video embeds later.</div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/courses" className="rtt-btn rtt-btn-secondary">
              Browse Courses
            </Link>
            <Link href="/diagnostic/free" className="rtt-btn rtt-btn-cta">
              Start Free
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
