import { Router } from 'express';
import { safariOpenApi } from './openapi.js';
import { externalPostmanCollection } from './postman-collection.js';

export const docsRoutes = Router();

docsRoutes.get('/openapi.json', (_req, res) => {
  res.json(safariOpenApi);
});

docsRoutes.get('/postman.json', (_req, res) => {
  res.json(externalPostmanCollection);
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
    <p>Postman collection: <a href="/api/v1/docs/postman.json">/api/v1/docs/postman.json</a> (Import in Postman via Link)</p>
    <p>Markdown contract: <code>docs/api/safaris.md</code> in the repository.</p>
    <h2>Surfaces</h2>
    <ul>
      <li><code>GET /api/v1/safaris</code> — public published packages</li>
      <li><code>/api/v1/admin/safaris</code> — CMS JWT + RBAC</li>
      <li><code>/api/v1/external</code> — third-party API key: tours, destinations, blogs, joining safaris, pages, menus, FAQs, lodges, reviews, settings</li>
      <li><code>GET /api/v1/site-bundle</code> — everything the public website needs in one cached response (ETag)</li>
      <li><code>GET /api/v1/reviews</code> — published guest reviews + ratings from Google, TripAdvisor and SafariBookings</li>
      <li><code>POST /api/v1/inquiries</code>, <code>POST /api/v1/bookings</code> — website forms (rate limited, spam-filtered)</li>
      <li>Outgoing webhooks — signed JSON messages sent to your other systems; see <code>docs/api/webhooks.md</code></li>
    </ul>
  </body>
</html>`);
});
