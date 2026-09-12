import { site } from '../home/content.js';
import { joinHero, joiningSafaris, joinIntro, joinFaqs, MONTH_NAMES } from './content.js';
import {
  renderCalendarMonth,
  defaultSelectedIso,
  monthFromIso,
  tripsInMonth,
  monthHasDeparture,
} from './calendar.js';

const trip = joiningSafaris[0];

function facts(day) {
  return [
    ['Date', day.dateLabel],
    day.viewing && day.viewing !== '—' ? ['Game viewing', day.viewing] : null,
    ['Transport', day.transport],
    ['Meals included', day.meals],
    ['Accommodation', day.stay],
  ]
    .filter(Boolean)
    .map(
      ([label, value]) => `
        <div>
          <dt>${label}</dt>
          <dd>${value}</dd>
        </div>
      `
    )
    .join('');
}

function renderDepartureCard(item) {
  const tags = (item.tags || [])
    .map(
      (tag) => `
        <li>
          <span class="join-card-tag-label">${tag.label}</span>
          <span>${tag.detail}</span>
        </li>
      `
    )
    .join('');

  return `
    <article class="join-card">
      <div class="join-card-copy">
        <h3>${item.title}</h3>
        <p>From ${item.datesLabel}</p>
        <p class="join-card-meta">${item.duration} · ${item.places}</p>
      </div>
      <ul class="join-card-tags">${tags}</ul>
      <a class="btn-navy !rounded-none" href="#join-book">${item.deposit || 'Join group'}</a>
    </article>
  `;
}

function renderDepartureList(year, monthIndex) {
  const trips = tripsInMonth(year, monthIndex);
  if (!trips.length) {
    return `
      <div class="join-card-empty">
        <p>No open joining safari in ${MONTH_NAMES[monthIndex]} ${year}.</p>
        <button type="button" class="btn-navy !rounded-none mt-5" data-cal-jump="2027-02-15">Show February 2027</button>
      </div>
    `;
  }
  return trips.map((item) => renderDepartureCard(item)).join('');
}

/**
 * Join-group safari page — year/month departure list, itinerary, and booking.
 */
