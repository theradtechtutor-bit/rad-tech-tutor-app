import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="relative min-h-[calc(100vh-73px+240px)] overflow-hidden bg-[color:var(--rtt-bg)] px-6 py-16 text-[color:var(--rtt-text)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(900px circle at 18% 18%, rgba(20,184,166,0.18), transparent 42%), radial-gradient(800px circle at 82% 22%, rgba(250,204,21,0.10), transparent 40%), radial-gradient(900px circle at 50% 100%, rgba(20,184,166,0.10), transparent 48%)",
        }}
      />

<div className="relative mx-auto max-w-3xl rounded-[30px] border border-teal-400/35 bg-white/[0.03] p-6 shadow-[0_0_80px_-28px_rgba(20,184,166,0.45)] backdrop-blur-xl md:p-8">        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-300">
          Legal
        </p>

        <h1 className="mt-4 text-4xl font-bold tracking-tight">
          Privacy Policy
        </h1>

        <p className="mt-3 text-sm text-white/50">
          Last Updated: May 2, 2026
        </p>

        <div className="mt-10 space-y-8 leading-7 text-white/75">
          <section>
            <p>
              We respect your privacy and are committed to protecting your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              1. Information We Collect
            </h2>
            <p className="mt-2">We may collect:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Name and email.</li>
              <li>Login activity.</li>
              <li>
                Platform usage, including tests, progress, and interactions.
              </li>
              <li>
                Payment data processed securely via Stripe. We do not store card
                information.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              2. How We Use Information
            </h2>
            <p className="mt-2">We use your data to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Provide access to the platform.</li>
              <li>Improve features and performance.</li>
              <li>Track progress and usage.</li>
              <li>Respond to support requests.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">3. Analytics</h2>
            <p className="mt-2">
              We may use analytics tools, such as PostHog, to understand how
              users interact with the platform.
            </p>
            <p className="mt-2">This helps us improve the experience.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              4. Data Security
            </h2>
            <p className="mt-2">
              We use industry-standard tools, including Supabase, Stripe, and
              secure hosting providers, to protect your data.
            </p>
            <p className="mt-2">However, no system is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">5. Data Sharing</h2>
            <p className="mt-2">We do not sell your personal data.</p>
            <p className="mt-2">
              We only share data with service providers needed to run the
              platform, including:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Payment processors, such as Stripe.</li>
              <li>
                Infrastructure providers, such as Supabase and hosting
                providers.
              </li>
              <li>Analytics providers used to improve the platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">6. Your Rights</h2>
            <p className="mt-2">You may request:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Account deletion.</li>
              <li>Data access.</li>
            </ul>
            <p className="mt-2">
              Email{" "}
              <a
                className="text-teal-300 underline underline-offset-2 hover:text-teal-200"
                href="mailto:contact@theradtechtutor.com"
              >
                contact@theradtechtutor.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">7. Updates</h2>
            <p className="mt-2">
              We may update this policy as needed. Continued use means
              acceptance.
            </p>
          </section>

          <p className="border-t border-white/10 pt-6 text-sm text-white/50">
            See also:{" "}
            <Link
              href="/terms"
              className="text-teal-300 underline underline-offset-2 hover:text-teal-200"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/refund-policy"
              className="text-teal-300 underline underline-offset-2 hover:text-teal-200"
            >
              Refund Policy
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}