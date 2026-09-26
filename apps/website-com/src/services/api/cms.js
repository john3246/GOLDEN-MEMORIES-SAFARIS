const API_BASE =
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '' : 'http://localhost:3000');

async function getJson(path, signal) {
  // "no-cache" = always ask the server, but reuse the cached copy when it
  // answers 304 Not Modified (fast, and CMS edits still show immediately).
  const res = await fetch(`${API_BASE}${path}`, {
    cache: 'no-cache',
    headers: { Accept: 'application/json' },
    ...(signal ? { signal } : {}),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    throw new Error(body.error?.message || `Unable to load ${path}`);
  }
  return body.data;
}

export async function fetchPublicSettings(signal) {
  return getJson('/api/v1/settings', signal);
}

export async function fetchPublishedContent(type, signal) {
  const data = await getJson(`/api/v1/content/${encodeURIComponent(type)}`, signal);
  return Array.isArray(data) ? data : [];
}

export async function fetchPublishedContentBySlug(type, slug, signal) {
  if (!slug) return null;
  try {
    return await getJson(
      `/api/v1/content/${encodeURIComponent(type)}/slug/${encodeURIComponent(slug)}`,
      signal
    );
  } catch {
    return null;
  }
}

async function postJson(path, payload, fallbackMessage) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    const err = new Error('We could not reach our server.');
    err.status = 0;
    throw err;
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    const err = new Error(body.error?.message || fallbackMessage);
    err.status = res.status;
    err.field = body.error?.details?.field;
    throw err;
  }
  return body.data;
}

export async function submitInquiry(payload) {
  return postJson('/api/v1/inquiries', payload, 'Unable to send your message');
}

export async function submitBooking(payload) {
  return postJson('/api/v1/bookings', payload, 'Unable to send your booking request');
}

let bundlePromise = null;

/** Everything the site needs from the CMS in one cached request. */
export function fetchSiteBundle(signal) {
  if (!bundlePromise) {
    bundlePromise = getJson('/api/v1/site-bundle', signal).catch((err) => {
      bundlePromise = null;
      throw err;
    });
  }
  return bundlePromise;
}

export async function fetchPublicReviews(params = {}, signal) {
  const query = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null));
  return getJson(`/api/v1/reviews?${query}`, signal);
}
