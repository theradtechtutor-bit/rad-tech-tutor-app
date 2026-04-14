'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import StartHereTour from '@/app/app/_components/StartHereTour';
import { readAttempts, readExamDate, writeExamDate } from '@/lib/progressStore';

type Attempt = {
  attempt: number;
  label: string;
  score: number;
  correct: number;
  total: number;
  dateISO: string;
  registryReady?: boolean;
  bankId?: number;
  category?: string;
  type?: string;
  questionsTaken?: number;
  timeSpentSeconds?: number;
};

const TYPE_COLOR: Record<string, string> = {
  'Practice Test': 'rgba(148,163,184,0.95)',
  'Mini Mock': 'rgba(59,130,246,0.95)',
  'Category Mock': 'rgba(16,185,129,0.95)',
  'Full Mock': 'rgba(250,204,21,0.95)',
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function parseLocalDateInput(dateStr: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) return null;
  const [, y, m, d] = match;
  return new Date(Number(y), Number(m) - 1, Number(d));
}

function formatInputDate(dateStr: string) {
  const parsed = parseLocalDateInput(dateStr);
  return parsed ? parsed.toLocaleDateString() : dateStr;
}

function formatDate(dISO: string) {
  try {
    return new Date(dISO).toLocaleDateString();
  } catch {
    return dISO;
  }
}

function daysUntil(dateStr: string) {
  if (!dateStr) return null;

  const [y, m, d] = dateStr.split("-").map(Number);
  const target = new Date(y, m - 1, d);

  if (Number.isNaN(target.getTime())) return null;

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  return Math.round((target.getTime() - now.getTime()) / 86400000);
}

function getAttemptKind(a: Attempt) {
  const probe = `${a.label || ''} ${a.category || ''}`.toLowerCase();
  if (a.type === 'practice' || probe.includes('practice test')) return 'Practice Test';
  if (probe.includes('mini mock')) return 'Mini Mock';
  if (a.type === 'full') return 'Full Mock';
  if (a.type === 'category') return 'Category Mock';
  if (a.category && !probe.includes('mini mock')) return 'Category Mock';
  return 'Full Mock';
}

