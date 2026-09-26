import { SafariStatus } from '@gm-safaris/shared-types';
import { config } from '../../config/index.js';
import { updateStore } from '../../cms-store/index.js';
import { safarisRepository } from './safaris.repository.js';
import { toSafariDocument } from './pdf-packages.js';
import { allTours } from '../../../../website-com/src/pages/tours/catalog.js';

function toDraft(item) {
  const draft = toSafariDocument(item);
  draft.seo = {
    ...draft.seo,
    canonical: draft.seo?.canonical || `${config.sites.com}/tours/${item.slug}/`,
    og_image: draft.seo?.og_image || item.hero_image?.url,
  };
  return draft;
}

export async function seedSafariPackages() {
  if (process.env.CMS_SEED_SAFARIS === 'false') return;
  if (!config.cms.seedSafaris && process.env.CMS_SEED_SAFARIS !== 'true') return;

  const now = new Date().toISOString();
  const toursToSeed = typeof allTours === 'function' ? allTours() : [];
  for (const item of toursToSeed) {
    const draft = toDraft(item);
    if (item.tour_type) {
      draft.tour_type = item.tour_type;
    }
    if (/kilimanjaro|meru/i.test(item.title)) {
      draft.tour_type = 'mountain';
    } else if (/zanzibar/i.test(item.title) || /zanzibar/i.test(item.places)) {
      draft.tour_type = 'beach';
    }
    // Never overwrite a tour that already exists — editors may have changed it.
    if (await safarisRepository.findBySlug(item.slug, { includeUnpublished: true })) continue;
    const record = await safarisRepository.create({ draft, actor: { userId: 'seed' } });
    record.updated_at = now;
    record.status = SafariStatus.PUBLISHED;
    record.published = { ...draft };
    record.published_at = record.published_at || now;
    await safarisRepository.save(record);
  }

  await updateStore((s) => {
    s.meta.seededSafaris = true;
  });
}
