import { describe, it, expect, beforeEach } from 'vitest';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { send } from './helpers/supertest-lite.js';
import { createApp } from '../../apps/api/src/app.js';
import { resetCmsStore } from '../../apps/api/src/cms-store/index.js';
import { bootstrapCms, resetBootstrapFlag } from '../../apps/api/src/bootstrap/cms.js';
import { memoryCache } from '../../apps/api/src/cache/index.js';
import { signPayload } from '../../apps/api/src/modules/webhooks/webhooks.service.js';
import { parsePastedReviews } from '../../apps/api/src/modules/reviews/reviews.service.js';
import { isPrivateAddress } from '../../apps/api/src/security/outbound-url.js';
import { passwordProblems } from '../../apps/api/src/security/password-policy.js';
import { metaForPath, injectSeo } from '../../apps/api/src/modules/seo/seo.service.js';
import { screenSubmission, cleanField } from '../../apps/api/src/modules/forms/form-guard.js';

const adminEmail = 'info@gms.co.tz';
const adminPassword = '1234gms';

async function setup() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'gm-platform-'));
  process.env.CMS_SEED_SAFARIS = 'false';
  memoryCache.reset();
  resetBootstrapFlag();
  await resetCmsStore(dir);
  await bootstrapCms();
  return createApp();
}

async function login(app, email = adminEmail, password = adminPassword) {
  const res = await send(app, 'POST', '/api/v1/admin/auth/login', { email, password });
  expect(res.status).toBe(200);
  return res.body.data.token;
}

const auth = (token) => ({ Authorization: `Bearer ${token}` });

