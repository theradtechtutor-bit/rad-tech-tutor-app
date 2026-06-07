'use client';

import { useState } from 'react';
import posthog from 'posthog-js';

export type FeedbackKind = 'free' | 'pro';
type FeedbackAnswer = 'yes' | 'no';

type FeedbackModalProps = {
  kind: FeedbackKind;
  onClose: () => void;
};

export default function InlineFeedbackModal({
  kind,
  onClose,
}: FeedbackModalProps) {
  const [freeAnswer, setFreeAnswer] = useState<FeedbackAnswer | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');

  const feedbackCompletedKey =
    kind === 'pro'
      ? 'rtt_pro_feedback_completed'
      : 'rtt_free_feedback_completed';

  const submitInlineFeedback = () => {
    const comment = feedbackComment.trim();
    if (!comment) return;

    if (kind === 'pro') {
      if (!rating) return;

      posthog.capture('pro_feedback_rating_comment', {
        rating,
        comment,
        comment_length: comment.length,
      });
    } else {
      if (!freeAnswer) return;

      posthog.capture('rtt_enjoying_comment', {
        answer: freeAnswer,
        comment,
        comment_length: comment.length,
      });
    }

    localStorage.setItem(feedbackCompletedKey, 'true');
    onClose();
  };

  const dismissFeedback = () => {
    posthog.capture(
      kind === 'pro'
        ? 'pro_feedback_dismissed'
        : 'free_feedback_dismissed',
      {
        rating: kind === 'pro' ? rating : undefined,
        answer: kind === 'free' ? freeAnswer : undefined,
        comment_started: feedbackComment.trim().length > 0,
        comment_length: feedbackComment.trim().length,
        answered: kind === 'pro' ? Boolean(rating) : Boolean(freeAnswer),
      },
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#10131a] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-300/80">
              Quick feedback
            </div>
            <h2 className="mt-2 text-xl font-semibold text-white">
              {kind === 'free'
                ? 'Quick question 👋'
                : 'Quick feedback (5 seconds)'}
            </h2>
          </div>

          <button
            type="button"
            onClick={dismissFeedback}
            className="rounded-full bg-white/8 px-3 py-1 text-sm font-semibold text-white/70 hover:bg-white/12 hover:text-white"
          >
            ×
          </button>
        </div>

        {kind === 'free' ? (
          <div className="mt-5">
            {!freeAnswer ? (
              <>
                <p className="text-sm leading-6 text-white/75">
                  Are you enjoying studying with The Rad Tech Tutor so far?
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem('rtt_enjoying', 'yes');
                      posthog.capture('rtt_enjoying', { answer: 'yes' });
                      setFreeAnswer('yes');
                    }}
                    className="rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-black hover:brightness-95"
                  >
                    Yes, it’s helping
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem('rtt_enjoying', 'no');
                      posthog.capture('rtt_enjoying', { answer: 'no' });
                      setFreeAnswer('no');
                    }}
                    className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/15"
                  >
                    Not really yet
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm leading-6 text-white/75">
                  {freeAnswer === 'yes'
                    ? 'That’s great to hear. Tell us why you gave that answer.'
                    : 'Thanks for being honest. Tell us why you gave that answer.'}
                </p>

                <label className="mt-4 block text-sm font-semibold text-white/85">
                  Tell us why you gave this rating
                </label>
                <textarea
                  value={feedbackComment}
                  onChange={(event) => setFeedbackComment(event.target.value)}
                  placeholder={
                    freeAnswer === 'yes'
                      ? 'What has been helpful so far?'
                      : 'What is missing, confusing, or not helping yet?'
                  }
                  className="mt-2 min-h-32 w-full resize-y rounded-2xl border border-white/10 bg-black/25 p-4 text-sm leading-6 text-white outline-none placeholder:text-white/35 focus:border-yellow-300/60"
                />

                <div className="mt-4 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm text-white/75">
                  Your feedback helps us improve The Rad Tech Tutor.
                </div>

                <div className="mt-5">
                  <button
                    type="button"
                    onClick={submitInlineFeedback}
                    disabled={!feedbackComment.trim()}
                    className="w-full rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-black hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Submit Feedback
                  </button>
                </div>

                <button
                  type="button"
                  onClick={dismissFeedback}
                  className="mt-3 w-full text-sm text-white/50 hover:text-white/70"
                >
                  Maybe later
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="mt-5">
            <p className="text-sm leading-6 text-white/75">
              How would you rate The Rad Tech Tutor so far?
            </p>

            <div className="mt-4 flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => {
                    setRating(star);
                    posthog.capture('pro_feedback_rating', { rating: star });
                  }}
                  className={`text-3xl transition hover:scale-110 ${
                    rating && star <= rating
                      ? 'text-yellow-300'
                      : 'text-white/25'
                  }`}
                  aria-label={`Rate ${star} stars`}
                >
                  ★
                </button>
              ))}
            </div>

            {rating ? (
              <div className="mt-5">
                <p className="mb-3 text-sm text-white/70">
                  Help us understand why you gave {rating}{' '}
                  {rating === 1 ? 'star' : 'stars'}.
                </p>

                <label className="block text-sm font-semibold text-white/85">
                  Tell us why you gave this rating
                </label>
                <textarea
                  value={feedbackComment}
                  onChange={(event) => setFeedbackComment(event.target.value)}
                  placeholder="What made you choose this rating? What should we keep, fix, or improve?"
                  className="mt-2 min-h-32 w-full resize-y rounded-2xl border border-white/10 bg-black/25 p-4 text-sm leading-6 text-white outline-none placeholder:text-white/35 focus:border-yellow-300/60"
                />

                <button
                  type="button"
                  onClick={submitInlineFeedback}
                  disabled={!feedbackComment.trim()}
                  className="mt-4 w-full rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-black hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Submit Feedback
                </button>

                <button
                  type="button"
                  onClick={dismissFeedback}
                  className="mt-3 w-full text-sm text-white/50 hover:text-white/70"
                >
                  Skip
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
