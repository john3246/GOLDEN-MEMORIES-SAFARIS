import { site, travelInfo } from '../../pages/home/content.js';

/**
 * Site footer — contact, useful links, travel info.
 */
export function renderFooter() {
  const infoLinks = travelInfo
    .map((item) => `<li><a class="hover:text-gold" href="${item.href}">${item.label}</a></li>`)
    .join('');

  return `
    <footer class="bg-black text-white">
      <div class="container-site grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        <div class="lg:col-span-1">
          <p class="font-display text-2xl font-semibold tracking-tight text-gold">
            ${site.name}
          </p>
          <p class="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
            Premier Tanzania safari experiences — wildlife, Kilimanjaro, and Zanzibar — crafted by local experts in Arusha.
          </p>
        </div>

        <div>
          <h2 class="font-body text-sm font-bold uppercase tracking-[0.12em] text-gold">Useful links</h2>
          <ul class="mt-4 space-y-2 text-sm text-white/75">
            <li><a class="hover:text-gold" href="/">Home</a></li>
            <li><a class="hover:text-gold" href="/tours/">Safaris</a></li>
            <li><a class="hover:text-gold" href="/destinations/">Destinations</a></li>
            <li><a class="hover:text-gold" href="/accommodations/">Accommodations</a></li>
            <li><a class="hover:text-gold" href="/join-safari/">Group Safari</a></li>
            <li><a class="hover:text-gold" href="/kilimanjaro/">Kilimanjaro</a></li>
            <li><a class="hover:text-gold" href="/blog/">Blog</a></li>
            <li><a class="hover:text-gold" href="/reviews/">Reviews</a></li>
            <li><a class="hover:text-gold" href="/about/">About Us</a></li>
            <li><a class="hover:text-gold" href="/contact/">Contact</a></li>
          </ul>
        </div>

        <div id="travel-info">
          <h2 class="font-body text-sm font-bold uppercase tracking-[0.12em] text-gold">Travel info</h2>
          <ul class="mt-4 space-y-2 text-sm text-white/75">
            ${infoLinks}
          </ul>
        </div>

        <div>
          <h2 class="font-body text-sm font-bold uppercase tracking-[0.12em] text-gold">Contact us</h2>
          <ul class="mt-4 space-y-2 text-sm text-white/75">
            <li>${site.address}</li>
            <li><a class="hover:text-gold" href="tel:${site.phone.replace(/\s+/g, '')}">${site.phone}</a></li>
            <li><a class="hover:text-gold" href="tel:${site.phoneAlt.replace(/\s+/g, '')}">${site.phoneAlt}</a></li>
            <li><a class="hover:text-gold" href="mailto:${site.email}">${site.email}</a></li>
          </ul>
        </div>
      </div>

      <div class="border-t border-white/10">
        <div class="container-site flex flex-col gap-3 py-5 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright ${new Date().getFullYear()}, Golden Memories Safaris. All rights reserved.</p>
          <div class="flex gap-4">
            <a class="hover:text-gold" href="#">Terms of Services</a>
            <a class="hover:text-gold" href="#">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  `;
}
