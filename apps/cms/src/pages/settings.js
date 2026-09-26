import { api } from '../api/client.js';
import { shell } from './shell.js';
import { notifyError, notifySuccess } from '../components/toast.js';
import { esc } from '../components/escape.js';

function field(label, name, value, type = 'text', extra = '', hint = '') {
  const help = hint ? `<p class="cms-hint">${hint}</p>` : '';
  if (type === 'textarea') {
    return `<div class="cms-field"><label class="cms-label" for="${name}">${label}</label><textarea id="${name}" name="${name}" ${extra}>${esc(value || '')}</textarea>${help}</div>`;
  }
  if (type === 'checkbox') {
    return `<label class="cms-check"><input id="${name}" name="${name}" type="checkbox" ${value ? 'checked' : ''} ${extra} /> ${label}</label>${help}`;
  }
  return `<div class="cms-field"><label class="cms-label" for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${esc(value || '')}" ${extra} />${help}</div>`;
}

const TEMPLATE_LABELS = {
  bookingGuest: 'Booking confirmation to the guest',
  bookingAdmin: 'New booking alert to staff',
  bookingReminder: '24-hour travel reminder to the guest',
  inquiryGuest: 'Inquiry auto-reply to the guest',
  inquiryAdmin: 'New inquiry alert to staff',
  passwordReset: 'CMS password reset',
};

export function renderSettings(user) {
  return shell(
    user,
    'settings',
    `
    <section class="cms-page">
      <div class="cms-page-head">
        <div>
          <p class="cms-kicker">System</p>
          <h1>Site settings</h1>
          <p class="cms-lead">Contact details, search-engine defaults, email and email wording. Changes are saved to the database and appear on the website straight away.</p>
        </div>
        <button class="cms-btn cms-btn-gold" type="button" data-save>Save settings</button>
      </div>
      <p class="cms-error" id="settings-error" hidden></p>
      <p class="cms-muted" id="settings-ok" hidden>Saved. Published pages pick this up on the next load.</p>
      <form id="settings-form" class="cms-form-stack"></form>
    </section>
  `
  );
}

