/**
 * One-time copy clean-up (runs once per database, see bootstrap/cms.js).
 *
 * Only touches text that is still exactly the original placeholder/seed
 * wording — anything an editor has already changed is left alone.
 */
import { SafariStatus } from '@gm-safaris/shared-types';
import { SEO_ROUTES, DEFAULT_KEYWORDS } from '@gm-safaris/safari-ui';
import { updateStore } from '../../cms-store/index.js';
import { logger } from '../../logging/index.js';

const PLACEHOLDER_TESTIMONIALS = new Set([
  'traveler review',
  'rated 5/5 by served clients',
  'northern circuit + coast',
  'family safari',
  'couple safari',
  'friends group',
  'summit group',
]);

const PAGE_EXCERPTS = {
  home: {
    old: ['Karibu Tanzania.'],
    next: 'Private Tanzania safaris, Kilimanjaro climbs and Zanzibar holidays, planned by a locally owned team in Arusha.',
  },
  about: {
    old: ['Local Tanzanian safari experts since 2023.'],
    next: 'A 100% Tanzanian-owned tour operator in Arusha, planning private safaris, Kilimanjaro climbs and Zanzibar stays.',
  },
  contact: {
    old: ['Call, email, or send a message from Arusha.'],
    next: 'Call, WhatsApp or email our Arusha team and receive a tailor-made itinerary with a clear price.',
  },
  accommodations: {
    old: ['Lodges and camps we book across Tanzania.'],
    next: 'Mid-range, luxury and premium lodges and tented camps we book across northern Tanzania.',
  },
  reviews: {
    old: ['Rated 5/5 by served clients.'],
    next: 'Independent guest reviews from Tripadvisor, Google and SafariBookings.',
  },
  kilimanjaro: {
    old: ['Guided routes from Arusha and Moshi.'],
    next: 'Fully supported Kilimanjaro climbs on every major route, with experienced mountain crews.',
  },
  'join-safari': {
    old: ['Small-group dates you can join.'],
    next: 'Fixed-date, small-group safaris — share the vehicle and the cost with other travellers.',
  },
  destinations: {
    old: ['Northern Circuit, coast, and southern parks.'],
    next: 'Serengeti, Ngorongoro, Tarangire, Kilimanjaro, Zanzibar and the southern parks — when to go and what to see.',
  },
  blog: {
    old: ['Practical Tanzania travel articles.'],
    next: 'Practical advice for planning a Tanzania safari, Kilimanjaro climb or Zanzibar holiday.',
  },
};

const OLD_SEO_TITLE = 'Golden Memories Safaris – Tanzania Safaris Experts';
const OLD_SEO_DESCRIPTION =
  'Golden Memories Safaris — premier Tanzania wildlife safaris, Kilimanjaro treks, and Zanzibar beach holidays crafted by experts in Arusha.';

function applyToDoc(doc, fn) {
  if (doc && typeof doc === 'object') fn(doc);
}

export async function upgradeSiteCopy() {
  const changes = { testimonials: 0, pages: 0, seo: false };
  await updateStore((store) => {
    for (const record of store.testimonials || []) {
      const title = String(record.draft?.title || record.published?.title || '').trim().toLowerCase();
      if (PLACEHOLDER_TESTIMONIALS.has(title) && record.status === SafariStatus.PUBLISHED) {
        record.status = SafariStatus.UNPUBLISHED;
        record.updated_at = new Date().toISOString();
        record.updated_by = 'copy-review';
        changes.testimonials += 1;
      }
    }

    for (const record of store.pages || []) {
      const rule = PAGE_EXCERPTS[record.slug];
      if (!rule) continue;
      let touched = false;
      for (const doc of [record.draft, record.published]) {
        applyToDoc(doc, (d) => {
          if (rule.old.includes(String(d.excerpt || '').trim())) {
            d.excerpt = rule.next;
            touched = true;
          }
        });
      }
      if (touched) changes.pages += 1;
    }

    const seo = store.settings?.seo;
    if (seo) {
      if (!seo.defaultTitle || seo.defaultTitle === OLD_SEO_TITLE) {
        seo.defaultTitle = SEO_ROUTES.home.title;
        changes.seo = true;
      }
      if (!seo.defaultDescription || seo.defaultDescription === OLD_SEO_DESCRIPTION) {
        seo.defaultDescription = SEO_ROUTES.home.description;
        changes.seo = true;
      }
      if (!seo.defaultKeywords) {
        seo.defaultKeywords = DEFAULT_KEYWORDS.join(', ');
        changes.seo = true;
      }
    }
  });
  logger.info('Professional copy review applied', changes);
  return changes;
}
