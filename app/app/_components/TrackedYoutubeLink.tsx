'use client';

import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react';
import { trackYoutubeClick } from '@/app/app/_lib/trackYoutubeClick';

type TrackedYoutubeLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href'
> & {
  href: string;
  location: string;
  label: string;
  bankNumber?: number | null;
  videoTitle?: string;
  children: ReactNode;
};

export default function TrackedYoutubeLink({
  href,
  location,
  label,
  bankNumber,
  videoTitle,
  onClick,
  children,
  ...props
}: TrackedYoutubeLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    trackYoutubeClick({
      url: href,
      location,
      label,
      bankNumber,
      videoTitle,
    });

    onClick?.(event);
  }

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
