import Link from 'next/link';
import Card from '../_components/Card';

export default function BankPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Question Bank</h1>
          <p className="mt-1 text-sm text-white/70">
            Filter by course → module → topic. (Front-end ready.)
          </p>
        </div>
        <Link
          href="/upgrade"
          className="rtt-btn rtt-btn-cta"
        >
          Upgrade
        </Link>
      </div>

      <Card className="border-yellow-400/20 bg-yellow-400/5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Paid feature (front-end ready)</div>
            <div className="mt-1 text-sm text-white/70">
              Once backend is connected, this page will show filters, search,
              explanations, and your precision 250Q bank.
            </div>
          </div>
          <div className="rtt-pill rtt-neutral-bg">Paid</div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {['Course', 'Module', 'Topic'].map((t) => (
          <Card key={t}>
            <div className="text-sm font-semibold">Filter: {t}</div>
            <div className="mt-2 text-sm text-white/70">
              Placeholder UI. Wire to backend later.
            </div>
            <div className="mt-4 space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-xl rtt-card px-3 py-2 text-sm text-white/70"
                >
                  {t} option {i}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
