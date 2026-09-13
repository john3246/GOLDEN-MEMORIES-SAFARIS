import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';
import express from 'express';
import { send } from './helpers/supertest-lite.js';
import { servePublicSite } from '../../apps/api/src/app.js';

describe('public CMS routes', () => {
  let dir;

  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'gm-public-'));
    await fs.mkdir(path.join(dir, 'cms'), { recursive: true });
    await fs.writeFile(path.join(dir, 'cms', 'index.html'), '<!doctype html><title>CMS</title>');
  });

  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  function app() {
    const instance = express();
    servePublicSite(instance, dir);
    return instance;
  }

  it('serves the CMS at /cms/ without redirecting', async () => {
    const res = await send(app(), 'GET', '/cms/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('CMS');
  });

  it('redirects /cms to /cms/ once', async () => {
    const res = await send(app(), 'GET', '/cms');
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe('/cms/');
  });

  it('redirects /tours/cms/ to /cms/ once', async () => {
    const res = await send(app(), 'GET', '/tours/cms/');
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe('/cms/');
  });
});
