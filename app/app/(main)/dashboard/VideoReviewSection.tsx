'use client';

import TrackedYoutubeLink from '@/app/app/_components/TrackedYoutubeLink';

const VIDEO_URL = 'https://www.youtube.com/watch?v=Q-3Ntw8z7xk';
const PRIMARY_THUMBNAIL_URL =
  'https://img.youtube.com/vi/Q-3Ntw8z7xk/maxresdefault.jpg';
const FALLBACK_THUMBNAIL_URL =
  'https://img.youtube.com/vi/Q-3Ntw8z7xk/hqdefault.jpg';

type VideoPart = {
  part: number;
  label: string;
  status: 'Now Available' | 'Coming Soon';
  href?: string;
  available: boolean;
};

const videoReviewByBank = {
  1: {
    hasAvailableVideo: true,
    title: '20-Question ARRT® Video Review',
    secondary: 'Mock exam walkthrough with answers and explanations.',
    description:
      'Review 20 ARRT®-style radiography practice questions with answers, explanations, and test-taking reminders.',
    href: VIDEO_URL,
    thumbnail: PRIMARY_THUMBNAIL_URL,
    fallbackThumbnail: FALLBACK_THUMBNAIL_URL,
  },
  2: { hasAvailableVideo: false },
  3: { hasAvailableVideo: false },
  4: { hasAvailableVideo: false },
  5: { hasAvailableVideo: false },
} as const;

function normalizeBankNumber(bankNumber?: number | null) {
  return bankNumber && bankNumber >= 1 && bankNumber <= 5
    ? (bankNumber as 1 | 2 | 3 | 4 | 5)
    : null;
}

function buildVideoParts(hasAvailableVideo: boolean): VideoPart[] {
  return Array.from({ length: 10 }, (_, idx) => {
    const part = idx + 1;
    const available = hasAvailableVideo && part === 1;

    return {
      part,
      label: '20Q Review',
      status: available ? 'Now Available' : 'Coming Soon',
      href: available ? VIDEO_URL : undefined,
      available,
    };
  });
}

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

function VideoPartRow({
  item,
  bankNumber,
  videoTitle,
}: {
  item: VideoPart;
  bankNumber?: number | null;
  videoTitle?: string;
}) {
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
      <TrackedYoutubeLink
        href={item.href}
        location="dashboard_video_review_row"
        label={`Video ${item.part}: ${item.label}`}
        bankNumber={bankNumber}
        videoTitle={videoTitle}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-8 w-full min-w-0 items-center justify-between gap-2 overflow-hidden rounded-xl border border-yellow-400/55 bg-yellow-400/10 px-3 py-1.5 text-xs font-medium text-white transition hover:border-yellow-300/70 hover:bg-yellow-400/15"
      >
        {content}
      </TrackedYoutubeLink>
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

export default function VideoReviewSection({
  bankNumber,
}: {
  bankNumber?: number | null;
}) {
  const normalizedBankNumber = normalizeBankNumber(bankNumber);
  const displayBankNumber = normalizedBankNumber ?? 'TBD';
  const bankConfig = normalizedBankNumber
    ? videoReviewByBank[normalizedBankNumber]
    : { hasAvailableVideo: false };
  const hasAvailableVideo = bankConfig.hasAvailableVideo === true;
  const videoParts = buildVideoParts(hasAvailableVideo);
  const title = hasAvailableVideo
    ? videoReviewByBank[1].title
    : `Bank ${displayBankNumber} Video Reviews Coming Soon`;
  const secondary = hasAvailableVideo
    ? videoReviewByBank[1].secondary
    : 'Video walkthroughs for this bank have not been added yet.';
  const description = hasAvailableVideo
    ? videoReviewByBank[1].description
    : 'Once available, these videos will review ARRT®-style questions from this mock exam bank with answers, explanations, and test-taking reminders.';
  const videoTitle = hasAvailableVideo ? videoReviewByBank[1].title : undefined;

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
        {hasAvailableVideo
          ? 'Watch ARRT®-style question walkthroughs to reinforce concepts and improve your test-taking.'
          : 'Video walkthroughs for this mock exam bank are coming soon.'}
      </p>

      <div className="mt-4 grid w-full min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] xl:items-start">
        <div className="min-w-0">
          <h4 className="text-xl font-semibold leading-tight text-white">
            {title}
          </h4>
          <div className="mt-2 text-sm font-medium text-yellow-100/80">
            {secondary}
          </div>

          {hasAvailableVideo ? (
            <TrackedYoutubeLink
              href={VIDEO_URL}
              location="dashboard_video_review_thumbnail"
              label="20-Question ARRT® Video Review thumbnail"
              bankNumber={normalizedBankNumber}
              videoTitle={videoTitle}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Watch 20-Question ARRT® Video Review"
              className="group relative mt-4 block w-full min-w-0 max-w-[420px] overflow-hidden rounded-2xl border border-yellow-400/35 bg-black/50 shadow-[inset_0_0_36px_rgba(250,204,21,0.08)]"
            >
              <div className="relative aspect-video">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={videoReviewByBank[1].thumbnail}
                  alt="20-Question ARRT® video review thumbnail"
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = videoReviewByBank[1].fallbackThumbnail;
                  }}
                />
                <div className="pointer-events-none absolute inset-0 bg-black/10" />
                <div className="absolute inset-0 grid place-items-center">
                  <span className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-black/55 shadow-[0_0_24px_rgba(250,204,21,0.24)] transition group-hover:bg-yellow-400/20">
                    <PlayIcon className="ml-1 border-l-yellow-100" />
                  </span>
                </div>
              </div>
            </TrackedYoutubeLink>
          ) : (
            <div className="mt-4 flex aspect-video w-full max-w-[420px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-center shadow-[inset_0_0_36px_rgba(255,255,255,0.03)]">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-white/35">
                Bank {displayBankNumber}
              </div>
              <div className="mt-3 text-xl font-semibold uppercase tracking-[0.14em] text-white/55">
                Video Reviews
              </div>
              <div className="mt-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-yellow-200/80">
                Coming Soon
              </div>
            </div>
          )}

          <p className="mt-3 text-sm leading-6 text-white/62">
            {description}
          </p>
          {hasAvailableVideo ? (
            <TrackedYoutubeLink
              href={VIDEO_URL}
              location="dashboard_video_review_button"
              label="Watch Review"
              bankNumber={normalizedBankNumber}
              videoTitle={videoTitle}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-yellow-400 px-5 py-2.5 text-sm font-bold text-black transition hover:bg-yellow-300"
            >
              <PlayIcon className="border-l-black" />
              Watch Review
            </TrackedYoutubeLink>
          ) : (
            <button
              type="button"
              disabled
              className="mt-4 inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-bold text-white/45"
            >
              Coming Soon
            </button>
          )}
        </div>

        <div className="grid w-full min-w-0 gap-1.5 overflow-hidden">
          {videoParts.map((item) => (
            <VideoPartRow
              key={item.part}
              item={item}
              bankNumber={normalizedBankNumber}
              videoTitle={videoTitle}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
