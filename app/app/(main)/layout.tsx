import type { ReactNode } from 'react';
import AppShell, { type NavItem } from '../_components/AppShell';

const NAV: NavItem[] = [
  { href: '/app/dashboard', label: 'RTT Mastery Method' },
  { href: '/app/practice', label: 'Practice' },
  { href: '/app/roadmap', label: 'Roadmap' },
  { href: '/app/upgrade', label: 'CE' },
];

export default function MainGroupLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell nav={NAV} showHeader={false}>
      {children}
    </AppShell>
  );
}
