const API_BASE =
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '' : 'http://localhost:3000');

function freshUrl(path) {
  const sep = String(path).includes('?') ? '&' : '?';
  return `${API_BASE}${path}${sep}_=${Date.now()}`;
}

async function getJson(path, signal) {
  const res = await fetch(freshUrl(path), {
    cache: 'no-store',
    headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
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

export async function submitInquiry(payload) {
  const res = await fetch(`${API_BASE}/api/v1/inquiries`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    throw new Error(body.error?.message || 'Unable to send the inquiry');
  }
  return body.data;
}

export async function submitBooking(payload) {
  const res = await fetch(`${API_BASE}/api/v1/bookings`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    throw new Error(body.error?.message || 'Unable to send the booking');
  }
  return body.data;
}
