import Link from 'next/link';
import Badge from '../_components/Badge';
import Card from '../_components/Card';

export default function MasteryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Mastery Mode</h1>
          <p className="mt-1 text-sm text-white/70">
            3-correct system: Red → Yellow → Teal → Gone.
          </p>
        </div>
        <Link
          href="/upgrade"
          className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300"
        >
          Unlock Mastery
        </Link>
      </div>

      <Card className="border-yellow-400/20 bg-yellow-400/5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Paid feature</div>
            <div className="mt-1 text-sm text-white/70">
              Front-end is ready. Backend will enforce access and persist mastery.
            </div>
          </div>
          <Badge variant="warning">Locked</Badge>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Card queue (demo)</div>
            <div className="text-xs text-white/50">UI only</div>
          </div>

          {/* <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-5"> */}
            <div className="mt-4 rtt-card rounded-2xl p-5">
            <div className="text-xs uppercase tracking-widest text-white/50">
              Safety • ALARA
            </div>
            <div className="mt-2 text-base font-semibold">
              What reduces exposure most during an exposure?
            </div>
            <div className="mt-3 grid gap-2">
              {['Increase kVp', 'Step back (increase distance)', 'Open collimation', 'Repeat'].map(
                (c, idx) => (
                  <div
                    key={c}
                    className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                      idx === 1
                        ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100'
                        : 'rtt-card text-white/70'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}. {c}
                  </div>
                )
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button className="rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-2 text-sm font-semibold text-red-100">
                Wrong
              </button>
              <button className="rounded-xl border border-yellow-400/25 bg-yellow-400/10 px-4 py-2 text-sm font-semibold text-yellow-100">
                Unsure
              </button>
              <button className="rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-100 shadow-[0_0_40px_-20px_rgba(45,212,191,0.45)]">
                Correct
              </button>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <div className="text-sm font-semibold">Mastery ladder</div>
            <div className="mt-3 space-y-2">
              <div className="rounded-xl border border-red-400/25 bg-red-400/10 p-3 text-sm text-red-100">
                0 correct • Red
              </div>
              <div className="rounded-xl border border-yellow-400/25 bg-yellow-400/10 p-3 text-sm text-yellow-100">
                1–2 correct • Yellow
              </div>
              <div className="rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-3 text-sm text-emerald-100">
                3 correct • Teal (mastered)
              </div>
              <div className="rounded-xl rtt-card p-3 text-sm text-white/70">
                Mastered cards disappear
              </div>
            </div>
          </Card>

          <Card>
            <div className="text-sm font-semibold">Jump into practice</div>
            <div className="mt-2 text-sm text-white/70">
              Start with the Essential 100, then upgrade when you’re ready for the loop.
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <Link
                href="/practice/essential-100"
                className="rounded-xl rtt-card px-4 py-2 text-sm font-semibold hover:bg-white/10"
              >
                Essential 100
              </Link>
              <Link
                href="/upgrade"
                className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300"
              >
                Upgrade
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
