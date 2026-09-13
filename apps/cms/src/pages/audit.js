import { api } from '../api/client.js';
import { shell } from './shell.js';

export function renderAudit(user) {
  return shell(
    user,
    'activity',
    `
    <section class="cms-page">
      <div class="cms-page-head">
        <div>
          <p class="cms-kicker">Admin</p>
          <h1>Activity log</h1>
          <p class="cms-lead">Recent CMS actions across safari packages, website content, media, and settings.</p>
        </div>
        <a class="cms-btn cms-btn-navy" href="#/dashboard">Back to dashboard</a>
      </div>
      <div id="audit-table">Loading…</div>
    </section>
  `
  );
}

export async function initAudit() {
  const mount = document.querySelector('#audit-table');
  if (!mount) return;
  try {
    const result = await api.listAudit();
    const rows = result.data || [];
    if (!rows.length) {
      mount.innerHTML = '<p class="cms-muted">No activity recorded yet.</p>';
      return;
    }
    mount.innerHTML = `
      <ol class="cms-activity cms-activity-full">
        ${rows
          .map((item) => {
            const when = String(item.timestamp || '').replace('T', ' ');
            const who = item.actorEmail || 'staff';
            const action = item.action || 'update';
            const target = [item.resource, item.resourceId].filter(Boolean).join(' · ');
            return `<li><strong>${action}</strong> <span>${who}</span> <em>${target}</em> <time>${when}</time></li>`;
          })
          .join('')}
      </ol>
      <p class="cms-muted" style="margin-top:1rem">${result.meta?.total ?? rows.length} events</p>
    `;
  } catch (err) {
    mount.innerHTML = `<p class="cms-error">${err.message}</p>`;
  }
}
