import { api } from '../api/client.js';
import { shell } from './shell.js';
import { esc } from '../components/escape.js';
import { notifyError, notifySuccess } from '../components/toast.js';

function row(label, value, ok) {
  const badge = ok === undefined ? '' : `<span class="cms-pill ${ok ? 'is-live' : 'is-draft'}">${ok ? 'OK' : 'Check'}</span>`;
  return `<tr><td>${esc(label)}</td><td>${value}</td><td>${badge}</td></tr>`;
}

export function renderSystem(user) {
  return shell(
    user,
    'system',
    `
    <section class="cms-page">
      <div class="cms-page-head">
        <div>
          <p class="cms-kicker">System</p>
          <h1>System status</h1>
          <p class="cms-lead">Where your content is saved, whether email is working, and security settings that need attention before going live.</p>
        </div>
        <button class="cms-btn" type="button" data-verify-email>Check email connection</button>
      </div>
      <p class="cms-error" id="system-error" hidden></p>
      <div id="system-body" class="cms-panel">Loading…</div>
    </section>
  `
  );
}

export async function initSystem() {
  const body = document.querySelector('#system-body');
  const error = document.querySelector('#system-error');
  try {
    const s = await api.systemStatus();
    const pg = s.storage?.backend === 'postgres';
    body.innerHTML = `
      <table class="cms-table"><tbody>
        ${row('Environment', esc(s.environment))}
        ${row('Content storage', pg ? 'PostgreSQL database' : `Local file (store.json) — ${esc(s.storage?.reason || '')}`, pg)}
        ${row('Database', `${esc(s.database?.status)} · ${esc(s.database?.name)} on ${esc(s.database?.host)}`, s.database?.status === 'up')}
        ${row('Outgoing email', s.email?.configured ? `${esc(s.email.host)} · from ${esc(s.email.from)} (${esc(s.email.source)})` : 'Not configured — booking and inquiry emails are not being sent', s.email?.configured)}
        ${row('Session signing key (JWT_SECRET)', s.security?.jwtSecretSet ? 'Set' : 'Missing or weak — set a long random JWT_SECRET', s.security?.jwtSecretSet)}
        ${row('Encryption key (APP_ENCRYPTION_KEY)', s.security?.encryptionKeySet ? 'Set' : 'Not set — secrets use JWT_SECRET as the key', s.security?.encryptionKeySet)}
        ${row('Canonical domain redirect', s.security?.canonicalHost ? esc(s.security.canonicalHost) : 'Off (set CANONICAL_HOST=www.gmsafaris.com in production)', s.environment !== 'production' || Boolean(s.security?.canonicalHost))}
        ${row('Main website', esc(s.sites?.website))}
        ${row('Tanzania site (.co.tz)', esc(s.sites?.tanzania))}
      </tbody></table>
      <h2 class="cms-hub-title" style="margin-top:1.5rem">Records in the database</h2>
      <div class="cms-kpi">${Object.entries(s.counts || {})
        .map(([key, value]) => `<article><strong>${Number(value)}</strong><span>${esc(key)}</span></article>`)
        .join('')}</div>`;
  } catch (err) {
    error.hidden = false;
    error.textContent = err.message;
  }

  document.querySelector('[data-verify-email]')?.addEventListener('click', async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    try {
      const result = await api.verifyEmail();
      if (result.ok) notifySuccess(result.dryRun ? 'Email settings look complete (test mode — nothing was sent).' : 'Connected to the mail server successfully.');
      else notifyError(`Email connection failed: ${result.reason}`);
    } catch (err) {
      notifyError(err.message);
    } finally {
      button.disabled = false;
    }
  });
}
