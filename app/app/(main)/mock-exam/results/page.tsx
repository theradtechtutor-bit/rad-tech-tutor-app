import { Suspense } from 'react';
import ResultsClient from './ResultsClient';

export default function MockExamResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl p-6 text-white/70">Loading results…</div>
      }
    >
      <ResultsClient />
    </Suspense>
  );
}
