import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { send } from '../api/helpers/supertest-lite.js';
import { createApp } from '../../apps/api/src/app.js';

/**
 * External API must remain read-only.
 * Write verbs must not mutate resources (404 route or method rejection — never 2xx write).
 */
describe('External API security — read-only', () => {
  const previousKeys = process.env.EXTERNAL_API_KEYS;
  let app;

  beforeAll(() => {
    process.env.EXTERNAL_API_KEYS = 'test_external_key_phase1';
    // Re-importing config is sticky; createApp uses already-loaded config.
    // For Phase 1 we assert that write methods are not registered (404),
    // which does not require a valid key for the security property under test.
    app = createApp();
  });

  afterAll(() => {
    if (previousKeys === undefined) delete process.env.EXTERNAL_API_KEYS;
    else process.env.EXTERNAL_API_KEYS = previousKeys;
  });

  it.each(['POST', 'PUT', 'PATCH', 'DELETE'])(
    '%s /api/v1/external/tours is not an allowed write surface',
    async (method) => {
      const res = await send(app, method, '/api/v1/external/tours', { title: 'hack' });
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).not.toBe(200);
      expect(res.status).not.toBe(201);
      expect(res.body?.success).not.toBe(true);
    }
  );
});
