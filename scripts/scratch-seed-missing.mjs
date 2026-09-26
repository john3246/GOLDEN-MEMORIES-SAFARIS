import { allTours } from '../apps/website-com/src/pages/tours/catalog.js';
import { safarisRepository } from '../apps/api/src/modules/safaris/safaris.repository.js';
import { toSafariDocument } from '../apps/api/src/modules/safaris/pdf-packages.js';
import { SafariStatus } from '@gm-safaris/shared-types';
import { connectDatabase, closeDatabase } from '../apps/api/src/database/index.js';
import { initCmsStore } from '../apps/api/src/cms-store/index.js';

async function seed() {
  const pool = await connectDatabase();
  await initCmsStore({ pool });

  const tours = allTours();
  console.log(`Found ${tours.length} tours in static catalog.`);

  const now = new Date().toISOString();
  
  let added = 0;
  for (const item of tours) {
    // Check if it already exists by slug
    const existing = await safarisRepository.findBySlug(item.slug, { includeUnpublished: true });
    if (existing) continue;

    const draft = toSafariDocument(item);
    if (item.tour_type) {
      draft.tour_type = item.tour_type;
    }
    
    // Mountain tours need special care to preserve categories if we want them grouped correctly.
    if (/kilimanjaro|meru/i.test(item.title)) {
      draft.tour_type = 'mountain';
    } else if (/zanzibar/i.test(item.title) || /zanzibar/i.test(item.places)) {
      draft.tour_type = 'beach';
    }

    const record = await safarisRepository.create({ draft, actor: { userId: 'seed-all' } });
    record.updated_at = now;
    record.status = SafariStatus.PUBLISHED;
    record.published = { ...draft };
    record.published_at = record.published_at || now;
    await safarisRepository.save(record);
    added++;
  }

  console.log(`Successfully seeded ${added} new tours into the database!`);
  await closeDatabase();
}

seed().catch(console.error);
