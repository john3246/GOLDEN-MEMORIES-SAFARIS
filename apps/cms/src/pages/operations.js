import { api } from '../api/client.js';
import { shell } from './shell.js';
import { notifyError, notifySuccess } from '../components/toast.js';

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

function bookingFormFields(row = {}) {
  return `
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
  `;
}

function matchesBooking(row, { q, status, dateFrom, dateTo }) {
  const needle = String(q || '').trim().toLowerCase();
  if (needle) {
    const hay = [row.code, row.customerName, row.email, row.safariTitle, row.phone].join(' ').toLowerCase();
    if (!hay.includes(needle)) return false;
  }
  if (status && row.status !== status) return false;
  const day = String(row.travelDate || '').slice(0, 10);
  if (dateFrom && day && day < dateFrom) return false;
  if (dateTo && day && day > dateTo) return false;
  if ((dateFrom || dateTo) && !day) return false;
  return true;
}

export function renderOperations(user, kind) {
  const copy = {
    bookings: {
      title: 'Bookings',
      lead: 'Guest bookings from gmsafaris.com and staff entries. Open a booking to view or edit it on its own page.',
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
        ${kind === 'bookings' ? `<a class="cms-btn cms-btn-gold" href="#/bookings/new">${copy.create}</a>` : ''}
      </div>
      ${
        kind === 'bookings'
          ? `<div class="cms-filters cms-panel">
        <div class="cms-field">
          <label class="cms-label" for="booking-q">Search</label>
          <input id="booking-q" placeholder="Name, email, or booking ref" />
        </div>
        <div class="cms-field">
          <label class="cms-label" for="booking-status">Status</label>
          <select id="booking-status">
            <option value="">All statuses</option>
            <option>Pending</option>
            <option>Confirmed</option>
            <option>Pending Payment</option>
            <option>Cancelled</option>
          </select>
        </div>
        <div class="cms-field">
          <label class="cms-label" for="booking-from">Travel from</label>
          <input id="booking-from" type="date" />
        </div>
        <div class="cms-field">
          <label class="cms-label" for="booking-to">Travel to</label>
          <input id="booking-to" type="date" />
        </div>
        <button class="cms-btn cms-btn-navy" type="button" data-booking-filter>Apply</button>
      </div>`
          : ''
      }
      <p class="cms-error" id="ops-error" hidden></p>
      <div id="ops-table">Loading…</div>
    </section>
  `
  );
}

export function renderBookingDetail(user, id) {
  const isNew = id === 'new';
  return shell(
    user,
    'bookings',
    `
    <section class="cms-page cms-doc-editor">
      <div class="cms-page-head">
        <div>
          <a class="cms-muted" href="#/bookings">← Bookings</a>
          <h1 id="booking-title">${isNew ? 'New booking' : 'Booking'}</h1>
          <p class="cms-lead" id="booking-lead">${isNew ? 'Create a staff booking, then save it to the list.' : 'View and edit this booking.'}</p>
        </div>
      </div>
      <p class="cms-error" id="ops-error" hidden></p>
      <form id="ops-form" class="cms-panel cms-form-stack">Loading…</form>
    </section>
  `
  );
}

export async function initOperations(kind) {
  const mount = document.querySelector('#ops-table');
  const error = document.querySelector('#ops-error');
  let rows = [];

  function bookingFilters() {
    return {
      q: document.querySelector('#booking-q')?.value || '',
      status: document.querySelector('#booking-status')?.value || '',
      dateFrom: document.querySelector('#booking-from')?.value || '',
      dateTo: document.querySelector('#booking-to')?.value || '',
    };
  }

  function paintBookings() {
    const visible = rows.filter((row) => matchesBooking(row, bookingFilters()));
    mount.innerHTML = visible.length
      ? `<div class="cms-table-wrap"><table class="cms-table"><thead><tr><th>ID</th><th>Guest</th><th>Tour</th><th>Travel date</th><th>Party</th><th>Status</th><th>Reminder</th><th></th></tr></thead><tbody>${visible
          .map(
            (row) =>
              `<tr>
                    <td><a href="#/bookings/${row.id}">${row.code}</a></td>
                    <td>${escapeAttr(row.customerName)}<br><span class="cms-muted">${escapeAttr(row.email || '')}</span></td>
                    <td>${escapeAttr(row.safariTitle)}</td>
                    <td>${escapeAttr(row.travelDate || '—')}</td>
                    <td>${Number(row.adults || row.travellers || 0)} adults${Number(row.children) ? ` · ${row.children} children` : ''}</td>
                    <td>${pill(row.status)}</td>
                    <td>${reminderPill(row)}</td>
                    <td><a class="cms-btn" href="#/bookings/${row.id}">Open</a></td>
                  </tr>`
          )
          .join('')}</tbody></table></div>
        <p class="cms-muted" style="margin-top:1rem">${visible.length} of ${rows.length} bookings</p>`
      : '<p class="cms-muted">No bookings match these filters.</p>';
  }

  async function refresh() {
    try {
      if (kind === 'bookings') {
        const result = await api.listBookings();
        rows = result.data || [];
        const saved = sessionStorage.getItem('gm_cms_search');
        if (saved) {
          const input = document.querySelector('#booking-q');
          if (input) input.value = saved;
          sessionStorage.removeItem('gm_cms_search');
        }
        paintBookings();
      } else if (kind === 'inquiries') {
        const result = await api.listInquiries();
        mount.innerHTML = result.data.length
          ? `<div class="cms-package-list">${result.data
              .map(
                (row) => `
              <article class="cms-package-card">
                <h3>${escapeAttr(row.name)}</h3>
                <div>${pill(row.status)}</div>
                <p class="cms-meta-row"><span>${escapeAttr(row.email)}</span><span>${escapeAttr(row.subject || '')}</span><span>${String(row.created_at || '').slice(0, 16).replace('T', ' ')}</span></p>
                <p>${escapeAttr(row.message || '')}</p>
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
            try {
              await api.updateInquiry(btn.dataset.status, btn.dataset.value);
              notifySuccess('Inquiry updated.');
              await refresh();
            } catch (err) {
              notifyError(err.message);
            }
          });
        });
      } else {
        const result = await api.listCustomers();
        mount.innerHTML = result.data.length
          ? `<div class="cms-table-wrap"><table class="cms-table"><thead><tr><th>Name</th><th>Email</th><th>Phone</th></tr></thead><tbody>${result.data
              .map((row) => `<tr><td>${escapeAttr(row.name)}</td><td>${escapeAttr(row.email)}</td><td>${escapeAttr(row.phone || '—')}</td></tr>`)
              .join('')}</tbody></table></div>`
          : '<p class="cms-muted">No customers yet.</p>';
      }
    } catch (err) {
      mount.innerHTML = `<p class="cms-error">${err.message}</p>`;
    }
  }

  document.querySelector('[data-booking-filter]')?.addEventListener('click', paintBookings);
  ['#booking-q', '#booking-status', '#booking-from', '#booking-to'].forEach((sel) => {
    document.querySelector(sel)?.addEventListener('change', paintBookings);
  });
  document.querySelector('#booking-q')?.addEventListener('input', paintBookings);

  await refresh();
}

export async function initBookingDetail(id) {
  const form = document.querySelector('#ops-form');
  const error = document.querySelector('#ops-error');
  const title = document.querySelector('#booking-title');
  const lead = document.querySelector('#booking-lead');
  const isNew = id === 'new';
  let row = {};

  if (!isNew) {
    try {
      row = await api.getBooking(id);
    } catch (err) {
      form.innerHTML = `<p class="cms-error">${err.message}</p>`;
      return;
    }
    if (title) title.textContent = row.code || 'Booking';
    if (lead) lead.textContent = `${row.customerName || 'Guest'} · ${row.safariTitle || 'Tour'}`;
  }

  form.innerHTML = `
      <h2 class="cms-hub-title">${isNew ? 'New booking' : `Edit ${row.code || 'booking'}`}</h2>
      ${bookingFormFields(row)}
      <div class="cms-editor-actions">
        <button class="cms-btn cms-btn-gold" type="submit">${isNew ? 'Save booking' : 'Update booking'}</button>
        ${!isNew && row.email ? `<button class="cms-btn" type="button" data-remind="${row.id}">Send travel reminder</button>` : ''}
        <a class="cms-btn" href="#/bookings">Back to list</a>
      </div>
    `;

  form.querySelector('[data-remind]')?.addEventListener('click', async (event) => {
    error.hidden = true;
    try {
      await api.remindBooking(event.currentTarget.dataset.remind);
      if (lead) lead.textContent = 'Travel reminder sent.';
      notifySuccess('Travel reminder sent.');
    } catch (err) {
      error.hidden = false;
      error.textContent = err.message;
      notifyError(err.message);
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    error.hidden = true;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      if (isNew) {
        const created = await api.createBooking(data);
        notifySuccess('Booking saved.');
        window.location.hash = `#/bookings/${created.id}`;
        return;
      }
      const updated = await api.updateBooking(id, data);
      if (title) title.textContent = updated.code || 'Booking';
      if (lead) lead.textContent = 'Saved.';
      notifySuccess('Booking updated.');
    } catch (err) {
      error.hidden = false;
      error.textContent = err.message;
      notifyError(err.message);
    }
  });
}
