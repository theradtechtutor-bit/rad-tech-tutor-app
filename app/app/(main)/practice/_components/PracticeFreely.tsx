import Link from 'next/link';

export default function PracticeFreely() {
  return (
    <div className="mt-8">
      <div className="text-xl font-semibold tracking-tight">Practice Freely</div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link
          href="/app/mock-exam"
          className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 hover:bg-white/10"
        >
          Take New Mock
        </Link>

        <Link
          href="/app/flashcards"
          className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 hover:bg-white/10"
        >
          Practice Flashcards
        </Link>

        <Link
          href="/app/practice-tests"
          className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 hover:bg-white/10"
        >
          Practice Questions
        </Link>
      </div>
    </div>
  );
}
