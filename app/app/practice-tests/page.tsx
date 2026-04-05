import Link from 'next/link';
import Card from '../_components/Card';

export default function PracticeTestsPage() {
  return (
    <div className="max-w-4xl">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm rtt-muted">Practice Tests</div>
          <h1 className="mt-1 text-2xl font-semibold">Short reps. Fast improvement.</h1>
          <p className="mt-2 text-sm rtt-muted">
            These are mini exams built from the <span className="text-white">Essential 100</span>.
            In v1 (front-end only), they’re layout-ready. Backend will randomize questions and save
            your results.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <div className="text-sm font-semibold">25-Question Practice Test</div>
          <div className="mt-1 text-sm rtt-muted">Quick focus session (10–15 minutes).</div>
          <div className="mt-4">
            <Link className="rtt-btn rtt-btn-ghost" href="/practice/essential-100">
              Start (uses Essential 100)
            </Link>
          </div>
        </Card>

        <Card>
          <div className="text-sm font-semibold">50-Question Practice Test</div>
          <div className="mt-1 text-sm rtt-muted">Build stamina without getting overwhelmed.</div>
          <div className="mt-4">
            <Link className="rtt-btn rtt-btn-ghost" href="/practice/essential-100">
              Start (uses Essential 100)
            </Link>
          </div>
        </Card>

        <Card>
          <div className="text-sm font-semibold">100-Question Practice Test</div>
          <div className="mt-1 text-sm rtt-muted">Quick focus session (10–15 minutes).</div>
          <div className="mt-4">
            <Link className="rtt-btn rtt-btn-ghost" href="/practice/essential-100">
              Start (uses Essential 100)
            </Link>
          </div>
        </Card>

        
      </div>
    </div>
  );
}
