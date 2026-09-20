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

  async forgotPassword(email) {
    const body = await parse(
      await fetch(`${API_BASE}/api/v1/admin/auth/forgot`, {
        method: 'POST',
        headers: headers({ json: true }),
        body: JSON.stringify({ email }),
      })
    );
    return body.data;
  },

  async resetPassword(token, password) {
    const body = await parse(
      await fetch(`${API_BASE}/api/v1/admin/auth/reset`, {
        method: 'POST',
        headers: headers({ json: true }),
        body: JSON.stringify({ token, password }),
      })
    );
    return body.data;
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

  async mediaLibrary() {
    const body = await parse(await fetch(`${API_BASE}/api/v1/admin/media/library`, { headers: headers() }));
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

  async listAudit() {
    const body = await parse(await fetch(`${API_BASE}/api/v1/admin/audit`, { headers: headers() }));
    return body;
  },

  async overview() {
    const body = await parse(
      await fetch(`${API_BASE}/api/v1/admin/content/overview`, { headers: headers() })
    );
    return body;
  },

  async listContent(type, params = {}) {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== '' && value != null)
    );
    const body = await parse(
      await fetch(`${API_BASE}/api/v1/admin/content/${type}?${query}`, { headers: headers() })
    );
    return body;
  },

  async getContent(type, id) {
    const body = await parse(
      await fetch(`${API_BASE}/api/v1/admin/content/${type}/${id}`, { headers: headers() })
    );
    return body.data;
  },

  async createContent(type, payload) {
    const body = await parse(
      await fetch(`${API_BASE}/api/v1/admin/content/${type}`, {
        method: 'POST',
        headers: headers({ json: true }),
        body: JSON.stringify(payload),
      })
    );
    return body.data;
  },

  async saveContent(type, id, payload) {
    const body = await parse(
      await fetch(`${API_BASE}/api/v1/admin/content/${type}/${id}`, {
        method: 'PATCH',
        headers: headers({ json: true }),
        body: JSON.stringify(payload),
      })
    );
    return body.data;
  },

  async publishContent(type, id) {
    const body = await parse(
      await fetch(`${API_BASE}/api/v1/admin/content/${type}/${id}/publish`, {
        method: 'POST',
        headers: headers({ json: true }),
        body: '{}',
      })
    );
    return body.data;
  },

  async unpublishContent(type, id) {
    const body = await parse(
      await fetch(`${API_BASE}/api/v1/admin/content/${type}/${id}/unpublish`, {
        method: 'POST',
        headers: headers({ json: true }),
        body: '{}',
      })
    );
    return body.data;
  },

  async deleteContent(type, id) {
    const body = await parse(
      await fetch(`${API_BASE}/api/v1/admin/content/${type}/${id}`, {
        method: 'DELETE',
        headers: headers(),
      })
    );
    return body.data;
  },

  async getSettings() {
    const body = await parse(await fetch(`${API_BASE}/api/v1/admin/settings`, { headers: headers() }));
    return body.data;
  },

  async saveSettings(payload) {
    const body = await parse(
      await fetch(`${API_BASE}/api/v1/admin/settings`, {
        method: 'PATCH',
        headers: headers({ json: true }),
        body: JSON.stringify(payload),
      })
    );
    return body.data;
  },

  async testEmail(to) {
    const body = await parse(
      await fetch(`${API_BASE}/api/v1/admin/settings/test-email`, {
        method: 'POST',
        headers: headers({ json: true }),
        body: JSON.stringify({ to }),
      })
    );
    return body.data;
  },

  async remindBooking(id) {
    const body = await parse(
      await fetch(`${API_BASE}/api/v1/admin/bookings/${id}/remind`, {
        method: 'POST',
        headers: headers({ json: true }),
        body: '{}',
      })
    );
    return body.data;
  },

  async listInquiries() {
    const body = await parse(await fetch(`${API_BASE}/api/v1/admin/inquiries`, { headers: headers() }));
    return body;
  },

  async updateInquiry(id, status) {
    const body = await parse(
      await fetch(`${API_BASE}/api/v1/admin/inquiries/${id}`, {
        method: 'PATCH',
        headers: headers({ json: true }),
        body: JSON.stringify({ status }),
      })
    );
    return body.data;
  },

  async listBookings() {
    const body = await parse(await fetch(`${API_BASE}/api/v1/admin/bookings`, { headers: headers() }));
    return body;
  },

  async createBooking(payload) {
    const body = await parse(
      await fetch(`${API_BASE}/api/v1/admin/bookings`, {
        method: 'POST',
        headers: headers({ json: true }),
        body: JSON.stringify(payload),
      })
    );
    return body.data;
  },

  async updateBooking(id, payload) {
    const body = await parse(
      await fetch(`${API_BASE}/api/v1/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: headers({ json: true }),
        body: JSON.stringify(payload),
      })
    );
    return body.data;
  },

  async listCustomers() {
    const body = await parse(await fetch(`${API_BASE}/api/v1/admin/customers`, { headers: headers() }));
    return body;
  },

  async listUsers() {
    const body = await parse(await fetch(`${API_BASE}/api/v1/admin/users`, { headers: headers() }));
    return body;
  },

  async createUser(payload) {
    const body = await parse(
      await fetch(`${API_BASE}/api/v1/admin/users`, {
        method: 'POST',
        headers: headers({ json: true }),
        body: JSON.stringify(payload),
      })
    );
    return body.data;
  },

  async updateUser(id, payload) {
    const body = await parse(
      await fetch(`${API_BASE}/api/v1/admin/users/${id}`, {
        method: 'PATCH',
        headers: headers({ json: true }),
        body: JSON.stringify(payload),
      })
    );
    return body.data;
  },
};
