import { createId } from '@gm-safaris/shared-utils';
import { EnquiryStatus } from '@gm-safaris/shared-types';
import { validationError, notFound } from '../../errors/index.js';
import { readStore, updateStore } from '../../cms-store/index.js';
import { recordAudit } from '../audit/audit.service.js';
import { sendSiteMail, loadMailSettings } from '../settings/mailer.js';
import { inquiryGuestEmail, inquiryAdminEmail } from '../settings/email-templates.js';
import { cleanField, cleanMultiline, cleanEmail, cleanPhone, screenSubmission, isDuplicate } from '../forms/form-guard.js';
import { notifyStaff } from '../notifications/notifications.service.js';
import { emitEvent } from '../webhooks/webhooks.service.js';

const STATUSES = new Set([...Object.values(EnquiryStatus), 'In progress']);

function now() {
  return new Date().toISOString();
}

async function upsertCustomer({ name, email, phone, country }) {
  if (!email) return null;
  return updateStore((store) => {
    if (!Array.isArray(store.customers)) store.customers = [];
    const existing = store.customers.find((item) => item.email === email);
    if (existing) {
      existing.name = name || existing.name;
      existing.phone = phone || existing.phone;
      existing.country = country || existing.country || '';
      existing.updated_at = now();
      return null;
    }
    const customer = {
      id: createId(),
      name: name || email,
      email,
      phone: phone || '',
      country: country || '',
      created_at: now(),
      updated_at: now(),
    };
    store.customers.unshift(customer);
    return customer;
  });
}

export const enquiriesService = {
  async createPublic(body = {}, context = {}) {
    const name = cleanField(body.name, 120);
    const message = cleanMultiline(body.message, 5000);
    if (!name) throw validationError('Please tell us your name', { field: 'name' });
    const email = cleanEmail(body.email);
    if (!message || message.length < 5) throw validationError('Please write a short message', { field: 'message' });

    const screen = screenSubmission(body, message);
    if (screen.drop) return { id: createId(), status: 'New' };

    const record = {
      id: createId(),
      name,
      email,
      phone: cleanPhone(body.phone),
      country: cleanField(body.country, 80),
      subject: cleanField(body.subject || 'Safari inquiry', 160),
      message,
      safari: cleanField(body.safari || body.package, 200),
      travelDate: cleanField(body.travelDate || body.dates, 60),
      travellers: cleanField(body.travellers || body.partySize, 20),
      source: cleanField(body.source || 'contact', 40),
      page: cleanField(body.page, 300),
      status: screen.spam ? 'Spam' : 'New',
      notes: '',
      ip: context.ip || null,
      created_at: now(),
    };
    if (isDuplicate('inquiry', { email, message })) return { id: record.id, status: record.status };

    await updateStore((store) => {
      if (!Array.isArray(store.inquiries)) store.inquiries = [];
      store.inquiries.unshift(record);
    });
    if (screen.spam) return { id: record.id, status: 'New' };

    const customer = await upsertCustomer(record);
    const settings = await loadMailSettings();
    const guest = inquiryGuestEmail(record, settings);
    const admin = inquiryAdminEmail(record, settings);
    await Promise.all([
      sendSiteMail({ to: email, subject: guest.subject, text: guest.text, html: guest.html }),
      notifyStaff({
        kind: 'inquiry',
        title: `New inquiry from ${record.name}`,
        body: record.subject,
        link: '#/inquiries',
        email: { subject: admin.subject, text: admin.text, html: admin.html, replyTo: email },
      }),
    ]);
    const { ip: _ip, ...safe } = record;
    emitEvent('inquiry.created', safe);
    if (customer) emitEvent('customer.created', customer);
    return { id: record.id, status: record.status };
  },

  async listAdmin() {
    const store = await readStore();
    const rows = (store.inquiries || []).map(({ ip: _ip, ...row }) => row);
    return { data: rows, meta: { total: rows.length } };
  },

  async updateStatus(id, body, actor) {
    const input = typeof body === 'string' ? { status: body } : body || {};
    if (input.status && !STATUSES.has(input.status)) throw validationError('Unknown inquiry status');
    const record = await updateStore((store) => {
      const item = (store.inquiries || []).find((row) => row.id === id);
      if (!item) return null;
      if (input.status) item.status = input.status;
      if (input.notes !== undefined) item.notes = cleanMultiline(input.notes, 5000);
      item.updated_at = now();
      item.updated_by = actor?.email || null;
      return item;
    });
    if (!record) throw notFound('Inquiry not found');
    await recordAudit({
      actorId: actor?.userId,
      actorEmail: actor?.email,
      action: 'inquiry.update',
      resource: 'inquiries',
      resourceId: id,
      metadata: { status: record.status },
    });
    return record;
  },

  async remove(id, actor) {
    const removed = await updateStore((store) => {
      const index = (store.inquiries || []).findIndex((row) => row.id === id);
      return index === -1 ? null : store.inquiries.splice(index, 1)[0];
    });
    if (!removed) throw notFound('Inquiry not found');
    await recordAudit({ actorId: actor?.userId, actorEmail: actor?.email, action: 'inquiry.delete', resource: 'inquiries', resourceId: id });
    return { id };
  },
};
