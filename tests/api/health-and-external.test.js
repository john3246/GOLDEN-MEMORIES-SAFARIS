import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request, { send } from './helpers/supertest-lite.js';
import { createApp } from '../../apps/api/src/app.js';

describe('API foundation', () => {
  const app = createApp();
  const previousKeys = process.env.EXTERNAL_API_KEYS;

  beforeAll(() => {
    delete process.env.EXTERNAL_API_KEYS;
  });

  afterAll(() => {
    if (previousKeys === undefined) delete process.env.EXTERNAL_API_KEYS;
    else process.env.EXTERNAL_API_KEYS = previousKeys;
  });

  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
    expect(res.headers['x-request-id']).toBeTruthy();
  });

  it('GET /api/v1 describes surfaces', async () => {
    const res = await request(app).get('/api/v1');
    expect(res.status).toBe(200);
    expect(res.body.data.surfaces.external).toBe('/api/v1/external');
  });

  it('GET /api/v1/external/status without key is unauthorized', async () => {
    const res = await request(app).get('/api/v1/external/status');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('GET /api/v1/external/status with valid key succeeds', async () => {
    process.env.EXTERNAL_API_KEYS = 'test_external_key_phase1';
    const res = await send(app, 'GET', '/api/v1/external/status', undefined, {
      'X-Api-Key': 'test_external_key_phase1',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.mode).toBe('read-only');
    delete process.env.EXTERNAL_API_KEYS;
  });
});
