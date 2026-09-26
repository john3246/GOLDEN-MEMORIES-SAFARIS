import { connectDatabase } from '../apps/api/src/database/index.js';
import { initCmsStore, readStore } from '../apps/api/src/cms-store/index.js';
import { gmsTrips } from '../apps/website-com/src/pages/tours/gms-trips.js';
import { allTours } from '../apps/website-com/src/pages/tours/catalog.js';
import { kilimanjaroTreks } from '../apps/website-com/src/pages/kilimanjaro/packages.js';

async function main() {
  const pool = await connectDatabase().catch(() => null);
  await initCmsStore({ pool });
  const store = await readStore();
  const cmsSafaris = store.safaris || [];

  const cmsMap = new Map();
  for (const s of cmsSafaris) {
    const slug = s.slug || s.draft?.slug;
    cmsMap.set(slug, s);
  }

  // Compare gmsTrips
  console.log('=== Checking gmsTrips against CMS ===');
  for (const t of gmsTrips) {
    const cms = cmsMap.get(t.slug);
    if (!cms) {
      console.log(`[gmsTrips] NOT IN CMS: ${t.slug} (${t.title})`);
    } else {
      const doc = cms.published || cms.draft || {};
      const missing = [];
      if (!doc.highlights?.length && t.highlights?.length) missing.push(`highlights (${t.highlights.length})`);
      if (!doc.inclusions?.length && (t.inclusions?.length || t.included?.length)) missing.push(`inclusions`);
      if (!doc.itinerary?.length && t.itinerary?.length) missing.push(`itinerary (${t.itinerary.length} days)`);
      if (!doc.price_from && t.price_from) missing.push(`price_from (${t.price_from})`);
      if (!doc.tour_type && t.tour_type) missing.push(`tour_type (${t.tour_type})`);
      if (missing.length) {
        console.log(`[gmsTrips] ${t.slug} has fields missing in CMS: ${missing.join(', ')}`);
      }
    }
  }

  // Compare allTours
  console.log('\n=== Checking allTours against CMS ===');
  for (const t of allTours()) {
    const cms = cmsMap.get(t.slug);
    if (!cms) {
      console.log(`[allTours] NOT IN CMS: ${t.slug} (${t.title})`);
    } else {
      const doc = cms.published || cms.draft || {};
      const missing = [];
      if (!doc.highlights?.length && t.highlights?.length) missing.push(`highlights (${t.highlights.length})`);
      if (!doc.inclusions?.length && (t.inclusions?.length || t.included?.length)) missing.push(`inclusions`);
      if (!doc.itinerary?.length && t.itinerary?.length) missing.push(`itinerary (${t.itinerary.length} days)`);
      if (!doc.price_from && t.price_from) missing.push(`price_from (${t.price_from})`);
      if (!doc.tour_type && t.tour_type) missing.push(`tour_type (${t.tour_type})`);
      if (missing.length) {
        console.log(`[allTours] ${t.slug} has fields missing in CMS: ${missing.join(', ')}`);
      }
    }
  }

  process.exit(0);
}

main().catch(console.error);
