import { config } from '../../config/index.js';
import { DEFAULT_SETTINGS } from '../content/content.seed.js';
import { partySummary, childDetailsSummary } from '../bookings/bookings.dto.js';

/**
 * Transactional email templates.
 *
 * Every subject line and opening paragraph can be changed in
 * CMS → Site settings → Email templates. Placeholders:
 *   {{name}} {{code}} {{safari}} {{date}} {{party}} {{site}} {{phone}} {{email}}
 * Contact details in the footer come from Site settings, not hard-coded text.
 */

export function publicSiteUrl(settings) {
  return (settings?.site?.websiteUrl || config.sites?.com || 'https://www.gmsafaris.com').replace(/\/$/, '');
}

export function cmsSiteUrl(settings) {
  const explicit = settings?.site?.cmsUrl;
  if (explicit) return String(explicit).replace(/\/$/, '');
  if (!config.isProduction && !config.servePublic) return 'http://localhost:5173';
  if (!config.isProduction) return `http://localhost:${config.port}/cms`;
  return `${publicSiteUrl(settings)}/cms`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function site(settings) {
  return { ...DEFAULT_SETTINGS.site, ...(settings?.site || {}) };
}

function fill(template, vars) {
  return String(template || '').replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, key) => (vars[key] != null ? String(vars[key]) : ''));
}

function custom(settings, key, fallback, vars) {
  const override = settings?.emailTemplates?.[key] || {};
  return {
    subject: fill(String(override.subject || '').trim() || fallback.subject, vars),
    intro: fill(String(override.intro || '').trim() || fallback.intro, vars),
  };
}

function footerLine(settings) {
  const s = site(settings);
  return [s.name || 'Golden Memories Safaris', s.address, s.phone, s.email].filter(Boolean).join(' · ');
}