export function renderJoinSafari() {
  const selected = defaultSelectedIso();
  const { year, monthIndex } = monthFromIso(selected);
  const highlights = trip.highlights.map((item) => `<li>${item}</li>`).join('');
  const intro = joinIntro.body.map((p) => `<p>${p}</p>`).join('');
  const faqs = joinFaqs
    .map(
      (item) => `
        <details class="safari-faq bg-white">
          <summary>${item.q}</summary>
          <p>${item.a}</p>
        </details>
      `
    )
    .join('');

  const days = trip.days
    .map((item) => {
      return `
        <article class="safari-day" id="join-day-${item.iso}">
          <div class="safari-day-media">
            <img src="${item.image}" alt="" loading="lazy" width="900" height="680" />
          </div>
          <div class="safari-day-copy">
            <p class="safari-day-label">${item.day}</p>
            <h3 class="safari-day-title">${item.title}</h3>
            <p class="safari-day-body">${item.body}</p>
            <dl class="safari-day-facts">${facts(item)}</dl>
          </div>
        </article>
      `;
    })
    .join('');

  return `
    <main id="main">
      <section class="page-hero relative isolate overflow-hidden text-white" aria-labelledby="join-hero-title">
        <img
          class="absolute inset-0 h-full w-full object-cover"
          src="${joinHero.image}"
          alt="Wildebeest on the Ndutu plains during calving season"
          width="2000"
          height="900"
          fetchpriority="high"
        />
        <div class="absolute inset-0 bg-black/55"></div>
        <div class="container-site relative flex min-h-[28rem] flex-col justify-end py-16 sm:min-h-[32rem] lg:min-h-[36rem]">
          <nav class="font-body text-xs font-semibold uppercase tracking-[0.12em] text-white/75" aria-label="Breadcrumb">
            <a class="hover:text-gold" href="/">Home</a>
            <span aria-hidden="true"> » </span>
            <a class="hover:text-gold" href="/tours/">Safaris</a>
            <span aria-hidden="true"> » </span>
            <span class="text-gold">Group Tours</span>
          </nav>
          <p class="mt-8 inline-flex w-fit items-center gap-2 bg-gold px-4 py-1.5 font-body text-xs font-bold uppercase tracking-[0.14em] text-black">
            ${joinHero.kicker}
          </p>
          <h1 id="join-hero-title" class="mt-5 max-w-4xl font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            ${joinHero.title}
          </h1>
          <p class="mt-4 max-w-2xl font-body text-base text-white/85 sm:text-lg">${joinHero.subtitle}</p>
          <a class="btn-navy mt-8 !rounded-none self-start" href="#join-calendar">${joinHero.cta}</a>
        </div>
      </section>

      <section class="bg-white py-16 sm:py-20" aria-labelledby="join-intro-title">
        <div class="container-site max-w-3xl">
          <p class="section-kicker">Joining safari</p>
          <h2 id="join-intro-title" class="section-title">${joinIntro.title}</h2>
          <div class="join-intro-copy mt-6">${intro}</div>
        </div>
      </section>

      <section class="bg-mist py-16 sm:py-20 lg:py-24" id="join-calendar" aria-labelledby="cal-title">
        <div class="container-site">
          <div class="reveal mx-auto max-w-3xl text-center">
            <p class="section-kicker">Open departures</p>
            <h2 id="cal-title" class="section-title">Find a group safari</h2>
            <p class="mt-4 text-ink/75">Choose a year and month. February 2027 is open for the Ndutu calving season.</p>
          </div>

          <div class="reveal mt-10" data-cal-host>
            ${renderCalendarMonth(year, monthIndex)}
          </div>

          <div class="reveal mt-8 space-y-4" data-join-departures>
            ${renderDepartureList(year, monthIndex)}
          </div>
        </div>
      </section>

      <section class="bg-white py-16 sm:py-20" aria-labelledby="join-about-title">
        <div class="container-site grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div class="reveal overflow-hidden bg-black">
            <img
              class="aspect-[4/5] w-full object-cover sm:aspect-[5/6]"
              src="${trip.image}"
              alt="Wildebeest calving season on the Ndutu plains"
              width="900"
              height="1100"
              loading="lazy"
            />
          </div>
          <div class="reveal">
            <p class="section-kicker">This departure</p>
            <h2 id="join-about-title" class="section-title">${trip.title}</h2>
            <p class="mt-3 font-body text-sm font-semibold uppercase tracking-[0.1em] text-gold-deep">${trip.datesLabel}</p>
            <p class="mt-5 font-body text-base leading-relaxed text-ink/75">${trip.overview}</p>
            <ul class="safari-bullets mt-6">${highlights}</ul>
            <a class="btn-navy mt-8 !rounded-none" href="#join-book">Join this group</a>
          </div>
        </div>
      </section>

      <section class="bg-black py-16 text-white sm:py-20 lg:py-24" id="join-itinerary" aria-labelledby="join-itin-title">
        <div class="container-site">
          <div class="reveal max-w-3xl">
            <p class="section-kicker !text-gold">Safari itinerary</p>
            <h2 id="join-itin-title" class="section-title !text-white">${trip.duration} — day to day</h2>
            <p class="mt-4 text-white/75">Lodges: Njiro Legacy in Arusha and Ang’ata Migration Camp in Ndutu.</p>
          </div>
          <div class="safari-itinerary reveal mt-12">
            ${days}
          </div>
        </div>
      </section>

      <section class="bg-mist py-16 sm:py-20" aria-labelledby="join-faq-title">
        <div class="container-site grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          <div class="reveal">
            <p class="section-kicker">Group or private</p>
            <h2 id="join-faq-title" class="section-title">Joining safari questions</h2>
            <p class="mt-4 text-ink/70">Fixed dates and a shared vehicle — or a private safari on your own calendar.</p>
          </div>
          <div class="reveal space-y-3">${faqs}</div>
        </div>
      </section>

      <section class="bg-gold py-16 sm:py-20" id="join-book" aria-labelledby="join-book-title">
        <div class="container-site grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
          <div class="reveal bg-white p-6 sm:p-10">
            <p class="section-kicker">Reserve a seat</p>
            <h2 id="join-book-title" class="section-title">Join this group</h2>
            <p class="mt-5 font-body text-base leading-relaxed text-ink/75">${trip.cta}</p>
            <dl class="mt-8 space-y-3 font-body text-sm">
              <div class="flex justify-between gap-4 border-b border-black/10 pb-3">
                <dt class="text-ink/55">Dates</dt>
                <dd class="font-bold text-black">${trip.datesLabel}</dd>
              </div>
              <div class="flex justify-between gap-4 border-b border-black/10 pb-3">
                <dt class="text-ink/55">Duration</dt>
                <dd class="font-bold text-black">${trip.duration}</dd>
              </div>
              <div class="flex justify-between gap-4 border-b border-black/10 pb-3">
                <dt class="text-ink/55">Route</dt>
                <dd class="text-right font-bold text-black">${trip.places}</dd>
              </div>
            </dl>
            <a class="btn-navy mt-8 !rounded-none" href="https://wa.me/255786383273" rel="noreferrer">Chat on WhatsApp</a>
          </div>
          <div class="reveal bg-white p-6 sm:p-10">
            <h2 class="section-title">Request to join</h2>
            <p class="mt-4 font-body text-base leading-relaxed text-ink/75">Tell us your name and group size. We will confirm remaining seats for ${trip.datesLabel}.</p>
            <form class="contact-form mt-8" data-join-form>
              <input type="hidden" name="departure" value="${trip.title}" />
              <input type="hidden" name="dates" value="${trip.datesLabel}" />
              <label>
                <span>Your Name *</span>
                <input type="text" name="name" required placeholder="Full name" autocomplete="name" />
              </label>
              <label>
                <span>Your Email *</span>
                <input type="email" name="email" required placeholder="you@example.com" autocomplete="email" />
              </label>
              <label>
                <span>Travellers *</span>
                <input type="number" name="travellers" required min="1" max="12" value="2" />
              </label>
              <label>
                <span>Phone</span>
                <input type="tel" name="phone" placeholder="${site.phone}" autocomplete="tel" />
              </label>
              <label class="contact-form-full">
                <span>Message</span>
                <textarea name="message" rows="4" placeholder="Any arrival flights, room sharing, or diet notes..."></textarea>
              </label>
              <p class="contact-form-full" data-join-note hidden></p>
              <button class="btn-navy contact-form-full !rounded-none" type="submit">Send join request</button>
            </form>
          </div>
        </div>
      </section>
    </main>
  `;
}

