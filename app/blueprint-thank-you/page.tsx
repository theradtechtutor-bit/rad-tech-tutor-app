'use client';

import Link from 'next/link';
import { useEffect } from 'react';

const PDF_PATH = '/xray-blueprint.pdf';
const YT_EMBED = 'https://www.youtube.com/embed/T7Smcvumu4w';

export default function BlueprintThankYouPage() {
  useEffect(() => {
    // Trigger download quickly after page load.
    const t = setTimeout(() => {
      window.location.href = PDF_PATH;
    }, 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,rgba(45,212,191,0.14),transparent_55%),#000] text-white">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="flex items-center justify-between">
          <Link href="/xray-blueprint" className="text-sm text-white/70 hover:text-white">
            ← Back
          </Link>
          <Link
            href="https://www.youtube.com/@RadTechTutor"
            target="_blank"
            className="text-sm text-white/70 hover:text-white"
          >
            YouTube →
          </Link>
        </div>

        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-[0_0_40px_-20px_rgba(45,212,191,0.5)]">
          <div className="text-xs font-semibold tracking-widest text-teal-300/90">
            SUCCESS • PDF
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Your Blueprint Is Downloading…
          </h1>
          <p className="mt-3 text-white/70">
            If your download didn’t start automatically, use the button below.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href={PDF_PATH}
              download
              className="inline-flex items-center justify-center rounded-xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black hover:bg-yellow-300"
            >
              Download Again
            </a>
            <Link
              href="/xray-blueprint"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
            >
              Back to Page
            </Link>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-black/40 p-5">
            <div className="text-sm font-semibold">Quick win for X-ray school</div>
            <p className="mt-2 text-sm text-white/70">
              I’m building a full ARRT prep system next. For now, watch this and take the next step.
            </p>

            <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
              <iframe
                className="aspect-video w-full"
                src={YT_EMBED}
                title="Rad Tech Tutor"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Link href="/app/practice" className="text-sm font-semibold text-teal-300 hover:text-teal-200">
                View ARRT Readiness System →
              </Link>
              <a
                href={PDF_PATH}
                target="_blank"
                className="text-sm text-white/60 hover:text-white"
              >
                Open PDF
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