function layout({ subject, heading, intro, rows = [], cta, footer, siteUrl, preheader, after }) {
  const visible = rows.filter((row) => row.value !== undefined && row.value !== null && String(row.value).trim() !== '');
  const list = visible
    .map(
      (row) =>
        `<tr><td style="padding:8px 12px 8px 0;color:#5c564c;width:140px;vertical-align:top;font-size:14px">${escapeHtml(row.label)}</td><td style="padding:8px 0;color:#111;font-size:14px;white-space:pre-line">${escapeHtml(row.value)}</td></tr>`
    )
    .join('');
  return {
    subject,
    text: [heading || subject, intro, ...visible.map((row) => `${row.label}: ${row.value}`), after, cta?.href ? `${cta.label}: ${cta.href}` : '', footer]
      .filter(Boolean)
      .join('\n\n'),
    html: `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;background:#f4f1ea;font-family:Georgia,'Times New Roman',serif;color:#111">
  <span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden">${escapeHtml(preheader || intro).slice(0, 140)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ea;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border:1px solid #e6dfd0">
        <tr><td style="background:#0b1c33;padding:22px 28px">
          <p style="margin:0;color:#c4a455;letter-spacing:.16em;font-size:11px;text-transform:uppercase;font-family:Arial,sans-serif">Golden Memories Safaris</p>
          <p style="margin:8px 0 0;color:#fff;font-size:22px;line-height:1.3">${escapeHtml(heading || subject)}</p>
        </td></tr>
        <tr><td style="padding:28px">
          <p style="margin:0 0 16px;line-height:1.65;font-size:16px">${escapeHtml(intro)}</p>
          ${list ? `<table role="presentation" width="100%" style="margin:16px 0;border-top:1px solid #eee7d8">${list}</table>` : ''}
          ${after ? `<p style="margin:16px 0 0;line-height:1.65;font-size:15px;color:#333">${escapeHtml(after)}</p>` : ''}
          ${
            cta?.href
              ? `<p style="margin:24px 0 0"><a href="${escapeHtml(cta.href)}" style="display:inline-block;background:#c4a455;color:#111;text-decoration:none;padding:12px 22px;font-weight:bold;font-family:Arial,sans-serif;font-size:14px">${escapeHtml(cta.label)}</a></p>`
              : ''
          }
        </td></tr>
        <tr><td style="padding:16px 28px;background:#faf7f1;color:#5c564c;font-size:12px;line-height:1.6;font-family:Arial,sans-serif">
          ${escapeHtml(footer)}<br>
          <a href="${escapeHtml(siteUrl)}" style="color:#0b1c33">${escapeHtml(siteUrl.replace(/^https?:\/\//, ''))}</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
  };
}

function vars(settings, extra = {}) {
  const s = site(settings);
  return { site: s.name || 'Golden Memories Safaris', phone: s.phone || '', email: s.email || '', ...extra };
}

export function bookingGuestEmail(booking, settings = DEFAULT_SETTINGS) {
  const siteUrl = publicSiteUrl(settings);
  const v = vars(settings, {
    name: booking.customerName || 'traveller',
    code: booking.code,
    safari: booking.safariTitle,
    date: booking.travelDate,
    party: partySummary(booking),
  });
  const copy = custom(
    settings,
    'bookingGuest',
    {
      subject: 'We have received your booking request — {{code}}',
      intro:
        'Dear {{name}}, thank you for choosing Golden Memories Safaris. Your booking request is with our reservations team in Arusha. We are now checking lodge and vehicle availability for your dates and will send a written confirmation with the final itinerary and payment details shortly.',
    },
    v
  );
  return layout({
    subject: copy.subject,
    heading: 'Booking request received',
    intro: copy.intro,
    rows: [
      { label: 'Reference', value: booking.code },
      { label: 'Safari', value: booking.safariTitle },
      { label: 'Travel date', value: booking.travelDate },
      { label: 'Travellers', value: partySummary(booking) },
      { label: 'Children', value: childDetailsSummary(booking) },
      { label: 'Quoted amount', value: booking.amount ? `USD ${Number(booking.amount).toLocaleString('en-US')}` : '' },
    ],
    after: `Please quote ${booking.code} in any message. If anything changes, simply reply to this email or call us on ${v.phone}.`,
    cta: { label: 'Explore our safaris', href: `${siteUrl}/tours/` },
    footer: footerLine(settings),
    siteUrl,
  });
}

export function bookingAdminEmail(booking, settings = DEFAULT_SETTINGS) {
  const siteUrl = publicSiteUrl(settings);
  const v = vars(settings, { name: booking.customerName, code: booking.code, safari: booking.safariTitle, date: booking.travelDate });
  const copy = custom(
    settings,
    'bookingAdmin',
    {
      subject: 'New booking {{code}} — {{safari}}',
      intro: 'A new booking request has arrived from the website. Please confirm availability and reply to the guest.',
    },
    v
  );
  return layout({
    subject: copy.subject,
    heading: `New booking ${booking.code}`,
    intro: copy.intro,
    rows: [
      { label: 'Guest', value: booking.customerName },
      { label: 'Email', value: booking.email },
      { label: 'Phone', value: booking.phone },
      { label: 'Country', value: booking.country },
      { label: 'Safari', value: booking.safariTitle },
      { label: 'Travel date', value: booking.travelDate },
      { label: 'Travellers', value: partySummary(booking) },
      { label: 'Children', value: childDetailsSummary(booking) },
      { label: 'Notes', value: booking.notes },
    ],
    cta: { label: 'Open booking in the CMS', href: `${cmsSiteUrl(settings)}/#/bookings/${booking.id}` },
    footer: 'Internal notification — reply to this email to answer the guest directly.',
    siteUrl,
  });
}

export function bookingReminderEmail(booking, settings = DEFAULT_SETTINGS) {
  const siteUrl = publicSiteUrl(settings);
  const v = vars(settings, { name: booking.customerName || 'traveller', code: booking.code, safari: booking.safariTitle, date: booking.travelDate });
  const copy = custom(
    settings,
    'bookingReminder',
    {
      subject: 'Your safari starts soon — {{code}}',
      intro:
        'Dear {{name}}, we are looking forward to welcoming you to Tanzania. Your safari begins within the next 24 hours. Please keep your passport, travel insurance details and our contact number close to hand. Your guide will meet you at the agreed pick-up point.',
    },
    v
  );
  return layout({
    subject: copy.subject,
    heading: 'See you soon in Tanzania',
    intro: copy.intro,
    rows: [
      { label: 'Reference', value: booking.code },
      { label: 'Safari', value: booking.safariTitle },
      { label: 'Start date', value: booking.travelDate },
      { label: 'Travellers', value: partySummary(booking) },
      { label: '24/7 contact', value: [v.phone, v.email].filter(Boolean).join(' · ') },
    ],
    cta: { label: 'Visit our website', href: siteUrl },
    footer: footerLine(settings),
    siteUrl,
  });
}

