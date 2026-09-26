import { site } from '../home/content.js';
import { galleryPhoto } from '../../media/gallery.js';
import { submitBooking } from '../../services/api/cms.js';
import { addSpamGuards, spamFields, setBusy, showNote, isNetworkError, focusField } from '../../components/forms/form-helpers.js';
import { safariPrice } from '@gm-safaris/safari-ui';
import { allTours } from '../tours/catalog.js';
import { allJoinPackages, isJoinPackage } from '../join-safari/catalog.js';
import { safariSlugFromQuery, tourHref } from '../tours/paths.js';
import { joinHref } from '../join-safari/paths.js';

function bookableSafaris() {
  const seen = new Set();
  const list = [];
  for (const item of [...allJoinPackages(), ...allTours()]) {
    if (!item.slug || seen.has(item.slug)) continue;
    seen.add(item.slug);
    list.push(item);
  }
  return list;
}

function optionLabel(item) {
  const price = safariPrice(item);
  if (price) return `${item.title} — ${price.card}`;
  if (item.datesLabel) return `${item.title} — ${item.datesLabel}`;
  return item.title;
}

function groupedOptions(selectedSlug) {
  const items = bookableSafaris();
  const joining = items.filter(isJoinPackage);
  const climbs = items.filter((item) => /kilimanjaro|marangu|machame|lemosho|umbwe|rongai/i.test(`${item.title} ${item.slug || ''}`));
  const climbsSlugs = new Set(climbs.map((item) => item.slug));
  const joiningSlugs = new Set(joining.map((item) => item.slug));
  const privateSafaris = items.filter((item) => !joiningSlugs.has(item.slug) && !climbsSlugs.has(item.slug));

  const group = (label, rows) => {
    if (!rows.length) return '';
    return `
      <optgroup label="${label}">
        ${rows
          .map(
            (item) =>
              `<option value="${item.slug}" ${item.slug === selectedSlug ? 'selected' : ''}>${optionLabel(item)}</option>`
          )
          .join('')}
      </optgroup>
    `;
  };

  return `${group('Joining group safaris', joining)}${group('Private safaris', privateSafaris)}${group('Kilimanjaro treks', climbs)}`;
}

function selectedSafari(slug) {
  return bookableSafaris().find((item) => item.slug === slug) || null;
}

function summaryHtml(item) {
  if (!item) {
    return `<p class="font-body text-base leading-relaxed text-ink/70">Choose a safari and this form will keep it selected while you add dates and traveller details.</p>`;
  }
  const price = safariPrice(item);
  const href = isJoinPackage(item) ? joinHref(item) : tourHref(item);
  return `
    <p class="font-body text-xs font-bold uppercase tracking-[0.14em] text-gold-deep">${item.activity || 'Safari'}</p>
    <h2 class="mt-3 font-display text-2xl font-semibold text-black">${item.title}</h2>
    <p class="mt-3 font-body text-sm font-semibold uppercase tracking-[0.1em] text-ink/60">${item.duration || ''}${
      item.places ? ` · ${item.places}` : ''
    }</p>
    ${price ? `<p class="mt-4 font-body text-lg font-bold text-black">${price.hero}</p>` : ''}
    <p class="mt-4 font-body text-base leading-relaxed text-ink/75">${item.overview || ''}</p>
    <a class="btn-navy mt-6 !rounded-none" href="${href}">View itinerary</a>
  `;
}

/**
 * Booking page — safari is preselected from ?safari=slug.
 */
export function renderBooking() {
  const selectedSlug = safariSlugFromQuery();
  const current = selectedSafari(selectedSlug);

  return `
    <main id="main">
      <section class="page-hero relative isolate overflow-hidden text-white" aria-labelledby="booking-hero-title">
        <img
          class="absolute inset-0 h-full w-full object-cover"
          src="${current?.image || galleryPhoto('ngorongoro', 10)}"
          alt=""
          width="2000"
          height="900"
          fetchpriority="high"
        />
        <div class="absolute inset-0 bg-black/55"></div>
        <div class="container-site relative flex min-h-[11rem] flex-col items-center justify-center py-8 text-center sm:min-h-[13rem] lg:min-h-[14rem]">
          <p class="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-1.5 font-body text-xs font-bold uppercase tracking-[0.14em] text-black">
            Book a safari
          </p>
          <h1 id="booking-hero-title" class="mt-5 max-w-4xl font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            ${current ? `Book ${current.title}` : 'Book your Tanzania safari'}
          </h1>
          <p class="mt-4 max-w-2xl font-body text-base text-white/85 sm:text-lg">Tell us your dates and group size — we confirm lodges, park fees, and the vehicle from Arusha.</p>
        </div>
      </section>

      <nav class="bg-white py-4" aria-label="Breadcrumb">
        <div class="container-site font-body text-sm text-black/60">
          <a class="hover:text-gold-deep" href="/">Home</a>
          <span aria-hidden="true"> › </span>
          <span class="text-black">Booking</span>
        </div>
      </nav>

      <section class="bg-gold py-8 sm:py-10" aria-labelledby="booking-form-title">
        <div class="container-site grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
          <div class="reveal bg-white p-6 sm:p-10" data-booking-summary>
            ${summaryHtml(current)}
          </div>

          <div class="reveal bg-white p-6 sm:p-10" id="booking-form">
            <h2 id="booking-form-title" class="section-title">Booking request</h2>
            <p class="mt-4 font-body text-base leading-relaxed text-ink/75">The safari you chose is selected below. Change it only if you want a different itinerary.</p>
            <form class="contact-form mt-8" data-booking-form>
              <label class="contact-form-full">
                <span>Safari *</span>
                <select name="safari" required data-booking-safari>
                  <option value="">Select a safari</option>
                  ${groupedOptions(selectedSlug)}
                </select>
              </label>
              <label>
                <span>Preferred travel date *</span>
                <input type="date" name="travelDate" required />
              </label>
              <label>
                <span>Adults *</span>
                <input type="number" name="adults" required min="1" max="20" value="2" />
              </label>
              <label>
                <span>Children</span>
                <input type="number" name="children" min="0" max="12" value="0" data-booking-children />
              </label>
              <div class="contact-form-full" data-child-details hidden>
                <p class="contact-form-legend">Child details</p>
                <p class="font-body text-sm font-medium normal-case tracking-normal text-ink/70">Name and age for each child — lodges and park fees change at about 12 years.</p>
                <div data-child-rows></div>
              </div>
              <label>
                <span>Your Name *</span>
                <input type="text" name="name" required placeholder="Full name" autocomplete="name" />
              </label>
              <label>
                <span>Your Email *</span>
                <input type="email" name="email" required placeholder="you@example.com" autocomplete="email" />
              </label>
              <label>
                <span>Phone</span>
                <input type="tel" name="phone" placeholder="${site.phone}" autocomplete="tel" />
              </label>
              <label>
                <span>Country</span>
                <input type="text" name="country" placeholder="Your country" autocomplete="country-name" />
              </label>
              <label class="contact-form-full">
                <span>Message</span>
                <textarea name="message" rows="4" placeholder="Room sharing, flights into Kilimanjaro, or diet notes..."></textarea>
              </label>
              <p class="contact-form-full" data-booking-note hidden></p>
              <button class="btn-navy contact-form-full !rounded-none" type="submit">Send booking request</button>
            </form>
          </div>
        </div>
      </section>
    </main>
  `;
}

