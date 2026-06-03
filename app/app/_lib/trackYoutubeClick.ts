import posthog from 'posthog-js';

type YoutubeClickProperties = {
  url: string;
  location: string;
  label: string;
  bankNumber?: number | null;
  videoTitle?: string;
};

export function trackYoutubeClick({
  url,
  location,
  label,
  bankNumber,
  videoTitle,
}: YoutubeClickProperties) {
  if (typeof window === 'undefined') return;
  if (typeof posthog?.capture !== 'function') return;

  try {
    posthog.capture('youtube_link_clicked', {
      url,
      location,
      label,
      bankNumber: bankNumber ?? undefined,
      videoTitle,
      sourcePage: window.location.pathname,
    });
  } catch {
    // Analytics should never block outbound navigation.
  }
}
