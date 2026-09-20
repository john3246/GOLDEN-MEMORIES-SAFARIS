import { config } from '../../config/index.js';
import { DEFAULT_SETTINGS } from '../content/content.seed.js';
import { partySummary, childDetailsSummary } from '../bookings/bookings.dto.js';

export function publicSiteUrl(settings) {
  return (
    settings?.site?.websiteUrl ||
    config.sites?.com ||
    'https://www.gmsafaris.com'
  ).replace(/\/$/, '');
}

export function cmsSiteUrl(settings) {
  const explicit = settings?.site?.cmsUrl;
  if (explicit) return String(explicit).replace(/\/$/, '');
  if (config.isDevelopment) return 'http://localhost:5173';
  return `${publicSiteUrl(settings)}/cms`;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function layout({ title, intro, rows = [], cta, footer, siteUrl }) {
  const list = rows
    .filter((row) => row.value)
    .map(
      (row) =>
        `<tr><td style="padding:8px 0;color:#5c564c;width:140px">${escapeHtml(row.label)}</td><td style="padding:8px 0;color:#111">${escapeHtml(row.value)}</td></tr>`
    )
    .join('');
  return {
    subject: title,
    text: [title, intro, ...rows.filter((row) => row.value).map((row) => `${row.label}: ${row.value}`), cta?.href, footer]
      .filter(Boolean)
      .join('\n\n'),
    html: `<!doctype html>
<html><body style="margin:0;background:#f4f1ea;font-family:Georgia,serif;color:#111">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ea;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border:1px solid #e6dfd0">
        <tr><td style="background:#0b1c33;padding:20px 28px">
          <p style="margin:0;color:#c4a455;letter-spacing:.16em;font-size:11px;text-transform:uppercase">Golden Memories Safaris</p>
          <p style="margin:8px 0 0;color:#fff;font-size:22px">${escapeHtml(title)}</p>
        </td></tr>
        <tr><td style="padding:28px">
          <p style="margin:0 0 16px;line-height:1.6">${escapeHtml(intro)}</p>
          ${list ? `<table role="presentation" width="100%" style="margin:16px 0">${list}</table>` : ''}
          ${
            cta?.href
              ? `<p style="margin:24px 0 0"><a href="${escapeHtml(cta.href)}" style="display:inline-block;background:#c4a455;color:#111;text-decoration:none;padding:12px 20px;font-weight:bold">${escapeHtml(cta.label)}</a></p>`
              : ''
          }
        </td></tr>
        <tr><td style="padding:16px 28px;background:#faf7f1;color:#5c564c;font-size:13px">
          ${escapeHtml(footer)}<br>
          <a href="${escapeHtml(siteUrl)}" style="color:#0b1c33">${escapeHtml(siteUrl.replace(/^https?:\/\//, ''))}</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
  };
}

export function bookingGuestEmail(booking, settings = DEFAULT_SETTINGS) {
  const siteUrl = publicSiteUrl(settings);
  return layout({
    title: `Booking received — ${booking.code}`,
    intro: `Dear ${booking.customerName || 'traveller'}, thank you for booking with Golden Memories Safaris. Our Arusha team has your request and will confirm lodges, park fees, and the vehicle.`,
    rows: [
      { label: 'Reference', value: booking.code },
      { label: 'Safari', value: booking.safariTitle },
      { label: 'Travel date', value: booking.travelDate },
      { label: 'Party', value: partySummary(booking) },
      { label: 'Children', value: childDetailsSummary(booking) },
      { label: 'Amount', value: booking.amount ? `USD ${booking.amount}` : '' },
    ],
    cta: { label: 'Visit gmsafaris.com', href: siteUrl },
    footer: 'Golden Memories Safaris · Njiro, Arusha, Tanzania · +255 786 383 273',
    siteUrl,
  });
}

export function bookingAdminEmail(booking, settings = DEFAULT_SETTINGS) {
  const siteUrl = publicSiteUrl(settings);
  return layout({
    title: `New booking ${booking.code}`,
    intro: 'A guest submitted a safari booking. Confirm availability and reply from the CMS Bookings tab.',
    rows: [
      { label: 'Guest', value: booking.customerName },
      { label: 'Email', value: booking.email },
      { label: 'Phone', value: booking.phone },
      { label: 'Safari', value: booking.safariTitle },
      { label: 'Travel date', value: booking.travelDate },
      { label: 'Party', value: partySummary(booking) },
      { label: 'Children', value: childDetailsSummary(booking) },
      { label: 'Notes', value: booking.notes },
    ],
    cta: { label: 'Open CMS', href: `${cmsSiteUrl(settings)}/#/bookings` },
    footer: 'Internal notification — Golden Memories Safaris',
    siteUrl,
  });
}

