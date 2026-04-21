export default function MethodDropdown() {
  return (
    <details className="mt-4 rounded-2xl rtt-card p-6">
      <summary className="cursor-pointer list-none">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">
            The Rad Tech Tutor Method That Works
          </div>
          <div className="text-white/50">⌄</div>
        </div>
        <div className="mt-2 text-sm text-white/70">
          Follow the loop. Eliminate weak spots. Repeat until test-ready.
        </div>
      </summary>

      <div className="mt-5 space-y-4 text-sm text-white/80">
        <div className="flex gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-black">
            1
          </div>
          <div>
            <div className="font-semibold text-white">
              Take a full mock (Exam Mode)
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-black">
            2
          </div>
          <div>
            <div className="font-semibold text-white">
              Missed questions go into your Missed Question Flashcard Bank +
              Practice Test Bank
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-black">
            3
          </div>
          <div>
            <div className="font-semibold text-white">
              Practice flashcards until mastered (3-correct mastery system)
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-black">
            4
          </div>
          <div>
            <div className="font-semibold text-white">
              Take practice tests until all missed questions are cleared
            </div>
            <div className="mt-1 text-white/70">
              Then retake the SAME mock and repeat until you consistently score{' '}
              <span className="font-semibold text-yellow-300">95–100%</span>.
            </div>
          </div>
        </div>

        <div className="pt-2 text-xs text-white/60">
          Mastering QBank 1 is a strong start. For maximum confidence on exam day, increase
          your exposure by mastering all 5 QBanks.
        </div>
      </div>
    </details>
  );
}