function paintMonth(host, year, monthIndex) {
  const root = host.querySelector('[data-cal-root]');
  if (!root) return;
  const holder = document.createElement('div');
  holder.innerHTML = renderCalendarMonth(year, monthIndex).trim();
  const next = holder.firstElementChild;
  if (next) root.replaceWith(next);

  const list = document.querySelector('[data-join-departures]');
  if (list) list.innerHTML = renderDepartureList(year, monthIndex);
}

export function initJoinSafari() {
  const host = document.querySelector('[data-cal-host]');
  if (host) {
    const goToIso = (iso) => {
      const next = monthFromIso(iso);
      paintMonth(host, next.year, next.monthIndex);
    };

    host.addEventListener('click', (event) => {
      const jump = event.target.closest('[data-cal-jump]');
      if (jump) {
        goToIso(jump.getAttribute('data-cal-jump') || defaultSelectedIso());
        return;
      }

      const yearPick = event.target.closest('[data-cal-year-pick]');
      if (yearPick) {
        const year = Number(yearPick.getAttribute('data-cal-year-pick'));
        const root = host.querySelector('[data-cal-root]');
        let monthIndex = Number(root?.getAttribute('data-cal-month') || 0);
        if (!monthHasDeparture(year, monthIndex)) {
          const openMonth = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].find((index) =>
            monthHasDeparture(year, index)
          );
          monthIndex = openMonth ?? 0;
        }
        paintMonth(host, year, monthIndex);
        return;
      }

      const monthPick = event.target.closest('[data-cal-month-pick]');
      if (monthPick) {
        const root = host.querySelector('[data-cal-root]');
        const year = Number(root?.getAttribute('data-cal-year'));
        const monthIndex = Number(monthPick.getAttribute('data-cal-month-pick'));
        paintMonth(host, year, monthIndex);
      }
    });

    document.querySelector('[data-join-departures]')?.addEventListener('click', (event) => {
      const jump = event.target.closest('[data-cal-jump]');
      if (jump) goToIso(jump.getAttribute('data-cal-jump') || defaultSelectedIso());
    });
  }

  const form = document.querySelector('[data-join-form]');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const subject = `Join safari: ${data.get('departure')} (${data.get('dates')})`;
      const body = [
        `Name: ${data.get('name') || ''}`,
        `Email: ${data.get('email') || ''}`,
        `Phone: ${data.get('phone') || ''}`,
        `Travellers: ${data.get('travellers') || ''}`,
        `Departure: ${data.get('departure') || ''}`,
        `Dates: ${data.get('dates') || ''}`,
        '',
        data.get('message') || '',
      ].join('\n');
      window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      const note = form.querySelector('[data-join-note]');
      if (note) {
        note.hidden = false;
        note.textContent = 'Thank you. Your email app should open with the join request.';
      }
    });
  }
}
