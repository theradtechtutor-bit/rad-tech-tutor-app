'use client';

import { useEffect, useMemo, useState } from 'react';

type Step = {
  selector: string;
  title: string;
  body: string;
};

type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type Props = {
  storageKey: string;
  steps: Step[];
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function StartHereTour({ storageKey, steps }: Props) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [mounted, setMounted] = useState(false);

  const step = useMemo(() => steps[index] || null, [steps, index]);

  function updateRect() {
    if (!step) return;
    const el = document.querySelector(step.selector) as HTMLElement | null;
    if (!el) {
      setRect(null);
      return;
    }

    el.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });

    const r = el.getBoundingClientRect();
    const pad = 10;

    setRect({
      top: Math.max(12, r.top - pad),
      left: Math.max(12, r.left - pad),
      width: r.width + pad * 2,
      height: r.height + pad * 2,
    });
  }

  function startTour() {
    setIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.setTimeout(() => {
      setOpen(true);
      try {
        window.localStorage.setItem(`${storageKey}_seen`, '1');
      } catch {}
    }, 450);
  }

  function closeTour() {
    setOpen(false);
  }

  function next() {
    if (index >= steps.length - 1) {
      closeTour();
      return;
    }
    setIndex((n) => n + 1);
  }

  function prev() {
    setIndex((n) => Math.max(0, n - 1));
  }

  useEffect(() => {
    setMounted(true);
    try {
      const seen = window.localStorage.getItem(`${storageKey}_seen`);
      if (!seen) {
        const t = window.setTimeout(() => startTour(), 700);
        return () => window.clearTimeout(t);
      }
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => updateRect(), 60);
    const onChange = () => updateRect();
    window.addEventListener('resize', onChange);
    window.addEventListener('scroll', onChange, true);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('resize', onChange);
      window.removeEventListener('scroll', onChange, true);
    };
  }, [open, index, step]);

  const cardStyle = rect
    ? {
        top: clamp(rect.top + rect.height + 14, 16, window.innerHeight - 230),
        left: clamp(rect.left, 16, Math.max(16, window.innerWidth - 420)),
      }
    : { top: 24, left: 24 };

  if (!mounted) return null;

  return (
    <>
      <button
        type="button"
        onClick={startTour}
        className="fixed bottom-5 right-5 z-[70] rounded-full border border-white/15 bg-black/70 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur hover:bg-black/80"
      >
        Start Here
      </button>

      {open ? (
        <div className="pointer-events-none fixed inset-0 z-[80]">
          <div className="absolute inset-0 bg-black/65" />
          {rect ? (
            <div
              className="absolute rounded-3xl border-2 border-yellow-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.68)] transition-all duration-200"
              style={{
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
              }}
            />
          ) : null}

          <div
            className="pointer-events-auto fixed z-[81] w-[min(380px,calc(100vw-32px))] rounded-3xl border border-white/10 bg-neutral-950/95 p-5 text-white shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur"
            style={cardStyle}
          >
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-300">
              Start here
            </div>
            <div className="mt-2 text-xl font-semibold">{step?.title}</div>
            <div className="mt-3 text-sm leading-6 text-white/75">{step?.body}</div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <div className="text-xs text-white/45">
                {index + 1} / {steps.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeTour}
                  className="rounded-2xl bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15"
                >
                  Skip
                </button>
                {index > 0 ? (
                  <button
                    type="button"
                    onClick={prev}
                    className="rounded-2xl bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15"
                  >
                    Back
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={next}
                  className="rounded-2xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:brightness-95"
                >
                  {index === steps.length - 1 ? 'Done' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
