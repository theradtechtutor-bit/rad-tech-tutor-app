import Link from "next/link";

export default function RefundPolicyPage() {
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
          Refund Policy
        </h1>

        <p className="mt-3 text-sm text-white/50">
          Last Updated: May 2, 2026
        </p>

        <div className="mt-10 space-y-8 leading-7 text-white/75">
          <section>
            <p>
              We aim to provide a high-quality study platform and fair customer
              experience.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              1. Digital Product Notice
            </h2>
            <p className="mt-2">
              All purchases provide immediate access to a digital platform. No
              physical product is delivered.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              2. Refund Eligibility
            </h2>
            <p className="mt-2">
              Refunds may be granted on a case-by-case basis.
            </p>
            <p className="mt-2">We consider:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Account usage.</li>
              <li>Time since purchase.</li>
              <li>Specific issue reported.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              3. Low or No Usage
            </h2>
            <p className="mt-2">
              If an account shows little to no activity, we are generally able to
              issue a refund.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              4. Used Accounts
            </h2>
            <p className="mt-2">
              If the platform has been actively used, such as multiple tests
              taken or flashcards reviewed, refunds may be limited or denied.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              5. Technical Issues
            </h2>
            <p className="mt-2">
              If you experienced a technical issue, please contact us first so we can:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Fix the issue.</li>
              <li>Verify the problem.</li>
              <li>Assist you properly.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">6. Chargebacks</h2>
            <p className="mt-2">
              If a chargeback is filed without contacting us first:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>
                We reserve the right to submit account usage data as evidence.
              </li>
              <li>Your account may be suspended.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              7. How to Request a Refund
            </h2>
            <p className="mt-2">
              To request a refund, email{" "}
              <a
                className="text-teal-300 underline underline-offset-2 hover:text-teal-200"
                href="mailto:contact@theradtechtutor.com"
              >
                contact@theradtechtutor.com
              </a>
              .
            </p>
            <p className="mt-2">Include:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Email used to sign up.</li>
              <li>Date of purchase.</li>
              <li>Brief reason for request.</li>
            </ul>
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