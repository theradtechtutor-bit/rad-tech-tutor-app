'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';
import { captureCurrentAttribution } from '@/lib/attribution';

export default function AttributionProvider() {
  useEffect(() => {
    const attribution = captureCurrentAttribution();
    if (Object.keys(attribution).length === 0) return;

    try {
      posthog.register(attribution);
      posthog.capture('traffic_source_captured', {
        ...attribution,
        sourcePage: window.location.pathname,
      });
    } catch {
      // Do not block rendering if analytics is unavailable.
    }
  }, []);

  return null;
}
