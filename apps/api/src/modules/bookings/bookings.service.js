import { createId } from '@gm-safaris/shared-utils';
import { notFound, validationError } from '../../errors/index.js';
import { readStore, updateStore } from '../../cms-store/index.js';
import { recordAudit } from '../audit/audit.service.js';
import { sendSiteMail, loadMailSettings } from '../settings/mailer.js';
import { bookingGuestEmail, bookingAdminEmail, bookingReminderEmail } from '../settings/email-templates.js';
import { DEFAULT_SETTINGS } from '../content/content.seed.js';
import { normalizeParty } from './bookings.dto.js';

function now() {
  return new Date().toISOString();
}

function code() {
  return `BK-${String(Date.now()).slice(-6)}`;
}

function emailLooksValid(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function notifyAddress(settings) {
  return settings?.email?.notifyTo || settings?.site?.email || DEFAULT_SETTINGS.site.email;
}

async function sendBookingEmails(record) {
  const settings = await loadMailSettings();
  const guest = bookingGuestEmail(record, settings);
  const admin = bookingAdminEmail(record, settings);
  const jobs = [];
  if (emailLooksValid(record.email)) {
    jobs.push(
      sendSiteMail({
        to: record.email,
        subject: guest.subject,
        text: guest.text,
        html: guest.html,
      })
    );
  }
  const staff = notifyAddress(settings);
  if (emailLooksValid(staff)) {
    jobs.push(
      sendSiteMail({
        to: staff,
        replyTo: record.email || undefined,
        subject: admin.subject,
        text: admin.text,
        html: admin.html,
      })
    );
  }
  await Promise.all(jobs);
}

function toRecord(body, extras = {}) {
  const customerName = String(body.customerName || body.name || '').trim();
  const safariTitle = String(body.safariTitle || body.package || body.safari || '').trim();
  if (!customerName || !safariTitle) {
    throw validationError('Guest name and tour package are required');
  }
  const party = normalizeParty(body);
  return {
    id: createId(),
    code: body.code || code(),
    customerName,
    email: String(body.email || '').trim(),
    phone: String(body.phone || '').trim(),
    safariTitle,
    safariId: body.safariId || body.safari || '',
    travelDate: String(body.travelDate || body.dates || '').trim(),
    adults: party.adults,
    children: party.children,
    childDetails: party.childDetails,
    travellers: party.travellers,
    notes: String(body.notes || body.message || '').trim(),
    status: body.status || 'Pending',
    amount: Number(body.amount || 0),
    reminderSentAt: null,
    created_at: now(),
    updated_at: now(),
    ...extras,
  };
}

async function persistBooking(record, actor) {
  await updateStore((store) => {
    if (!Array.isArray(store.bookings)) store.bookings = [];
    store.bookings.unshift(record);
    if (record.email) {
      if (!Array.isArray(store.customers)) store.customers = [];
      if (!store.customers.some((item) => item.email === record.email)) {
        store.customers.unshift({
          id: createId(),
          name: record.customerName,
          email: record.email,
          phone: record.phone,
          created_at: now(),
          updated_at: now(),
        });
      }
    }
  });
  await recordAudit({
    actorId: actor?.userId || 'public',
    actorEmail: actor?.email || record.email,
    action: 'booking.create',
    resource: 'bookings',
    resourceId: record.id,
  });
  await sendBookingEmails(record);
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
    const email = String(body.email || '').trim();
    const travelDate = String(body.travelDate || body.dates || '').trim();
    if (!emailLooksValid(email)) throw validationError('A valid guest email is required');
    if (!travelDate) throw validationError('Travel date is required');
    const party = normalizeParty(body);
    if (party.children > 0 && party.childDetails.some((child) => child.age === '')) {
      throw validationError('Each child needs an age for park fees and seating');
    }
    return persistBooking(
      toRecord({ ...body, email, travelDate, status: body.status || 'Pending' }, { source: 'website' })
    );
  },

  async update(id, body, actor) {
    const record = await updateStore((store) => {
      const item = (store.bookings || []).find((row) => row.id === id);
      if (!item) return null;
      Object.assign(item, {
        customerName: body.customerName ?? item.customerName,
        email: body.email ?? item.email,
        phone: body.phone ?? item.phone,
        safariTitle: body.safariTitle ?? item.safariTitle,
        travelDate: body.travelDate ?? item.travelDate,
        notes: body.notes ?? item.notes,
        status: body.status ?? item.status,
        amount: body.amount != null ? Number(body.amount) : item.amount,
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
    });
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
