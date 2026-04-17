'use client';

import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { CE_COURSES } from './_data/ceCourses';

const SHOW_CE = false;

export default function CEPage() {
  if (!SHOW_CE) {
    redirect('/app/dashboard');
  }

  return (
    <div className="max-w-6xl pb-8">
      <section className="rounded-[32px] border border-emerald-400/15 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_42%),linear-gradient(to_bottom,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
              CE
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Continuing education for working technologists
            </h1>
            <p className="mt-5 max-w-3xl text-xl leading-9 text-white/72">
              Focused self-study CE courses with a post-test, certificate, and a
              clean completion flow after passing.
            </p>
          </div>

          <div className="w-full max-w-sm rounded-[28px] border border-white/10 bg-black/20 p-5">
            <div className="text-sm text-white/60">How CE works</div>
            <div className="mt-3 text-3xl font-semibold text-white">
              Study → Test → Certificate
            </div>
            <div className="mt-3 text-base leading-7 text-white/65">
              Each course is built to help technologists complete credits
              without unnecessary filler. Finish the post-test and download your
              certificate after passing.
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {CE_COURSES.map((c) => {
          const isApproved = c.approvalStatus === 'approved';
          return (
            <div
              key={c.id}
              className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.08),transparent_36%),linear-gradient(to_bottom,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:border-white/15"
            >
              <div className="flex gap-4">
                <div className="relative h-44 w-32 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                  {c.coverImage ? (
                    <Image
                      src={c.coverImage}
                      alt={c.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-white/50">
                      No image
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-semibold tracking-tight text-white">
                      {c.title}
                    </h2>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
                      {isApproved ? 'Approved' : 'Pending approval'}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
                      New
                    </span>
                  </div>

                  <div className="mt-3 text-sm text-white/60">
                    {c.credits} Credits · {c.category} · ~{c.minutesEstimate}{' '}
                    min
                  </div>
                  <p className="mt-4 text-base leading-7 text-white/70">
                    {c.description}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Link
                      href={`/app/ce/${c.id}`}
                      className="inline-flex items-center gap-2 rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black hover:brightness-95"
                    >
                      View Course →
                    </Link>
                    {typeof c.priceUsd === 'number' && isApproved ? (
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-semibold text-white/80">
                        ${c.priceUsd}
                      </span>
                    ) : null}
                  </div>

                  {!isApproved && (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-white/60">
                      Not yet for sale — pending ASRT approval. ASRT reviewers
                      can access via the Reviewer Login.
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
