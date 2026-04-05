'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CE_COURSES } from '../_data/ceCourses';

type Summary = {
  attemptsUsed?: number;
  attempts_used?: number;
  attemptsRemaining?: number;
  maxAttempts?: number;
  lastAttempt?: { score_pct?: number; passed?: boolean; created_at?: string } | null;
  certificate?: { cert_number?: string; issued_at?: string; score_pct?: number } | null;
  owned?: boolean;
  purchased?: boolean;
  access?: { owned?: boolean; purchased?: boolean } | null;
};

export default function CECoursePage() {
  const params = useParams() as { courseId?: string };
  const router = useRouter();
  const courseId = String(params?.courseId || '').trim();
  const course = useMemo(() => CE_COURSES.find((c) => c.id === courseId), [courseId]);

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [isValidator, setIsValidator] = useState(false);
  const [validatorUser, setValidatorUser] = useState('');
  const [validatorPass, setValidatorPass] = useState('');
  const [validatorErr, setValidatorErr] = useState<string | null>(null);
  const [validatorBusy, setValidatorBusy] = useState(false);

  const isApproved = course?.approvalStatus === 'approved';
  const passPct = (course as any)?.test?.passPct ?? 75;
  const attemptsMax = 3;
  const canAccess = !!isValidator || (!!isApproved && !!purchased);

  const loadPageState = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);

    try {
      const profileRes = await fetch('/api/profile', { cache: 'no-store', credentials: 'include' }).catch(() => null);
      if (profileRes?.ok) {
        const data = await profileRes.json().catch(() => null);
        const uid = data?.user?.id || data?.profile?.user_id || data?.user_id || data?.id || null;
        setSignedIn(!!uid);
      } else {
        setSignedIn(false);
      }
    } catch {
      setSignedIn(false);
    }

    try {
      const v = await fetch('/api/validator/me', { cache: 'no-store', credentials: 'include' }).catch(() => null);
      const j = await v?.json().catch(() => ({}));
      setIsValidator(!!j?.authenticated);
    } catch {
      setIsValidator(false);
    }

    try {
      const res = await fetch(`/api/ce/${courseId}/summary`, { cache: 'no-store', credentials: 'include' }).catch(() => null);
      if (res?.ok) {
        const data = await res.json().catch(() => null);
        setSummary(data);
      } else {
        setSummary(null);
      }
    } catch {
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void loadPageState();
  }, [loadPageState]);

  useEffect(() => {
    const onFocus = () => {
      router.refresh();
      void loadPageState();
    };
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        router.refresh();
        void loadPageState();
      }
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [loadPageState, router]);

  useEffect(() => {
    if (!summary) return;
    const owned = !!summary?.owned || !!summary?.purchased || !!summary?.access?.owned || !!summary?.access?.purchased;
    setPurchased((prev) => prev || owned);
  }, [summary]);

  async function loginValidator(e?: React.FormEvent) {
    e?.preventDefault?.();
    setValidatorErr(null);
    setValidatorBusy(true);
    try {
      const res = await fetch('/api/validator/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: validatorUser, password: validatorPass }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.authenticated) {
        setValidatorErr('Invalid reviewer credentials.');
        return;
      }
      await loadPageState();
      router.refresh();
    } catch {
      setValidatorErr('Login failed.');
    } finally {
      setValidatorBusy(false);
    }
  }

  async function logoutValidator() {
    await fetch('/api/validator/logout', { method: 'POST', credentials: 'include' }).catch(() => null);
    setValidatorUser('');
    setValidatorPass('');
    setValidatorErr(null);
    await loadPageState();
    router.refresh();
  }

  if (!course) {
    return (
      <div className="mx-auto max-w-5xl">
        <button onClick={() => router.push('/app/ce')} className="rtt-btn rtt-card rounded-xl px-4 py-2">
          ← Back to CE
        </button>
        <div className="mt-4 text-sm text-white/70">Course not found.</div>
      </div>
    );
  }

  const attemptsUsed = Number(summary?.attemptsUsed ?? summary?.attempts_used ?? 0) || 0;
  const attemptsRemaining = Number(summary?.attemptsRemaining ?? Math.max(0, attemptsMax - attemptsUsed));
  const pdfHref = course?.pdfPath ? '/' + String(course.pdfPath).replace(/^\/+/, '') : '#';
  const showAttempts = (signedIn || isValidator) && canAccess;
  const hasCertificate = !!summary?.certificate?.cert_number || !!summary?.certificate;

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/app/ce')}
          className="rtt-btn rtt-card rounded-xl px-4 py-2"
        >
          ← Back to CE
        </button>
        <span className="rtt-pill rtt-card border border-white/10">Course</span>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 rounded-2xl rtt-card p-6">
          <h1 className="text-2xl font-semibold">{course.title}</h1>
          <div className="mt-2 text-sm text-white/60">
            {course.credits} Credits · {course.category} · ~
            {course.minutesEstimate} min · Pass: {passPct}% · Attempts:{' '}
            {attemptsMax} max
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-semibold">Access</div>
            <div className="mt-1 text-sm text-white/70">
              {isValidator
                ? 'ASRT reviewer signed in'
                : signedIn
                  ? 'Signed in'
                  : 'Not signed in'}
            </div>

            <div className="mt-3 text-sm text-white/70">
              {canAccess ? (
                <span className="text-white/90">
                  You have access to this course.
                </span>
              ) : isApproved ? (
                <span className="text-white/70">
                  Purchase required to access course materials.
                </span>
              ) : (
                <span className="text-white/70">
                  Not yet for sale — pending ASRT approval. Coming soon.
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {canAccess ? (
                <>
                  <a
                    href={pdfHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-2xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:brightness-95"
                  >
                    Download Course Material (PDF)
                  </a>
                  {hasCertificate ? (
                    <>
                      <a
                        href={`/api/ce/${course.id}/certificate`}
                        className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
                      >
                        Download Certificate
                      </a>
                      <Link
                        href={`/app/ce/${course.id}/test/result`}
                        className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
                      >
                        View Result
                      </Link>
                    </>
                  ) : attemptsRemaining <= 0 ? (
                    <button
                      disabled
                      className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold text-white/60"
                    >
                      No attempts remaining
                    </button>
                  ) : (
                    <Link
                      href={`/app/ce/${course.id}/test`}
                      className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
                    >
                      Start Post-Test
                    </Link>
                  )}
                </>
              ) : (
                <button
                  disabled
                  className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold text-white/60"
                >
                  {isApproved
                    ? 'Purchase to Unlock'
                    : 'Coming Soon (Pending ASRT Approval)'}
                </button>
              )}
            </div>

            {!isValidator ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold">ASRT Reviewer Login</div>
                <form onSubmit={loginValidator} className="mt-3 grid gap-2">
                  <input
                    value={validatorUser}
                    onChange={(e) => setValidatorUser(e.target.value)}
                    placeholder="Username"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
                  />
                  <input
                    value={validatorPass}
                    onChange={(e) => setValidatorPass(e.target.value)}
                    placeholder="Password"
                    type="password"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="submit"
                      disabled={validatorBusy}
                      className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 disabled:opacity-60"
                    >
                      {validatorBusy ? 'Signing in…' : 'Reviewer Login'}
                    </button>
                    {validatorErr ? (
                      <div className="text-sm text-red-300">{validatorErr}</div>
                    ) : null}
                  </div>
                </form>
              </div>
            ) : (
              <div className="mt-4">
                <button
                  onClick={logoutValidator}
                  className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
                >
                  Reviewer Logout
                </button>
              </div>
            )}
          </div>

          {showAttempts ? (
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-wide text-white/50">
                  Attempts Used
                </div>
                <div className="mt-2 text-3xl font-semibold text-white">
                  {loading ? '—' : attemptsUsed}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-wide text-white/50">
                  Attempts Remaining
                </div>
                <div className="mt-2 text-3xl font-semibold text-white">
                  {loading ? '—' : attemptsRemaining}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-wide text-white/50">
                  Status
                </div>
                <div className="mt-2 text-lg font-semibold text-white">
                  {loading
                    ? 'Loading…'
                    : hasCertificate
                      ? 'Passed'
                      : attemptsRemaining <= 0
                        ? 'Locked'
                        : 'Ready'}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl rtt-card p-5">
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <Image
              src={course.coverImage || '/ce/ce01-cover.png'}
              alt={course.title}
              width={900}
              height={1200}
              className="h-auto w-full object-cover"
            />
          </div>
          <div className="mt-4 text-sm text-white/70">
            Read the course PDF first, then complete the 24-question post-test.
            Passing automatically unlocks your certificate.
          </div>
          {summary?.lastAttempt ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              Latest attempt:{' '}
              <span className="font-semibold text-white">
                {Number(summary.lastAttempt.score_pct ?? 0)}%
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
