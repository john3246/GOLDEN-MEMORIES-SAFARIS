import { connectDatabase } from '../apps/api/src/database/index.js';
import { initCmsStore, readStore } from '../apps/api/src/cms-store/index.js';
import { gmsTrips } from '../apps/website-com/src/pages/tours/gms-trips.js';
import { kilimanjaroTreks } from '../apps/website-com/src/pages/kilimanjaro/packages.js';
import { allTours } from '../apps/website-com/src/pages/tours/catalog.js';

async function main() {
  const pool = await connectDatabase().catch(() => null);
  await initCmsStore({ pool });
  const store = await readStore();
  const cmsSafaris = store.safaris || [];

  console.log(`CMS safaris count: ${cmsSafaris.length}`);

  // Create lookup map of client tours
  const clientMap = new Map();
  for (const t of allTours()) clientMap.set(t.slug || t.id, t);
  for (const t of gmsTrips) clientMap.set(t.slug || t.id, t);
  for (const t of kilimanjaroTreks) clientMap.set(t.slug || t.id, t);

  for (const cms of cmsSafaris) {
    const doc = cms.published || cms.draft || {};
    const client = clientMap.get(cms.slug) || clientMap.get(cms.id);
    console.log(`\n========================================`);
    console.log(`CMS Slug: ${cms.slug} (${doc.title})`);
    if (!client) {
      console.log(`  -> NOT in client-side static catalog`);
      continue;
    }

    const issues = [];
    // 1. Itinerary
    const cmsDays = doc.itinerary?.length || 0;
    const clientDays = client.itinerary?.length || client.days?.length || 0;
    if (cmsDays === 0 && clientDays > 0) {
      issues.push(`Empty CMS itinerary! Client has ${clientDays} days`);
    } else if (cmsDays !== clientDays) {
      issues.push(`Day count mismatch: CMS has ${cmsDays}, Client has ${clientDays}`);
    }

    // 2. Inclusions / Exclusions
    const cmsInc = (doc.inclusions?.length || 0) + (doc.included?.length || 0);
    const clientInc = (client.included?.length || 0) + (client.inclusions?.length || 0);
    if (cmsInc === 0 && clientInc > 0) {
      issues.push(`CMS has 0 inclusions, but client has ${clientInc}`);
    }

    const cmsExc = (doc.exclusions?.length || 0) + (doc.excluded?.length || 0);
    const clientExc = (client.excluded?.length || 0) + (client.exclusions?.length || 0);
    if (cmsExc === 0 && clientExc > 0) {
      issues.push(`CMS has 0 exclusions, but client has ${clientExc}`);
    }

    // 3. Highlights
    const cmsHigh = doc.highlights?.length || 0;
    const clientHigh = client.highlights?.length || 0;
    if (cmsHigh === 0 && clientHigh > 0) {
      issues.push(`CMS has 0 highlights, but client has ${clientHigh}`);
    }

    // 4. Accommodations in itinerary
    if (doc.itinerary?.length) {
      let missingAcc = 0;
      doc.itinerary.forEach((d, i) => {
        const clientDay = client.itinerary?.[i] || client.days?.[i];
        const hasCmsAcc = Boolean(d.accommodation_name || d.accommodation || d.stay);
        const hasClientAcc = Boolean(clientDay?.accommodation_name || clientDay?.accommodation || clientDay?.stay);
        if (!hasCmsAcc && hasClientAcc) missingAcc++;
      });
      if (missingAcc > 0) {
        issues.push(`${missingAcc} days missing accommodation in CMS that exist in client`);
      }
    }

    // 5. Day facts (elevation, hiking time, vegetation zone for mountain; transport, viewing, meals for safari)
    if (doc.itinerary?.length) {
      let missingFacts = 0;
      doc.itinerary.forEach((d, i) => {
        const clientDay = client.itinerary?.[i] || client.days?.[i];
        if (clientDay?.elevation && !d.elevation) missingFacts++;
        if (clientDay?.hiking_time && !d.hiking_time) missingFacts++;
      });
      if (missingFacts > 0) {
        issues.push(`${missingFacts} facts (elevation/hiking_time) missing in CMS days`);
      }
    }

    // 6. Tour type
    if (!doc.tour_type && client.tour_type) {
      issues.push(`CMS tour_type is undefined, client has '${client.tour_type}'`);
    }

    // 7. Price
    if (!doc.price_from && client.price_from) {
      issues.push(`CMS missing price_from (${client.price_from})`);
    }

    if (issues.length) {
      console.log(`  ISSUES FOUND:`);
      for (const iss of issues) console.log(`    * ${iss}`);
    } else {
      console.log(`  -> Fully in sync! (${cmsDays} days, ${cmsInc} inc, ${cmsHigh} highlights, tour_type=${doc.tour_type})`);
    }
  }

  process.exit(0);
}

main().catch(console.error);