export async function initSettings() {
  const form = document.querySelector('#settings-form');
  const error = document.querySelector('#settings-error');
  const ok = document.querySelector('#settings-ok');

  function socialLines(socials) {
    return (socials || []).map((item) => `${item.label} | ${item.href}`).join('\n');
  }

  function parseSocials(text) {
    return String(text || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [label, href] = line.split('|').map((part) => part.trim());
        return { label: label || 'Social', href: href || '#' };
      });
  }

  const data = await api.getSettings();
  const site = data.site || {};
  const email = data.email || {};
  const seo = data.seo || {};
  const security = data.security || {};
  const templates = data.emailTemplates || {};
  const lock = email.envLocked ? 'readonly disabled' : '';
  form.innerHTML = `
    <div class="cms-panel cms-form-stack">
      <h2 class="cms-hub-title">Public website</h2>
      ${field('Company name', 'name', site.name)}
      ${field('Short name', 'shortName', site.shortName)}
      ${field('Tagline', 'tagline', site.tagline)}
      ${field('Phone', 'phone', site.phone, 'tel')}
      ${field('Second phone', 'phoneAlt', site.phoneAlt, 'tel')}
      ${field('Public email', 'email', site.email, 'email')}
      ${field('Public website URL', 'websiteUrl', site.websiteUrl || 'https://www.gmsafaris.com', 'url')}
      ${field('CMS URL (optional)', 'cmsUrl', site.cmsUrl, 'url')}
      ${field('Address', 'address', site.address)}
      ${field('Social links (Label | URL per line)', 'socials', socialLines(site.socials), 'textarea')}
      ${field('Website is live', 'websiteLive', data.websiteLive !== false, 'checkbox')}
    </div>
    <div class="cms-panel cms-form-stack">
      <h2 class="cms-hub-title">Search engines (SEO)</h2>
      <p class="cms-hint">Every page already has its own optimised title, description and keywords. To change one page, open <a href="#/pages">Pages</a> and fill in its SEO fields; tours, destinations and blog posts have their own SEO fields too. The values below are the fall-back for anything that has none.</p>
      ${field('Fallback title', 'defaultTitle', seo.defaultTitle, 'text', 'maxlength="70"', 'Keep under 60 characters.')}
      ${field('Fallback description', 'defaultDescription', seo.defaultDescription, 'textarea', 'maxlength="170"', 'Keep between 120 and 160 characters.')}
      ${field('Fallback keywords', 'defaultKeywords', seo.defaultKeywords, 'textarea', '', 'Comma-separated.')}
      ${field('Default share image', 'defaultImage', seo.defaultImage, 'text', '', 'Shown when a page is shared on WhatsApp, Facebook or LinkedIn and has no photo of its own.')}
      ${field('Let search engines index the website', 'indexPublicPages', security.indexPublicPages !== false, 'checkbox', '', 'Untick only while the site is under construction. Sitemap: /sitemap.xml · Robots: /robots.txt')}
    </div>
    <div class="cms-panel cms-form-stack">
      <h2 class="cms-hub-title">Email configuration</h2>
      <p class="cms-muted">Used for booking confirmations (guest and staff), 24-hour travel reminders, password resets, and contact-form replies. The SMTP password is stored in the server environment, never in the public CMS store.</p>
      ${email.configured ? '<p class="cms-hint">SMTP is configured and ready to send.</p>' : '<p class="cms-hint">SMTP is not fully configured yet.</p>'}
      ${email.envLocked ? '<p class="cms-hint">Host, username, and password are locked to the server .env file. You can still change from-name, from-address, and staff notification email here.</p>' : ''}
      ${field('From name', 'fromName', email.fromName)}
      ${field('From email', 'fromEmail', email.fromEmail, 'email')}
      ${field('Reply-to', 'replyTo', email.replyTo, 'email')}
      ${field('Send staff alerts to', 'notifyTo', email.notifyTo, 'text', '', 'One or more addresses separated by commas. Staff can also switch on alerts in "My profile".')}
      ${field('SMTP host', 'smtpHost', email.smtpHost, 'text', lock)}
      ${field('SMTP port', 'smtpPort', email.smtpPort, 'text', lock)}
      ${field('SMTP username', 'smtpUser', email.smtpUser, 'text', lock)}
      ${field('SMTP password', 'smtpPass', email.smtpPass, 'password', `${lock} autocomplete="new-password" placeholder="${email.configured ? 'Stored on the server' : 'App password'}"`)}
      <p class="cms-hint">Port 587 uses STARTTLS automatically. Tick SSL only if the host requires port 465. Leave the password blank to keep the stored secret.</p>
      ${field('Use implicit SSL (port 465)', 'smtpSecure', email.smtpSecure, 'checkbox', lock)}
      <div class="cms-editor-actions">
        <button class="cms-btn" type="button" data-test-email>Send test email</button>
      </div>
      <p class="cms-muted" id="settings-mail" hidden></p>
    </div>
    <div class="cms-panel cms-form-stack">
      <h2 class="cms-hub-title">Email wording</h2>
      <p class="cms-hint">Leave a box empty to use the standard professional wording. You can use {{name}}, {{code}}, {{safari}}, {{date}}, {{party}}, {{phone}} and {{email}}.</p>
      ${Object.entries(TEMPLATE_LABELS)
        .map(
          ([key, label]) => `
        <details class="cms-template">
          <summary>${label}</summary>
          ${field('Subject line', `tpl_${key}_subject`, templates[key]?.subject)}
          ${field('Opening paragraph', `tpl_${key}_intro`, templates[key]?.intro, 'textarea', 'rows="4"')}
        </details>`
        )
        .join('')}
    </div>
  `;

  document.querySelector('[data-save]')?.addEventListener('click', async () => {
    error.hidden = true;
    ok.hidden = true;
    const fd = new FormData(form);
    try {
      await api.saveSettings({
        websiteLive: form.elements.websiteLive?.checked,
        site: {
          name: fd.get('name'),
          shortName: fd.get('shortName'),
          tagline: fd.get('tagline'),
          phone: fd.get('phone'),
          phoneAlt: fd.get('phoneAlt'),
          email: fd.get('email'),
          address: fd.get('address'),
          websiteUrl: fd.get('websiteUrl'),
          cmsUrl: fd.get('cmsUrl'),
          socials: parseSocials(fd.get('socials')),
        },
        seo: {
          defaultTitle: fd.get('defaultTitle'),
          defaultDescription: fd.get('defaultDescription'),
          defaultKeywords: fd.get('defaultKeywords'),
          defaultImage: fd.get('defaultImage'),
        },
        security: {
          indexPublicPages: form.elements.indexPublicPages?.checked,
        },
        emailTemplates: Object.fromEntries(
          Object.keys(TEMPLATE_LABELS).map((key) => [
            key,
            { subject: String(fd.get(`tpl_${key}_subject`) || '').trim(), intro: String(fd.get(`tpl_${key}_intro`) || '').trim() },
          ])
        ),
        email: {
          fromName: fd.get('fromName'),
          fromEmail: fd.get('fromEmail'),
          replyTo: fd.get('replyTo'),
          notifyTo: fd.get('notifyTo'),
          smtpHost: fd.get('smtpHost'),
          smtpPort: fd.get('smtpPort'),
          smtpUser: fd.get('smtpUser'),
          smtpPass: fd.get('smtpPass') === '••••••••' ? '' : fd.get('smtpPass'),
          smtpSecure: form.elements.smtpSecure?.checked,
        },
      });
      ok.hidden = false;
      notifySuccess('Settings saved.');
    } catch (err) {
      error.hidden = false;
      error.textContent = err.message;
      notifyError(err.message);
    }
  });

  document.querySelector('[data-test-email]')?.addEventListener('click', async () => {
    const mailNote = document.querySelector('#settings-mail');
    error.hidden = true;
    if (mailNote) mailNote.hidden = true;
    try {
      const result = await api.testEmail(form.elements.notifyTo?.value);
      if (mailNote) {
        mailNote.hidden = false;
        mailNote.textContent = result.sent
          ? `Test email sent to ${result.to}.`
          : `SMTP is not sending yet (${result.reason || 'not configured'}). Save host, user, and password, then try again.`;
      }
      if (result.sent) notifySuccess(`Test email sent to ${result.to}.`);
      else notifyError(result.reason || 'SMTP is not configured.');
    } catch (err) {
      error.hidden = false;
      error.textContent = err.message;
      notifyError(err.message);
    }
  });
}
