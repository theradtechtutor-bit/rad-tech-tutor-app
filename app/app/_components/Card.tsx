import type { ReactNode } from 'react';

export default function Card({
  children,
  className = '',
  glow = true,
  padding = 'p-6',
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  padding?: string;
}) {
  return (
    <div
      className={`
        rtt-card
        ${glow ? 'rtt-glow' : ''}
        rounded-2xl
        ${padding}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
