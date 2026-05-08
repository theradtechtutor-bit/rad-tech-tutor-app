'use client';

type BreakdownQuestion = {
  id: string;
  category?: string;
};

type StatRow = {
  label: string;
  total: number;
  correct: number;
  pct: number;
};

type PerformanceBreakdownProps = {
  questions: BreakdownQuestion[];
  isCorrectById: Record<string, boolean>;
  variant?: 'practice' | 'mock';
  scope?: 'mini' | 'full' | 'category' | 'practice';
  className?: string;
};

const ARRT_CATEGORY_ORDER = [
  'Patient Care',
  'Safety',
  'Image Production',
  'Procedures',
];

function mapToArrtMajorCategory(raw: string): string {
  const v = String(raw || '').toLowerCase().trim();

  if (!v) return 'Other';

  if (
    v.includes('patient care') ||
    v.includes('patient interaction') ||
    v.includes('patient assessment') ||
    v.includes('patient education') ||
    v.includes('infection') ||
    v.includes('consent') ||
    v.includes('patient')
  ) {
    return 'Patient Care';
  }

  if (
    v.includes('radiobiology') ||
    v.includes('radiation physics') ||
    v.includes('radiation protection') ||
    v.includes('safety') ||
    v.includes('dose') ||
    v.includes('physics') ||
    v.includes('technique') ||
    v.includes('kvp') ||
    v.includes('mas') ||
    v.includes('grid') ||
    v.includes('beam') ||
    v.includes('filtration') ||
    v.includes('collimation') ||
    v.includes('scatter')
  ) {
    return 'Safety';
  }

  if (
    v.includes('image production') ||
    v.includes('image evaluation') ||
    v.includes('quality') ||
    v.includes('artifact') ||
    v.includes('exposure') ||
    v.includes('processing') ||
    v.includes('digital') ||
    v.includes('detector') ||
    v.includes('image') ||
    v.includes('ei') ||
    v.includes('di')
  ) {
    return 'Image Production';
  }

  if (
    v.includes('position') ||
    v.includes('positioning') ||
    v.includes('procedure') ||
    v.includes('exam') ||
    v.includes('trauma') ||
    v.includes('portable') ||
    v.includes('c-arm') ||
    v.includes('fluoro') ||
    v.includes('contrast') ||
    v.includes('anatomy') ||
    v.includes('pathology') ||
    v.includes('skeletal') ||
    v.includes('respiratory') ||
    v.includes('gi') ||
    v.includes('cardiac')
  ) {
    return 'Procedures';
  }

  return 'Other';
}

function pct(correct: number, total: number) {
  return total > 0 ? Math.round((correct / total) * 100) : 0;
}

function formatPercent(value: number) {
  return `${value}%`;
}

function buildStats(
  questions: BreakdownQuestion[],
  isCorrectById: Record<string, boolean>,
) {
  const answeredQuestions = questions.filter((q) =>
    Object.prototype.hasOwnProperty.call(isCorrectById, q.id),
  );

  const rowsByCategory = new Map<
    string,
    {
      total: number;
      correct: number;
    }
  >();

  for (const q of answeredQuestions) {
    const category = mapToArrtMajorCategory(q.category || '');

    const current = rowsByCategory.get(category) || {
      total: 0,
      correct: 0,
    };

    current.total += 1;

    if (isCorrectById[q.id]) {
      current.correct += 1;
    }

    rowsByCategory.set(category, current);
  }

  const orderedCategories = [
    ...ARRT_CATEGORY_ORDER,
    ...Array.from(rowsByCategory.keys()).filter(
      (category) =>
        !ARRT_CATEGORY_ORDER.includes(category) && category !== 'Other',
    ),
    ...(rowsByCategory.has('Other') ? ['Other'] : []),
  ];

  const categoryRows: StatRow[] = orderedCategories
    .map((label) => {
      const stats = rowsByCategory.get(label) || {
        total: 0,
        correct: 0,
      };

      return {
        label,
        total: stats.total,
        correct: stats.correct,
        pct: pct(stats.correct, stats.total),
      };
    })
    .filter((row) => row.total > 0);

  const totals = categoryRows.reduce(
    (acc, row) => {
      acc.total += row.total;
      acc.correct += row.correct;
      return acc;
    },
    {
      total: 0,
      correct: 0,
    },
  );

  const totalRow: StatRow = {
    label: 'TOTAL FOR ALL CONTENT CATEGORIES',
    total: totals.total,
    correct: totals.correct,
    pct: pct(totals.correct, totals.total),
  };

  return {
    categoryRows,
    totalRow,
    answeredCount: totals.total,
  };
}

export default function PerformanceBreakdown({
  questions,
  isCorrectById,
  variant = 'mock',
  scope = 'practice',
  className = '',
}: PerformanceBreakdownProps) {
  const { categoryRows, totalRow, answeredCount } = buildStats(
    questions,
    isCorrectById,
  );

  if (answeredCount === 0 || categoryRows.length === 0) {
    return null;
  }

  const smallSample = scope === 'mini' || answeredCount < 50;

  return (
    <div className={`mt-6 ${className}`}>
      <div className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-200/75">
              Content Category Breakdown
            </div>

            <h2 className="mt-2 text-xl font-semibold text-white">
              ARRT Content Category Scores
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/68">
              See your score by major ARRT content category.
            </p>
          </div>

          <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs font-semibold text-white/70">
            {variant === 'practice'
              ? 'Practice Snapshot'
              : scope === 'full'
                ? 'Full Mock Report'
                : 'Mock Snapshot'}
          </div>
        </div>

        {smallSample ? (
          <div className="mt-4 rounded-2xl border border-yellow-400/15 bg-yellow-400/10 px-4 py-3 text-sm text-yellow-100/90">
            Mini mocks use fewer questions than full mock exams, so this
            content category breakdown is best used as a quick snapshot. For
            the most accurate content category scores, complete a full
            200-question mock exam.
          </div>
        ) : null}

        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.06] text-left text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
                  <th className="px-4 py-3">Content Category</th>
                  <th className="px-4 py-3 text-right">Score</th>
                  <th className="px-4 py-3 text-right">Percent</th>
                </tr>
              </thead>

              <tbody>
                {categoryRows.map((row) => (
                  <tr
                    key={row.label}
                    className="border-b border-white/10 bg-black/20 text-white/80 last:border-b-0"
                  >
                    <td className="px-4 py-3 font-semibold text-white">
                      {row.label}
                    </td>

                    <td className="px-4 py-3 text-right text-white/70">
                      {row.correct} / {row.total}
                    </td>

                    <td className="px-4 py-3 text-right font-semibold text-yellow-200">
                      {formatPercent(row.pct)}
                    </td>
                  </tr>
                ))}

                <tr className="border-t border-yellow-400/20 bg-yellow-400/10 text-white">
                  <td className="px-4 py-4 font-bold">{totalRow.label}</td>

                  <td className="px-4 py-4 text-right font-semibold">
                    {totalRow.correct} / {totalRow.total}
                  </td>

                  <td className="px-4 py-4 text-right font-bold text-yellow-200">
                    {formatPercent(totalRow.pct)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}