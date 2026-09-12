import { describe, it, expect, beforeEach } from 'vitest';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';
import { send } from './helpers/supertest-lite.js';
import { createApp } from '../../apps/api/src/app.js';
import { resetCmsStore } from '../../apps/api/src/cms-store/index.js';
import { bootstrapCms, resetBootstrapFlag } from '../../apps/api/src/bootstrap/cms.js';
import { memoryCache } from '../../apps/api/src/cache/index.js';
import { createTestRateLimiter } from '../../apps/api/src/middleware/rateLimit.js';
import express from 'express';

const adminEmail = 'admin@gmsafaris.com';
const adminPassword = 'ChangeMeAdmin!23';
const editorEmail = 'editor@gmsafaris.com';
const editorPassword = 'ChangeMeEditor!23';
const viewerEmail = 'viewer@gmsafaris.com';
const viewerPassword = 'ChangeMeViewer!23';

async function setup() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'gm-safari-cms-'));
  process.env.CMS_SEED_SAFARIS = 'false';
  memoryCache.reset();
  resetBootstrapFlag();
  await resetCmsStore(dir);
  await bootstrapCms();
  return createApp();
}

async function login(app, email, password) {
  const res = await send(app, 'POST', '/api/v1/admin/auth/login', { email, password });
  expect(res.status).toBe(200);
  return res.body.data.token;
}

function auth(token) {
  return { Authorization: `Bearer ${token}` };
}

