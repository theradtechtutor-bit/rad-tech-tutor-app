import Link from "next/link";

export default function FullDiagnosticLocked() {
  return (
    <div className="max-w-3xl rtt-card rtt-glow rounded-2xl p-8">
      <h1 className="text-3xl font-bold">Full 200Q Diagnostic</h1>
      <p className="mt-2 rtt-muted">
        This is locked in the MVP. Upgrade unlocks the full readiness system.
      </p>
      <div className="mt-6 flex gap-3 flex-wrap">
        <Link href="/upgrade" className="rtt-btn rtt-btn-cta">Upgrade</Link>
        <Link href="/app/practice" className="rtt-btn rtt-card rounded-xl px-4 py-2 hover:bg-white/10">Back to Practice</Link>
      </div>
    </div>
  );
}