export function bookingReminderEmail(booking, settings = DEFAULT_SETTINGS) {
  const siteUrl = publicSiteUrl(settings);
  return layout({
    title: `Your safari is tomorrow — ${booking.code}`,
    intro: `Dear ${booking.customerName || 'traveller'}, this is a reminder that your Golden Memories safari is within 24 hours. Please keep your passport, travel insurance, and our Arusha contacts handy.`,
    rows: [
      { label: 'Reference', value: booking.code },
      { label: 'Safari', value: booking.safariTitle },
      { label: 'Travel date', value: booking.travelDate },
      { label: 'Party', value: partySummary(booking) },
      { label: 'Office', value: '+255 786 383 273 · info@gmsafaris.com' },
    ],
    cta: { label: 'gmsafaris.com', href: siteUrl },
    footer: 'We look forward to welcoming you in Tanzania.',
    siteUrl,
  });
}

export function passwordResetEmail({ name, resetUrl }, settings = DEFAULT_SETTINGS) {
  const siteUrl = publicSiteUrl(settings);
  return layout({
    title: 'Reset your CMS password',
    intro: `Hi ${name || 'there'}, we received a request to reset the Golden Memories Safaris CMS password. This link expires in one hour. If you did not ask for it, ignore this email.`,
    rows: [],
    cta: { label: 'Choose a new password', href: resetUrl },
    footer: 'Golden Memories Safaris staff access only.',
    siteUrl,
  });
}

export function inquiryGuestEmail(inquiry, settings = DEFAULT_SETTINGS) {
  const siteUrl = publicSiteUrl(settings);
  return layout({
    title: 'We received your message',
    intro: `Dear ${inquiry.name}, thank you for writing to Golden Memories Safaris. The Arusha team aims to reply within 24 hours.`,
    rows: [
      { label: 'Subject', value: inquiry.subject },
      { label: 'Safari', value: inquiry.safari },
    ],
    cta: { label: 'gmsafaris.com', href: siteUrl },
    footer: 'Golden Memories Safaris · Njiro, Arusha',
    siteUrl,
  });
}

export function inquiryAdminEmail(inquiry, settings = DEFAULT_SETTINGS) {
  const siteUrl = publicSiteUrl(settings);
  return layout({
    title: inquiry.subject || 'New website inquiry',
    intro: 'A message arrived from gmsafaris.com.',
    rows: [
      { label: 'Name', value: inquiry.name },
      { label: 'Email', value: inquiry.email },
      { label: 'Phone', value: inquiry.phone },
      { label: 'Country', value: inquiry.country },
      { label: 'Message', value: inquiry.message },
    ],
    cta: { label: 'Open inquiries', href: `${cmsSiteUrl(settings)}/#/inquiries` },
    footer: 'Internal notification',
    siteUrl,
  });
}

export function smtpTestEmail(settings = DEFAULT_SETTINGS) {
  const siteUrl = publicSiteUrl(settings);
  return layout({
    title: 'SMTP test from Golden Memories Safaris',
    intro: 'This confirms outbound email is working for booking confirmations, travel reminders, and password resets on gmsafaris.com.',
    rows: [{ label: 'From', value: settings.email?.fromEmail || 'info@gmsafaris.com' }],
    cta: { label: 'gmsafaris.com', href: siteUrl },
    footer: 'You can ignore this message if you were only testing SMTP.',
    siteUrl,
  });
}