describe('Safari CMS', () => {
  let app;

  beforeEach(async () => {
    app = await setup();
  });

  it('creates, updates, and lists a draft that stays off the public API', async () => {
    const token = await login(app, adminEmail, adminPassword);
    const created = await send(app, 'POST', '/api/v1/admin/safaris', { title: 'Serengeti Luxury Safari' }, auth(token));
    expect(created.status).toBe(201);
    expect(created.body.data.status).toBe('DRAFT');
    const id = created.body.data.id;
    const slug = created.body.data.slug;

    const updated = await send(
      app,
      'PATCH',
      `/api/v1/admin/safaris/${id}`,
      { description: 'Private northern-circuit days from Arusha.', price_from: 3200 },
      auth(token)
    );
    expect(updated.status).toBe(200);
    expect(updated.body.data.draft.price_from).toBe(3200);

    const pub = await send(app, 'GET', `/api/v1/safaris/slug/${slug}`);
    expect(pub.status).toBe(404);

    const preview = await send(app, 'GET', `/api/v1/admin/safaris/${id}/preview`, undefined, auth(token));
    expect(preview.status).toBe(200);
    expect(preview.body.data.title).toBe('Serengeti Luxury Safari');
  });

  it('publishes to the public API and unpublishes again', async () => {
    const token = await login(app, adminEmail, adminPassword);
    const created = await send(app, 'POST', '/api/v1/admin/safaris', { title: 'Tarangire Elephant Safari' }, auth(token));
    const id = created.body.data.id;
    const slug = created.body.data.slug;

    const published = await send(app, 'POST', `/api/v1/admin/safaris/${id}/publish`, {}, auth(token));
    expect(published.status).toBe(200);
    expect(published.body.data.status).toBe('PUBLISHED');

    const pub = await send(app, 'GET', `/api/v1/safaris/slug/${slug}`);
    expect(pub.status).toBe(200);
    expect(pub.body.data.slug).toBe(slug);
    expect(pub.body.data.draft).toBeUndefined();
    expect(pub.body.data.created_by).toBeUndefined();

    const list = await send(app, 'GET', '/api/v1/safaris');
    expect(list.body.data.some((item) => item.slug === slug)).toBe(true);

    await send(app, 'POST', `/api/v1/admin/safaris/${id}/unpublish`, {}, auth(token));
    const hidden = await send(app, 'GET', `/api/v1/safaris/slug/${slug}`);
    expect(hidden.status).toBe(404);
  });

  it('keeps internal ids stable when the title changes', async () => {
    const token = await login(app, adminEmail, adminPassword);
    const created = await send(app, 'POST', '/api/v1/admin/safaris', { title: 'Serengeti Luxury Safari' }, auth(token));
    const id = created.body.data.id;
    const renamed = await send(app, 'PATCH', `/api/v1/admin/safaris/${id}`, { title: 'Luxury Serengeti Safari' }, auth(token));
    expect(renamed.body.data.id).toBe(id);
  });

  it('records revisions on save and publish', async () => {
    const token = await login(app, adminEmail, adminPassword);
    const created = await send(app, 'POST', '/api/v1/admin/safaris', { title: 'Ngorongoro Crater Safari' }, auth(token));
    const id = created.body.data.id;
    await send(app, 'PATCH', `/api/v1/admin/safaris/${id}`, { destination: 'Ngorongoro' }, auth(token));
    await send(app, 'POST', `/api/v1/admin/safaris/${id}/publish`, {}, auth(token));
    const got = await send(app, 'GET', `/api/v1/admin/safaris/${id}`, undefined, auth(token));
    const actions = got.body.data.revisions.map((item) => item.action);
    expect(actions).toEqual(expect.arrayContaining(['created', 'updated', 'published']));
  });

  it('duplicates a safari as a new draft', async () => {
    const token = await login(app, adminEmail, adminPassword);
    const created = await send(app, 'POST', '/api/v1/admin/safaris', { title: 'Classic Lodge Safari' }, auth(token));
    const copy = await send(app, 'POST', `/api/v1/admin/safaris/${created.body.data.id}/duplicate`, {}, auth(token));
    expect(copy.status).toBe(201);
    expect(copy.body.data.id).not.toBe(created.body.data.id);
    expect(copy.body.data.status).toBe('DRAFT');
  });

  it('rejects invalid slugs and negative prices', async () => {
    const token = await login(app, adminEmail, adminPassword);
    const badSlug = await send(app, 'POST', '/api/v1/admin/safaris', { title: 'X', slug: 'Bad Slug' }, auth(token));
    expect(badSlug.status).toBe(400);
    const created = await send(app, 'POST', '/api/v1/admin/safaris', { title: 'Valid Safari' }, auth(token));
    const badPrice = await send(
      app,
      'PATCH',
      `/api/v1/admin/safaris/${created.body.data.id}`,
      { price: -20 },
      auth(token)
    );
    expect(badPrice.status).toBe(400);
  });

  it('forbids editor deletes and viewer writes', async () => {
    const admin = await login(app, adminEmail, adminPassword);
    const created = await send(app, 'POST', '/api/v1/admin/safaris', { title: 'Protected Safari' }, auth(admin));
    const id = created.body.data.id;

    const editor = await login(app, editorEmail, editorPassword);
    const editorDelete = await send(app, 'DELETE', `/api/v1/admin/safaris/${id}`, undefined, auth(editor));
    expect(editorDelete.status).toBe(403);

    const viewer = await login(app, viewerEmail, viewerPassword);
    const viewerWrite = await send(app, 'PATCH', `/api/v1/admin/safaris/${id}`, { title: 'Nope' }, auth(viewer));
    expect(viewerWrite.status).toBe(403);
  });

  it('lets an editor publish but not manage API clients', async () => {
    const editor = await login(app, editorEmail, editorPassword);
    const created = await send(app, 'POST', '/api/v1/admin/safaris', { title: 'Editor Safari' }, auth(editor));
    const published = await send(app, 'POST', `/api/v1/admin/safaris/${created.body.data.id}/publish`, {}, auth(editor));
    expect(published.status).toBe(200);
    const clients = await send(app, 'GET', '/api/v1/admin/api-clients', undefined, auth(editor));
    expect(clients.status).toBe(403);
  });

  it('issues a third-party key that can read published safaris only', async () => {
    const admin = await login(app, adminEmail, adminPassword);
    const created = await send(app, 'POST', '/api/v1/admin/safaris', { title: 'Public Key Safari', slug: 'public-key-safari' }, auth(admin));
    await send(app, 'POST', `/api/v1/admin/safaris/${created.body.data.id}/publish`, {}, auth(admin));

    const keyRes = await send(app, 'POST', '/api/v1/admin/api-clients', { name: 'co.tz', scopes: ['safaris:read'] }, auth(admin));
    expect(keyRes.status).toBe(201);
    const apiKey = keyRes.body.data.key;
    expect(apiKey).toMatch(/^gm_/);

    const ok = await send(app, 'GET', '/api/v1/external/safaris/slug/public-key-safari', undefined, { 'X-Api-Key': apiKey });
    expect(ok.status).toBe(200);
    expect(ok.body.data.title).toBe('Public Key Safari');

    const draft = await send(app, 'POST', '/api/v1/admin/safaris', { title: 'Hidden Draft', slug: 'hidden-draft' }, auth(admin));
    const leak = await send(app, 'GET', '/api/v1/external/safaris/slug/hidden-draft', undefined, { 'X-Api-Key': apiKey });
    expect(leak.status).toBe(404);

    const noKey = await send(app, 'GET', '/api/v1/external/safaris');
    expect(noKey.status).toBe(401);

    await send(app, 'POST', `/api/v1/admin/api-clients/${keyRes.body.data.id}/revoke`, {}, auth(admin));
    const revoked = await send(app, 'GET', '/api/v1/external/safaris', undefined, { 'X-Api-Key': apiKey });
    expect(revoked.status).toBe(401);
  });

  it('invalidates public cache after publish', async () => {
    const token = await login(app, adminEmail, adminPassword);
    const created = await send(app, 'POST', '/api/v1/admin/safaris', { title: 'Cache Safari', slug: 'cache-safari' }, auth(token));
    const before = await send(app, 'GET', '/api/v1/safaris');
    expect(before.body.data.find((item) => item.slug === 'cache-safari')).toBeUndefined();
    await send(app, 'POST', `/api/v1/admin/safaris/${created.body.data.id}/publish`, {}, auth(token));
    const after = await send(app, 'GET', '/api/v1/safaris');
    expect(after.body.data.find((item) => item.slug === 'cache-safari')).toBeTruthy();
  });

  it('rate-limits when the limiter max is 1', async () => {
    const mini = express();
    mini.use(createTestRateLimiter(1));
    mini.get('/ping', (_req, res) => res.json({ success: true, data: { ok: true } }));
    const first = await send(mini, 'GET', '/ping');
    const second = await send(mini, 'GET', '/ping');
    expect(first.status).toBe(200);
    expect(second.status).toBe(429);
    expect(second.body.error.code).toBe('RATE_LIMITED');
  });

  it('serves OpenAPI documentation', async () => {
    const res = await send(app, 'GET', '/api/v1/docs/openapi.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.0.3');
    expect(res.body.paths['/safaris']).toBeTruthy();
  });
});
