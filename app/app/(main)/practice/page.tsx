import QBankSection from './_components/QBankSection';
import StartHereTour from '@/app/app/_components/StartHereTour';

export default function PracticeLandingPage() {
  return (
    <div className="max-w-6xl">
      <StartHereTour
        storageKey="rtt_tour_practice"
        steps={[
          {
            selector: '[data-tour="practice-header"]',
            title: 'This is the practice hub',
            body: 'Use this page to open questions, flashcards, and the full mock anytime.'
          },
          {
            selector: '[data-tour="practice-banks"]',
            title: 'These are your practice banks',
            body: 'QBank 1 is your free starter bank. QBank 2 and 3 unlock with Pro.'
          },
          {
            selector: '[data-tour="practice-free"]',
            title: 'Practice freely',
            body: 'Open questions, flashcards, or the full mock exam whenever you want.'
          }
        ]}
      />

      <section className="p-6">
        <h1 className="text-4xl font-semibold text-white">Practice & Review</h1>
        <p className="mt-3 text-white/70">
          Practice questions, review flashcards, or take a full mock—focus on what matters most.
        </p>
      </section>

      <QBankSection />
    </div>
  );
}
