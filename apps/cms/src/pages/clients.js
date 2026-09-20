import { api } from '../api/client.js';
import { shell } from './shell.js';

export function renderClients(user) {
  return shell(
    user,
    'clients',
    `
    <section class="cms-page">
      <div class="cms-page-head">
        <div>
          <p class="cms-kicker">Access</p>
          <h1>API clients</h1>
          <p class="cms-lead">Issue hashed, revocable keys for the sister site. The key can read published tours, destinations, blogs, joining safaris, and the rest of the public website. The secret is shown once.</p>
        </div>
      </div>
      <form id="client-form" class="cms-panel cms-form-stack">
        <div class="cms-field">
          <label class="cms-label" for="client-name">Client name</label>
          <input id="client-name" name="name" placeholder="Partner or integration name" required />
        </div>
        <button class="cms-btn cms-btn-gold" type="submit">Create key</button>
      </form>
      <p id="new-key" class="cms-key-banner" hidden></p>
      <div id="client-table" style="margin-top:1rem"></div>
    </section>
  `
  );
}

export async function initClients() {
  const table = document.querySelector('#client-table');
  const banner = document.querySelector('#new-key');

  async function refresh() {
    const items = await api.listClients();
    table.innerHTML = items.length
      ? `<div class="cms-package-list">${items
          .map(
            (item) => `
            <article class="cms-client-card">
              <h3>${item.name}</h3>
              <div>${item.revokedAt ? '<span class="cms-pill">Revoked</span>' : '<span class="cms-pill is-live">Active</span>'}</div>
              <p class="cms-meta-row">
                <span>${item.prefix}</span>
                <span>${(item.scopes || []).join(', ')}</span>
              </p>
              ${item.revokedAt ? '' : `<button class="cms-btn cms-btn-danger" style="margin-top:0.75rem" data-revoke="${item.id}">Revoke</button>`}
            </article>`
          )
          .join('')}</div>`
      : '<p class="cms-muted">No API clients yet.</p>';
    table.querySelectorAll('[data-revoke]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        await api.revokeClient(btn.dataset.revoke);
        await refresh();
      });
    });
  }

  document.querySelector('#client-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = event.currentTarget.name.value;
    const created = await api.createClient({ name });
    banner.hidden = false;
    banner.textContent = created.key
      ? `Copy this key now — it will not be shown again: ${created.key}`
      : 'Key created.';
    event.currentTarget.reset();
    await refresh();
  });

  await refresh();
}
