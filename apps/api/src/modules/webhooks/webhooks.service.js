/**
 * Outbound integrations ("webhooks").
 *
 * When something happens on the website or in the CMS (a booking, an inquiry,
 * a tour being published …) the API POSTs a signed JSON message to every
 * third-party endpoint that subscribed to that event — e.g. a CRM, Zapier /
 * Make, a partner booking system, Slack, or the .co.tz sister site.
 *
 * Message
 *   POST <your URL>
 *   Content-Type: application/json
 *   X-GMS-Event: booking.created
 *   X-GMS-Delivery: <uuid>
 *   X-GMS-Timestamp: <unix seconds>
 *   X-GMS-Signature: sha256=<hex HMAC-SHA256 of "<timestamp>.<raw body>" with the endpoint secret>
 *   { "id": "<delivery id>", "event": "booking.created", "created_at": "...", "data": { ... } }
 *
 * Failed deliveries are retried after 1 min, 5 min, 30 min, 2 h and 12 h.
 */
import crypto from 'node:crypto';
import { createId } from '@gm-safaris/shared-utils';
import { readStore, updateStore } from '../../cms-store/index.js';
import { notFound, validationError } from '../../errors/index.js';
import { encryptSecret, decryptSecret, maskSecret } from '../../security/secrets.js';
import { parseOutboundUrl, assertPublicHost } from '../../security/outbound-url.js';
import { recordAudit } from '../audit/audit.service.js';
import { logger } from '../../logging/index.js';

export const WEBHOOK_EVENTS = Object.freeze({
  'booking.created': 'A guest or staff member creates a booking',
  'booking.updated': 'A booking status, date or amount changes',
  'inquiry.created': 'Someone sends the contact / enquiry form',
  'customer.created': 'A new customer record is created',
  'safari.published': 'A tour package is published',
  'safari.unpublished': 'A tour package is taken offline',
  'content.published': 'A page, destination, blog post, lodge, FAQ, group safari or menu is published',
  'content.unpublished': 'Any of the above is taken offline',
  'review.imported': 'New reviews arrive from Google, TripAdvisor or SafariBookings',
});

const RETRY_DELAYS_MS = [60_000, 5 * 60_000, 30 * 60_000, 2 * 3600_000, 12 * 3600_000];
const MAX_DELIVERIES = 500;
const TIMEOUT_MS = 10_000;
const inFlight = new Set();

function now() {
  return new Date().toISOString();
}

function cleanHeaders(raw) {
  const out = {};
  const entries = Array.isArray(raw)
    ? raw.map((row) => [row?.name, row?.value])
    : typeof raw === 'string'
      ? raw.split('\n').map((line) => {
          const index = line.indexOf(':');
          return index > 0 ? [line.slice(0, index), line.slice(index + 1)] : [null, null];
        })
      : Object.entries(raw || {});
  for (const [name, value] of entries) {
    const key = String(name || '').trim();
    if (!key) continue;
    if (!/^[A-Za-z0-9-]{1,64}$/.test(key)) throw validationError(`Invalid header name "${key}"`, { field: 'headers' });
    if (/^(host|content-length|content-type|x-gms-)/i.test(key)) continue;
    out[key] = String(value ?? '').trim().slice(0, 2000);
  }
  return out;
}

function cleanEvents(list) {
  const events = (Array.isArray(list) ? list : String(list || '').split(','))
    .map((item) => String(item).trim())
    .filter((item) => item === '*' || WEBHOOK_EVENTS[item]);
  if (!events.length) throw validationError('Choose at least one event', { field: 'events' });
  return [...new Set(events)];
}

async function toAdmin(hook) {
  const headers = {};
  for (const [name, value] of Object.entries(hook.headers || {})) {
    headers[name] = value ? maskSecret(value) : '';
  }
  return {
    id: hook.id,
    name: hook.name,
    url: hook.url,
    events: hook.events || [],
    active: hook.active !== false,
    headerNames: Object.keys(hook.headers || {}),
    headers,
    hasSecret: Boolean(hook.secret),
    created_at: hook.created_at,
    updated_at: hook.updated_at,
    last_status: hook.last_status || null,
    last_delivery_at: hook.last_delivery_at || null,
    failures: hook.failures || 0,
  };
}

async function encryptHeaders(headers) {
  const out = {};
  for (const [name, value] of Object.entries(headers)) out[name] = await encryptSecret(value);
  return out;
}

async function decryptHeaders(headers) {
  const out = {};
  for (const [name, value] of Object.entries(headers || {})) out[name] = await decryptSecret(value);
  return out;
}

export function signPayload(secret, timestamp, body) {
  return `sha256=${crypto.createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex')}`;
}

