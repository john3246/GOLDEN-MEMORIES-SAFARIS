import { site } from '../../pages/home/content.js';

function telHref(phone) {
  return `tel:${phone.replace(/\s+/g, '')}`;
}

function whatsappHref(phone) {
  return `https://wa.me/${phone.replace(/\D/g, '')}`;
}

/**
 * Bottom-right action stack: WhatsApp, call, email.
 */
export function renderFab() {
  return `
    <div class="site-fab" data-site-fab>
      <a class="site-fab-item site-fab-mail" href="mailto:${site.email}" aria-label="Email ${site.email}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
      </a>
      <a class="site-fab-item site-fab-call" href="${telHref(site.phone)}" aria-label="Call ${site.phone}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
      </a>
      <a class="site-fab-main" href="${whatsappHref(site.phone)}" target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.15 6.4 2.15 11.83c0 1.74.46 3.44 1.34 4.94L2 22l5.38-1.41a10 10 0 0 0 4.66 1.13h.01c5.46 0 9.89-4.4 9.89-9.83S17.5 2 12.04 2zm5.76 14.2c-.24.68-1.4 1.3-1.94 1.38-.5.07-1.13.1-1.82-.11-.42-.14-.96-.31-1.66-.61-2.92-1.26-4.82-4.2-4.97-4.4-.14-.2-1.18-1.57-1.18-3 0-1.41.74-2.11 1-2.4.24-.27.64-.39.86-.39h.62c.2 0 .46-.05.72.55.27.64.91 2.22.99 2.38.08.16.13.35.03.56-.1.22-.16.35-.31.54-.16.19-.33.42-.47.56-.16.16-.32.33-.14.64.19.32.84 1.38 1.8 2.24 1.24 1.1 2.28 1.45 2.6 1.61.32.16.5.13.69-.08.19-.2.8-.93 1.02-1.25.21-.32.43-.26.72-.16.3.1 1.88.89 2.2 1.05.32.16.54.24.62.38.08.13.08.77-.16 1.45z"/></svg>
      </a>
    </div>
  `;
}
