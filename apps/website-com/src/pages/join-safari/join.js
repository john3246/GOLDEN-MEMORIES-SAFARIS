import { joinHero, joiningSafaris, openJoiningPackages, joinIntro, joinFaqs, MONTH_NAMES } from './content.js';
import { joinCard } from '../../components/cards/join-card.js';
import { bookingHref } from '../tours/paths.js';
import { joinHref } from './paths.js';
import {
  renderCalendarMonth,
  defaultSelectedIso,
  monthFromIso,
  tripsInMonth,
  monthHasDeparture,
} from './calendar.js';

const trip = joiningSafaris[0];

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
  return trips.map((item) => joinCard(item)).join('');
}

/**
 * Join-group safari listing, overlay cards, calendar, and booking CTA.
 */
export function renderJoinSafari() {
  const selected = defaultSelectedIso();
  const { year, monthIndex } = monthFromIso(selected);
  const highlights = (trip.highlights || []).map((item) => `<li>${item}</li>`).join('');
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
        <div class="container-site relative flex min-h-[11rem] flex-col justify-end py-8 sm:min-h-[13rem] lg:min-h-[14rem]">
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
          <a class="btn-navy mt-8 !rounded-none self-start" href="#join-packages">${joinHero.cta}</a>
        </div>
      </section>

      <section class="bg-white py-8 sm:py-10" aria-labelledby="join-intro-title">
        <div class="container-site max-w-3xl">
          <p class="section-kicker">Joining safari</p>
          <h2 id="join-intro-title" class="section-title">${joinIntro.title}</h2>
          <div class="join-intro-copy mt-6">${intro}</div>
        </div>
      </section>

      <section class="bg-mist py-8 sm:py-10" id="join-packages" aria-labelledby="join-packages-title">
        <div class="container-site">
          <div class="reveal mx-auto max-w-3xl text-center">
            <p class="section-kicker">2026–2027 joining packages</p>
            <h2 id="join-packages-title" class="section-title">Group safaris with published prices</h2>
            <p class="mt-4 text-ink/75">Shared 4x4, professional guide, and Northern Circuit parks, open a package for the full day-by-day itinerary.</p>
          </div>
          <div class="reveal mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            ${openJoiningPackages.map(joinCard).join('')}
          </div>
        </div>
      </section>

      <section class="bg-mist py-8 sm:py-10" id="join-calendar" aria-labelledby="cal-title">
        <div class="container-site">
          <div class="reveal mx-auto max-w-3xl text-center">
            <p class="section-kicker">Open departures</p>
            <h2 id="cal-title" class="section-title">Find a group safari</h2>
            <p class="mt-4 text-ink/75">Choose a year and month for dated departures such as the Ndutu calving safari.</p>
          </div>

          <div class="reveal mt-10" data-cal-host>
            ${renderCalendarMonth(year, monthIndex)}
          </div>

          <div class="reveal mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" data-join-departures>
            ${renderDepartureList(year, monthIndex)}
          </div>
        </div>
      </section>

      <section class="bg-white py-8 sm:py-10" aria-labelledby="join-about-title">
        <div class="container-site grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <a class="reveal join-featured-media overflow-hidden bg-black" href="${joinHref(trip)}">
            <img
              class="aspect-[16/10] w-full object-cover sm:aspect-[16/11]"
              src="${trip.image}"
              alt="Wildebeest calving season on the Ndutu plains"
              width="900"
              height="1100"
              loading="lazy"
            />
          </a>
          <div class="reveal">
            <p class="section-kicker">Dated departure</p>
            <h2 id="join-about-title" class="section-title">${trip.title}</h2>
            <p class="mt-3 font-body text-sm font-semibold uppercase tracking-[0.1em] text-gold-deep">${trip.datesLabel}</p>
            <p class="mt-5 font-body text-base leading-relaxed text-ink/75">${trip.overview}</p>
            <ul class="safari-bullets mt-6">${highlights}</ul>
            <div class="mt-8 flex flex-wrap gap-3">
              <a class="btn-navy !rounded-none" href="${joinHref(trip)}">View itinerary</a>
              <a class="btn-gold !rounded-none" href="${bookingHref(trip)}">Book this safari</a>
            </div>
          </div>
        </div>
      </section>

      <section class="bg-mist py-8 sm:py-10" aria-labelledby="join-faq-title">
        <div class="container-site grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          <div class="reveal">
            <p class="section-kicker">Group or private</p>
            <h2 id="join-faq-title" class="section-title">Joining safari questions</h2>
            <p class="mt-4 text-ink/70">Fixed dates and a shared vehicle, or a private safari on your own calendar.</p>
          </div>
          <div class="reveal space-y-3">${faqs}</div>
        </div>
      </section>

      <section class="bg-gold py-8 sm:py-10" id="join-book" aria-labelledby="join-book-title">
        <div class="container-site flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div class="reveal">
            <p class="section-kicker">Reserve a seat</p>
            <h2 id="join-book-title" class="section-title">Book a joining safari</h2>
            <p class="mt-4 max-w-xl font-body text-base leading-relaxed text-ink/75">Open a package for the full itinerary, then book, the form arrives with that safari already selected.</p>
          </div>
          <a class="reveal btn-navy !rounded-none shrink-0" href="/booking/?safari=${encodeURIComponent(openJoiningPackages[0]?.slug || trip.slug || '')}">Go to booking form</a>
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
  if (!host) return;

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
        const openMonth = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].find((index) => monthHasDeparture(year, index));
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
