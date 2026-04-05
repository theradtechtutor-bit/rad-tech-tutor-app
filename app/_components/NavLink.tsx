'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  exact?: boolean; // if false, /catalog/[slug] will still highlight /catalog
};

export default function NavLink({
  href,
  children,
  className = '',
  activeClassName = '',
  exact = false,
}: Props) {
  const pathname = usePathname() || '';

  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(href + '/');

  return (
    <Link
      href={href}
      className={[className, isActive ? activeClassName : ''].join(' ').trim()}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
    </Link>
  );
}
