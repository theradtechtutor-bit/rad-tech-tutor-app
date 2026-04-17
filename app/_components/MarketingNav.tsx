'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import AuthStatusNav from '@/app/app/_components/AuthStatusNav';
import { supabase } from '@/lib/supabaseClient';

const SHOW_CE = false;

const nav = [
  { href: '/app/dashboard', label: 'RTT Mastery Method' },
  { href: '/app/practice', label: 'Practice' },
  { href: '/app/roadmap', label: 'Roadmap' },
  ...(SHOW_CE ? [{ href: '/app/ce', label: 'CE' }] : []),
];

export default function MarketingNav() {
  const pathname = usePathname() || '';
  const [mobileOpen, setMobileOpen] = useState(false);

  const [isPro, setIsPro] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  useEffect(() => {
    let mounted = true;

    async function loadMobileAuthState() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        setIsAuthed(false);
        setIsPro(false);
        return;
      }

      setIsAuthed(true);

      const { data } = await supabase
        .from('user_access')
        .select('is_pro')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!mounted) return;
      setIsPro(Boolean(data?.is_pro));
    }

    loadMobileAuthState();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-[color:var(--rtt-border)] bg-[color:var(--rtt-bg)]/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[color:var(--rtt-border)] bg-white/5 text-sm font-semibold text-[color:var(--rtt-text)]">
            RT
          </span>

          {/* Desktop brand */}
          <div className="hidden leading-tight sm:block lg:block">
            <div className="text-xs tracking-widest text-[color:var(--rtt-muted)]">
              RAD TECH TUTOR
            </div>
            <div className="-mt-0.5 text-sm font-semibold">Mastery Method</div>
          </div>

          {/* Mobile / tablet brand */}
          <div className="block leading-tight sm:hidden">
            <div className="text-sm font-semibold text-[color:var(--rtt-text)]">
              Rad Tech Tutor
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 text-sm lg:flex">
          {nav.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/');
            const isCE = item.label === 'CE';

            const base = isCE
              ? 'font-semibold text-yellow-400 hover:text-yellow-300'
              : 'text-[color:var(--rtt-muted)] hover:text-[color:var(--rtt-text)]';

            const active =
              'font-semibold relative after:absolute after:-bottom-2 after:left-0 after:h-[2px] after:w-full after:rounded-full after:bg-yellow-400';

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition ${
                  isActive
                    ? `${active} ${
                        isCE
                          ? 'text-yellow-300'
                          : 'text-[color:var(--rtt-text)]'
                      }`
                    : base
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop auth */}
          <div className="hidden lg:flex">
            <AuthStatusNav showGetPro />
          </div>

          {/* Mobile/tablet Get Pro */}
          {(!isAuthed || !isPro) && (
            <Link
              href="/app/upgrade"
              className="inline-flex rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-300 lg:hidden"
            >
              Get Pro
            </Link>
          )}

          {/* Mobile/tablet hamburger */}
          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[color:var(--rtt-border)] bg-white/5 text-[color:var(--rtt-text)] transition hover:bg-white/10 lg:hidden"
          >
            <span className="sr-only">Menu</span>
            <div className="flex flex-col gap-1.5">
              <span
                className={`block h-0.5 w-5 rounded-full bg-current transition ${
                  mobileOpen ? 'translate-y-2 rotate-45' : ''
                }`}
              />
              <span
                className={`block h-0.5 w-5 rounded-full bg-current transition ${
                  mobileOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`block h-0.5 w-5 rounded-full bg-current transition ${
                  mobileOpen ? '-translate-y-2 -rotate-45' : ''
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile / tablet menu */}
      {mobileOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu overlay"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 top-[73px] z-20 bg-black/50 lg:hidden"
          />

          <div className="absolute inset-x-0 top-full z-30 border-b border-[color:var(--rtt-border)] bg-[color:var(--rtt-bg)] shadow-2xl lg:hidden">
            <div className="max-h-[calc(100vh-73px)] overflow-y-auto px-4 py-4">
              <nav className="flex flex-col gap-2">
                {nav.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + '/');
                  const isCE = item.label === 'CE';

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                        isActive
                          ? 'bg-white/10 text-[color:var(--rtt-text)]'
                          : isCE
                            ? 'text-yellow-400 hover:bg-white/5 hover:text-yellow-300'
                            : 'text-[color:var(--rtt-muted)] hover:bg-white/5 hover:text-[color:var(--rtt-text)]'
                      }`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-4 border-t border-[color:var(--rtt-border)] pt-4">
                <AuthStatusNav showGetPro={false} />{' '}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
