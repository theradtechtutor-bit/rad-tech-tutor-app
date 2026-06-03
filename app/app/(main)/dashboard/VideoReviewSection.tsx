'use client';

const VIDEO_URL = 'https://www.youtube.com/watch?v=Q-3Ntw8z7xk';
const PRIMARY_THUMBNAIL_URL =
  'https://img.youtube.com/vi/Q-3Ntw8z7xk/maxresdefault.jpg';
const FALLBACK_THUMBNAIL_URL =
  'https://img.youtube.com/vi/Q-3Ntw8z7xk/hqdefault.jpg';

const videoParts = [
  {
    part: 1,
    label: '20Q Review',
    status: 'Now Available',
    href: VIDEO_URL,
    available: true,
  },
  {
    part: 2,
    label: '20Q Review',
    status: 'Coming Soon',
    available: false,
  },
  {
    part: 3,
    label: '20Q Review',
    status: 'Coming Soon',
    available: false,
  },
  {
    part: 4,
    label: '20Q Review',
    status: 'Coming Soon',
    available: false,
  },
  {
    part: 5,
    label: '20Q Review',
    status: 'Coming Soon',
    available: false,
  },
  {
    part: 6,
    label: '20Q Review',
    status: 'Coming Soon',
    available: false,
  },
  {
    part: 7,
    label: '20Q Review',
    status: 'Coming Soon',
    available: false,
  },
  {
    part: 8,
    label: '20Q Review',
    status: 'Coming Soon',
    available: false,
  },
  {
    part: 9,
    label: '20Q Review',
    status: 'Coming Soon',
    available: false,
  },
  {
    part: 10,
    label: '20Q Review',
    status: 'Coming Soon',
    available: false,
  },
];

function PlayIcon({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent ${className}`}
    />
  );
}

function ClockIcon() {
  return (
    <span
      aria-hidden="true"
      className="relative inline-flex h-3.5 w-3.5 rounded-full border border-white/20"
    >
      <span className="absolute left-[6px] top-[3px] h-[5px] w-px rounded-full bg-white/25" />
      <span className="absolute left-[6px] top-[7px] h-px w-[4px] rounded-full bg-white/25" />
    </span>
  );
}

function VideoPartRow({ item }: { item: (typeof videoParts)[number] }) {
  const content = (
    <>
      <span className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/[0.04]">
          {item.available ? (
            <PlayIcon className="border-l-yellow-300" />
          ) : (
            <ClockIcon />
          )}
        </span>
        <span className="truncate">
          Video {item.part}: {item.label}
        </span>
      </span>
      <span
        className={
          item.available
            ? 'shrink-0 rounded-full bg-emerald-400/12 px-2 py-0.5 text-[10px] font-semibold text-emerald-200'
            : 'shrink-0 text-[11px] text-white/45'
        }
      >
        {item.status}
      </span>
    </>
  );

  if (item.available && item.href) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-8 w-full min-w-0 items-center justify-between gap-2 overflow-hidden rounded-xl border border-yellow-400/55 bg-yellow-400/10 px-3 py-1.5 text-xs font-medium text-white transition hover:border-yellow-300/70 hover:bg-yellow-400/15"
      >
        {content}
      </a>
    );
  }

  return (
    <div
      className="flex min-h-8 w-full min-w-0 items-center justify-between gap-2 overflow-hidden rounded-xl border border-white/10 bg-white/[0.025] px-3 py-1.5 text-xs text-white/55"
    >
      {content}
    </div>
  );
}

export default function VideoReviewSection() {
  return (
    <section className="w-full overflow-hidden rounded-3xl border border-white/10 bg-black/20 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-semibold leading-none text-white">
          Video Review
        </h3>
        <span className="rounded-full border border-yellow-400/30 bg-yellow-400/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-yellow-200">
          NEW
        </span>
      </div>

      <p className="mt-2 text-sm leading-5 text-white/62">
        Watch ARRT®-style question walkthroughs to reinforce concepts and
        improve your test-taking.
      </p>

      <div className="mt-4 grid w-full min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] xl:items-start">
        <div className="min-w-0">
          <h4 className="text-xl font-semibold leading-tight text-white">
            20-Question ARRT® Video Review
          </h4>
          <div className="mt-2 text-sm font-medium text-yellow-100/80">
            Mock exam walkthrough with answers and explanations.
          </div>

          <a
            href={VIDEO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Watch 20-Question ARRT® Video Review"
            className="group relative mt-4 block w-full min-w-0 max-w-[420px] overflow-hidden rounded-2xl border border-yellow-400/35 bg-black/50 shadow-[inset_0_0_36px_rgba(250,204,21,0.08)]"
          >
            <div className="relative aspect-video">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={PRIMARY_THUMBNAIL_URL}
                alt="20-Question ARRT® video review thumbnail"
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = FALLBACK_THUMBNAIL_URL;
                }}
              />
              <div className="pointer-events-none absolute inset-0 bg-black/10" />
              <div className="absolute inset-0 grid place-items-center">
                <span className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-black/55 shadow-[0_0_24px_rgba(250,204,21,0.24)] transition group-hover:bg-yellow-400/20">
                  <PlayIcon className="ml-1 border-l-yellow-100" />
                </span>
              </div>
            </div>
          </a>

          <p className="mt-3 text-sm leading-6 text-white/62">
            Review 20 ARRT®-style radiography practice questions with answers,
            explanations, and test-taking reminders.
          </p>
          <a
            href={VIDEO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-yellow-400 px-5 py-2.5 text-sm font-bold text-black transition hover:bg-yellow-300"
          >
            <PlayIcon className="border-l-black" />
            Watch Review
          </a>
        </div>

        <div className="grid w-full min-w-0 gap-1.5 overflow-hidden">
          {videoParts.map((item) => (
            <VideoPartRow key={item.part} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
