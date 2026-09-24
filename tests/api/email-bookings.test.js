import { describe, it, expect, beforeEach } from 'vitest';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';
import { send } from './helpers/supertest-lite.js';
import { createApp } from '../../apps/api/src/app.js';
import { resetCmsStore } from '../../apps/api/src/cms-store/index.js';
import { bootstrapCms, resetBootstrapFlag } from '../../apps/api/src/bootstrap/cms.js';
import { memoryCache } from '../../apps/api/src/cache/index.js';
import { mailOutbox, resetMailOutbox } from '../../apps/api/src/modules/settings/mailer.js';
import { bookingNeedsReminder } from '../../apps/api/src/modules/bookings/reminders.js';
import { sendDueBookingReminders } from '../../apps/api/src/modules/bookings/reminders.js';
import { bookingGuestEmail } from '../../apps/api/src/modules/settings/email-templates.js';

const adminEmail = 'info@gms.co.tz';
const adminPassword = '1234gms';

async function setup() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'gm-mail-'));
  process.env.CMS_SEED_SAFARIS = 'false';
  memoryCache.reset();
  resetBootstrapFlag();
  resetMailOutbox();
  await resetCmsStore(dir);
  await bootstrapCms();
  return createApp();
}

async function login(app) {
  const res = await send(app, 'POST', '/api/v1/admin/auth/login', { email: adminEmail, password: adminPassword });
  expect(res.status).toBe(200);
  return res.body.data.token;
}

function auth(token) {
  return { Authorization: `Bearer ${token}` };
}

describe('email, bookings, and password reset', () => {
  let app;

  beforeEach(async () => {
    app = await setup();
  });

  it('emails guest and staff when a public booking is created', async () => {
    const res = await send(app, 'POST', '/api/v1/bookings', {
      name: 'Amina Guest',
      email: 'amina@example.com',
      safari: 'Serengeti Classic',
      travelDate: '2026-10-01',
      travellers: '2',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.code).toMatch(/^BK-/);
    expect(mailOutbox.some((item) => item.to === 'amina@example.com' && /Booking received/i.test(item.subject))).toBe(true);
    expect(mailOutbox.some((item) => /New booking/i.test(item.subject))).toBe(true);
    const list = await send(app, 'GET', '/api/v1/admin/bookings');
    expect(list.body.data[0].email).toBe('amina@example.com');
    expect(list.body.data[0].travelDate).toBe('2026-10-01');
    expect(list.body.data[0].adults).toBe(2);
    expect(list.body.data[0].children).toBe(0);
  });

  it('stores child count and ages on a public booking', async () => {
    const res = await send(app, 'POST', '/api/v1/bookings', {
      name: 'Amina Guest',
      email: 'family@example.com',
      safari: 'Tarangire Family Safari',
      travelDate: '2026-11-12',
      adults: 2,
      children: 2,
      childDetails: [
        { name: 'Liam', age: 8 },
        { name: 'Nora', age: 5 },
      ],
    });
    expect(res.status).toBe(201);
    const list = await send(app, 'GET', '/api/v1/admin/bookings');
    const row = list.body.data[0];
    expect(row.children).toBe(2);
    expect(row.adults).toBe(2);
    expect(row.travellers).toBe(4);
    expect(row.childDetails).toEqual([
      { name: 'Liam', age: 8, index: 0 },
      { name: 'Nora', age: 5, index: 1 },
    ]);
  });

  it('sends a 24-hour travel reminder once', async () => {
    const tomorrow = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString().slice(0, 10);
    await send(app, 'POST', '/api/v1/bookings', {
      name: 'Johan Traveller',
      email: 'johan@example.com',
      safari: 'Ngorongoro Crater',
      travelDate: tomorrow,
    });
    resetMailOutbox();
    const first = await sendDueBookingReminders();
    expect(first.sent).toBe(1);
    expect(mailOutbox.some((item) => /tomorrow/i.test(item.subject) && item.to === 'johan@example.com')).toBe(true);
    const second = await sendDueBookingReminders();
    expect(second.sent).toBe(0);
  });

  it('resets a CMS password from the emailed link', async () => {
    const forgot = await send(app, 'POST', '/api/v1/admin/auth/forgot', { email: adminEmail });
    expect(forgot.status).toBe(200);
    const mail = mailOutbox.find((item) => /Reset your CMS password/i.test(item.subject));
    expect(mail).toBeTruthy();
    const token = mail.text.match(/token=([a-f0-9]+)/)?.[1];
    expect(token).toBeTruthy();
    const reset = await send(app, 'POST', '/api/v1/admin/auth/reset', { token, password: 'NewPass!234' });
    expect(reset.status).toBe(200);
    const oldLogin = await send(app, 'POST', '/api/v1/admin/auth/login', { email: adminEmail, password: adminPassword });
    expect(oldLogin.status).toBe(401);
    const nextLogin = await send(app, 'POST', '/api/v1/admin/auth/login', { email: adminEmail, password: 'NewPass!234' });
    expect(nextLogin.status).toBe(200);
  });

  it('lets staff send a test email from settings', async () => {
    const token = await login(app);
    const res = await send(app, 'POST', '/api/v1/admin/settings/test-email', { to: 'ops@gmsafaris.com' }, auth(token));
    expect(res.status).toBe(200);
    expect(mailOutbox.some((item) => item.to === 'ops@gmsafaris.com' && /SMTP test/i.test(item.subject))).toBe(true);
  });

  it('never returns the SMTP password to the CMS', async () => {
    const token = await login(app);
    const res = await send(app, 'GET', '/api/v1/admin/settings', undefined, auth(token));
    expect(res.status).toBe(200);
    const pass = res.body.data?.email?.smtpPass || '';
    expect(pass === '' || pass === '••••••••').toBe(true);
    expect(JSON.stringify(res.body)).not.toMatch(/qpgi|dghe|jrjz/i);
  });
});

describe('booking reminder window', () => {
  it('flags bookings whose travel date is within 24 hours', () => {
    const now = new Date('2026-09-21T12:00:00.000Z');
    expect(
      bookingNeedsReminder(
        { email: 'a@b.c', travelDate: '2026-09-22', status: 'Confirmed' },
        now
      )
    ).toBe(true);
    expect(
      bookingNeedsReminder(
        { email: 'a@b.c', travelDate: '2026-09-30', status: 'Confirmed' },
        now
      )
    ).toBe(false);
    expect(
      bookingNeedsReminder(
        { email: 'a@b.c', travelDate: '2026-09-22', status: 'Cancelled' },
        now
      )
    ).toBe(false);
    expect(
      bookingNeedsReminder(
        { email: 'a@b.c', travelDate: '2026-09-22', reminderSentAt: now.toISOString() },
        now
      )
    ).toBe(false);
  });

  it('puts gmsafaris.com in branded booking templates', () => {
    const mail = bookingGuestEmail({
      code: 'BK-1',
      customerName: 'Amina',
      safariTitle: 'Serengeti Classic',
      travelDate: '2026-10-01',
      travellers: '2',
    });
    expect(mail.html).toContain('gmsafaris.com');
    expect(mail.html).toContain('Golden Memories Safaris');
  });
});