async function attempt(deliveryId) {
  if (inFlight.has(deliveryId)) return;
  inFlight.add(deliveryId);
  try {
    const store = await readStore();
    const delivery = (store.webhookDeliveries || []).find((row) => row.id === deliveryId);
    if (!delivery || delivery.status === 'success') return;
    const hook = (store.webhooks || []).find((row) => row.id === delivery.webhookId);
    if (!hook) {
      await patchDelivery(deliveryId, { status: 'failed', error: 'Endpoint was deleted', next_attempt_at: null });
      return;
    }

    const body = JSON.stringify({ id: delivery.id, event: delivery.event, created_at: delivery.created_at, data: delivery.payload });
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const secret = await decryptSecret(hook.secret);
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'GoldenMemoriesSafaris-Webhooks/1.0',
      'X-GMS-Event': delivery.event,
      'X-GMS-Delivery': delivery.id,
      'X-GMS-Timestamp': timestamp,
      ...(secret ? { 'X-GMS-Signature': signPayload(secret, timestamp, body) } : {}),
      ...(await decryptHeaders(hook.headers)),
    };

    let status = 0;
    let responseText = '';
    let error = '';
    try {
      const url = parseOutboundUrl(hook.url);
      await assertPublicHost(url);
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
      try {
        const res = await fetch(url, { method: 'POST', headers, body, signal: ctrl.signal, redirect: 'manual' });
        status = res.status;
        responseText = (await res.text().catch(() => '')).slice(0, 500);
      } finally {
        clearTimeout(timer);
      }
    } catch (err) {
      error = err?.name === 'AbortError' ? `No response within ${TIMEOUT_MS / 1000}s` : err instanceof Error ? err.message : String(err);
    }

    const ok = status >= 200 && status < 300;
    const attempts = Number(delivery.attempts || 0) + 1;
    const retryIn = RETRY_DELAYS_MS[attempts - 1];
    await updateStore((next) => {
      const row = (next.webhookDeliveries || []).find((item) => item.id === deliveryId);
      if (row) {
        row.attempts = attempts;
        row.response_code = status || null;
        row.response_body = responseText;
        row.error = ok ? '' : error || `HTTP ${status}`;
        row.last_attempt_at = now();
        row.status = ok ? 'success' : retryIn ? 'retrying' : 'failed';
        row.next_attempt_at = ok || !retryIn ? null : new Date(Date.now() + retryIn).toISOString();
      }
      const target = (next.webhooks || []).find((item) => item.id === hook.id);
      if (target) {
        target.last_status = ok ? `OK ${status}` : error || `HTTP ${status}`;
        target.last_delivery_at = now();
        target.failures = ok ? 0 : Number(target.failures || 0) + 1;
      }
    });
    if (!ok) logger.warn('Webhook delivery failed', { hook: hook.name, event: delivery.event, status, error });
  } finally {
    inFlight.delete(deliveryId);
  }
}

async function patchDelivery(id, patch) {
  await updateStore((store) => {
    const row = (store.webhookDeliveries || []).find((item) => item.id === id);
    if (row) Object.assign(row, patch);
  });
}

/**
 * Fire an event to every subscribed endpoint. Never throws and never blocks
 * the request that triggered it.
 */
export async function emitEvent(event, data) {
  if (process.env.VITEST && process.env.WEBHOOKS_IN_TESTS !== 'true') return [];
  try {
    const store = await readStore();
    const hooks = (store.webhooks || []).filter(
      (hook) => hook.active !== false && (hook.events || []).some((name) => name === '*' || name === event)
    );
    if (!hooks.length) return [];
    const deliveries = hooks.map((hook) => ({
      id: createId(),
      webhookId: hook.id,
      event,
      payload: data,
      status: 'pending',
      attempts: 0,
      created_at: now(),
      next_attempt_at: now(),
    }));
    await updateStore((next) => {
      if (!Array.isArray(next.webhookDeliveries)) next.webhookDeliveries = [];
      next.webhookDeliveries.unshift(...deliveries);
      if (next.webhookDeliveries.length > MAX_DELIVERIES) next.webhookDeliveries.length = MAX_DELIVERIES;
    });
    for (const delivery of deliveries) {
      setImmediate(() => attempt(delivery.id).catch(() => undefined));
    }
    return deliveries.map((row) => row.id);
  } catch (err) {
    logger.error('Could not queue webhook', { event, message: err instanceof Error ? err.message : String(err) });
    return [];
  }
}

export async function retryPendingDeliveries() {
  const store = await readStore();
  const due = (store.webhookDeliveries || []).filter(
    (row) => ['pending', 'retrying'].includes(row.status) && row.next_attempt_at && Date.parse(row.next_attempt_at) <= Date.now()
  );
  for (const row of due.slice(0, 20)) await attempt(row.id);
  return due.length;
}

function actorMeta(actor) {
  return { actorId: actor?.userId, actorEmail: actor?.email };
}

