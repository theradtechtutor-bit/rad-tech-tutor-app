import Link from "next/link";

export default function TermsPage() {
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
          Terms of Service
        </h1>

        <p className="mt-3 text-sm text-white/50">
          Last Updated: May 2, 2026
        </p>

        <div className="mt-10 space-y-8 leading-7 text-white/75">
          <section>
            <p>
              By accessing or using The Rad Tech Tutor (“we”, “us”, “our”), you
              agree to the following Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              1. Use of Service
            </h2>
            <p className="mt-2">
              The Rad Tech Tutor provides educational content, including practice
              questions, flashcards, mock exams, and study tools for ARRT exam
              preparation.
            </p>
            <p className="mt-2">
              This is a digital service. No physical products are shipped.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              2. Account Access
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Access is granted to a single user only.</li>
              <li>Sharing login credentials is prohibited.</li>
              <li>You are responsible for maintaining account security.</li>
            </ul>
            <p className="mt-2">
              We reserve the right to suspend or terminate accounts for misuse.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">3. License</h2>
            <p className="mt-2">
              You are granted a limited, non-transferable, non-exclusive license
              to use the platform for personal study purposes only.
            </p>
            <p className="mt-2">You may not:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Copy or distribute content.</li>
              <li>Resell or share access.</li>
              <li>Attempt to reverse engineer the platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">4. Payments</h2>
            <p className="mt-2">All payments are processed securely via Stripe.</p>
            <p className="mt-2">By purchasing, you agree to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>The listed price at checkout.</li>
              <li>The access duration associated with your plan.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              5. No Guarantee of Results
            </h2>
            <p className="mt-2">We do not guarantee:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Passing the ARRT exam.</li>
              <li>Score improvements.</li>
              <li>Specific outcomes.</li>
            </ul>
            <p className="mt-2">
              Results depend on individual effort and study habits.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              6. Platform Availability
            </h2>
            <p className="mt-2">The platform is provided “as is.”</p>
            <p className="mt-2">We do not guarantee:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Uninterrupted access.</li>
              <li>Error-free functionality.</li>
            </ul>
            <p className="mt-2">
              We may update or modify features at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">7. Usage Data</h2>
            <p className="mt-2">
              We may collect and analyze usage data, including login activity,
              progress, test attempts, and platform interactions, to:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Improve the platform.</li>
              <li>Provide support.</li>
              <li>Verify account activity if needed.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              8. Dispute Resolution
            </h2>
            <p className="mt-2">
              Before initiating any chargeback or dispute, you agree to contact us at{" "}
              <a
                className="text-teal-300 underline underline-offset-2 hover:text-teal-200"
                href="mailto:contact@theradtechtutor.com"
              >
                contact@theradtechtutor.com
              </a>
              .
            </p>
            <p className="mt-2">
              We will make reasonable efforts to resolve the issue.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              9. Limitation of Liability
            </h2>
            <p className="mt-2">
              To the maximum extent permitted by law, our liability is limited to
              the amount paid for the service.
            </p>
            <p className="mt-2">We are not responsible for:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Indirect or consequential damages.</li>
              <li>Loss of data or results.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              10. Changes to Terms
            </h2>
            <p className="mt-2">
              We may update these Terms at any time. Continued use means you
              accept the updated Terms.
            </p>
          </section>

          <p className="border-t border-white/10 pt-6 text-sm text-white/50">
            See also:{" "}
            <Link
              href="/refund-policy"
              className="text-teal-300 underline underline-offset-2 hover:text-teal-200"
            >
              Refund Policy
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy-policy"
              className="text-teal-300 underline underline-offset-2 hover:text-teal-200"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}