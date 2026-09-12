const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Public Safari API client. Drafts are never requested from this module.
 */
export async function fetchPublishedSafaris(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== '' && value != null)
  );
  const res = await fetch(`${API_BASE}/api/v1/safaris?${query}`);
  const body = await res.json();
  if (!res.ok || body.success === false) {
    throw new Error(body.error?.message || 'Unable to load safaris');
  }
  return body.data || [];
}

export async function fetchPublishedSafariBySlug(slug) {
  const res = await fetch(`${API_BASE}/api/v1/safaris/slug/${encodeURIComponent(slug)}`);
  const body = await res.json();
  if (res.status === 404) return null;
  if (!res.ok || body.success === false) {
    throw new Error(body.error?.message || 'Unable to load safari');
  }
  return body.data;
}
