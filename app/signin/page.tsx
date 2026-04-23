import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[color:var(--rtt-bg)] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(700px circle at 18% 18%, rgba(20,184,166,0.20), transparent 42%), radial-gradient(700px circle at 82% 20%, rgba(250,204,21,0.10), transparent 38%), radial-gradient(900px circle at 50% 100%, rgba(20,184,166,0.10), transparent 45%)',
        }}
      />

      <div className="relative flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/[0.05] p-8 shadow-2xl backdrop-blur">
          <div className="mb-3 inline-flex rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">
            Rad Tech Tutor
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Sign in to Rad Tech Tutor
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/65">
            Save your ARRT®-style question progress, flashcards, and mini mock
            progress to your account.
          </p>

          <form className="mt-8 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/75">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-teal-300/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/75">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-teal-300/50"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-teal-400 px-4 py-3 font-semibold text-black transition hover:opacity-90"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-white/55">
            New here?{' '}
            <Link href="/" className="text-teal-300 hover:text-teal-200">
              Start practicing free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
