import { notFound } from 'next/navigation';
import { VideoReviewModalTestLauncher } from '@/app/app/(main)/dashboard/VideoReviewSection';

export default function VideoReviewTestPage() {
  if (process.env.VERCEL_ENV === 'production') {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[color:var(--rtt-bg)] px-4 py-10 text-[color:var(--rtt-text)]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-2xl border border-yellow-400/20 bg-white/[0.03] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.35)]">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-yellow-200/70">
            Temporary Preview Test Page
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-white">
            Video Review Modal Responsive Test
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
            Use the Video Review card below to open the same modal used on the
            dashboard. This route is disabled in production.
          </p>
          <div className="mt-4">
            <VideoReviewModalTestLauncher />
          </div>
        </div>
      </div>
    </div>
  );
}
