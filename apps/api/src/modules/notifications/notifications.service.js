/**
 * Staff notifications: the bell in the CMS top bar + email alerts.
 *
 * Every new booking / inquiry (and important system problems) creates a
 * notification. It is emailed to the addresses in Site settings → Email →
 * "Notify" (comma-separated) and to every active staff member who switched on
 * booking or inquiry alerts in their profile.
 */
import { createId } from '@gm-safaris/shared-utils';
import { readStore, updateStore, storeBackend } from '../../cms-store/index.js';
import { sendSiteMail, loadMailSettings, smtpConfig } from '../settings/mailer.js';
import { usersRepository } from '../users/users.repository.js';
import { logger } from '../../logging/index.js';

const MAX_ITEMS = 300;

function splitEmails(value) {
  return String(value || '')
    .split(/[,;\s]+/)
    .map((item) => item.trim().toLowerCase())
    .filter((item) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item));
}

async function recipients(kind) {
  const settings = await loadMailSettings();
  const list = new Set(splitEmails(settings.email?.notifyTo || settings.site?.email));
  try {
    const users = await usersRepository.all();
    for (const user of users) {
      if (user.status === 'disabled') continue;
      if (kind === 'booking' && user.notifyBookings === true && user.role !== 'Viewer') list.add(user.email);
      if (kind === 'inquiry' && user.notifyInquiries === true && user.role !== 'Viewer') list.add(user.email);
    }
  } catch {
    /* users table unavailable — fall back to settings only */
  }
  return [...list];
}

/**
 * @param {{ kind: 'booking'|'inquiry'|'system', title: string, body?: string, link?: string,
 *           email?: { subject: string, text: string, html?: string, replyTo?: string }, silent?: boolean }} input
 */
export async function notifyStaff(input) {
  const item = {
    id: createId(),
    kind: input.kind,
    title: String(input.title || '').slice(0, 200),
    body: String(input.body || '').slice(0, 500),
    link: input.link || '',
    created_at: new Date().toISOString(),
    readBy: [],
  };
  await updateStore((store) => {
    if (!Array.isArray(store.notifications)) store.notifications = [];
    store.notifications.unshift(item);
    if (store.notifications.length > MAX_ITEMS) store.notifications.length = MAX_ITEMS;
  });
  if (input.email && !input.silent) {
    const to = await recipients(input.kind);
    if (to.length) {
      const result = await sendSiteMail({ ...input.email, to: to.join(', ') });
      if (!result.sent && result.reason !== 'smtp-not-configured') {
        logger.warn('Staff notification email failed', { reason: result.reason });
      }
    }
  }
  return item;
}

async function systemAlerts(store) {
  const alerts = [];
  try {
    const smtp = await smtpConfig();
    if (!smtp.configured) {
      alerts.push({ level: 'warning', title: 'Email is not set up', body: 'Booking and inquiry emails are not being sent.', link: '#/settings' });
    }
  } catch {
    /* ignore */
  }
  if (storeBackend().backend !== 'postgres') {
    alerts.push({
      level: 'warning',
      title: 'Database not connected',
      body: 'Content is being saved to a local file instead of PostgreSQL. Check DATABASE_* settings.',
      link: '#/settings',
    });
  }
  const failing = (store.webhooks || []).filter((hook) => hook.active !== false && Number(hook.failures || 0) >= 3);
  for (const hook of failing) {
    alerts.push({ level: 'error', title: `Integration "${hook.name}" is failing`, body: hook.last_status || '', link: '#/api-clients' });
  }
  for (const [source, info] of Object.entries(store.reviewSummary || {})) {
    if (info?.error) alerts.push({ level: 'warning', title: `${source} reviews could not be imported`, body: info.error, link: '#/reviews' });
  }
  return alerts;
}

export const notificationsService = {
  async forUser(userId) {
    const store = await readStore();
    const items = (store.notifications || []).slice(0, 40).map((item) => ({
      id: item.id,
      kind: item.kind,
      title: item.title,
      body: item.body,
      link: item.link,
      created_at: item.created_at,
      unread: !(item.readBy || []).includes(userId),
    }));
    const unread = (store.notifications || []).filter((item) => !(item.readBy || []).includes(userId)).length;
    const counts = {
      newInquiries: (store.inquiries || []).filter((row) => row.status === 'New').length,
      pendingBookings: (store.bookings || []).filter((row) => row.status === 'Pending').length,
    };
    return { items, unread, counts, alerts: await systemAlerts(store) };
  },

  async markRead(userId, ids) {
    const all = !Array.isArray(ids) || !ids.length;
    await updateStore((store) => {
      for (const item of store.notifications || []) {
        if (!all && !ids.includes(item.id)) continue;
        if (!item.readBy) item.readBy = [];
        if (!item.readBy.includes(userId)) item.readBy.push(userId);
      }
    });
    return { ok: true };
  },
};
