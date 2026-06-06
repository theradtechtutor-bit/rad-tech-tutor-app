export type AttributionProperties = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  landing_page?: string;
  initial_referrer?: string;
  traffic_captured_at?: string;
};

export const ATTRIBUTION_STORAGE_KEY = 'rtt_attribution';
export const ATTRIBUTION_COOKIE_KEY = 'rtt_attribution';

const ATTRIBUTION_PARAM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
] as const;

export const ATTRIBUTION_PROPERTY_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'landing_page',
  'initial_referrer',
  'traffic_captured_at',
] as const;

function cleanValue(value: string | null) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

export function readStoredAttribution(): AttributionProperties {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};

    return parsed as AttributionProperties;
  } catch {
    return {};
  }
}

export function getAttributionFromUrl(): AttributionProperties {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  const attribution: AttributionProperties = {};

  for (const key of ATTRIBUTION_PARAM_KEYS) {
    const value = cleanValue(params.get(key));
    if (value) {
      attribution[key] = value;
    }
  }

  return attribution;
}

export function captureCurrentAttribution(): AttributionProperties {
  if (typeof window === 'undefined') return {};

  const existing = readStoredAttribution();
  const fromUrl = getAttributionFromUrl();
  const hasUrlAttribution = Object.keys(fromUrl).length > 0;
  const hasExistingCampaignAttribution = Boolean(
    existing.utm_source ||
      existing.utm_medium ||
      existing.utm_campaign ||
      existing.gclid,
  );

  if (!hasUrlAttribution && Object.keys(existing).length > 0) {
    return existing;
  }

  if (hasUrlAttribution && hasExistingCampaignAttribution) {
    return existing;
  }

  const next: AttributionProperties = {
    ...(hasUrlAttribution ? existing : {}),
    ...fromUrl,
    landing_page: hasUrlAttribution
      ? `${window.location.pathname}${window.location.search}`
      : existing.landing_page ||
        `${window.location.pathname}${window.location.search}`,
    initial_referrer: hasUrlAttribution
      ? document.referrer || ''
      : existing.initial_referrer || document.referrer || '',
    traffic_captured_at: hasUrlAttribution
      ? new Date().toISOString()
      : existing.traffic_captured_at || new Date().toISOString(),
  };

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

export function normalizeAttributionProperties(
  attribution: AttributionProperties,
) {
  return ATTRIBUTION_PROPERTY_KEYS.reduce(
    (properties, key) => {
      properties[key] = attribution[key] ?? null;
      return properties;
    },
    {} as Record<(typeof ATTRIBUTION_PROPERTY_KEYS)[number], string | null>,
  );
}
