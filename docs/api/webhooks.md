# Outgoing webhooks (sending data to third-party systems)

Configure in **CMS → Integrations & webhooks**. For every endpoint you choose
which events to send. Typical uses: a CRM (HubSpot, Zoho, Pipedrive), Zapier or
Make automations, Slack/Teams alerts, a partner booking system, or the
gmsafaris.co.tz site.

## Events

| Event | When |
|-------|------|
| `booking.created` | A guest books on the website or staff create a booking |
| `booking.updated` | Status, date, amount or party changes |
| `inquiry.created` | Contact / enquiry form submitted (spam is not sent) |
| `customer.created` | First booking or inquiry from a new email address |
| `safari.published` / `safari.unpublished` | A tour package goes live / offline |
| `content.published` / `content.unpublished` | Page, destination, blog post, lodge, FAQ, group safari or menu |
| `review.imported` | New reviews imported from Google / TripAdvisor |
| `test.ping` | "Send test" button |

## Request

```http
POST https://your-endpoint.example.com/hooks/gms
Content-Type: application/json
User-Agent: GoldenMemoriesSafaris-Webhooks/1.0
X-GMS-Event: booking.created
X-GMS-Delivery: 5d1f3c1e-…            (unique; use it to ignore duplicates)
X-GMS-Timestamp: 1790399999          (Unix seconds)
X-GMS-Signature: sha256=9b2c…        (HMAC-SHA256, see below)
Authorization: Bearer …              (any extra headers you configured)

{
  "id": "5d1f3c1e-…",
  "event": "booking.created",
  "created_at": "2026-09-26T08:00:00.000Z",
  "data": { "code": "GMS-260926-7KQ2", "customerName": "…", "email": "…", "safariTitle": "…", "travelDate": "…", "adults": 2, "children": 0, … }
}
```

Reply with any **2xx** status within **10 seconds**. Anything else is retried
after 1 min, 5 min, 30 min, 2 h and 12 h, then marked *failed* (you can retry
manually from the CMS).

## Verifying the signature

The signing secret is shown once when you create the endpoint (use **New
secret** to rotate it). Compute `HMAC_SHA256(secret, timestamp + "." + rawBody)`
and compare it with the header. Reject requests older than 5 minutes.

### Node.js

```js
import crypto from 'node:crypto';

export function verifyGmsWebhook(rawBody, headers, secret) {
  const timestamp = headers['x-gms-timestamp'];
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
  const given = String(headers['x-gms-signature'] || '');
  return given.length === expected.length && crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}
```

### PHP

```php
$timestamp = $_SERVER['HTTP_X_GMS_TIMESTAMP'];
$raw = file_get_contents('php://input');
$expected = 'sha256=' . hash_hmac('sha256', $timestamp . '.' . $raw, $secret);
$valid = hash_equals($expected, $_SERVER['HTTP_X_GMS_SIGNATURE']) && abs(time() - (int) $timestamp) < 300;
```

## Security

* Only `https://` endpoints on the public internet are accepted (private/
  internal addresses are refused to prevent server-side request forgery).
* Signing secrets and custom header values are stored encrypted.
* Delivery history (last 500) is visible in the CMS; payloads are not shown there.
