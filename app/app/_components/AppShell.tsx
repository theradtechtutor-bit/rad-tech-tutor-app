'use client';

import AuthStatusNav from '@/app/app/_components/AuthStatusNav';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export type NavItem = {
  href: string;
  label: string;
  badge?: string;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export default function AppShell({
  children,
  nav,
  showHeader = false,
}: {
  children: ReactNode;
  nav: NavItem[];
  showHeader?: boolean;
}) {
  const pathname = usePathname();
  const [isValidator, setIsValidator] = useState(false);

  const isUpgradePage = pathname === '/app/upgrade';
  const isLoginPage = pathname === '/app/login';

  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await fetch('/api/validator/me', { cache: 'no-store' }).catch(
        () => null as any,
      );
      if (!alive) return;
      if (res?.ok) {
        const j = await res.json().catch(() => null);
        setIsValidator(Boolean(j?.authenticated));
      } else {
        setIsValidator(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const logoutValidator = async () => {
    await fetch('/api/validator/logout', { method: 'POST' }).catch(() => null);
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen flex-col bg-[color:var(--rtt-bg)] text-[color:var(--rtt-text)]">
      <div className="mx-auto max-w-7xl">
        {showHeader ? (
          <header className="flex items-center justify-between px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full rtt-card text-sm font-semibold">
                RT
              </div>
              <div className="leading-tight">
                <div className="text-xs tracking-widest text-white/70">
                  RAD TECH TUTOR
                </div>
                <div className="text-sm font-semibold">Mastery Engine</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isValidator ? (
                <>
                  <span className="rounded-full rtt-card px-4 py-2 text-sm text-white/85 border border-white/10">
                    Signed in: ASRT Reviewer
                  </span>
                  <button
                    onClick={logoutValidator}
                    className="rounded-full rtt-card px-4 py-2 text-sm text-white/80 hover:bg-white/10"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <AuthStatusNav />
              )}
            </div>
          </header>
        ) : null}
      </div>

      <div className={cx('border-t border-white/10', (isLoginPage || isUpgradePage) && 'flex flex-1 flex-col')}>
        <main className="min-w-0 flex-1">
          {isUpgradePage || isLoginPage ? (
            <div>{children}</div>
          ) : (
            <div className="mx-auto max-w-7xl">
              <div className="px-6 pt-6 pb-12 md:px-10 md:pt-8">{children}</div>
            </div>
          )}

          {/* <div className="border-t border-white/10">
            <div className="mx-auto max-w-7xl px-6 py-4 md:px-10">
              <div className="max-w-4xl text-xs leading-6 text-white/45">
                <span className="font-semibold text-white/70">Disclaimer:</span>{' '}
                Rad Tech Tutor provides original ARRT-style practice questions
                and educational materials created by Rad Tech Tutor. The ARRT®
                is a registered trademark of The American Registry of Radiologic
                Technologists and is not affiliated with this platform.
              </div>
            </div>
          </div> */}
        </main>
      </div>
    </div>
  );
}
