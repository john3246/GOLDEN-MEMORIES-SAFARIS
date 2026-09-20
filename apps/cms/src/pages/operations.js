import { api } from '../api/client.js';
import { shell } from './shell.js';

function pill(status) {
  const kind = /confirm/i.test(status) ? 'is-live' : /pending|new/i.test(status) ? 'is-draft' : '';
  return `<span class="cms-pill ${kind}">${status || '—'}</span>`;
}

function reminderPill(row) {
  if (row.reminderSentAt) return `<span class="cms-pill is-live">Reminder sent</span>`;
  return `<span class="cms-muted">Pending</span>`;
}

function escapeAttr(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

export function renderOperations(user, kind) {
  const copy = {
    bookings: {
      title: 'Bookings',
      lead: 'Guest bookings from gmsafaris.com and staff entries. Confirm lodges, then keep travel dates accurate so the 24-hour reminder can send.',
      create: 'New booking',
    },
    inquiries: {
      title: 'Inquiries',
      lead: 'Messages from the public contact form. Reply by email, then mark the status.',
    },
    customers: {
      title: 'Customers',
      lead: 'Guests collected from inquiries and bookings.',
    },
  }[kind];
  return shell(
    user,
    kind,
    `
    <section class="cms-page">
      <div class="cms-page-head">
        <div>
          <p class="cms-kicker">Operations</p>
          <h1>${copy.title}</h1>
          <p class="cms-lead">${copy.lead}</p>
        </div>
        ${kind === 'bookings' ? `<button class="cms-btn cms-btn-gold" type="button" data-create>${copy.create}</button>` : ''}
      </div>
      <p class="cms-error" id="ops-error" hidden></p>
      <div id="ops-table">Loading…</div>
      <form id="ops-form" class="cms-panel cms-form-stack" hidden></form>
    </section>
  `
  );
}

export async function initOperations(kind) {
  const mount = document.querySelector('#ops-table');
  const form = document.querySelector('#ops-form');
  const error = document.querySelector('#ops-error');

  function bookingForm(row = {}) {
    form.hidden = false;
    form.dataset.id = row.id || '';
    form.innerHTML = `
      <h2 class="cms-hub-title">${row.id ? `Edit ${row.code || 'booking'}` : 'New booking'}</h2>
      <div class="cms-grid-2">
        <div class="cms-field"><label class="cms-label">Guest name</label><input name="customerName" value="${escapeAttr(row.customerName)}" required /></div>
        <div class="cms-field"><label class="cms-label">Email</label><input name="email" type="email" value="${escapeAttr(row.email)}" /></div>
        <div class="cms-field"><label class="cms-label">Phone</label><input name="phone" value="${escapeAttr(row.phone)}" /></div>
        <div class="cms-field"><label class="cms-label">Tour package</label><input name="safariTitle" value="${escapeAttr(row.safariTitle)}" required /></div>
        <div class="cms-field"><label class="cms-label">Travel date</label><input name="travelDate" type="date" value="${escapeAttr(String(row.travelDate || '').slice(0, 10))}" /></div>
        <div class="cms-field"><label class="cms-label">Adults</label><input name="adults" type="number" min="1" value="${escapeAttr(row.adults || row.travellers || 1)}" /></div>
        <div class="cms-field"><label class="cms-label">Children</label><input name="children" type="number" min="0" value="${escapeAttr(row.children || 0)}" /></div>
        <div class="cms-field"><label class="cms-label">Amount (USD)</label><input name="amount" type="number" value="${escapeAttr(row.amount || '')}" /></div>
        <div class="cms-field"><label class="cms-label">Status</label>
          <select name="status">
            ${['Pending', 'Confirmed', 'Pending Payment', 'Cancelled']
              .map((status) => `<option ${row.status === status ? 'selected' : ''}>${status}</option>`)
              .join('')}
          </select>
        </div>
      </div>
      <div class="cms-field"><label class="cms-label">Child details (Name | age per line)</label><textarea name="childDetails">${escapeAttr(
        (row.childDetails || []).map((child) => `${child.name || ''} | ${child.age ?? ''}`).join('\n')
      )}</textarea></div>
      <div class="cms-field"><label class="cms-label">Notes</label><textarea name="notes">${escapeAttr(row.notes)}</textarea></div>
      <div class="cms-editor-actions">
        <button class="cms-btn cms-btn-gold" type="submit">${row.id ? 'Update booking' : 'Save booking'}</button>
        ${row.id && row.email ? `<button class="cms-btn" type="button" data-remind="${row.id}">Send travel reminder</button>` : ''}
        <button class="cms-btn" type="button" data-cancel-form>Close</button>
      </div>
    `;
    form.querySelector('[data-cancel-form]')?.addEventListener('click', () => {
      form.hidden = true;
      form.innerHTML = '';
      delete form.dataset.id;
    });
    form.querySelector('[data-remind]')?.addEventListener('click', async (event) => {
      error.hidden = true;
      try {
        await api.remindBooking(event.currentTarget.dataset.remind);
        await refresh();
      } catch (err) {
        error.hidden = false;
        error.textContent = err.message;
      }
    });
  }

  async function refresh() {
    try {
      if (kind === 'bookings') {
        const result = await api.listBookings();
        mount.innerHTML = result.data.length
          ? `<table class="cms-table"><thead><tr><th>ID</th><th>Guest</th><th>Tour</th><th>Travel date</th><th>Party</th><th>Status</th><th>Reminder</th><th></th></tr></thead><tbody>${result.data
              .map(
                (row) =>
                  `<tr>
                    <td>${row.code}</td>
                    <td>${row.customerName}<br><span class="cms-muted">${row.email || ''}</span></td>
                    <td>${row.safariTitle}</td>
                    <td>${row.travelDate || '—'}</td>
                    <td>${Number(row.adults || row.travellers || 0)} adults${Number(row.children) ? ` · ${row.children} children` : ''}</td>
                    <td>${pill(row.status)}</td>
                    <td>${reminderPill(row)}</td>
                    <td><button class="cms-btn" type="button" data-edit="${row.id}">Edit</button></td>
                  </tr>`
              )
              .join('')}</tbody></table>`
          : '<p class="cms-muted">No bookings yet.</p>';
        const byId = Object.fromEntries(result.data.map((row) => [row.id, row]));
        mount.querySelectorAll('[data-edit]').forEach((btn) => {
          btn.addEventListener('click', () => bookingForm(byId[btn.dataset.edit]));
        });
      } else if (kind === 'inquiries') {
        const result = await api.listInquiries();
        mount.innerHTML = result.data.length
          ? `<div class="cms-package-list">${result.data
              .map(
                (row) => `
              <article class="cms-package-card">
                <h3>${row.name}</h3>
                <div>${pill(row.status)}</div>
                <p class="cms-meta-row"><span>${row.email}</span><span>${row.subject || ''}</span><span>${String(row.created_at || '').slice(0, 16).replace('T', ' ')}</span></p>
                <p>${row.message || ''}</p>
                <div class="cms-editor-actions" style="margin-top:0.75rem">
                  <button class="cms-btn" type="button" data-status="${row.id}" data-value="In progress">In progress</button>
                  <button class="cms-btn cms-btn-navy" type="button" data-status="${row.id}" data-value="Replied">Replied</button>
                </div>
              </article>`
              )
              .join('')}</div>`
          : '<p class="cms-muted">No inquiries yet.</p>';
        mount.querySelectorAll('[data-status]').forEach((btn) => {
          btn.addEventListener('click', async () => {
            await api.updateInquiry(btn.dataset.status, btn.dataset.value);
            await refresh();
          });
        });
      } else {
        const result = await api.listCustomers();
        mount.innerHTML = result.data.length
          ? `<table class="cms-table"><thead><tr><th>Name</th><th>Email</th><th>Phone</th></tr></thead><tbody>${result.data
              .map((row) => `<tr><td>${row.name}</td><td>${row.email}</td><td>${row.phone || '—'}</td></tr>`)
              .join('')}</tbody></table>`
          : '<p class="cms-muted">No customers yet.</p>';
      }
    } catch (err) {
      mount.innerHTML = `<p class="cms-error">${err.message}</p>`;
    }
  }

  document.querySelector('[data-create]')?.addEventListener('click', () => bookingForm());

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    error.hidden = true;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      if (form.dataset.id) await api.updateBooking(form.dataset.id, data);
      else await api.createBooking(data);
      form.hidden = true;
      form.innerHTML = '';
      delete form.dataset.id;
      await refresh();
    } catch (err) {
      error.hidden = false;
      error.textContent = err.message;
    }
  });

  await refresh();
}
