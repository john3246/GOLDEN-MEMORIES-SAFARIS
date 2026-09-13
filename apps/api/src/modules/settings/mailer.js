import { readStore } from '../../cms-store/index.js';
import { DEFAULT_SETTINGS } from '../content/content.seed.js';

/**
 * Best-effort outbound mail. SMTP is configured in CMS site settings.
 * If nodemailer is not installed or SMTP is empty, the inquiry is still stored.
 */
export async function sendSiteMail({ to, subject, text, replyTo }) {
  const store = await readStore();
  const email = store.settings?.email || DEFAULT_SETTINGS.email;
  if (!email.smtpHost || !to) {
    return { sent: false, reason: 'smtp-not-configured' };
  }
  try {
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.createTransport({
      host: email.smtpHost,
      port: Number(email.smtpPort || 587),
      secure: Boolean(email.smtpSecure),
      auth: email.smtpUser ? { user: email.smtpUser, pass: email.smtpPass || '' } : undefined,
    });
    await transporter.sendMail({
      from: `"${email.fromName || 'Golden Memories Safaris'}" <${email.fromEmail || email.smtpUser}>`,
      to,
      replyTo: replyTo || email.replyTo || email.fromEmail,
      subject,
      text,
    });
    return { sent: true };
  } catch (err) {
    return { sent: false, reason: err.message || 'send-failed' };
  }
}
