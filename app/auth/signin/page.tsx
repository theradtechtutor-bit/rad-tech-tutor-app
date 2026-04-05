"use client";

import { useState } from "react";
import supabase from '@/lib/supabaseClient';

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendLink() {
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="mt-2 text-sm text-white/70">
        Sign in to save mock exams and keep your progress.
      </p>

      <div className="mt-6 grid gap-3">
        <input
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          className="rounded-2xl bg-white/10 px-4 py-3 font-semibold hover:bg-white/15 disabled:opacity-50"
          onClick={sendLink}
          disabled={!email}
        >
          Email me a sign-in link
        </button>

        {sent && (
          <div className="text-sm text-white/80">
            Check your email for the sign-in link.
          </div>
        )}
        {error && <div className="text-sm text-red-400">{error}</div>}
      </div>
    </main>
  );
}