export function initBookingForm() {
  const form = document.querySelector('[data-booking-form]');
  const select = form?.querySelector('[data-booking-safari]');
  const summary = document.querySelector('[data-booking-summary]');
  const childrenInput = form?.querySelector('[data-booking-children]');
  const childWrap = form?.querySelector('[data-child-details]');
  const childRows = form?.querySelector('[data-child-rows]');

  const paintSummary = () => {
    if (!summary || !select) return;
    summary.innerHTML = summaryHtml(selectedSafari(select.value));
  };

  const paintChildren = () => {
    if (!childWrap || !childRows || !childrenInput) return;
    const count = Math.max(0, Math.min(12, Number(childrenInput.value) || 0));
    childWrap.hidden = count === 0;
    childRows.innerHTML = Array.from({ length: count }, (_, index) => `
      <div class="booking-child-row">
        <label>
          <span>Child ${index + 1} name</span>
          <input type="text" name="childName_${index}" placeholder="First name" autocomplete="off" />
        </label>
        <label>
          <span>Age *</span>
          <input type="number" name="childAge_${index}" required min="0" max="17" placeholder="Years" />
        </label>
      </div>
    `).join('');
  };

  select?.addEventListener('change', paintSummary);
  childrenInput?.addEventListener('input', paintChildren);
  childrenInput?.addEventListener('change', paintChildren);
  paintChildren();

  if (!form) return;
  addSpamGuards(form);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (form.getAttribute('aria-busy') === 'true') return;
    const data = new FormData(form);
    const safari = selectedSafari(String(data.get('safari') || ''));
    const note = form.querySelector('[data-booking-note]');
    const adults = Number(data.get('adults') || 1);
    const children = Number(data.get('children') || 0);
    const childDetails = Array.from({ length: children }, (_, index) => ({
      name: String(data.get(`childName_${index}`) || '').trim(),
      age: Number(data.get(`childAge_${index}`)),
    }));
    const payload = {
      name: String(data.get('name') || ''),
      email: String(data.get('email') || ''),
      phone: String(data.get('phone') || ''),
      country: String(data.get('country') || ''),
      safari: safari?.title || String(data.get('safari') || ''),
      safariId: safari?.slug || String(data.get('safari') || ''),
      travelDate: String(data.get('travelDate') || ''),
      adults,
      children,
      childDetails,
      travellers: adults + children,
      notes: [
        data.get('country') ? `Country: ${data.get('country')}` : '',
        data.get('message') || '',
      ]
        .filter(Boolean)
        .join('\n'),
      ...spamFields(form),
    };
    form.setAttribute('aria-busy', 'true');
    setBusy(form, true);
    try {
      const result = await submitBooking(payload);
      form.reset();
      if (select && safari?.slug) select.value = safari.slug;
      paintSummary();
      paintChildren();
      const stamp = form.querySelector('[name="_ts"]');
      if (stamp) stamp.value = String(Date.now());
      showNote(
        note,
        `Thank you — your booking request ${result.code || ''} has been received. We have emailed a copy to ${payload.email} and our reservations team will confirm availability and final details shortly.`
      );
    } catch (err) {
      if (!isNetworkError(err)) {
        showNote(note, err.message, 'error');
        focusField(form, err.field);
        return;
      }
      window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(`Booking request: ${payload.safari}`)}&body=${encodeURIComponent(
        [
          `Name: ${payload.name}`,
          `Email: ${payload.email}`,
          `Phone: ${payload.phone}`,
          `Travel date: ${payload.travelDate}`,
          `Adults: ${payload.adults}`,
          `Children: ${payload.children}`,
          payload.childDetails.map((child, index) => `Child ${index + 1}: ${child.name || '—'}, age ${child.age}`).join('\n'),
          '',
          payload.notes,
        ].join('\n')
      )}`;
      showNote(
        note,
        `Our booking system is temporarily unavailable, so we have opened your email app with the request ready to send to ${site.email}.`,
        'error'
      );
    } finally {
      form.removeAttribute('aria-busy');
      setBusy(form, false);
    }
  });
}
