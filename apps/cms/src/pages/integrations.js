import { api } from '../api/client.js';
import { shell } from './shell.js';
import { esc } from '../components/escape.js';
import { notifyError, notifySuccess } from '../components/toast.js';

export function renderIntegrations(user) {
  return shell(
    user,
    'integrations',
    `
    <section class="cms-page">
      <div class="cms-page-head">
        <div>
          <p class="cms-kicker">System</p>
          <h1>Integrations &amp; webhooks</h1>
          <p class="cms-lead">Send bookings, inquiries and publishing events from this website to other systems — your CRM, Zapier or Make, a partner's booking API, Slack, or the gmsafaris.co.tz site. Each message is signed so the receiver can check it really came from you, and failed deliveries are retried automatically.</p>
        </div>
      </div>
      <p class="cms-error" id="hooks-error" hidden></p>
      <p class="cms-key-banner" id="hooks-secret" hidden></p>

      <form id="hook-form" class="cms-panel cms-form-stack">
        <h2 class="cms-hub-title">Add an endpoint</h2>
        <div class="cms-grid-2">
          <div class="cms-field"><label class="cms-label" for="hook-name">Name</label><input id="hook-name" name="name" required placeholder="e.g. HubSpot CRM, Zapier – new bookings" /></div>
          <div class="cms-field"><label class="cms-label" for="hook-url">Endpoint URL</label><input id="hook-url" name="url" required placeholder="https://hooks.zapier.com/…" inputmode="url" /></div>
        </div>
        <fieldset class="cms-field">
          <legend class="cms-label">Send these events</legend>
          <div id="hook-events" class="cms-check-grid">Loading…</div>
        </fieldset>
        <div class="cms-field">
          <label class="cms-label" for="hook-headers">Extra headers the other API needs (optional, one per line)</label>
          <textarea id="hook-headers" name="headers" rows="3" placeholder="Authorization: Bearer your-partner-token&#10;X-Api-Key: 123456"></textarea>
          <p class="cms-hint">Header values are encrypted and never shown again after saving.</p>
        </div>
        <button class="cms-btn cms-btn-gold" type="submit">Add endpoint</button>
      </form>

      <div id="hooks-list" style="margin-top:1.25rem">Loading…</div>

      <section class="cms-panel" style="margin-top:1.25rem">
        <h2 class="cms-hub-title">Recent deliveries</h2>
        <div id="hooks-deliveries" class="cms-table-wrap">Loading…</div>
      </section>

      <details class="cms-panel" style="margin-top:1.25rem">
        <summary><strong>How the receiving system verifies a message</strong></summary>
        <div class="cms-prose" style="margin-top:0.75rem">
          <p>Every request is a <code>POST</code> with a JSON body <code>{ id, event, created_at, data }</code> and these headers:</p>
          <ul>
            <li><code>X-GMS-Event</code> — e.g. <code>booking.created</code></li>
            <li><code>X-GMS-Delivery</code> — unique id (use it to ignore duplicates)</li>
            <li><code>X-GMS-Timestamp</code> — Unix seconds</li>
            <li><code>X-GMS-Signature</code> — <code>sha256=</code> + HMAC-SHA256 of <code>timestamp + "." + raw body</code> using the endpoint secret</li>
          </ul>
          <p>Reply with any 2xx status within 10 seconds. Otherwise we retry after 1 min, 5 min, 30 min, 2 h and 12 h.</p>
        </div>
      </details>
    </section>
  `
  );
}

