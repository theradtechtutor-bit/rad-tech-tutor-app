'use client';

export default function UpgradePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      {/* HERO */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">
          Unlock the Full ARRT® Readiness System
        </h1>
        <p className="mt-3 text-sm text-gray-400">
          Follow the method. Close your gaps. Walk into your exam ready.
        </p>
      </div>

      {/* WHAT YOU UNLOCK */}
      <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-8">
        <h2 className="text-lg font-semibold text-white text-center">
          What You Unlock with Pro Access
        </h2>

        <div className="mt-6 space-y-4 text-sm text-gray-300">
          <div>
            <span className="font-semibold text-white">
              Full 600Q Readiness System
            </span>{' '}
            — Structured, high-yield questions covering every ARRT®
            category.
          </div>

          <div>
            <span className="font-semibold text-white">
              3-Step Mastery Progression
            </span>{' '}
            — Questions must be answered correctly 3 times before leaving your
            deck.
          </div>

          <div>
            <span className="font-semibold text-white">
              Score Builder Flashcards
            </span>{' '}
            — Automatically created from missed questions so each review session
            raises your next score.
          </div>

          <div>
            <span className="font-semibold text-white">
              Category Performance Analytics
            </span>{' '}
            — See exactly where you’re strong and where you need improvement.
          </div>

          <div>
            <span className="font-semibold text-white">
              Readiness Score Tracking
            </span>{' '}
            — Watch your score trend upward as you close gaps.
          </div>
        </div>
      </div>

      {/* PRICING */}
      <div className="mt-16">
        <h2 className="text-center text-lg font-semibold text-white">
          Choose Your Prep Timeline
        </h2>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {/* 1 Month */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
            <h3 className="text-lg font-semibold text-white">1 Month</h3>
            <div className="mt-4 text-3xl font-bold text-white">$49</div>
            <div className="text-sm text-gray-400">$49 / month</div>
            <p className="mt-3 text-xs text-gray-400">Short-term access.</p>
            <button className="mt-6 w-full rounded-xl bg-yellow-400 py-2 text-sm font-semibold text-black hover:bg-yellow-300">
              Get 1 Month Access
            </button>
          </div>

          {/* 3 Months */}
          <div className="relative rounded-2xl border border-blue-400 bg-white/5 p-6 text-center">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white">
              MOST POPULAR
            </div>
            <h3 className="text-lg font-semibold text-white">3 Months</h3>
            <div className="mt-4 text-3xl font-bold text-white">$79</div>
            <div className="text-sm text-gray-400">$26 / month</div>
            <p className="mt-3 text-xs text-gray-400">
              Ideal for focused exam prep.
            </p>
            <button className="mt-6 w-full rounded-xl bg-yellow-400 py-2 text-sm font-semibold text-black hover:bg-yellow-300">
              Get 3 Months Access
            </button>
          </div>

          {/* 6 Months */}
          <div className="rounded-2xl border border-teal-400 bg-white/5 p-6 text-center">
            <h3 className="text-lg font-semibold text-white">6 Months</h3>
            <div className="mt-4 text-3xl font-bold text-white">$119</div>
            <div className="text-sm text-teal-400">
              $19 / month billed upfront
            </div>
            <p className="mt-3 text-xs text-gray-400">Lowest monthly cost.</p>
            <button className="mt-6 w-full rounded-xl bg-yellow-400 py-2 text-sm font-semibold text-black hover:bg-yellow-300">
              Get 6 Months Access
            </button>
          </div>
        </div>
      </div>

      {/* FREE VS PRO */}
      <div className="mt-16 rounded-2xl border border-white/10 bg-white/5 p-8">
        <h2 className="text-center text-lg font-semibold text-white">
          Free vs Pro
        </h2>

        <div className="mt-8 grid gap-8 md:grid-cols-2 text-sm text-gray-300">
          <div>
            <h3 className="font-semibold text-white mb-3">Free Access</h3>
            <ul className="space-y-2">
              <li>• 20Q Diagnostic</li>
              <li>• Basic Score Report</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3">Pro Access</h3>
            <ul className="space-y-2">
              <li>✔ Full 600Q System</li>
              <li>✔ Score Builder Flashcards</li>
              <li>✔ Mastery Tracking</li>
              <li>✔ Performance Analytics</li>
              <li>✔ Readiness Tracking</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
