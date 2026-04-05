export default function SignInPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-black px-6 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8">
        <h1 className="mb-6 text-2xl font-semibold">Sign In</h1>

        <form className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-white/60">Email</label>
            <input
              type="email"
              className="w-full rounded-lg border border-white/10 bg-black px-4 py-2 text-white outline-none focus:border-white/30"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-white/60">Password</label>
            <input
              type="password"
              className="w-full rounded-lg border border-white/10 bg-black px-4 py-2 text-white outline-none focus:border-white/30"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-yellow-400 py-2 font-semibold text-black transition hover:opacity-90"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