export async function initIntegrations() {
  const error = document.querySelector('#hooks-error');
  const secretBanner = document.querySelector('#hooks-secret');
  const list = document.querySelector('#hooks-list');
  const deliveries = document.querySelector('#hooks-deliveries');
  let events = [];
  let hooks = [];

  function fail(err) {
    error.hidden = false;
    error.textContent = err.message;
    notifyError(err.message);
  }

  function showSecret(secret, name) {
    secretBanner.hidden = false;
    secretBanner.textContent = `Signing secret for "${name}" — copy it into the receiving system now, it will not be shown again: ${secret}`;
  }

  function eventChecks(selected = [], prefix = 'ev') {
    return events
      .map(
        (ev) =>
          `<label class="cms-check" title="${esc(ev.description)}"><input type="checkbox" name="${prefix}" value="${esc(ev.key)}" ${selected.includes(ev.key) ? 'checked' : ''}/> <code>${esc(ev.key)}</code></label>`
      )
      .join('');
  }

  function paintHooks() {
    list.innerHTML = hooks.length
      ? `<div class="cms-package-list">${hooks
          .map(
            (hook) => `
        <article class="cms-client-card" data-hook-id="${esc(hook.id)}">
          <h3>${esc(hook.name)}</h3>
          <p class="cms-meta-row"><span class="cms-pill ${hook.active ? 'is-live' : 'is-draft'}">${hook.active ? 'Active' : 'Paused'}</span><span>${esc(hook.url)}</span></p>
          <p class="cms-muted">${(hook.events || []).map((ev) => `<code>${esc(ev)}</code>`).join(' ')}</p>
          <p class="cms-muted">Last delivery: ${hook.last_delivery_at ? `${esc(hook.last_status || '')} · ${esc(String(hook.last_delivery_at).slice(0, 16).replace('T', ' '))}` : 'never'}${hook.failures ? ` · <span class="cms-error">${Number(hook.failures)} failures in a row</span>` : ''}</p>
          ${hook.headerNames?.length ? `<p class="cms-muted">Headers: ${hook.headerNames.map(esc).join(', ')}</p>` : ''}
          <div class="cms-editor-actions">
            <button class="cms-btn cms-btn-navy" type="button" data-test>Send test</button>
            <button class="cms-btn" type="button" data-toggle>${hook.active ? 'Pause' : 'Resume'}</button>
            <button class="cms-btn" type="button" data-rotate>New secret</button>
            <button class="cms-btn cms-btn-danger" type="button" data-delete>Delete</button>
          </div>
        </article>`
          )
          .join('')}</div>`
      : '<p class="cms-muted">No endpoints yet.</p>';
  }

  async function paintDeliveries() {
    const rows = await api.webhookDeliveries();
    const byId = new Map(hooks.map((hook) => [hook.id, hook.name]));
    deliveries.innerHTML = rows.length
      ? `<table class="cms-table"><thead><tr><th>When</th><th>Endpoint</th><th>Event</th><th>Status</th><th>Attempts</th><th>Response</th><th></th></tr></thead><tbody>${rows
          .slice(0, 50)
          .map(
            (row) => `<tr>
              <td>${esc(String(row.created_at || '').slice(0, 16).replace('T', ' '))}</td>
              <td>${esc(byId.get(row.webhookId) || '—')}</td>
              <td><code>${esc(row.event)}</code></td>
              <td><span class="cms-pill ${row.status === 'success' ? 'is-live' : row.status === 'failed' ? '' : 'is-draft'}">${esc(row.status)}</span></td>
              <td>${Number(row.attempts || 0)}</td>
              <td>${esc(row.response_code || '')} ${esc(row.error || '')}</td>
              <td>${row.status !== 'success' ? `<button class="cms-btn" type="button" data-retry="${esc(row.id)}">Retry</button>` : ''}</td>
            </tr>`
          )
          .join('')}</tbody></table>`
      : '<p class="cms-muted">Nothing sent yet.</p>';
  }

  async function refresh() {
    error.hidden = true;
    hooks = await api.listWebhooks();
    paintHooks();
    await paintDeliveries();
  }

  document.querySelector('#hook-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const f = new FormData(form);
    try {
      const created = await api.createWebhook({
        name: f.get('name'),
        url: f.get('url'),
        events: f.getAll('ev'),
        headers: f.get('headers'),
      });
      if (created.secret) showSecret(created.secret, created.name);
      form.reset();
      notifySuccess('Endpoint added. Use "Send test" to check it.');
      await refresh();
    } catch (err) {
      fail(err);
    }
  });

  list.addEventListener('click', async (event) => {
    const card = event.target.closest('[data-hook-id]');
    if (!card) return;
    const id = card.getAttribute('data-hook-id');
    const hook = hooks.find((item) => item.id === id);
    try {
      if (event.target.closest('[data-test]')) {
        const result = await api.testWebhook(id);
        if (result.status === 'success') notifySuccess(`Test delivered (HTTP ${result.response_code}).`);
        else notifyError(`Test failed: ${result.error || `HTTP ${result.response_code}`}`);
      } else if (event.target.closest('[data-toggle]')) {
        await api.updateWebhook(id, { active: !hook.active });
      } else if (event.target.closest('[data-rotate]')) {
        if (!window.confirm('Create a new signing secret? The receiving system must be updated with it.')) return;
        const updated = await api.updateWebhook(id, { rotateSecret: true });
        if (updated.secret) showSecret(updated.secret, updated.name);
      } else if (event.target.closest('[data-delete]')) {
        if (!window.confirm(`Delete "${hook.name}"?`)) return;
        await api.deleteWebhook(id);
      } else {
        return;
      }
      await refresh();
    } catch (err) {
      fail(err);
    }
  });

  deliveries.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-retry]');
    if (!button) return;
    try {
      await api.retryDelivery(button.getAttribute('data-retry'));
      await refresh();
    } catch (err) {
      fail(err);
    }
  });

  try {
    events = await api.webhookEvents();
    document.querySelector('#hook-events').innerHTML = eventChecks(['booking.created', 'inquiry.created']);
    await refresh();
  } catch (err) {
    fail(err);
  }
}
