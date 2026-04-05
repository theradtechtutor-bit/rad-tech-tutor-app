'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DownloadForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/kitt/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Subscribe failed');
      }

      router.push('/blueprint-thank-you');
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-teal-300/50 focus:ring-2 focus:ring-teal-400/20"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black hover:bg-yellow-300 disabled:opacity-60 sm:w-auto"
        >
          {loading ? 'Sending…' : 'Get Free Download'}
        </button>
      </div>

      <div className="text-xs text-white/55">
        Free student resource • Check your email after submitting
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {error}
        </div>
      )}
    </form>
  );
}
