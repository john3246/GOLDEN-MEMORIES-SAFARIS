import { createId } from '@gm-safaris/shared-utils';
import { validationError, notFound } from '../../errors/index.js';
import { readStore, updateStore } from '../../cms-store/index.js';
import { recordAudit } from '../audit/audit.service.js';
import { sendSiteMail, loadMailSettings } from '../settings/mailer.js';
import { inquiryGuestEmail, inquiryAdminEmail } from '../settings/email-templates.js';
import { DEFAULT_SETTINGS } from '../content/content.seed.js';

function now() {
  return new Date().toISOString();
}

async function upsertCustomer({ name, email, phone }) {
  if (!email) return;
  await updateStore((store) => {
    if (!Array.isArray(store.customers)) store.customers = [];
    const existing = store.customers.find((item) => item.email === email);
    if (existing) {
      existing.name = name || existing.name;
      existing.phone = phone || existing.phone;
      existing.updated_at = now();
      return;
    }
    store.customers.unshift({
      id: createId(),
      name: name || email,
      email,
      phone: phone || '',
      created_at: now(),
      updated_at: now(),
    });
  });
}

export const enquiriesService = {
  async createPublic(body = {}) {
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim();
    const message = String(body.message || '').trim();
    if (!name || !email || !message) {
      throw validationError('Name, email, and message are required');
    }
    const record = {
      id: createId(),
      name,
      email,
      phone: String(body.phone || '').trim(),
      country: String(body.country || '').trim(),
      subject: String(body.subject || 'Safari inquiry').trim(),
      message,
      safari: String(body.safari || body.package || '').trim(),
      status: 'New',
      created_at: now(),
    };
    await updateStore((store) => {
      if (!Array.isArray(store.inquiries)) store.inquiries = [];
      store.inquiries.unshift(record);
    });
    await upsertCustomer(record);
    const settings = await loadMailSettings();
    const notifyTo = settings.email?.notifyTo || settings.site?.email || DEFAULT_SETTINGS.site.email;
    const guest = inquiryGuestEmail(record, settings);
    const admin = inquiryAdminEmail(record, settings);
    await Promise.all([
      sendSiteMail({
        to: email,
        subject: guest.subject,
        text: guest.text,
        html: guest.html,
      }),
      sendSiteMail({
        to: notifyTo,
        replyTo: email,
        subject: admin.subject,
        text: admin.text,
        html: admin.html,
      }),
    ]);
    return { id: record.id, status: record.status };
  },

  async listAdmin() {
    const store = await readStore();
    const rows = store.inquiries || [];
    return { data: rows, meta: { total: rows.length } };
  },

  async updateStatus(id, status, actor) {
    const record = await updateStore((store) => {
      const item = (store.inquiries || []).find((row) => row.id === id);
      if (!item) return null;
      item.status = status || item.status;
      item.updated_at = now();
      return item;
    });
    if (!record) throw notFound('Inquiry not found');
    await recordAudit({
      actorId: actor?.userId,
      actorEmail: actor?.email,
      action: 'inquiry.update',
      resource: 'inquiries',
      resourceId: id,
    });
    return record;
  },
};
