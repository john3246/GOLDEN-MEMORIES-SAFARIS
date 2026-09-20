import { readStore, updateStore } from '../../cms-store/index.js';
import { logger } from '../../logging/index.js';
import { sendSiteMail, loadMailSettings } from '../settings/mailer.js';
import { bookingReminderEmail } from '../settings/email-templates.js';

const DAY_MS = 24 * 60 * 60 * 1000;

export function parseTravelDate(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return new Date(`${raw}T00:00:00.000Z`);
  }
  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) ? new Date(parsed) : null;
}

/**
 * Reminder window: 24 hours before the travel date through the travel day.
 */
export function bookingNeedsReminder(booking, now = new Date()) {
  if (!booking?.email || !booking.travelDate || booking.reminderSentAt) return false;
  if (/cancel|refund/i.test(booking.status || '')) return false;
  const travel = parseTravelDate(booking.travelDate);
  if (!travel) return false;
  const start = travel.getTime();
  const at = now.getTime();
  return at > start - DAY_MS && at < start + DAY_MS;
}

export async function sendDueBookingReminders(now = new Date()) {
  const store = await readStore();
  const due = (store.bookings || []).filter((row) => bookingNeedsReminder(row, now));
  if (!due.length) return { sent: 0 };
  const settings = await loadMailSettings();
  let sent = 0;
  for (const booking of due) {
    const mail = bookingReminderEmail(booking, settings);
    const result = await sendSiteMail({
      to: booking.email,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    });
    await updateStore((next) => {
      const item = (next.bookings || []).find((row) => row.id === booking.id);
      if (item) {
        item.reminderSentAt = now.toISOString();
        item.updated_at = now.toISOString();
      }
    });
    if (result.sent || result.reason === 'smtp-not-configured') sent += 1;
    else logger.error('Booking reminder failed', { id: booking.id, reason: result.reason });
  }
  if (sent) logger.info('Booking reminders processed', { sent });
  return { sent };
}
