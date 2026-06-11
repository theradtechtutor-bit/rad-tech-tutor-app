'use client';

import Image from 'next/image';
import Link from 'next/link';
import posthog from 'posthog-js';
import { useCallback, useEffect, useState } from 'react';

type SuccessScreenshot = {
  id: string;
  src: string;
  alt: string;
  title: string;
  type: 'email' | 'message';
  width: number;
  height: number;
  externalUrl?: string;
  externalLabel?: string;
};

const loreinnneeTikTokUrl =
  'https://www.tiktok.com/@loreinnnee._/photo/7636538802353261855?is_from_webapp=1&sender_device=pc&web_id=7634784942032094751';

const successScreenshots: SuccessScreenshot[] = [
  {
    id: 'arrt-recommendation-post-loreinnnee',
    src: '/student-success/loreinnnee-arrt-pass-tiktok-post-v2.png',
    alt: 'Redacted student social post recommending The Rad Tech Tutor after passing on the first try.',
    title: 'ARRT® pass TikTok post',
    type: 'message',
    width: 1125,
    height: 2285,
    externalUrl: loreinnneeTikTokUrl,
    externalLabel: 'View original TikTok post by @loreinnnee._',
  },
  {
    id: 'rene-arellano-arrt-pass-85',
    src: '/student-success/rene-arellano-arrt-pass-85-name-blurred.png',
    alt: 'Redacted student email sharing that they passed the ARRT exam with an 85 percent score.',
    title: 'ARRT® exam follow-up',
    type: 'email',
    width: 1198,
    height: 826,
  },
  {
    id: 'stephanie-arrt-pass-92',
    src: '/student-success/stephanie-arrt-pass-92-name-blurred-v2.png',
    alt: 'Redacted student email sharing that they passed the ARRT exam with a 92 score.',
    title: 'ARRT® exam follow-up',
    type: 'email',
    width: 1194,
    height: 1060,
  },
  {
    id: 'arrt-pass-93-email',
    src: '/student-success/arrt-pass-93-email-name-avatar-covered-v3.png',
    alt: 'Redacted student email sharing that they passed the ARRT exam with a 93 score.',
    title: 'ARRT® exam follow-up',
    type: 'email',
    width: 826,
    height: 1254,
  },
  {
    id: 'sanaa-palmer-pass',
    src: '/student-success/sanaa-palmer-name-photo-blurred.png',
    alt: 'Redacted student message sharing that they passed the exam.',
    title: 'ARRT® pass email',
    type: 'email',
    width: 1780,
    height: 328,
  },
  {
    id: 'lumiere-kazadi-pass-86',
    src: '/student-success/lumiere-kazadi-name-blurred.png',
    alt: 'Redacted student email sharing that they passed with an 86 score.',
    title: 'ARRT® exam follow-up',
    type: 'email',
    width: 1316,
    height: 748,
  },
  {
    id: 'chandler-brugh-pass-81',
    src: '/student-success/chandler-brugh-name-blurred.png',
    alt: 'Redacted student email sharing that they passed with an 81 score.',
    title: 'ARRT® exam follow-up',
    type: 'email',
    width: 1118,
    height: 622,
  },
  {
    id: 'text-message-pass-80',
    src: '/student-success/text-message-pass-photo-blurred.png',
    alt: 'Student text message sharing that they passed with an 80 score.',
    title: 'ARRT® pass TikTok message',
    type: 'message',
    width: 1332,
    height: 1268,
  },
];

function captureStudentSuccessEvent(
  eventName:
    | 'student_success_page_viewed'
    | 'student_success_screenshot_opened'
    | 'student_success_screenshot_closed',
  properties: Record<string, unknown>
) {
  if (typeof window === 'undefined') return;
  if (typeof posthog?.capture !== 'function') return;

  try {
    posthog.capture(eventName, properties);
  } catch {
    // Analytics should never interfere with the student success gallery.
  }
}

