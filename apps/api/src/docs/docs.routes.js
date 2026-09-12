import { Router } from 'express';
import { safariOpenApi } from './openapi.js';

export const docsRoutes = Router();

docsRoutes.get('/openapi.json', (_req, res) => {
  res.json(safariOpenApi);
});

docsRoutes.get('/', (_req, res) => {
  res.type('html').send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>GM Safaris Safari API</title>
    <style>
      body { font-family: Georgia, serif; max-width: 52rem; margin: 2rem auto; padding: 0 1rem; color: #111; }
      code { background: #f4f1ea; padding: 0.1rem 0.35rem; }
      a { color: #a8883a; }
    </style>
  </head>
  <body>
    <h1>Safari API documentation</h1>
    <p>OpenAPI document: <a href="/api/v1/docs/openapi.json">/api/v1/docs/openapi.json</a></p>
    <p>Markdown contract: <code>docs/api/safaris.md</code> in the repository.</p>
    <h2>Surfaces</h2>
    <ul>
      <li><code>GET /api/v1/safaris</code> — public published packages</li>
      <li><code>/api/v1/admin/safaris</code> — CMS JWT + RBAC</li>
      <li><code>/api/v1/external/safaris</code> — third-party API key, scope <code>safaris:read</code></li>
    </ul>
  </body>
</html>`);
});
