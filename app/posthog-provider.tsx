'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';
import {
  captureCurrentAttribution,
  shouldCaptureTrafficSourceEvent,
} from '@/lib/attribution';

export default function PostHogProvider() {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      capture_pageview: true,
      loaded: (posthogInstance) => {
        const attribution = captureCurrentAttribution();
        if (Object.keys(attribution).length === 0) return;

        try {
          posthogInstance.register(attribution);

          if (shouldCaptureTrafficSourceEvent(attribution)) {
            posthogInstance.capture('traffic_source_captured', {
              ...attribution,
              $set_once: attribution,
            });
          }
        } catch {
          // Attribution should never block app startup.
        }
      },
    });
  }, []);

  return null;
}
