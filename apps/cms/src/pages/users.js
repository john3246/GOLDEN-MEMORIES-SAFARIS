import { api } from '../api/client.js';
import { shell } from './shell.js';
import { isStaffAdmin } from '../auth/roles.js';

function escapeValue(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function pill(status) {
  return `<span class="cms-pill ${status === 'active' ? 'is-live' : 'is-draft'}">${status || '—'}</span>`;
}

export function renderUsers(user) {
  const canSuper = user?.role === 'Super Admin';
  return shell(
    user,
    'users',
    `
    <section class="cms-page">
      <div class="cms-page-head">
        <div>
          <p class="cms-kicker">System</p>
          <h1>Staff users</h1>
          <p class="cms-lead">Create CMS logins and assign Super Admin or Admin. Passwords are never shown after save.</p>
        </div>
      </div>
      <p class="cms-error" id="users-error" hidden></p>
      <form id="user-form" class="cms-panel cms-form-stack">
        <h2>New staff account</h2>
        <div class="cms-grid-2">
          <div class="cms-field">
            <label class="cms-label" for="user-name">Name</label>
            <input id="user-name" name="name" required />
          </div>
          <div class="cms-field">
            <label class="cms-label" for="user-email">Email</label>
            <input id="user-email" name="email" type="email" required />
          </div>
          <div class="cms-field">
            <label class="cms-label" for="user-role">Role</label>
            <select id="user-role" name="role">
              <option value="Admin">Admin</option>
              ${canSuper ? '<option value="Super Admin">Super Admin</option>' : ''}
            </select>
          </div>
          <div class="cms-field">
            <label class="cms-label" for="user-password">Password</label>
            <input id="user-password" name="password" type="password" minlength="8" required autocomplete="new-password" />
          </div>
        </div>
        <button class="cms-btn cms-btn-navy" type="submit">Create user</button>
      </form>
      <div id="users-table" class="cms-panel" style="margin-top:1.25rem">Loading…</div>
    </section>
  `
  );
}

export async function initUsers() {
  const mount = document.querySelector('#users-table');
  const error = document.querySelector('#users-error');
  const form = document.querySelector('#user-form');
  const viewer = api.user();

  function showError(message) {
    error.hidden = false;
    error.textContent = message;
  }

  async function refresh() {
    error.hidden = true;
    const result = await api.listUsers();
    const rows = result.data || [];
    mount.innerHTML = `
      <table class="cms-table">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr></thead>
        <tbody>
          ${rows
            .map(
              (item) => `
            <tr data-user-id="${escapeValue(item.id)}">
              <td>${escapeValue(item.name)}</td>
              <td>${escapeValue(item.email)}</td>
              <td>${escapeValue(item.role)}</td>
              <td>${pill(item.status)}</td>
              <td>
                <button class="cms-btn" type="button" data-user-edit>Edit</button>
                ${
                  item.status === 'active'
                    ? '<button class="cms-btn cms-btn-danger" type="button" data-user-disable>Disable</button>'
                    : '<button class="cms-btn" type="button" data-user-enable>Enable</button>'
                }
              </td>
            </tr>`
            )
            .join('')}
        </tbody>
      </table>`;
  }

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    try {
      await api.createUser(data);
      form.reset();
      await refresh();
    } catch (err) {
      showError(err.message);
    }
  });

  mount?.addEventListener('click', async (event) => {
    const button = event.target.closest('button');
    const row = event.target.closest('[data-user-id]');
    if (!button || !row) return;
    const id = row.dataset.userId;
    try {
      if (button.hasAttribute('data-user-disable')) {
        await api.updateUser(id, { status: 'disabled' });
      } else if (button.hasAttribute('data-user-enable')) {
        await api.updateUser(id, { status: 'active' });
      } else if (button.hasAttribute('data-user-edit')) {
        const name = window.prompt('Name', row.children[0].textContent);
        if (!name) return;
        const role =
          viewer?.role === 'Super Admin'
            ? window.prompt('Role (Admin or Super Admin)', row.children[2].textContent)
            : undefined;
        const password = window.prompt('New password (leave empty to keep the current one)') || undefined;
        await api.updateUser(id, { name, role, password });
      }
      await refresh();
    } catch (err) {
      showError(err.message);
    }
  });

  if (!isStaffAdmin(viewer)) {
    mount.innerHTML = '<p class="cms-error">Staff admin access required.</p>';
    return;
  }

  try {
    await refresh();
  } catch (err) {
    showError(err.message);
    mount.innerHTML = '';
  }
}