describe('platform features', () => {
  let app;
  beforeEach(async () => {
    app = await setup();
  });

  it('signs webhook payloads with HMAC-SHA256 over timestamp.body', () => {
    const body = JSON.stringify({ event: 'booking.created' });
    const expected = `sha256=${crypto.createHmac('sha256', 'secret').update(`123.${body}`).digest('hex')}`;
    expect(signPayload('secret', '123', body)).toBe(expected);
  });

  it('refuses webhook URLs that are not public https', async () => {
    const token = await login(app);
    const http = await send(app, 'POST', '/api/v1/admin/webhooks', { name: 'x', url: 'http://example.com', events: ['booking.created'] }, auth(token));
    expect(http.status).toBe(400);
    expect(isPrivateAddress('10.0.0.5')).toBe(true);
    expect(isPrivateAddress('169.254.169.254')).toBe(true);
    expect(isPrivateAddress('::1')).toBe(true);
    expect(isPrivateAddress('8.8.8.8')).toBe(false);
    const ok = await send(
      app,
      'POST',
      '/api/v1/admin/webhooks',
      { name: 'CRM', url: 'https://example.com/hook', events: ['booking.created'], headers: 'Authorization: Bearer abc' },
      auth(token)
    );
    expect(ok.status).toBe(200);
    expect(ok.body.data.secret).toMatch(/^[a-f0-9]{48}$/);
    const list = await send(app, 'GET', '/api/v1/admin/webhooks', undefined, auth(token));
    expect(JSON.stringify(list.body)).not.toContain('Bearer abc');
    expect(JSON.stringify(list.body)).not.toContain(ok.body.data.secret);
  });

  it('parses pasted SafariBookings reviews and publishes them', async () => {
    const rows = parsePastedReviews('Name | Country | Rating | Date | Title | Review\nAna | Spain | 5 | 2026-07-01 | Superb | Great guide and camps.');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ author: 'Ana', country: 'Spain', rating: 5, title: 'Superb', source: 'safaribookings' });
    const token = await login(app);
    const imported = await send(
      app,
      'POST',
      '/api/v1/admin/reviews/import',
      { source: 'safaribookings', text: 'Ana | Spain | 5 | 2026-07-01 | Superb | Great guide and camps.' },
      auth(token)
    );
    expect(imported.body.data.added).toBe(1);
    const pub = await send(app, 'GET', '/api/v1/reviews');
    expect(pub.body.data.reviews.some((row) => row.author === 'Ana' && row.source === 'safaribookings')).toBe(true);
  });

  it('manages all five staff roles and blocks editors from user admin', async () => {
    const token = await login(app);
    const weak = await send(app, 'POST', '/api/v1/admin/users', { name: 'Kim', email: 'kim@example.com', role: 'Manager', password: 'short' }, auth(token));
    expect(weak.status).toBe(400);
    const created = await send(
      app,
      'POST',
      '/api/v1/admin/users',
      { name: 'Kim Ops', email: 'kim@example.com', role: 'Manager', password: 'Kiboko!Safari2026', sendWelcome: false },
      auth(token)
    );
    expect(created.status).toBe(201);
    expect(created.body.data.role).toBe('Manager');
    const editorToken = await login(app, 'editor@gmsafaris.com', 'ChangeMeEditor!23');
    const forbidden = await send(app, 'GET', '/api/v1/admin/users', undefined, auth(editorToken));
    expect(forbidden.status).toBe(403);
    const managerToken = await login(app, 'kim@example.com', 'Kiboko!Safari2026');
    await send(app, 'PATCH', `/api/v1/admin/users/${created.body.data.id}`, { status: 'disabled' }, auth(token));
    const afterDisable = await send(app, 'GET', '/api/v1/admin/bookings', undefined, auth(managerToken));
    expect(afterDisable.status).toBe(401);
  });

  it('locks an account after five wrong passwords', async () => {
    for (let i = 0; i < 4; i += 1) {
      const res = await send(app, 'POST', '/api/v1/admin/auth/login', { email: adminEmail, password: 'wrong-password' });
      expect(res.status).toBe(401);
    }
    const locked = await send(app, 'POST', '/api/v1/admin/auth/login', { email: adminEmail, password: 'wrong-password' });
    expect(locked.status).toBe(429);
    const evenCorrect = await send(app, 'POST', '/api/v1/admin/auth/login', { email: adminEmail, password: adminPassword });
    expect(evenCorrect.status).toBe(429);
  });

  it('serves one cached site bundle with ETag revalidation', async () => {
    const first = await send(app, 'GET', '/api/v1/site-bundle');
    expect(first.status).toBe(200);
    expect(first.body.data).toHaveProperty('settings');
    expect(first.body.data).toHaveProperty('safaris');
    const etag = first.headers.etag;
    expect(etag).toBeTruthy();
    const second = await send(app, 'GET', '/api/v1/site-bundle', undefined, { 'If-None-Match': etag });
    expect(second.status).toBe(304);
  });

  it('builds per-page SEO tags and structured data', async () => {
    const meta = await metaForPath('/tours/');
    expect(meta.title).toMatch(/Tanzania Safari Packages/);
    expect(meta.description.length).toBeLessThanOrEqual(165);
    expect(meta.keywords).toMatch(/Serengeti/);
    const html = injectSeo('<html><head><meta name="viewport" content="x"><title>old</title></head><body><div id="app"></div></body></html>', meta, {});
    expect(html).toContain('<meta name="keywords"');
    expect(html).toContain('application/ld+json');
    expect(html).toContain('og:image');
    expect(html).not.toContain('<title>old</title>');
    expect(await metaForPath('/tours/does-not-exist/')).toBeNull();
  });

  it('screens spam and strips markup from form fields', () => {
    expect(screenSubmission({ website: 'http://spam' }).drop).toBe(true);
    expect(screenSubmission({ _ts: Date.now() }).drop).toBe(true);
    expect(screenSubmission({}, 'see https://a https://b https://c https://d').spam).toBe(true);
    expect(cleanField('<b>Hi</b><script>x</script>')).toBe('Hix');
  });

  it('enforces the staff password policy', () => {
    expect(passwordProblems('1234gms').length).toBeGreaterThan(0);
    expect(passwordProblems('Kiboko!Safari2026')).toEqual([]);
    expect(passwordProblems('Mary!Safari2026x', { name: 'Mary Smith' }).length).toBeGreaterThan(0);
  });
});
