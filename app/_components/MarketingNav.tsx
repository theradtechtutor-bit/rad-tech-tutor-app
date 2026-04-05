'use client';


import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthStatusNav from '@/app/app/_components/AuthStatusNav';

const nav = [
  { href: '/app/dashboard', label: 'RTT Mastery Method' },
  { href: '/app/practice', label: 'Practice' },
  { href: '/app/roadmap', label: 'Roadmap' },
  { href: '/app/ce', label: 'CE' },
];

export default function MarketingNav() {
  const pathname = usePathname() || '';

  return (
    <header className="sticky top-0 z-20 border-b border-[color:var(--rtt-border)] bg-[color:var(--rtt-bg)]/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--rtt-border)] bg-white/5 text-sm font-semibold text-[color:var(--rtt-text)]">
            RT
          </span>
          <div className="leading-tight">
            <div className="text-xs tracking-widest text-[color:var(--rtt-muted)]">RAD TECH TUTOR</div>
            <div className="-mt-0.5 text-sm font-semibold">Mastery Method</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 text-sm md:flex">
          {nav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const isCE = item.label === 'CE';
            const base = isCE
              ? 'font-semibold text-yellow-400 hover:text-yellow-300'
              : 'text-[color:var(--rtt-muted)] hover:text-[color:var(--rtt-text)]';
            const active = 'font-semibold relative after:absolute after:-bottom-2 after:left-0 after:h-[2px] after:w-full after:bg-yellow-400 after:rounded-full';

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition ${isActive ? `${active} ${isCE ? 'text-yellow-300' : 'text-[color:var(--rtt-text)]'}` : base}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          
          <AuthStatusNav />
        </div>
      </div>
    </header>
  );
}