export const webhooksService = {
  events() {
    return Object.entries(WEBHOOK_EVENTS).map(([key, description]) => ({ key, description }));
  },

  async list() {
    const store = await readStore();
    return Promise.all((store.webhooks || []).map(toAdmin));
  },

  async create(body, actor) {
    const name = String(body?.name || '').trim().slice(0, 120);
    if (!name) throw validationError('Give this integration a name', { field: 'name' });
    const url = parseOutboundUrl(body?.url).toString();
    const secret = String(body?.secret || '').trim() || crypto.randomBytes(24).toString('hex');
    const hook = {
      id: createId(),
      name,
      url,
      events: cleanEvents(body?.events),
      active: body?.active !== false,
      secret: await encryptSecret(secret),
      headers: await encryptHeaders(cleanHeaders(body?.headers)),
      created_at: now(),
      updated_at: now(),
    };
    await updateStore((store) => {
      if (!Array.isArray(store.webhooks)) store.webhooks = [];
      store.webhooks.push(hook);
    });
    await recordAudit({ ...actorMeta(actor), action: 'webhooks.create', resource: 'webhooks', resourceId: hook.id });
    // The signing secret is shown ONCE so it can be pasted into the receiving system.
    return { ...(await toAdmin(hook)), secret };
  },

  async update(id, body, actor) {
    const store = await readStore();
    const current = (store.webhooks || []).find((hook) => hook.id === id);
    if (!current) throw notFound('Integration not found');
    const patch = { updated_at: now() };
    if (body?.name !== undefined) patch.name = String(body.name).trim().slice(0, 120) || current.name;
    if (body?.url !== undefined) patch.url = parseOutboundUrl(body.url).toString();
    if (body?.events !== undefined) patch.events = cleanEvents(body.events);
    if (body?.active !== undefined) patch.active = Boolean(body.active);
    let newSecret = null;
    if (body?.rotateSecret) {
      newSecret = crypto.randomBytes(24).toString('hex');
      patch.secret = await encryptSecret(newSecret);
    }
    if (body?.headers !== undefined) {
      const incoming = cleanHeaders(body.headers);
      const kept = {};
      for (const [name, value] of Object.entries(incoming)) {
        // "••••••••" means "keep the saved value".
        kept[name] = value === maskSecret('x') ? current.headers?.[name] || '' : await encryptSecret(value);
      }
      patch.headers = kept;
    }
    const saved = await updateStore((next) => {
      const hook = next.webhooks.find((item) => item.id === id);
      Object.assign(hook, patch);
      return hook;
    });
    await recordAudit({ ...actorMeta(actor), action: 'webhooks.update', resource: 'webhooks', resourceId: id });
    return { ...(await toAdmin(saved)), ...(newSecret ? { secret: newSecret } : {}) };
  },

  async remove(id, actor) {
    const removed = await updateStore((store) => {
      const index = (store.webhooks || []).findIndex((hook) => hook.id === id);
      if (index === -1) return null;
      return store.webhooks.splice(index, 1)[0];
    });
    if (!removed) throw notFound('Integration not found');
    await recordAudit({ ...actorMeta(actor), action: 'webhooks.delete', resource: 'webhooks', resourceId: id });
    return { id };
  },

  async test(id, actor) {
    const store = await readStore();
    const hook = (store.webhooks || []).find((item) => item.id === id);
    if (!hook) throw notFound('Integration not found');
    const delivery = {
      id: createId(),
      webhookId: hook.id,
      event: 'test.ping',
      payload: { message: 'Test message from Golden Memories Safaris CMS', sent_by: actor?.email || null },
      status: 'pending',
      attempts: 0,
      created_at: now(),
      next_attempt_at: null,
    };
    await updateStore((next) => {
      if (!Array.isArray(next.webhookDeliveries)) next.webhookDeliveries = [];
      next.webhookDeliveries.unshift(delivery);
    });
    await attempt(delivery.id);
    const after = await readStore();
    const row = after.webhookDeliveries.find((item) => item.id === delivery.id);
    // A test ping is never retried automatically.
    if (row && row.status === 'retrying') await patchDelivery(row.id, { status: 'failed', next_attempt_at: null });
    return { ...row, status: row?.status === 'retrying' ? 'failed' : row?.status };
  },

  async deliveries(id) {
    const store = await readStore();
    return (store.webhookDeliveries || [])
      .filter((row) => !id || row.webhookId === id)
      .slice(0, 100)
      .map((row) => ({ ...row, payload: undefined }));
  },

  async retry(deliveryId) {
    await patchDelivery(deliveryId, { status: 'retrying', next_attempt_at: now() });
    await attempt(deliveryId);
    const store = await readStore();
    return (store.webhookDeliveries || []).find((row) => row.id === deliveryId) || null;
  },
};
