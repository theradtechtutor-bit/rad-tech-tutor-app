import Link from "next/link";

export default function FreeDiagnosticPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="rtt-card rtt-glow rounded-2xl p-8">
        <h1 className="text-3xl font-bold">Baseline Diagnostic (50Q)</h1>
        <p className="mt-2 rtt-muted">
          Take a baseline. You’ll get a score + weak-spot breakdown.
        </p>

        <div className="mt-6 flex gap-3 flex-wrap">
          <Link href="/diagnostic/free/run" className="rtt-btn rtt-btn-cta">
            Start Diagnostic
          </Link>
          <Link
            href="/diagnostic/free/results"
            className="rtt-btn rtt-card rounded-xl px-4 py-2 hover:bg-white/10"
          >
            View Results
          </Link>
        </div>
      </div>

      <div className="rtt-card rounded-2xl p-6">
        <div className="text-sm font-semibold">How it works</div>
        <ul className="mt-2 list-disc pl-5 rtt-muted space-y-1 text-sm">
          <li>50 questions, ARRT-style</li>
          <li>Score saved locally on this device</li>
          <li>Breakdown by topic + retake improvement</li>
        </ul>
      </div>
    </div>
  );
}
