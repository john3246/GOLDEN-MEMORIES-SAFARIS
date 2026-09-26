import { api } from '../api/client.js';
import { shell } from './shell.js';
import { isStaffAdmin } from '../auth/roles.js';
import { esc } from '../components/escape.js';
import { notifyError, notifySuccess } from '../components/toast.js';

const ROLE_HELP = {
  'Super Admin': 'Everything, including other Super Admins, roles and API keys.',
  Admin: 'Content, bookings, users (except Super Admins), settings and integrations.',
  Manager: 'Bookings, inquiries, customers and group departures. Read-only content.',
  Editor: 'Create, edit and publish tours, destinations, blog, pages, lodges and media.',
  Viewer: 'Read-only access to the CMS.',
};

function pill(status) {
  return `<span class="cms-pill ${status === 'active' ? 'is-live' : 'is-draft'}">${esc(status === 'active' ? 'Active' : 'Disabled')}</span>`;
}

function roleOptions(selected, canSuper) {
  return Object.keys(ROLE_HELP)
    .filter((role) => canSuper || role !== 'Super Admin')
    .map((role) => `<option value="${esc(role)}" ${role === selected ? 'selected' : ''}>${esc(role)}</option>`)
    .join('');
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
          <h1>Users &amp; roles</h1>
          <p class="cms-lead">Staff accounts are stored in the PostgreSQL database. Give each person their own login and the smallest role that lets them do their job. Disabling someone or changing their role signs them out immediately.</p>
        </div>
      </div>
      <p class="cms-error" id="users-error" hidden></p>
      <form id="user-form" class="cms-panel cms-form-stack">
        <h2>New staff account</h2>
        <div class="cms-grid-2">
          <div class="cms-field">
            <label class="cms-label" for="user-name">Full name</label>
            <input id="user-name" name="name" required maxlength="120" />
          </div>
          <div class="cms-field">
            <label class="cms-label" for="user-email">Email</label>
            <input id="user-email" name="email" type="email" required />
          </div>
          <div class="cms-field">
            <label class="cms-label" for="user-role">Role</label>
            <select id="user-role" name="role">${roleOptions('Editor', canSuper)}</select>
            <p class="cms-hint" id="user-role-help">${esc(ROLE_HELP.Editor)}</p>
          </div>
          <div class="cms-field">
            <label class="cms-label" for="user-password">Temporary password</label>
            <input id="user-password" name="password" type="password" minlength="10" required autocomplete="new-password" />
            <p class="cms-hint">10+ characters, three of: lowercase, uppercase, numbers, symbols. Ask them to change it under "My profile".</p>
          </div>
        </div>
        <label class="cms-check"><input type="checkbox" name="sendWelcome" checked /> Email them a welcome message with the sign-in link</label>
        <button class="cms-btn cms-btn-navy" type="submit">Create user</button>
      </form>
      <div id="users-table" class="cms-panel" style="margin-top:1.25rem">Loading…</div>
      <dialog id="user-dialog" class="cms-dialog">
        <form method="dialog" id="user-edit-form" class="cms-form-stack"></form>
      </dialog>
    </section>
  `
  );
}

export async function initUsers() {
  const mount = document.querySelector('#users-table');
  const error = document.querySelector('#users-error');
  const form = document.querySelector('#user-form');
  const dialog = document.querySelector('#user-dialog');
  const editForm = document.querySelector('#user-edit-form');
  const viewer = api.user();
  const canSuper = viewer?.role === 'Super Admin';
  let rows = [];

  function showError(message) {
    error.hidden = false;
    error.textContent = message;
    notifyError(message);
  }

  document.querySelector('#user-role')?.addEventListener('change', (event) => {
    document.querySelector('#user-role-help').textContent = ROLE_HELP[event.target.value] || '';
  });

  async function refresh() {
    error.hidden = true;
    const result = await api.listUsers();
    rows = result.data || [];
    mount.innerHTML = `
      <div class="cms-table-wrap"><table class="cms-table">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last sign-in</th><th></th></tr></thead>
        <tbody>
          ${rows
            .map((item) => {
              const locked = item.locked ? ' <span class="cms-pill is-draft">Locked</span>' : '';
              const manageable = canSuper || item.role !== 'Super Admin';
              const self = item.id === viewer?.id;
              return `
            <tr data-user-id="${esc(item.id)}">
              <td>${esc(item.name)}${self ? ' <span class="cms-muted">(you)</span>' : ''}</td>
              <td>${esc(item.email)}</td>
              <td>${esc(item.role)}</td>
              <td>${pill(item.status)}${locked}</td>
              <td>${esc(item.lastLoginAt ? String(item.lastLoginAt).slice(0, 16).replace('T', ' ') : '—')}</td>
              <td class="cms-row-actions">
                ${manageable ? '<button class="cms-btn" type="button" data-user-edit>Edit</button>' : ''}
                ${manageable && !self ? (item.status === 'active' ? '<button class="cms-btn" type="button" data-user-disable>Disable</button>' : '<button class="cms-btn" type="button" data-user-enable>Enable</button>') : ''}
                ${manageable && item.locked ? '<button class="cms-btn" type="button" data-user-unlock>Unlock</button>' : ''}
                ${manageable && !self ? '<button class="cms-btn cms-btn-danger" type="button" data-user-delete>Delete</button>' : ''}
              </td>
            </tr>`;
            })
            .join('')}
        </tbody>
      </table></div>`;
  }

  function openEditor(item) {
    editForm.innerHTML = `
      <h2>Edit ${esc(item.name)}</h2>
      <input type="hidden" name="id" value="${esc(item.id)}" />
      <div class="cms-field"><label class="cms-label">Full name</label><input name="name" value="${esc(item.name)}" required /></div>
      <div class="cms-field"><label class="cms-label">Email</label><input name="email" type="email" value="${esc(item.email)}" required /></div>
      <div class="cms-field"><label class="cms-label">Phone</label><input name="phone" value="${esc(item.phone || '')}" /></div>
      <div class="cms-field"><label class="cms-label">Role</label><select name="role">${roleOptions(item.role, canSuper)}</select></div>
      <label class="cms-check"><input type="checkbox" name="notifyBookings" ${item.notifyBookings ? 'checked' : ''}/> Email alerts for new bookings</label>
      <label class="cms-check"><input type="checkbox" name="notifyInquiries" ${item.notifyInquiries ? 'checked' : ''}/> Email alerts for new inquiries</label>
      <div class="cms-field"><label class="cms-label">New password (leave empty to keep)</label><input name="password" type="password" autocomplete="new-password" minlength="10" /></div>
      <label class="cms-check"><input type="checkbox" name="signOutEverywhere" /> Sign this user out on all devices</label>
      <div class="cms-editor-actions">
        <button class="cms-btn cms-btn-navy" value="save" type="submit">Save changes</button>
        <button class="cms-btn" value="cancel" type="submit" formnovalidate>Cancel</button>
      </div>`;
    dialog.showModal();
  }

  editForm?.addEventListener('submit', async (event) => {
    if (event.submitter?.value !== 'save') return;
    event.preventDefault();
    const f = new FormData(editForm);
    try {
      await api.updateUser(f.get('id'), {
        name: f.get('name'),
        email: f.get('email'),
        phone: f.get('phone'),
        role: f.get('role'),
        notifyBookings: f.get('notifyBookings') === 'on',
        notifyInquiries: f.get('notifyInquiries') === 'on',
        password: f.get('password') || undefined,
        signOutEverywhere: f.get('signOutEverywhere') === 'on',
      });
      dialog.close();
      notifySuccess('User updated.');
      await refresh();
    } catch (err) {
      notifyError(err.message);
    }
  });

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    data.sendWelcome = data.sendWelcome === 'on';
    try {
      await api.createUser(data);
      form.reset();
      notifySuccess('Staff user created.');
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
    const item = rows.find((entry) => entry.id === id);
    try {
      if (button.hasAttribute('data-user-edit')) {
        openEditor(item);
        return;
      }
      if (button.hasAttribute('data-user-disable')) {
        if (!window.confirm(`Disable ${item.name}? They will be signed out immediately.`)) return;
        await api.updateUser(id, { status: 'disabled' });
      } else if (button.hasAttribute('data-user-enable')) {
        await api.updateUser(id, { status: 'active' });
      } else if (button.hasAttribute('data-user-unlock')) {
        await api.updateUser(id, { unlock: true });
      } else if (button.hasAttribute('data-user-delete')) {
        if (!window.confirm(`Delete ${item.name} permanently? This cannot be undone.`)) return;
        await api.deleteUser(id);
      }
      notifySuccess('User updated.');
      await refresh();
    } catch (err) {
      showError(err.message);
    }
  });

  if (!isStaffAdmin(viewer)) {
    mount.innerHTML = '<p class="cms-error">Admin access required.</p>';
    return;
  }

  try {
    await refresh();
  } catch (err) {
    showError(err.message);
    mount.innerHTML = '';
  }
}
