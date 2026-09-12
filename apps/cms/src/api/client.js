const TOKEN_KEY = 'gm_cms_token';
const USER_KEY = 'gm_cms_user';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

function headers(extra = {}) {
  const token = sessionStorage.getItem(TOKEN_KEY);
  return {
    Accept: 'application/json',
    ...(extra.json ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra.headers,
  };
}

function apiMessageFromBody(status, text) {
  try {
    const body = JSON.parse(text);
    if (body && body.success === false && body.error?.message) {
      return { ok: false, body, message: body.error.message, code: body.error.code };
    }
    if (body && body.success !== false) {
      return { ok: true, body };
    }
  } catch {
    /* HTML or empty */
  }
  if (/requested path could not be found/i.test(text) || /service suspended/i.test(text)) {
    return {
      ok: false,
      body: {},
      message:
        'This page is a static site, so sign-in has no API. Deploy a Render Web Service (not Static) with start command npm start, then open /cms/ on that URL.',
    };
  }
  return { ok: false, body: {}, message: `Request failed (${status})` };
}

async function parse(res) {
  const text = await res.text();
  const parsed = apiMessageFromBody(res.status, text);
  if (!res.ok || !parsed.ok) {
    const error = new Error(parsed.message);
    error.status = res.status;
    error.code = parsed.code;
    throw error;
  }
  return parsed.body;
}

export const api = {
  token() {
    return sessionStorage.getItem(TOKEN_KEY);
  },
  user() {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  setSession(token, user) {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clearSession() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },

  async login(email, password) {
    const body = await parse(
      await fetch(`${API_BASE}/api/v1/admin/auth/login`, {
        method: 'POST',
        headers: headers({ json: true }),
        body: JSON.stringify({ email, password }),
      })
    );
    this.setSession(body.data.token, body.data.user);
    return body.data;
  },

  async me() {
    const body = await parse(
      await fetch(`${API_BASE}/api/v1/admin/auth/me`, { headers: headers() })
    );
    this.setSession(this.token(), body.data);
    return body.data;
  },

  async listSafaris(params = {}) {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== '' && value != null)
    );
    const body = await parse(
      await fetch(`${API_BASE}/api/v1/admin/safaris?${query}`, { headers: headers() })
    );
    return body;
  },

  async getSafari(id) {
    const body = await parse(await fetch(`${API_BASE}/api/v1/admin/safaris/${id}`, { headers: headers() }));
    return body.data;
  },

  async previewSafari(id) {
    const body = await parse(
      await fetch(`${API_BASE}/api/v1/admin/safaris/${id}/preview`, { headers: headers() })
    );
    return body.data;
  },

  async createSafari(payload) {
    const body = await parse(
      await fetch(`${API_BASE}/api/v1/admin/safaris`, {
        method: 'POST',
        headers: headers({ json: true }),
        body: JSON.stringify(payload),
      })
    );
    return body.data;
  },

  async saveSafari(id, payload) {
    const body = await parse(
      await fetch(`${API_BASE}/api/v1/admin/safaris/${id}`, {
        method: 'PATCH',
        headers: headers({ json: true }),
        body: JSON.stringify(payload),
      })
    );
    return body.data;
  },

  async action(id, name) {
    const body = await parse(
      await fetch(`${API_BASE}/api/v1/admin/safaris/${id}/${name}`, {
        method: 'POST',
        headers: headers({ json: true }),
        body: '{}',
      })
    );
    return body.data;
  },

  async deleteSafari(id) {
    const body = await parse(
      await fetch(`${API_BASE}/api/v1/admin/safaris/${id}`, { method: 'DELETE', headers: headers() })
    );
    return body.data;
  },

  async listMedia() {
    const body = await parse(await fetch(`${API_BASE}/api/v1/admin/media`, { headers: headers() }));
    return body.data;
  },

  async addMediaUrl(url, alt = '', caption = '') {
    const body = await parse(
      await fetch(`${API_BASE}/api/v1/admin/media`, {
        method: 'POST',
        headers: headers({ json: true }),
        body: JSON.stringify({ url, alt, caption }),
      })
    );
    return body.data;
  },

  async uploadMedia(file, alt = '', caption = '') {
    const form = new FormData();
    form.append('file', file);
    form.append('alt', alt);
    form.append('caption', caption);
    const token = sessionStorage.getItem(TOKEN_KEY);
    const body = await parse(
      await fetch(`${API_BASE}/api/v1/admin/media`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })
    );
    return body.data;
  },

  async listClients() {
    const body = await parse(await fetch(`${API_BASE}/api/v1/admin/api-clients`, { headers: headers() }));
    return body.data;
  },

  async createClient(payload) {
    const body = await parse(
      await fetch(`${API_BASE}/api/v1/admin/api-clients`, {
        method: 'POST',
        headers: headers({ json: true }),
        body: JSON.stringify(payload),
      })
    );
    return body.data;
  },

  async revokeClient(id) {
    const body = await parse(
      await fetch(`${API_BASE}/api/v1/admin/api-clients/${id}/revoke`, {
        method: 'POST',
        headers: headers({ json: true }),
        body: '{}',
      })
    );
    return body.data;
  },
};
