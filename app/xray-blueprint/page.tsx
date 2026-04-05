import Link from 'next/link';
import DownloadForm from './DownloadForm';

export default function XrayBlueprintPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,rgba(45,212,191,0.14),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(250,204,21,0.10),transparent_55%),#000] text-white">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm text-white/70 hover:text-white">
            ← Back
          </Link>
          <Link
            href="https://www.youtube.com/@RadTechTutor"
            target="_blank"
            className="text-sm text-white/70 hover:text-white"
          >
            YouTube →
          </Link>
        </div>

        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-[0_0_40px_-20px_rgba(45,212,191,0.5)]">
          <div className="text-xs font-semibold tracking-widest text-yellow-300/90">
            FREE DOWNLOAD
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            X-Ray School Survival Blueprint
          </h1>
          <p className="mt-3 text-white/70">
            A simple system to manage time, clinicals, physics, and early ARRT
            prep — so school feels structured, not chaotic.
          </p>

          <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-white/75">
            <li>Weekly study structure template</li>
            <li>Clinical notebook system</li>
            <li>Physics strategy (no cramming)</li>
            <li>Early ARRT prep roadmap</li>
          </ul>

          <DownloadForm />

          <div className="mt-5 text-center">
            <a
              href="/xray-blueprint.pdf"
              target="_blank"
              className="text-sm font-semibold text-teal-300 hover:text-teal-200"
            >
              Preview the PDF →
            </a>
          </div>

          <div className="mt-4 text-xs text-white/45">
            Note: the PDF file must exist at <span className="text-white/70">/public/xray-blueprint.pdf</span>.
          </div>
        </div>
      </div>
    </div>
  );
}
