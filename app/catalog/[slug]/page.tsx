'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { normalizeChoices } from '@/lib/normalizeChoices';

type MockQuestion = {
  id: string;
  stem: string;
  choices: string[];
};

const mockQuestions: MockQuestion[] = [
  {
    id: 'PC-001',
    stem: 'Which document ensures patient consent for a radiologic procedure?',
    choices: [
      'A. Incident report',
      'B. Informed consent form',
      'C. Chart note',
      'D. HIPAA disclosure form',
    ],
  },
  {
    id: 'PC-002',
    stem: 'Which vital sign is most critical to monitor during a contrast reaction?',
    choices: [
      'A. Blood pressure',
      'B. Temperature',
      'C. Oxygen saturation',
      'D. Height',
    ],
  },
  {
    id: 'PC-003',
    stem: 'Standard precautions require gloves when:',
    choices: [
      'A. Talking to a patient',
      'B. Entering any hospital room',
      'C. Exposure to bodily fluids is possible',
      'D. Taking a history',
    ],
  },
  {
    id: 'PC-004',
    stem: 'The chain of infection includes all EXCEPT:',
    choices: [
      'A. Infectious agent',
      'B. Reservoir',
      'C. Radiation dose',
      'D. Mode of transmission',
    ],
  },
  {
    id: 'PC-005',
    stem: 'A patient with a seizure should first be:',
    choices: [
      'A. Restrained tightly',
      'B. Given contrast',
      'C. Protected from injury',
      'D. Sat upright immediately',
    ],
  },
];

const sections = [
  {
    id: 'ethical',
    title: 'Ethical & Legal',
    subsections: [
      { id: 'consent', title: 'Consent & Documentation' },
      { id: 'hipaa', title: 'Confidentiality (HIPAA)' },
    ],
  },
  {
    id: 'infection',
    title: 'Infection Control',
    subsections: [
      { id: 'chain', title: 'Chain of Infection' },
      { id: 'precautions', title: 'Standard Precautions' },
    ],
  },
  {
    id: 'emergency',
    title: 'Medical Emergencies',
    subsections: [
      { id: 'contrast', title: 'Contrast Reactions' },
      { id: 'seizure', title: 'Seizures & CPR' },
    ],
  },
];

export default function CoursePage() {
  const searchParams = useSearchParams();
  const activeSection = searchParams.get('s') || sections[0].id;
  const activeSub = searchParams.get('sub') || sections[0].subsections[0].id;

  const currentSection = sections.find((s) => s.id === activeSection)!;
  const currentSub = currentSection.subsections.find(
    (x) => x.id === activeSub
  )!;

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="text-xs tracking-widest text-white/50">COURSE</div>
          <h1 className="mt-1 text-4xl font-semibold">Patient Care</h1>
          <p className="mt-2 text-white/60">
            ARRT Patient Care domain – structured by subsection.
          </p>
        </div>

        {/* <Link
          href="/upgrade"
          className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
        >
          Unlock Pro
        </Link> */}
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Sidebar */}
        <aside className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-xs tracking-widest text-white/50 mb-3">
            SECTIONS
          </div>

          {sections.map((section) => {
            const isActive = section.id === activeSection;

            return (
              <div
                key={section.id}
                className="mb-3 rounded-2xl border border-white/10 bg-black/40"
              >
                <Link
                  href={`?s=${section.id}`}
                  className={`block px-4 py-3 text-sm ${
                    isActive ? 'text-white' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {section.title}
                </Link>

                {isActive && (
                  <div className="border-t border-white/10 p-2 space-y-1">
                    {section.subsections.map((sub) => {
                      const subActive = sub.id === activeSub;

                      return (
                        <Link
                          key={sub.id}
                          href={`?s=${section.id}&sub=${sub.id}`}
                          className={`block rounded-xl px-3 py-2 text-sm ${
                            subActive
                              ? 'bg-white/5 text-white'
                              : 'text-white/60 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          {sub.title}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </aside>

        {/* Main Panel */}
        <section className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-2xl font-semibold">
              {currentSection.title} → {currentSub.title}
            </h2>
            <p className="mt-2 text-white/60">
              5 mock questions linked to this subsection.
            </p>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            {mockQuestions.map((q, index) => (
              <div
                key={q.id}
                className="rounded-2xl border border-white/10 bg-black/40 p-5"
              >
                <div className="text-sm text-white/50 mb-2">
                  Question {index + 1}
                </div>

                <div className="font-medium mb-4">{q.stem}</div>

                <div className="space-y-2">
                  {normalizeChoices(q.choices).map(({ key, text }, i) => (
                  <div
                      key={i}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80"
                    >
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <Link
              href="/practice"
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white hover:bg-white/10"
            >
              Practice this subsection →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}