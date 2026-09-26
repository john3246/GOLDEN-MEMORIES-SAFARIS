import { createId } from '@gm-safaris/shared-utils';
import { notFound, validationError } from '../../errors/index.js';
import { readStore, updateStore } from '../../cms-store/index.js';
import { recordAudit } from '../audit/audit.service.js';
import { sendSiteMail, loadMailSettings } from '../settings/mailer.js';
import { bookingGuestEmail, bookingAdminEmail, bookingReminderEmail } from '../settings/email-templates.js';
import { normalizeParty } from './bookings.dto.js';
import { cleanField, cleanMultiline, cleanPhone, isValidEmail, screenSubmission, isDuplicate } from '../forms/form-guard.js';
import { notifyStaff } from '../notifications/notifications.service.js';
import { emitEvent } from '../webhooks/webhooks.service.js';

const BOOKING_STATUSES = new Set(['Pending', 'Confirmed', 'DepositPaid', 'Paid', 'InProgress', 'Completed', 'Cancelled', 'Refunded']);

function now() {
  return new Date().toISOString();
}

function code() {
  const d = new Date();
  const ymd = `${String(d.getUTCFullYear()).slice(-2)}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `GMS-${ymd}-${rand}`;
}

function emailLooksValid(value) {
  return isValidEmail(value);
}

async function sendBookingEmails(record) {
  const settings = await loadMailSettings();
  const guest = bookingGuestEmail(record, settings);
  const admin = bookingAdminEmail(record, settings);
  const jobs = [];
  if (emailLooksValid(record.email)) {
    jobs.push(sendSiteMail({ to: record.email, subject: guest.subject, text: guest.text, html: guest.html }));
  }
  jobs.push(
    notifyStaff({
      kind: 'booking',
      title: `New booking ${record.code} — ${record.customerName}`,
      body: `${record.safariTitle}${record.travelDate ? ` · ${record.travelDate}` : ''}`,
      link: `#/bookings/${record.id}`,
      email: { subject: admin.subject, text: admin.text, html: admin.html, replyTo: record.email || undefined },
    })
  );
  await Promise.all(jobs);
}

function toRecord(body, extras = {}) {
  const customerName = cleanField(body.customerName || body.name, 120);
  const safariTitle = cleanField(body.safariTitle || body.package || body.safari, 200);
  if (!customerName) throw validationError('Please enter the lead guest name', { field: 'customerName' });
  if (!safariTitle) throw validationError('Please choose a safari or tour package', { field: 'safariTitle' });
  const status = BOOKING_STATUSES.has(body.status) ? body.status : 'Pending';
  const party = normalizeParty(body);
  return {
    id: createId(),
    code: body.code || code(),
    customerName,
    email: String(body.email || '').trim().toLowerCase().slice(0, 180),
    phone: cleanPhone(body.phone),
    country: cleanField(body.country, 80),
    safariTitle,
    safariId: cleanField(body.safariId || body.safari, 120),
    travelDate: cleanField(body.travelDate || body.dates, 60),
    adults: party.adults,
    children: party.children,
    childDetails: party.childDetails,
    travellers: party.travellers,
    notes: cleanMultiline(body.notes || body.message, 5000),
    status,
    amount: Math.max(0, Number(body.amount || 0) || 0),
    reminderSentAt: null,
    created_at: now(),
    updated_at: now(),
    ...extras,
  };
}

async function persistBooking(record, actor) {
  const newCustomer = await updateStore((store) => {
    if (!Array.isArray(store.bookings)) store.bookings = [];
    store.bookings.unshift(record);
    if (record.email) {
      if (!Array.isArray(store.customers)) store.customers = [];
      if (!store.customers.some((item) => item.email === record.email)) {
        const customer = {
          id: createId(),
          name: record.customerName,
          email: record.email,
          phone: record.phone,
          country: record.country || '',
          created_at: now(),
          updated_at: now(),
        };
        store.customers.unshift(customer);
        return customer;
      }
    }
    return null;
  });
  await recordAudit({
    actorId: actor?.userId || 'public',
    actorEmail: actor?.email || record.email,
    action: 'booking.create',
    resource: 'bookings',
    resourceId: record.id,
  });
  await sendBookingEmails(record);
  emitEvent('booking.created', record);
  if (newCustomer) emitEvent('customer.created', newCustomer);
  return record;
}

