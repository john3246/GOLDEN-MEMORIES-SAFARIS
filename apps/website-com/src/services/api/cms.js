const API_BASE =
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '' : 'http://localhost:3000');

async function getJson(path, signal) {
  const res = await fetch(`${API_BASE}${path}`, signal ? { signal } : undefined);
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
