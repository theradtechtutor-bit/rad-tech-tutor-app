type Variant = 'success' | 'warning' | 'danger' | 'neutral' | 'paid';

export default function Badge({
  children,
  variant = 'neutral',
}: {
  children: React.ReactNode;
  variant?: Variant;
}) {
  const base =
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border';

  const styles: Record<Variant, string> = {
    success:
      'border-emerald-400/25 bg-emerald-400/10 text-emerald-200 shadow-[0_0_40px_-20px_rgba(45,212,191,0.45)]',
    warning: 'border-yellow-400/25 bg-yellow-400/10 text-yellow-200',
    danger: 'border-red-400/25 bg-red-400/10 text-red-200',
    neutral: 'rtt-card text-white/70',
    paid: 'border-fuchsia-400/25 bg-fuchsia-400/10 text-fuchsia-200',
  };

  return <span className={`${base} ${styles[variant]}`}>{children}</span>;
}