export default function StudentSuccessPage() {
  const [selectedScreenshot, setSelectedScreenshot] = useState<
    (typeof successScreenshots)[number] | null
  >(null);

  useEffect(() => {
    captureStudentSuccessEvent('student_success_page_viewed', {
      sourcePage: '/app/student-success',
      screenshotCount: successScreenshots.length,
    });
  }, []);

  const openScreenshot = useCallback((item: (typeof successScreenshots)[number]) => {
    captureStudentSuccessEvent('student_success_screenshot_opened', {
      screenshotId: item.id,
      title: item.title,
      type: item.type,
      imageSrc: item.src,
      sourcePage: '/app/student-success',
    });

    setSelectedScreenshot(item);
  }, []);

  const closeScreenshot = useCallback(() => {
    if (selectedScreenshot) {
      captureStudentSuccessEvent('student_success_screenshot_closed', {
        screenshotId: selectedScreenshot.id,
        title: selectedScreenshot.title,
        type: selectedScreenshot.type,
        sourcePage: '/app/student-success',
      });
    }

    setSelectedScreenshot(null);
  }, [selectedScreenshot]);

  useEffect(() => {
    if (!selectedScreenshot) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeScreenshot();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeScreenshot, selectedScreenshot]);

  return (
    <div className="relative mx-auto max-w-6xl overflow-hidden pb-4">
      <div className="pointer-events-none absolute left-1/2 top-4 h-80 w-[720px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.16),transparent_66%)] blur-3xl" />

      <section className="relative px-4 pt-10 text-center md:pt-14">
        <div className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-200/90">
          Real Student Emails
        </div>

        <h1 className="mt-6 text-5xl font-semibold tracking-tight text-white drop-shadow-[0_8px_28px_rgba(0,0,0,0.45)] md:text-7xl">
          Student{' '}
          <span className="text-emerald-300">Success</span>
        </h1>

        <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-[color:var(--rtt-muted)] md:text-lg">
          Real emails from students who used The Rad Tech Tutor and passed the
          ARRT® exam.
        </p>
        <p className="mx-auto mt-2 max-w-2xl text-base leading-7 text-white/52 md:text-lg">
          Shared with permission or anonymized for privacy.
        </p>
      </section>

      <section className="relative mx-auto mt-8 max-w-4xl rounded-[24px] border border-emerald-300/25 bg-[linear-gradient(135deg,rgba(16,185,129,0.12),rgba(5,8,12,0.96)_55%,rgba(0,0,0,0.98))] p-5 shadow-[0_18px_70px_rgba(16,185,129,0.14)] md:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-emerald-300/25 bg-emerald-400/10 text-emerald-200 shadow-[0_0_30px_rgba(16,185,129,0.12)]">
              <span className="text-xl leading-none">✉</span>
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-white">
                Passed your ARRT® exam?
              </h2>
              <p className="mt-1 text-sm leading-6 text-[color:var(--rtt-muted)]">
                Reply to our follow-up email to be featured.
              </p>
            </div>
          </div>

          <Link
            href="/help"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-yellow-400 px-6 py-3 text-sm font-bold text-black shadow-[0_10px_30px_rgba(250,204,21,0.18)] transition hover:bg-yellow-300"
          >
            Share Your Result
          </Link>
        </div>
      </section>

      <section className="relative mt-10">
        <div className="columns-1 gap-5 md:columns-2 xl:columns-3">
          {successScreenshots.map((item, index) => (
            <div
              key={item.id}
              className="group mb-5 inline-block w-full break-inside-avoid overflow-hidden rounded-[24px] border border-emerald-400/35 bg-emerald-500/10 align-top shadow-[0_0_0_1px_rgba(45,212,191,0.16),0_0_24px_rgba(16,185,129,0.12),0_18px_70px_rgba(0,0,0,0.24)] transition hover:-translate-y-0.5 hover:border-emerald-300/45 hover:bg-emerald-500/12"
            >
              <div className="border-b border-white/10 px-4 py-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-[color:var(--rtt-muted)]">
                    {item.type === 'email'
                      ? 'Real student email screenshot · Click to enlarge'
                      : 'Real student message screenshot · Click to enlarge'}
                  </p>
                  {item.externalUrl && item.externalLabel && (
                    <a
                      href={item.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex text-xs font-semibold text-emerald-200 transition hover:text-yellow-300"
                    >
                      {item.externalLabel}
                    </a>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => openScreenshot(item)}
                className="block w-full cursor-pointer text-left"
              >
                <div className="bg-white p-2">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={item.width}
                    height={item.height}
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="h-auto w-full rounded-[18px]"
                    priority={index === 0}
                  />
                </div>
              </button>
            </div>
          ))}
        </div>
      </section>

      {selectedScreenshot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedScreenshot.title} enlarged screenshot`}
          onClick={closeScreenshot}
        >
          <div
            className="relative max-h-[85vh] max-w-[90vw] overflow-hidden rounded-[24px] border border-emerald-400/35 bg-black/70 p-3 shadow-[0_0_0_1px_rgba(45,212,191,0.16),0_24px_90px_rgba(0,0,0,0.55)]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeScreenshot}
              className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/75 text-xl leading-none text-white transition hover:border-emerald-300/45 hover:bg-emerald-500/15"
              aria-label="Close screenshot preview"
            >
              x
            </button>

            <Image
              src={selectedScreenshot.src}
              alt={selectedScreenshot.alt}
              width={selectedScreenshot.width}
              height={selectedScreenshot.height}
              sizes="90vw"
              className="max-h-[82vh] w-auto max-w-[86vw] rounded-[18px] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
