import { SafariStatus } from '@gm-safaris/shared-types';
import { config } from '../../config/index.js';
import { updateStore } from '../../cms-store/index.js';
import { safarisRepository } from './safaris.repository.js';
import { PDF_PACKAGES, toSafariDocument } from './pdf-packages.js';

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
  for (const item of PDF_PACKAGES) {
    const draft = toDraft(item);
    let record = await safarisRepository.findBySlug(item.slug, { includeUnpublished: true });
    if (!record) {
      record = await safarisRepository.create({ draft, actor: { userId: 'seed' } });
    } else {
      record.draft = draft;
      record.slug = item.slug;
      record.updated_at = now;
    }
    record.status = SafariStatus.PUBLISHED;
    record.published = { ...draft };
    record.published_at = record.published_at || now;
    await safarisRepository.save(record);
  }

  await updateStore((s) => {
    s.meta.seededSafaris = true;
  });
}
