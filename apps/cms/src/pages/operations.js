import { api } from '../api/client.js';
import { shell } from './shell.js';

function pill(status) {
  const kind = /confirm/i.test(status) ? 'is-live' : /pending|new/i.test(status) ? 'is-draft' : '';
  return `<span class="cms-pill ${kind}">${status || '—'}</span>`;
}

export function renderOperations(user, kind) {
  const copy = {
    bookings: {
      title: 'Bookings',
      lead: 'Record and update guest bookings. These appear on the admin dashboard.',
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
      <div id="ops-table">Loading…</div>
      <form id="ops-form" class="cms-panel cms-form-stack" hidden></form>
    </section>
  `
  );
}

export async function initOperations(kind) {
  const mount = document.querySelector('#ops-table');
  const form = document.querySelector('#ops-form');

  async function refresh() {
    try {
      if (kind === 'bookings') {
        const result = await api.listBookings();
        mount.innerHTML = result.data.length
          ? `<table class="cms-table"><thead><tr><th>ID</th><th>Guest</th><th>Tour</th><th>Travel date</th><th>Status</th><th>Amount</th></tr></thead><tbody>${result.data
              .map(
                (row) =>
                  `<tr><td>${row.code}</td><td>${row.customerName}<br><span class="cms-muted">${row.email || ''}</span></td><td>${row.safariTitle}</td><td>${row.travelDate || '—'}</td><td>${pill(row.status)}</td><td>${row.amount || '—'}</td></tr>`
              )
              .join('')}</tbody></table>`
          : '<p class="cms-muted">No bookings yet.</p>';
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

  document.querySelector('[data-create]')?.addEventListener('click', () => {
    form.hidden = false;
    form.innerHTML = `
      <div class="cms-grid-2">
        <div class="cms-field"><label class="cms-label">Guest name</label><input name="customerName" required /></div>
        <div class="cms-field"><label class="cms-label">Email</label><input name="email" type="email" /></div>
        <div class="cms-field"><label class="cms-label">Tour package</label><input name="safariTitle" required /></div>
        <div class="cms-field"><label class="cms-label">Travel date</label><input name="travelDate" type="date" /></div>
        <div class="cms-field"><label class="cms-label">Amount (USD)</label><input name="amount" type="number" /></div>
        <div class="cms-field"><label class="cms-label">Status</label>
          <select name="status"><option>Pending</option><option>Confirmed</option><option>Pending Payment</option><option>Cancelled</option></select>
        </div>
      </div>
      <button class="cms-btn cms-btn-gold" type="submit">Save booking</button>
    `;
  });

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    await api.createBooking(data);
    form.hidden = true;
    form.innerHTML = '';
    await refresh();
  });

  await refresh();
}
