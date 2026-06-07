'use client';

import posthog from 'posthog-js';
import { getAttributionEventProps } from '@/lib/attribution';

type EventProps = Record<string, string | number | boolean | null | undefined>;

export function captureEvent(eventName: string, props?: EventProps) {
  if (typeof window === 'undefined') return;
  try {
    posthog.capture(eventName, {
      ...getAttributionEventProps(),
      ...props,
    });
  } catch {}
}

export function identifyUser(userId: string, props?: EventProps) {
  if (typeof window === 'undefined' || !userId) return;
  try {
    posthog.identify(userId, {
      ...getAttributionEventProps(),
      ...props,
    });
  } catch {}
}

export function resetAnalyticsUser() {
  if (typeof window === 'undefined') return;
  try {
    posthog.reset();
  } catch {}
}
