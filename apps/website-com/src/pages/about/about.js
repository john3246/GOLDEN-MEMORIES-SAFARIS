import {
  aboutHero,
  aboutStory,
  aboutPrinciples,
  aboutAdvantages,
  aboutTeamIntro,
  aboutTeam,
  aboutCredentials,
  aboutCta,
} from './content.js';

/**
 * About page, live GM copy and photos, current site header/footer and gold/black layout.
 */
export function renderAbout() {
  const principles = aboutPrinciples
    .map(
      (item) => `
        <article class="border border-black/10 bg-white p-6 sm:p-8">
          <h3 class="font-display text-xl font-semibold text-black sm:text-2xl">${item.title}</h3>
          <p class="mt-3 text-sm leading-relaxed text-ink/70 sm:text-base">${item.body}</p>
        </article>
      `
    )
    .join('');

  const advantages = aboutAdvantages
    .map(
      (item) => `
        <article class="bg-white p-6 sm:p-8">
          <h3 class="font-display text-xl font-semibold text-black">${item.title}</h3>
          <p class="mt-3 text-sm leading-relaxed text-ink/70">${item.body}</p>
        </article>
      `
    )
    .join('');

  const team = aboutTeam
    .map(
      (member) => `
        <article class="about-team-card">
          <div class="about-team-media">
            <img src="${member.image}" alt="${member.imageAlt}" loading="lazy" width="800" height="900" />
          </div>
          <div class="p-6 sm:p-8">
            <h3 class="font-display text-2xl font-semibold text-black">${member.name}</h3>
            <p class="mt-1 font-body text-xs font-bold uppercase tracking-[0.12em] text-gold-deep">${member.role}</p>
            <p class="mt-4 text-sm leading-relaxed text-ink/70">${member.body}</p>
            <p class="mt-4 flex flex-wrap gap-2">
              ${member.tags.map((tag) => `<span class="about-tag">${tag}</span>`).join('')}
            </p>
          </div>
        </article>
      `
    )
    .join('');

  const credentials = aboutCredentials
    .map(
      (item) => `
        <article class="border border-gold/30 p-6 sm:p-8">
          <h3 class="font-display text-xl font-semibold text-gold">${item.title}</h3>
          <p class="mt-3 text-sm leading-relaxed text-white/75">${item.body}</p>
        </article>
      `
    )
    .join('');

  return `
    <main id="main">
      <section class="page-hero relative isolate overflow-hidden text-white" aria-labelledby="about-hero-title">
        <img
          class="absolute inset-0 h-full w-full object-cover"
          src="${aboutHero.image}"
          alt="Golden Memories Safaris team and Tanzania safari country"
          width="2000"
          height="900"
          fetchpriority="high"
        />
        <div class="absolute inset-0 bg-black/55"></div>
        <div class="container-site relative flex min-h-[11rem] flex-col items-center justify-center py-8 text-center sm:min-h-[13rem] lg:min-h-[14rem]">
          <p class="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-1.5 font-body text-xs font-bold uppercase tracking-[0.14em] text-black">
            ${aboutHero.kicker}
          </p>
          <h1 id="about-hero-title" class="mt-5 max-w-4xl font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            ${aboutHero.title}
          </h1>
          <p class="mt-4 font-display text-lg sm:text-xl font-normal text-gold italic">${aboutHero.motto}</p>
          <a class="btn-navy mt-8 !rounded-none" href="/contact/">${aboutHero.cta}</a>
        </div>
      </section>

      <nav class="bg-white py-4" aria-label="Breadcrumb">
        <div class="container-site font-body text-sm text-black/60">
          <a class="hover:text-gold-deep" href="/">Home</a>
          <span aria-hidden="true"> › </span>
          <span class="text-black">About Us</span>
        </div>
      </nav>

      <section class="bg-gold py-8 sm:py-10" aria-labelledby="about-story-title">
        <div class="container-site grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div class="reveal overflow-hidden bg-black">
            <img
              class="aspect-[16/10] w-full object-cover sm:aspect-[16/11]"
              src="${aboutStory.image}"
              alt="${aboutStory.imageAlt}"
              width="900"
              height="1100"
              loading="lazy"
            />
          </div>
          <div class="reveal bg-white p-6 sm:p-10">
            <p class="section-kicker">${aboutStory.kicker}</p>
            <h2 id="about-story-title" class="section-title">${aboutStory.title}</h2>
            ${aboutStory.paragraphs
              .map((p) => `<p class="mt-5 font-body text-base leading-relaxed text-ink/75">${p}</p>`)
              .join('')}
            <a class="btn-navy mt-8 !rounded-none" href="/contact/">Start Planning My Safari</a>
          </div>
        </div>
      </section>

      <section class="bg-white py-8 sm:py-10" aria-labelledby="principles-title">
        <div class="container-site">
          <div class="reveal mx-auto max-w-3xl text-center">
            <p class="section-kicker">Our purpose</p>
            <h2 id="principles-title" class="section-title">Guiding Principles</h2>
          </div>
          <div class="reveal mt-10 grid gap-5 md:grid-cols-2">
            ${principles}
          </div>
        </div>
      </section>

      <section class="bg-mist py-8 sm:py-10" aria-labelledby="advantage-title">
        <div class="container-site">
          <div class="reveal mx-auto max-w-3xl text-center">
            <p class="section-kicker">Why choose us</p>
            <h2 id="advantage-title" class="section-title">The Golden Memories Advantage</h2>
          </div>
          <div class="reveal mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            ${advantages}
          </div>
        </div>
      </section>

      <section class="bg-white py-8 sm:py-10" aria-labelledby="team-title">
        <div class="container-site">
          <div class="reveal mx-auto max-w-3xl text-center">
            <p class="section-kicker">Meet our team</p>
            <h2 id="team-title" class="section-title">The Faces Behind Your Safari</h2>
            <p class="mt-4 text-ink/70">${aboutTeamIntro}</p>
          </div>
          <div class="reveal mt-10 grid gap-6 lg:grid-cols-3">
            ${team}
          </div>
        </div>
      </section>

      <section class="bg-black py-10 text-white sm:py-12 lg:py-14" aria-labelledby="trust-title">
        <div class="container-site">
          <div class="reveal mx-auto max-w-3xl text-center">
            <p class="section-kicker !text-gold">Trust &amp; credentials</p>
            <h2 id="trust-title" class="section-title !text-white">Our Certifications &amp; Affiliations</h2>
          </div>
          <div class="reveal mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            ${credentials}
          </div>
        </div>
      </section>

      <section class="bg-gold py-8 sm:py-10" aria-labelledby="about-cta-title">
        <div class="container-site flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div class="reveal max-w-3xl">
            <h2 id="about-cta-title" class="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              ${aboutCta.title}
            </h2>
            <p class="mt-3 text-ink/80">${aboutCta.body}</p>
          </div>
          <div class="reveal flex flex-col gap-3 sm:flex-row">
            <a class="btn-navy !rounded-none shrink-0" href="/contact/">Start Planning My Safari</a>
            <a class="btn-light !rounded-none shrink-0" href="/tours/">Explore Our Tours</a>
          </div>
        </div>
      </section>
    </main>
  `;
}