export function passwordResetEmail({ name, resetUrl }, settings = DEFAULT_SETTINGS) {
  const siteUrl = publicSiteUrl(settings);
  const copy = custom(
    settings,
    'passwordReset',
    {
      subject: 'Reset your Golden Memories Safaris CMS password',
      intro:
        'Hi {{name}}, we received a request to reset your CMS password. Use the button below within the next hour. If you did not request this, you can safely ignore this email — your password will not change.',
    },
    vars(settings, { name: name || 'there' })
  );
  return layout({
    subject: copy.subject,
    heading: 'Reset your password',
    intro: copy.intro,
    rows: [],
    cta: { label: 'Choose a new password', href: resetUrl },
    footer: 'Staff access only. Never share this link.',
    siteUrl,
  });
}

export function staffWelcomeEmail({ name, email, role }, settings = DEFAULT_SETTINGS) {
  const siteUrl = publicSiteUrl(settings);
  return layout({
    subject: 'Your Golden Memories Safaris CMS account',
    heading: 'Welcome to the CMS',
    intro: `Hi ${name || 'there'}, an administrator has created a CMS account for you. Sign in with this email address and the password you were given, then change it under "My profile".`,
    rows: [
      { label: 'Email', value: email },
      { label: 'Role', value: role },
    ],
    cta: { label: 'Sign in to the CMS', href: `${cmsSiteUrl(settings)}/#/login` },
    footer: 'Staff access only. If you were not expecting this, please tell us.',
    siteUrl,
  });
}

export function inquiryGuestEmail(inquiry, settings = DEFAULT_SETTINGS) {
  const siteUrl = publicSiteUrl(settings);
  const v = vars(settings, { name: inquiry.name, safari: inquiry.safari });
  const copy = custom(
    settings,
    'inquiryGuest',
    {
      subject: 'Thank you for contacting Golden Memories Safaris',
      intro:
        'Dear {{name}}, thank you for your message. A member of our Arusha team is reviewing your request and will reply personally, usually within one working day. If your trip is urgent, call or WhatsApp us on {{phone}}.',
    },
    v
  );
  return layout({
    subject: copy.subject,
    heading: 'We have your message',
    intro: copy.intro,
    rows: [
      { label: 'Subject', value: inquiry.subject },
      { label: 'Safari of interest', value: inquiry.safari },
      { label: 'Travel dates', value: inquiry.travelDate },
      { label: 'Your message', value: inquiry.message },
    ],
    cta: { label: 'Browse safari ideas', href: `${siteUrl}/tours/` },
    footer: footerLine(settings),
    siteUrl,
  });
}

export function inquiryAdminEmail(inquiry, settings = DEFAULT_SETTINGS) {
  const siteUrl = publicSiteUrl(settings);
  const copy = custom(
    settings,
    'inquiryAdmin',
    {
      subject: 'New website inquiry: {{subject}}',
      intro: 'A new message has arrived from the website. Reply to this email to answer the guest directly.',
    },
    vars(settings, { name: inquiry.name, subject: inquiry.subject || 'Safari inquiry' })
  );
  return layout({
    subject: copy.subject,
    heading: `Inquiry from ${inquiry.name}`,
    intro: copy.intro,
    rows: [
      { label: 'Name', value: inquiry.name },
      { label: 'Email', value: inquiry.email },
      { label: 'Phone', value: inquiry.phone },
      { label: 'Country', value: inquiry.country },
      { label: 'Safari', value: inquiry.safari },
      { label: 'Travel dates', value: inquiry.travelDate },
      { label: 'Travellers', value: inquiry.travellers },
      { label: 'Message', value: inquiry.message },
      { label: 'Page', value: inquiry.page },
    ],
    cta: { label: 'Open inquiries in the CMS', href: `${cmsSiteUrl(settings)}/#/inquiries` },
    footer: 'Internal notification',
    siteUrl,
  });
}

export function smtpTestEmail(settings = DEFAULT_SETTINGS) {
  const siteUrl = publicSiteUrl(settings);
  return layout({
    subject: 'Test email from Golden Memories Safaris',
    heading: 'Email is working',
    intro:
      'This test confirms that the website can send booking confirmations, inquiry replies, travel reminders and password-reset emails.',
    rows: [
      { label: 'Sent from', value: settings.email?.fromEmail || site(settings).email },
      { label: 'Sent at', value: new Date().toUTCString() },
    ],
    cta: { label: 'Open the website', href: siteUrl },
    footer: 'You can delete this message.',
    siteUrl,
  });
}
