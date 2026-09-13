import { site } from '../home/content.js';
import { contactHero, contactIntro, getContactDetails, contactMap, contactFormCopy } from './content.js';
import { submitInquiry } from '../../services/api/cms.js';

/**
 * Contact page — live GM copy, map, and form fields with current site UI.
 */
export function renderContact() {
  const details = getContactDetails()
    .map((item) => {
      const value = item.href
        ? `<a class="font-semibold text-black hover:text-gold-deep" href="${item.href}">${item.value}</a>`
        : `<p class="font-semibold text-black">${item.value}</p>`;
      return `
        <div class="border-b border-black/10 pb-4">
          <p class="font-body text-xs font-bold uppercase tracking-[0.12em] text-gold-deep">${item.label}</p>
          <div class="mt-2 font-body text-base">${value}</div>
        </div>
      `;
    })
    .join('');

  return `
    <main id="main">
      <section class="page-hero relative isolate overflow-hidden text-white" aria-labelledby="contact-hero-title">
        <img
          class="absolute inset-0 h-full w-full object-cover"
          src="${contactHero.image}"
          alt="Contact Golden Memories Safaris in Arusha"
          width="2000"
          height="900"
          fetchpriority="high"
        />
        <div class="absolute inset-0 bg-black/55"></div>
        <div class="container-site relative flex min-h-[11rem] flex-col items-center justify-center py-8 text-center sm:min-h-[13rem] lg:min-h-[14rem]">
          <p class="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-1.5 font-body text-xs font-bold uppercase tracking-[0.14em] text-black">
            ${contactHero.kicker}
          </p>
          <h1 id="contact-hero-title" class="mt-5 max-w-4xl font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            ${contactHero.title}
          </h1>
          <a class="btn-navy mt-8 !rounded-none" href="#contact-form">${contactHero.cta}</a>
        </div>
      </section>

      <nav class="bg-white py-4" aria-label="Breadcrumb">
        <div class="container-site font-body text-sm text-black/60">
          <a class="hover:text-gold-deep" href="/">Home</a>
          <span aria-hidden="true"> › </span>
          <span class="text-black">Contact</span>
        </div>
      </nav>

      <section class="bg-gold py-8 sm:py-10" aria-labelledby="contact-intro-title">
        <div class="container-site grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
          <div class="reveal bg-white p-6 sm:p-10">
            <p class="section-kicker">${contactIntro.kicker}</p>
            <h2 id="contact-intro-title" class="section-title">${contactIntro.title}</h2>
            <p class="mt-5 font-body text-base leading-relaxed text-ink/75">${contactIntro.body}</p>
            <div class="mt-8 space-y-5">
              ${details}
            </div>
            <a class="btn-navy mt-8 !rounded-none" href="https://wa.me/255786383273" rel="noreferrer">Chat on WhatsApp</a>
          </div>

          <div class="reveal bg-white p-6 sm:p-10" id="contact-form">
            <h2 class="section-title">${contactFormCopy.title}</h2>
            <p class="mt-4 font-body text-base leading-relaxed text-ink/75">${contactFormCopy.body}</p>
            <form class="contact-form mt-8" data-contact-form>
              <label>
                <span>Your Name *</span>
                <input type="text" name="name" required placeholder="John Doe" autocomplete="name" />
              </label>
              <label>
                <span>Your Email *</span>
                <input type="email" name="email" required placeholder="john.doe@example.com" autocomplete="email" />
              </label>
              <label>
                <span>Phone Number</span>
                <input type="tel" name="phone" placeholder="${site.phone}" autocomplete="tel" />
              </label>
              <label>
                <span>Country</span>
                <input type="text" name="country" placeholder="Your Country" autocomplete="country-name" />
              </label>
              <label class="contact-form-full">
                <span>Subject *</span>
                <input type="text" name="subject" required placeholder="e.g., Safari Inquiry, Kilimanjaro Question" />
              </label>
              <label class="contact-form-full">
                <span>Message *</span>
                <textarea name="message" required rows="6" placeholder="Please describe your inquiry in detail..."></textarea>
              </label>
              <p class="contact-form-full" data-contact-note hidden></p>
              <button class="btn-navy contact-form-full !rounded-none" type="submit">Send Message</button>
            </form>
          </div>
        </div>
      </section>

      <section class="bg-black py-8 sm:py-10" aria-labelledby="map-title">
        <div class="container-site">
          <div class="reveal max-w-2xl">
            <p class="section-kicker !text-gold">Visit us</p>
            <h2 id="map-title" class="section-title !text-white">${contactMap.title}</h2>
          </div>
          <div class="reveal contact-map mt-8">
            <iframe
              title="Golden Memories Safaris office on Google Maps"
              src="${contactMap.src}"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              allowfullscreen
            ></iframe>
          </div>
        </div>
      </section>
    </main>
  `;
}

export function initContactForm() {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const note = form.querySelector('[data-contact-note]');
    const payload = {
      name: String(data.get('name') || ''),
      email: String(data.get('email') || ''),
      phone: String(data.get('phone') || ''),
      country: String(data.get('country') || ''),
      subject: String(data.get('subject') || 'Safari inquiry'),
      message: String(data.get('message') || ''),
    };
    try {
      await submitInquiry(payload);
      form.reset();
      if (note) {
        note.hidden = false;
        note.textContent = 'Thank you. Your message is with our Arusha team — we aim to reply within 24 hours.';
      }
    } catch {
      const body = [
        `Name: ${payload.name}`,
        `Email: ${payload.email}`,
        `Phone: ${payload.phone}`,
        `Country: ${payload.country}`,
        '',
        payload.message,
      ].join('\n');
      window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(payload.subject)}&body=${encodeURIComponent(body)}`;
      if (note) {
        note.hidden = false;
        note.textContent = 'Thank you. Your email app should open with the message. We aim to reply within 24 hours.';
      }
    }
  });
}
