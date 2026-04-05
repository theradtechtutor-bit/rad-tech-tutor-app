import { Suspense } from 'react';
import SuccessClient from './SuccessClient';

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <div className="inline-flex rounded-full bg-yellow-400/15 px-3 py-1 text-xs font-semibold text-yellow-300">
            CHECKING PAYMENT
          </div>
          <h1 className="mt-4 text-3xl font-semibold text-white">
            Welcome to Pro
          </h1>
          <p className="mt-3 text-sm text-white/70">
            Verifying payment...
          </p>
        </div>
      </div>
    }>
      <SuccessClient />
    </Suspense>
  );
}
