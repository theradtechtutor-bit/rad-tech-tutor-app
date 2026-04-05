'use client';

import { useSearchParams } from 'next/navigation';

export default function ResultsClient() {
  const sp = useSearchParams();

  // Read whatever you need from query string:
  const score = sp.get('score');
  const total = sp.get('total');

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold">Mock Exam Results</h1>

      <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-5 text-white/70">
        <div>
          Score: <span className="text-white">{score ?? '—'}</span>
        </div>
        <div className="mt-1">
          Total: <span className="text-white">{total ?? '—'}</span>
        </div>

        <div className="mt-4 text-sm text-white/55">
          (Query params via useSearchParams)
        </div>
      </div>
    </div>
  );
}
