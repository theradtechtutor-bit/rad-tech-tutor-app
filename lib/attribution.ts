export type AttributionProperties = {
  original_source?: string;
  utm_campaign?: string;
  utm_content?: string;
};

export const ATTRIBUTION_STORAGE_KEY = 'rtt_attribution';
export const ATTRIBUTION_COOKIE_KEY = 'rtt_attribution';
const TRAFFIC_SOURCE_EVENT_PREFIX = 'rtt_traffic_source_captured';

function cleanValue(value: string | null) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function normalizeSource(value: string) {
  return value.trim().toLowerCase().replace(/^www\./, '');
}

function getReferrerSource() {
  if (typeof window === 'undefined') return 'direct';
  if (!document.referrer) return 'direct';

  try {
    const referrerHost = new URL(document.referrer).hostname
      .toLowerCase()
      .replace(/^www\./, '');
    const currentHost = window.location.hostname
      .toLowerCase()
      .replace(/^www\./, '');

    if (!referrerHost || referrerHost === currentHost) return 'direct';
    if (referrerHost.includes('youtube.com') || referrerHost === 'youtu.be') {
      return 'youtube';
    }
    if (
      referrerHost.includes('facebook.com') ||
      referrerHost === 'fb.com' ||
      referrerHost.includes('instagram.com')
    ) {
      return 'facebook';
    }
    if (referrerHost.includes('google.')) return 'google';

    return 'referral';
  } catch {
    return 'direct';
  }
}

function attributionFromCurrentVisit(): AttributionProperties {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  const utmSource = cleanValue(params.get('utm_source'));
  const utmCampaign = cleanValue(params.get('utm_campaign'));
  const utmContent = cleanValue(params.get('utm_content'));

  return {
    original_source: utmSource
      ? normalizeSource(utmSource)
      : getReferrerSource(),
    ...(utmCampaign ? { utm_campaign: utmCampaign } : {}),
    ...(utmContent ? { utm_content: utmContent } : {}),
  };
}

function isDirectOrReferral(source: string | undefined) {
  return !source || source === 'direct' || source === 'referral';
}

function hasUtmSource() {
  if (typeof window === 'undefined') return false;
  return Boolean(cleanValue(new URLSearchParams(window.location.search).get('utm_source')));
}

function pruneAttribution(attribution: AttributionProperties) {
  return Object.fromEntries(
    Object.entries(attribution).filter(([, value]) => value),
  ) as AttributionProperties;
}

export function readStoredAttribution(): AttributionProperties {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};

    const originalSource =
      typeof parsed.original_source === 'string'
        ? parsed.original_source
        : typeof parsed.utm_source === 'string'
          ? normalizeSource(parsed.utm_source)
          : undefined;

    return pruneAttribution({
      original_source: originalSource,
      utm_campaign:
        typeof parsed.utm_campaign === 'string' ? parsed.utm_campaign : undefined,
      utm_content:
        typeof parsed.utm_content === 'string' ? parsed.utm_content : undefined,
    });
  } catch {
    return {};
  }
}

export function captureCurrentAttribution(): AttributionProperties {
  if (typeof window === 'undefined') return {};

  const existing = readStoredAttribution();
  const current = attributionFromCurrentVisit();
  const shouldReplace =
    !existing.original_source ||
    (isDirectOrReferral(existing.original_source) && hasUtmSource());

  const next = shouldReplace ? current : existing;

  try {
    window.localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(next));
    document.cookie = `${ATTRIBUTION_COOKIE_KEY}=${encodeURIComponent(
      JSON.stringify(next),
    )}; path=/; max-age=7776000; SameSite=Lax`;
  } catch {
    // Attribution is helpful, but should never affect the app.
  }

  return next;
}

export function getAttributionEventProps(): AttributionProperties {
  if (typeof window === 'undefined') return {};
  return readStoredAttribution();
}

export function shouldCaptureTrafficSourceEvent(
  attribution: AttributionProperties,
) {
  if (typeof window === 'undefined') return false;
  if (!attribution.original_source || attribution.original_source === 'direct') {
    return false;
  }

  const eventKey = [
    TRAFFIC_SOURCE_EVENT_PREFIX,
    attribution.original_source,
    attribution.utm_campaign ?? '',
    attribution.utm_content ?? '',
  ].join(':');

  try {
    if (window.localStorage.getItem(eventKey) === '1') return false;
    window.localStorage.setItem(eventKey, '1');
    return true;
  } catch {
    return true;
  }
}
