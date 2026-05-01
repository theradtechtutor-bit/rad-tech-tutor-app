import Link from 'next/link';

export default function HelpPage() {
  return (
    <main className="relative min-h-[calc(100vh-180px)] overflow-hidden bg-black px-6 py-20 text-white">
      
      {/* BACKGROUND GLOW (same as login) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(900px circle at 18% 16%, rgba(20,184,166,0.18), transparent 42%), radial-gradient(900px circle at 82% 18%, rgba(250,204,21,0.10), transparent 40%), radial-gradient(1000px circle at 50% 100%, rgba(20,184,166,0.10), transparent 48%)',
        }}
      />

      <div className="relative mx-auto max-w-2xl">
        
        <div className="mt-8 rounded-[28px] border border-[rgba(45,212,191,0.45)] bg-[linear-gradient(180deg,rgba(45,212,191,0.08),rgba(255,255,255,0.02))] p-6 shadow-[0_0_70px_rgba(45,212,191,0.28)] md:p-8">
          
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgba(45,212,191,0.8)]">
            Contact
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Need to get in touch?
          </h1>

          <p className="mt-4 leading-7 text-white/65">
            If you have an account access issue, payment question, or general
            question about Rad Tech Tutor, send a message and we’ll get back to
            you as soon as possible.
          </p>

          <div className="mt-6 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm text-yellow-100">
            For account access issues, please include the email address you used
            to sign in and the email used at checkout.
          </div>

          <a
            href="mailto:contact@theradtechtutor.com?subject=Rad%20Tech%20Tutor%20Contact"
            className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-yellow-400 px-5 py-4 text-base font-semibold text-black transition hover:bg-yellow-300"
          >
            Email The Rad Tech Tutor
          </a>

          <p className="mt-4 text-center text-xs text-white/40">
            We’ll get back to you as soon as possible — most responses are within 1–2 hours.
          </p>
        </div>
      </div>
    </main>
  );
}