'use client';

import Link from 'next/link';

export default function FreeDiagnosticRunPage() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Free Diagnostic</h1>
      <p className="mt-2 text-white/70">
        Temporarily disabled while we finish the Question type + choices normalization refactor.
      </p>

      <div className="mt-4 flex gap-2">
        <Link
          href="/diagnostic/free"
          className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15"
        >
          Back
        </Link>
        <Link
          href="/app/practice"
          className="rounded-2xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:brightness-95"
        >
          Go to Practice
        </Link>
      </div>
    </div>
  );
}
