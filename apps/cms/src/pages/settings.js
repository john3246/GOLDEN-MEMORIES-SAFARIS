import { api } from '../api/client.js';
import { shell } from './shell.js';
import { notifyError, notifySuccess } from '../components/toast.js';

function field(label, name, value, type = 'text') {
  if (type === 'textarea') {
    return `<div class="cms-field"><label class="cms-label" for="${name}">${label}</label><textarea id="${name}" name="${name}">${value || ''}</textarea></div>`;
  }
  if (type === 'checkbox') {
    return `<label class="cms-check"><input type="checkbox" name="${name}" ${value ? 'checked' : ''} /> ${label}</label>`;
  }
  return `<div class="cms-field"><label class="cms-label" for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${value || ''}" /></div>`;
}

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
          <p class="cms-lead">Contact details, SEO defaults, and outbound email. These values drive the public website on gmsafaris.com, booking confirmations, travel reminders, and password resets.</p>
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
      <h2 class="cms-hub-title">SEO defaults</h2>
      ${field('Default title', 'defaultTitle', seo.defaultTitle)}
      ${field('Default description', 'defaultDescription', seo.defaultDescription, 'textarea')}
    </div>
    <div class="cms-panel cms-form-stack">
      <h2 class="cms-hub-title">Email configuration</h2>
      <p class="cms-muted">Used for booking confirmations (guest and staff), 24-hour travel reminders, password resets, and contact-form replies. Fill SMTP from your mailbox provider (for example Gmail, Zoho, or the gmsafaris.com mail host).</p>
      ${field('From name', 'fromName', email.fromName)}
      ${field('From email', 'fromEmail', email.fromEmail, 'email')}
      ${field('Reply-to', 'replyTo', email.replyTo, 'email')}
      ${field('Notify staff at', 'notifyTo', email.notifyTo, 'email')}
      ${field('SMTP host', 'smtpHost', email.smtpHost)}
      ${field('SMTP port', 'smtpPort', email.smtpPort)}
      ${field('SMTP username', 'smtpUser', email.smtpUser)}
      ${field('SMTP password', 'smtpPass', email.smtpPass, 'password')}
      ${field('Use TLS/SSL', 'smtpSecure', email.smtpSecure, 'checkbox')}
      <div class="cms-editor-actions">
        <button class="cms-btn" type="button" data-test-email>Send test email</button>
      </div>
      <p class="cms-muted" id="settings-mail" hidden></p>
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
        },
        email: {
          fromName: fd.get('fromName'),
          fromEmail: fd.get('fromEmail'),
          replyTo: fd.get('replyTo'),
          notifyTo: fd.get('notifyTo'),
          smtpHost: fd.get('smtpHost'),
          smtpPort: fd.get('smtpPort'),
          smtpUser: fd.get('smtpUser'),
          smtpPass: fd.get('smtpPass'),
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
