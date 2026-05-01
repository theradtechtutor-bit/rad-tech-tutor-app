import type { Metadata } from 'next';
import './globals.css';
import MarketingNav from './_components/MarketingNav';
import PostHogProvider from './posthog-provider';

export const metadata: Metadata = {
  title: 'Rad Tech Tutor',
  description: 'Master the ARRT® with a structured, mastery-first system.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* <body className="min-h-screen bg-black text-white antialiased"> */}
      <body className="flex min-h-screen flex-col bg-black text-white antialiased">
        <PostHogProvider />
        <MarketingNav />
        {/* <main>{children}</main> */}
        <main className="flex-1">{children}</main>
<footer className="border-t border-white/10 px-6 py-4 text-center text-xs text-white/45">
  <div className="mx-auto max-w-5xl space-y-3">
    <div>
      Disclaimer: The Rad Tech Tutor LLC provides original ARRT®-style
      practice questions and educational materials created by The Rad Tech
      Tutor LLC. The ARRT® is a registered trademark of The American Registry
      of Radiologic Technologists and is not affiliated with this platform.
    </div>


<div className="text-center text-white/50">
  © 2026 The Rad Tech Tutor LLC ·{' '}
  <a
    href="/help"
className="text-white/70 hover:text-white transition underline underline-offset-2"  >
    Contact
  </a>
</div>

    <div>
      ARRT® and The American Registry of Radiologic Technologists® are
      registered trademarks of The American Registry of Radiologic
      Technologists. The Rad Tech Tutor is not affiliated with, endorsed by, or
      sponsored by The American Registry of Radiologic Technologists.
    </div>
  </div>
</footer>
      </body>
    </html>
  );
}