export const bookingsService = {
  async list() {
    const store = await readStore();
    return { data: store.bookings || [], meta: { total: (store.bookings || []).length } };
  },

  async get(id) {
    const store = await readStore();
    const item = (store.bookings || []).find((row) => row.id === id);
    if (!item) throw notFound('Booking not found');
    return item;
  },

  async create(body, actor) {
    return persistBooking(toRecord(body), actor);
  },

  async createPublic(body = {}) {
    const email = String(body.email || '').trim().toLowerCase();
    const travelDate = cleanField(body.travelDate || body.dates, 60);
    if (!emailLooksValid(email)) throw validationError('Please enter a valid email address', { field: 'email' });
    if (!travelDate) throw validationError('Please choose your travel date', { field: 'travelDate' });
    const screen = screenSubmission(body, body.notes || body.message || '');
    if (screen.drop) return { id: createId(), code: code(), status: 'Pending' };
    if (isDuplicate('booking', { email, travelDate, s: body.safariTitle || body.package || body.safari })) {
      throw validationError('We already received this booking a moment ago — please check your email.');
    }
    const party = normalizeParty(body);
    if (party.children > 0 && party.childDetails.some((child) => child.age === '')) {
      throw validationError('Each child needs an age for park fees and seating');
    }
    return persistBooking(
      toRecord({ ...body, email, travelDate, status: 'Pending', amount: 0 }, { source: 'website', spam: screen.spam })
    );
  },

  async update(id, body, actor) {
    const record = await updateStore((store) => {
      const item = (store.bookings || []).find((row) => row.id === id);
      if (!item) return null;
      Object.assign(item, {
        customerName: body.customerName != null ? cleanField(body.customerName, 120) : item.customerName,
        email: body.email != null ? String(body.email).trim().toLowerCase().slice(0, 180) : item.email,
        phone: body.phone != null ? cleanField(body.phone, 40) : item.phone,
        safariTitle: body.safariTitle != null ? cleanField(body.safariTitle, 200) : item.safariTitle,
        travelDate: body.travelDate != null ? cleanField(body.travelDate, 60) : item.travelDate,
        notes: body.notes != null ? cleanMultiline(body.notes, 5000) : item.notes,
        status: body.status && BOOKING_STATUSES.has(body.status) ? body.status : item.status,
        amount: body.amount != null ? Math.max(0, Number(body.amount) || 0) : item.amount,
        updated_at: now(),
      });
      if (
        body.adults != null ||
        body.children != null ||
        body.childDetails != null ||
        body.travellers != null
      ) {
        const party = normalizeParty({
          adults: body.adults ?? item.adults,
          children: body.children ?? item.children,
          childDetails: body.childDetails ?? item.childDetails,
          travellers: body.travellers ?? item.travellers,
        });
        Object.assign(item, party);
      }
      return item;
    });
    if (!record) throw notFound('Booking not found');
    await recordAudit({
      actorId: actor?.userId,
      actorEmail: actor?.email,
      action: 'booking.update',
      resource: 'bookings',
      resourceId: id,
      metadata: { status: record.status },
    });
    emitEvent('booking.updated', record);
    return record;
  },

  async sendReminder(id, actor) {
    const store = await readStore();
    const booking = (store.bookings || []).find((row) => row.id === id);
    if (!booking) throw notFound('Booking not found');
    if (!emailLooksValid(booking.email)) throw validationError('This booking has no guest email');
    const settings = await loadMailSettings();
    const mail = bookingReminderEmail(booking, settings);
    await sendSiteMail({
      to: booking.email,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    });
    const record = await updateStore((next) => {
      const item = (next.bookings || []).find((row) => row.id === id);
      if (!item) return null;
      item.reminderSentAt = now();
      item.updated_at = now();
      return item;
    });
    await recordAudit({
      actorId: actor?.userId,
      actorEmail: actor?.email,
      action: 'booking.remind',
      resource: 'bookings',
      resourceId: id,
    });
    return record;
  },

  async listCustomers() {
    const store = await readStore();
    return { data: store.customers || [], meta: { total: (store.customers || []).length } };
  },
};