function getOrdinal(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n}st`;
  if (mod10 === 2 && mod100 !== 12) return `${n}nd`;
  if (mod10 === 3 && mod100 !== 13) return `${n}rd`;
  return `${n}th`;
}

function getAttemptKey(a: Attempt) {
  const kind = getAttemptKind(a);
  const probe = `${a.label || ''} ${a.category || ''}`;
  const miniMatch = probe.match(/mini mock\s*(\d+)/i);
  const miniNumber = miniMatch ? miniMatch[1] : null;

  if (kind === 'Practice Test') return miniNumber ? `practice-mini-${miniNumber}` : `practice-${a.label || 'general'}`;
  if (kind === 'Mini Mock') return miniNumber ? `exam-mini-${miniNumber}` : `mini-${a.label || 'general'}`;
  if (kind === 'Category Mock') return `category-${a.category || a.label || 'general'}`;
  return 'full-mock';
}

function getAttemptIteration(data: Attempt[], index: number) {
  const target = getAttemptKey(data[index]);
  let count = 0;
  for (let j = 0; j <= index; j += 1) {
    if (getAttemptKey(data[j]) === target) count += 1;
  }
  return count;
}

function getAttemptDisplayName(a: Attempt, i: number, data?: Attempt[]) {
  const kind = getAttemptKind(a);
  const probe = `${a.label || ''} ${a.category || ''}`;
  const miniMatch = probe.match(/mini mock\s*(\d+)/i);
  const miniNumber = miniMatch ? miniMatch[1] : null;
  const iteration = data ? ` — ${getOrdinal(getAttemptIteration(data, i))} attempt` : '';

  if (kind === 'Practice Test') {
    return miniNumber ? `Mini Mock ${miniNumber}: Practice Test${iteration}` : `${a.label || 'Practice Test'}${iteration}`;
  }

  if (kind === 'Mini Mock') {
    return miniNumber ? `Mini Mock ${miniNumber}: Exam${iteration}` : `${a.label || `Mini Mock ${i + 1}`}${iteration}`;
  }

  if (kind === 'Category Mock') {
    return a.category ? `${a.category} Mock${iteration}` : `Category Mock ${i + 1}${iteration}`;
  }

  return `Full Mock${iteration}`;
}

function getAttemptIterationLabel(data: Attempt[], index: number) {
  return `${getOrdinal(getAttemptIteration(data, index))} attempt`;
}

function colorForAttempt(a: Attempt) {
  return TYPE_COLOR[getAttemptKind(a)] || 'rgba(255,255,255,0.9)';
}

function TrendChart({ data, examDate }: { data: Attempt[]; examDate: string }) {
  const w = 1400;
  const h = 500;
  const padL = 100;
  const padR = 110;
  const padT = 24;
  const padB = 145;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;
  const hasGoalDate = Boolean(examDate);
  const goalReserve = hasGoalDate ? 140 : 0;
  const mockChartW = chartW - goalReserve;
  const goalX = padL + mockChartW + (hasGoalDate ? 55 : 0);
  const goalY = padT + ((100 - 90) / 100) * chartH;

  const pts = useMemo(() => {
    if (!data.length) return [] as Array<{ x: number; y: number; d: Attempt }>;
    return data.map((d, i) => ({
      x: padL + (data.length === 1 ? mockChartW / 2 : (i / (data.length - 1)) * mockChartW),
      y: padT + ((100 - clamp(d.score, 0, 100)) / 100) * chartH,
      d,
    }));
  }, [data, mockChartW, chartH]);

  const path = useMemo(() => {
    if (!pts.length) return '';
    return pts.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }, [pts]);

  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
      <div className="flex flex-wrap items-end justify-between gap-3">
          {examDate ? (
            <div className="text-xs text-yellow-300 mt-2">Goal Date: {formatDate(examDate)}</div>
          ) : null}
        <div>
          <div className="text-sm font-semibold text-white">Mock score roadmap</div>
          <div className="mt-1 text-xs text-white/60">
            X-axis = each completed mock over time. Y-axis = your score percentage.
          </div>
        </div>
        <div className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs text-yellow-100">
          Target: 90%+
        </div>
      </div>

      <div className="mt-5 overflow-hidden pb-3">
        <div className="relative">
          <svg viewBox={`0 0 ${w} ${h}`} className="h-[500px] w-full" role="img" aria-label="Mock score roadmap chart" preserveAspectRatio="xMidYMid meet">
            {[0, 25, 50, 75, 85, 100].map((v) => {
              const y = padT + ((100 - v) / 100) * chartH;
              const isTarget = v === 85;
              return (
                <g key={v}>
                  <line
                    x1={padL}
                    x2={w - padR}
                    y1={y}
                    y2={y}
                    stroke={isTarget ? 'rgba(250,204,21,0.5)' : 'rgba(255,255,255,0.08)'}
                    strokeDasharray={isTarget ? '6 6' : undefined}
                  />
                  <text x={10} y={y + 4} fontSize={11} fill={isTarget ? 'rgba(250,204,21,0.9)' : 'rgba(255,255,255,0.55)'}>
                    {v}%
                  </text>
                </g>
              );
            })}

            {[0, 1, 2, 3, 4].map((i) => {
              const x = padL + (mockChartW / 4) * i;
              return <line key={i} x1={x} x2={x} y1={padT} y2={h - padB} stroke="rgba(255,255,255,0.05)" />;
            })}

            {hasGoalDate ? (
              <>
                <line x1={goalX} x2={goalX} y1={padT} y2={h - padB} stroke="rgba(250,204,21,0.35)" strokeDasharray="6 6" />
                <circle cx={goalX + 12} cy={goalY} r={7} fill="rgba(250,204,21,0.95)" />
                
                
              </>
            ) : null}

            {data.length ? (
              <>
                <path d={path} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth={2} strokeLinecap="round" />
                {pts.map((p, i) => (
                  <g key={`${p.d.attempt}-${i}`}>
                    <circle cx={p.x} cy={p.y} r={6} fill={colorForAttempt(p.d)} />
                      <title>{getAttemptDisplayName(p.d, i, data)} — {p.d.score}%</title>
                      <title>{getAttemptDisplayName(p.d, i, data)} — {p.d.score}% • {p.d.correct}/{p.d.total} • {formatDate(p.d.dateISO)}</title>
                      <title>{getAttemptDisplayName(p.d, i, data)} — {p.d.score}%</title>
                  </g>
                ))}
              </>
            ) : (
              <>
                <text x={w / 2} y={h / 2 - 12} textAnchor="middle" fontSize={18} fill="rgba(255,255,255,0.82)">
                  Your roadmap will appear here after your first mock.
                </text>
                <text x={w / 2} y={h / 2 + 18} textAnchor="middle" fontSize={13} fill="rgba(255,255,255,0.55)">
                  Take a mock exam to start plotting your score trend over time.
                </text>
              </>
            )}
          </svg>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/65">
        {[
          ['Practice Test', TYPE_COLOR['Practice Test']],
          ['Mini Mock', TYPE_COLOR['Mini Mock']],
          ['Category Mock', TYPE_COLOR['Category Mock']],
          ['Full Mock', TYPE_COLOR['Full Mock']],
          ['Goal Date', 'rgba(250,204,21,0.95)'],
        ].map(([label, color]) => (
          <span key={label} className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            <span style={{ color }}>{label === 'Goal Date' ? '★' : '●'}</span> {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function RoadmapPage() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [examDate, setExamDate] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const refresh = () => {
      const normalized = readAttempts()
        .filter(Boolean)
        .map((a: any, idx: number) => ({
          attempt: Number(a.attempt ?? idx + 1),
          label: a.label || `Mock ${idx + 1}`,
          score: Number(a.score ?? 0),
          correct: Number(a.correct ?? 0),
          total: Number(a.total ?? 0),
          dateISO: a.dateISO || a.finishedAt || new Date().toISOString(),
          registryReady: Number(a.score ?? 0) >= 90,
          bankId: Number(a.bankId ?? 1),
          category: a.category || 'Full Exam',
          type: a.type || '',
          questionsTaken: Number(a.questionsTaken ?? a.total ?? 0),
          timeSpentSeconds: Number(a.timeSpentSeconds ?? 0),
        }))
        .sort((a: Attempt, b: Attempt) => Date.parse(a.dateISO) - Date.parse(b.dateISO));

      setAttempts(normalized);
      const saved = readExamDate();
      const today = new Date().toISOString().split('T')[0];

      setExamDate(saved && saved >= today ? saved : '');
      setMounted(true);
    };

    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('rtt-progress-updated', refresh as EventListener);

    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('rtt-progress-updated', refresh as EventListener);
    };
  }, []);

  const daysLeft = examDate ? daysUntil(examDate) : null;
  const miniMockAttempts = useMemo(() => attempts.filter((a) => getAttemptKind(a) === 'Mini Mock'), [attempts]);
  const averageMiniMockScore = useMemo(() => {
    if (!miniMockAttempts.length) return null;
    return Math.round(miniMockAttempts.reduce((sum, a) => sum + a.score, 0) / miniMockAttempts.length);
  }, [miniMockAttempts]);
  const weakestCategory = useMemo(() => {
    if (miniMockAttempts.length < 5) return null as [string, number] | null;
    const bucket = new Map<string, number[]>();
    attempts.filter((a) => getAttemptKind(a) === 'Category Mock').forEach((a) => {
      const key = a.category || 'Unknown';
      bucket.set(key, [...(bucket.get(key) || []), a.score]);
    });
    const averaged = [...bucket.entries()].map(([label, scores]) => [label, Math.round(scores.reduce((s, n) => s + n, 0) / scores.length)] as [string, number]);
    if (!averaged.length) return null;
    averaged.sort((a, b) => a[1] - b[1]);
    return averaged[0];
  }, [attempts, miniMockAttempts.length]);

  if (!mounted) return <div className="max-w-6xl" />;

  return (
    <div className="max-w-[88rem] pb-8">
      <StartHereTour
        storageKey="rtt_tour_roadmap"
        steps={[
          { selector: '[data-tour="roadmap-header"]', title: 'Roadmap', body: 'Use this page to track your score trend as you move through the RTT Mastery Method.' },
          { selector: '[data-tour="roadmap-date"]', title: 'Set your exam date', body: 'Add your exam date so your roadmap has a finish line.' },
          { selector: '[data-tour="roadmap-chart"]', title: 'Track your trend', body: 'This chart shows whether your scores are moving toward ARRT readiness.' },
          { selector: '[data-tour="roadmap-metrics"]', title: 'Watch your metrics', body: 'These metrics match the RTT Mastery Method page so the platform feels consistent.' },
        ]}
      />

      <section data-tour="roadmap-header" className="rounded-[32px] border border-emerald-400/15 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_42%),linear-gradient(to_bottom,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.28)] md:p-8">
        <div className="max-w-4xl">
          <div className="inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">Roadmap</div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-5xl">Your path to test-ready</h1>
          <p className="mt-4 max-w-4xl text-lg leading-8 text-white/72 md:text-xl md:leading-9">
            Track your exam date, watch your score trend, and use this page as the analytics view of your RTT Mastery Method progress.
          </p>
        </div>

        <div data-tour="roadmap-date" className="mt-8 rounded-[28px] border border-white/10 bg-black/20 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold text-white">ARRT exam date</div>
              <div className="mt-1 text-sm text-white/70">
                {examDate ? (
                  <>
                    {formatInputDate(examDate)}
                    {typeof daysLeft === 'number' ? <span className="ml-2 text-white/60">({daysLeft} days left)</span> : null}
                  </>
                ) : (
                  <>Add your target exam date so your roadmap has a finish line.</>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
<input
  type="date"
  value={examDate}
  min={new Date().toISOString().split('T')[0]}
  onChange={(e) => {
    const today = new Date().toISOString().split('T')[0];
    const next = e.target.value;

    const safeDate = next < today ? today : next;

    setExamDate(safeDate);
    writeExamDate(safeDate);
  }}
  className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
/>
              {examDate ? (
                <button
                  type="button"
                  onClick={() => {
                    setExamDate('');
                    writeExamDate('');
                  }}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8 rounded-[28px] border border-white/10 bg-black/20 p-5">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">How roadmap works</div>
        <div className="mt-3 text-sm text-white/70">Your scores are tracked here over time. <span className="font-semibold text-white">Practice Test</span> shows your baseline before review.</div>
        <div className="mt-2 text-sm text-white/60"><span className="font-semibold text-white">Mini Mock Exam</span> shows how much you improved after flashcards. Use this page to see whether your scores are moving toward ARRT readiness.</div>
      </div>

      <div data-tour="roadmap-chart" className="mt-8"><TrendChart data={attempts} examDate={examDate} /></div>

      <div data-tour="roadmap-metrics" className="mt-8 grid gap-4 xl:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
          <div className="text-sm font-semibold text-white">Average Mini Mock Score</div>
          <div className="mt-3 text-2xl font-semibold text-white">{averageMiniMockScore != null ? `${averageMiniMockScore}%` : 'Not enough data yet'}</div>
          <div className="mt-2 text-sm leading-6 text-white/65">{averageMiniMockScore != null ? `Based on ${miniMockAttempts.length} Mini Mock Exam score${miniMockAttempts.length === 1 ? '' : 's'}.` : 'Take a Mini Mock Exam to calculate average.'}</div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
          <div className="text-sm font-semibold text-white">Weakest Category</div>
          <div className="mt-3 text-2xl font-semibold text-white">{weakestCategory ? weakestCategory[0] : 'Not enough data yet'}</div>
          <div className="mt-2 text-sm leading-6 text-white/65">{weakestCategory ? `Current Avg: ${weakestCategory[1]}%` : 'Take at least 5 Mini Mocks to calculate weakest category.'}</div>
          <div className="mt-2 text-sm text-white/55">Current Avg: {weakestCategory ? `${weakestCategory[1]}%` : '—'}<br />Goal: 90%+</div>
        </div>
      </div>

      {!!attempts.length && (
        <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {attempts.map((d, i) => (
            <div key={`${d.attempt}-${i}`} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/75">
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-white">{getAttemptDisplayName(d, i)}</div>
                <div style={{ color: colorForAttempt(d) }}>{d.score}%</div>
              </div>
              <div className="mt-2 text-xs text-white/55">{formatDate(d.dateISO)}</div>
              <div className="mt-2 text-xs text-white/65">Bank: QBank {d.bankId ?? 1}</div>
              <div className="mt-1 text-xs text-white/65">Type: {getAttemptKind(d) === 'Practice Test' ? 'Pre-Test' : getAttemptKind(d) === 'Mini Mock' ? 'Post-Test' : getAttemptKind(d)}</div>
                <div className="mt-1 text-xs text-white/65">Attempt: {getOrdinal(getAttemptIteration(attempts, i))}</div>
              <div className="mt-1 text-xs text-white/65">Questions: {d.questionsTaken || d.total}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
