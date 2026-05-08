import Link from 'next/link';

export default function MothersDaySaleBanner() {
  return (
    <section className="mx-auto mt-10 w-full max-w-7xl px-4">
      <div className="relative overflow-hidden rounded-[28px] border border-yellow-400/50 bg-[linear-gradient(90deg,rgba(25,25,5,0.96),rgba(4,14,12,0.98)_45%,rgba(5,43,32,0.95))] px-8 py-7 shadow-[0_0_55px_rgba(250,204,21,0.14)]">
        {/* background glow */}
        <div className="absolute -left-24 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="absolute right-10 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-emerald-400/15 blur-3xl" />


<div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
  <div className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left md:items-center md:gap-6">
    <div className="shrink-0">
      <span className="text-9xl leading-none">💐</span>
    </div>

<div>
  <p className="mb-2 text-xs font-bold uppercase tracking-[0.35em] text-yellow-300">
    Limited-Time Offer
  </p>

  <p className="mb-2 text-sm font-medium text-zinc-400 md:text-base">
    In honor of all the future RT(R) moms balancing school, family, and the ARRT.
  </p>

  <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
    Mother&apos;s Day Weekend Sale — 10% Off Pro
  </h2>

  <p className="mt-2 text-sm text-zinc-400 md:text-base">
    Use code <span className="font-bold text-yellow-300">MOM10</span> at checkout
    • Ends Monday at 11:59 PM
  </p>

  <p className="mt-1 text-xs text-zinc-500 md:text-sm">
    P.S. You don&apos;t have to be a mom to take advantage of this offer.
  </p>
</div>
          </div>

          <Link
            href="/app/upgrade"
className="inline-flex w-full items-center justify-center rounded-2xl bg-yellow-400 px-8 py-4 text-base font-bold text-black shadow-[0_0_30px_rgba(250,204,21,0.28)] transition hover:bg-yellow-300 md:w-auto"          >
            Claim 10% Off
          </Link>
        </div>
      </div>
    </section>
  );
}