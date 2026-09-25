import { describe, it, expect } from 'vitest';
import { renderSafariPage, emptySafariDocument, safariCompletenessErrors, hasSafariPrice } from '@gm-safaris/safari-ui';

describe('safari-ui', () => {
  it('renders the same hero/overview structure for public and preview', () => {
    const doc = emptySafariDocument({
      title: 'Serengeti Luxury Safari',
      slug: 'serengeti-luxury-safari',
      description: 'Private northern-circuit days.',
      duration_label: '6 Days / 5 Nights',
      destination: 'Serengeti',
      highlights: ['Serengeti plains'],
      inclusions: ['Park fees'],
      exclusions: ['Flights'],
    });
    const html = renderSafariPage(doc);
    expect(html).toContain('Serengeti Luxury Safari');
    expect(html).toContain('About this itinerary');
    expect(html).toContain('What’s included');
    const editable = renderSafariPage(doc, { editable: true });
    expect(editable).toContain('data-safari-edit="title"');
    expect(editable).not.toContain('role="button"');
    expect(editable).not.toContain('What this safari is known for');
    expect(editable).not.toContain('Moments on this route');
  });

  it('blocks incomplete tours until they have a price and matching itinerary days', () => {
    expect(safariCompletenessErrors(emptySafariDocument({ title: 'Draft' }))).toHaveLength(2);
    expect(
      safariCompletenessErrors(
        emptySafariDocument({
          price_from: 1800,
          duration: 2,
          itinerary: [{ title: 'Tarangire' }],
        })
      ).join(' ')
    ).toMatch(/exactly 2 days/);
    expect(
      safariCompletenessErrors(
        emptySafariDocument({
          price_from: 1800,
          duration: 2,
          itinerary: [{ title: 'Tarangire' }, { title: 'Serengeti' }],
        })
      )
    ).toEqual([]);
    expect(hasSafariPrice({ price_from: 0 })).toBe(false);
    expect(hasSafariPrice({ price: 1800 })).toBe(true);
    expect(hasSafariPrice(null)).toBe(false);
  });

  it('omits unpublished-only empty sections for public rendering', () => {
    const html = renderSafariPage(emptySafariDocument({ title: 'Short safari', gallery: [] }));
    expect(html).not.toContain('Moments on this route');
  });

  it('places a photo beside each itinerary day for the zigzag layout', () => {
    const html = renderSafariPage(
      emptySafariDocument({
        title: 'Northern circuit',
        itinerary: [
          { day: 'Day 1', title: 'Tarangire National Park', description: 'Elephants among baobabs.' },
          { day: 'Day 2', title: 'Serengeti National Park', description: 'Open plains.' },
        ],
      })
    );
    expect(html.match(/class="safari-day"/g)?.length).toBe(2);
    expect(html.match(/safari-day-media/g)?.length).toBe(2);
    expect(html).not.toContain('is-text');
  });

  it('shows a per-person rate and a two-sharing total', () => {
    const html = renderSafariPage(
      emptySafariDocument({
        title: 'Family safari',
        price_from: 3094,
        currency: 'USD',
        minimum_people: 2,
      })
    );
    expect(html).toContain('USD 3,094');
    expect(html).toContain('per person');
    expect(html).toContain('USD 6,188');
    expect(html).toContain('Price per person');
  });

  it('uses destination-matched itinerary photos that differ between safaris', async () => {
    const { resolveDayImage, galleryKindForText, galleryKindForCover } = await import('@gm-safaris/safari-ui');
    expect(galleryKindForText('Tarangire, Serengeti & Ngorongoro')).toBe('tarangire');
    expect(galleryKindForCover({
      title: '4-Day Affordable Private Tanzania Safari – Tarangire, Serengeti & Ngorongoro Crater Adventure',
    })).toBe('tarangire');
    expect(galleryKindForCover({
      title: '4-Day Shared Safari Tanzania',
      itinerary: [
        { title: 'Tarangire National Park' },
        { title: 'Serengeti National Park' },
        { title: 'Full day in the Serengeti' },
        { title: 'Ngorongoro Crater and return' },
      ],
    })).toBe('serengeti');
    expect(galleryKindForText('5 Day Great Migration Safari')).toBe('serengeti');
    expect(galleryKindForText('Ngorongoro Crater Day Trip')).toBe('ngorongoro');
    expect(galleryKindForText('Machame Route Kilimanjaro')).toBe('kilimanjaro');

    const { publicMediaUrl, pickedMediaUrl } = await import('@gm-safaris/safari-ui');
    expect(publicMediaUrl('http://localhost:3000/api/v1/media/abc-123/file')).toBe('/api/v1/media/abc-123/file');
    expect(pickedMediaUrl({ hero_image: { url: 'http://127.0.0.1:3000/api/v1/media/abc-123/file' } })).toBe(
      '/api/v1/media/abc-123/file'
    );
    expect(resolveDayImage({ title: 'Tarangire', image: '/api/v1/media/day-1/file' }, { slug: 'demo' }, 0)).toBe(
      '/api/v1/media/day-1/file'
    );

    const tarangire = resolveDayImage(
      { title: 'Tarangire National Park', description: 'Elephants among baobabs.' },
      { slug: '3-days-affordable-joining-safari', title: '3-Day Affordable Joining Safari' },
      0
    );
    const serengeti = resolveDayImage(
      { title: 'Serengeti National Park', description: 'Open plains.' },
      { slug: '5-day-great-migration-safari', title: '5 Day Great Migration Safari' },
      0
    );
    const otherTarangire = resolveDayImage(
      { title: 'Tarangire National Park', description: 'Elephants among baobabs.' },
      { slug: '2-days-tarangire-ngorongoro-safari', title: '2-Day Tarangire & Ngorongoro Safari' },
      0
    );
    expect(tarangire).toMatch(/\/images\/gallery\/tarangire-\d+\.webp$/);
    expect(serengeti).toMatch(/\/images\/gallery\/serengeti-\d+\.webp$/);
    expect(otherTarangire).toMatch(/\/images\/gallery\/tarangire-\d+\.webp$/);
    expect(tarangire).not.toBe(otherTarangire);
  });

  it('names safari packages with spaces, not hyphens', async () => {
    const { safariPackageTitle, clampSeoTitle } = await import('@gm-safaris/safari-ui');
    expect(safariPackageTitle('4 Days Mt Meru Trekking Via Momella Gate')).toBe('4 Days Mt Meru Trekking Via Momella Gate');
    expect(safariPackageTitle('6 Day Family Tour Tanzania')).toBe('6 Day Family Tour Tanzania');
    expect(safariPackageTitle('8-Day Luxury Tanzania Safari')).toBe('8 Day Luxury Tanzania Safari');
    expect(safariPackageTitle('4-Day Tanzania safari- Tarangire, Serengeti')).toBe(
      '4 Day Tanzania safari, Tarangire, Serengeti'
    );
    expect(
      clampSeoTitle(
        '8 Day Luxury Tanzania Safari, Tarangire, Serengeti, Ngorongoro Crater and Zanzibar Beach'
      ).length
    ).toBeLessThanOrEqual(70);
  });

  it('renders destination paragraphs, tables and images', async () => {
    const { renderDestinationBlocks } = await import('@gm-safaris/safari-ui');
    const html = renderDestinationBlocks([
      { type: 'heading', text: 'When to go' },
      { type: 'paragraph', text: 'The herds stay in the Serengeti all year.' },
      { type: 'image', url: '/images/gallery/serengeti-01.webp', alt: 'Serengeti plains' },
      { type: 'table', headers: ['Month', 'Focus'], rows: [['February', 'Calving'], ['July', 'River crossings']] },
    ]);
    expect(html).toContain('When to go');
    expect(html).toContain('The herds stay in the Serengeti all year.');
    expect(html).toContain('/images/gallery/serengeti-01.webp');
    expect(html).toContain('<th>Month</th>');
    expect(html).toContain('<td>Calving</td>');
  });

  it('normalizes rich blog blocks, read time, and article layout', async () => {
    const { normalizeBlogDocument, renderBlogPage, estimateReadTime } = await import('@gm-safaris/safari-ui');
    const doc = normalizeBlogDocument({
      title: 'Serengeti migration guide',
      slug: 'serengeti-migration-guide',
      topic: 'safari',
      excerpt: 'When the herds move, and how to sit still for the crossing.',
      author: 'Golden Memories Safaris',
      featured_tour_slugs: ['5-day-luxury-migration-safari'],
      blocks: [
        { type: 'heading', text: 'Best months', level: 2 },
        { type: 'paragraph', text: 'July and August put you on the northern river. '.repeat(40) },
        { type: 'callout', callout_type: 'tip', title: 'Safari tip', text: 'Leave camp before first light.' },
        { type: 'gallery', gallery_mode: 'lightbox', images: [{ url: '/images/gallery/serengeti-01.webp', alt: 'Crossing' }] },
        { type: 'cta', text: 'View packages', href: '/tours/', variant: 'gold' },
      ],
    });
    expect(doc.read_time).toBeGreaterThanOrEqual(1);
    expect(estimateReadTime(doc)).toBe(doc.read_time);
    expect(doc.featured_tour_slugs).toEqual(['5-day-luxury-migration-safari']);
    const html = renderBlogPage(doc, { featuredToursHtml: '<article>Tour</article>' });
    expect(html).toContain('Serengeti migration guide');
    expect(html).toContain('On this page');
    expect(html).toContain('Best months');
    expect(html).toContain('blog-callout--tip');
    expect(html).toContain('data-blog-lightbox');
    expect(html).toContain('View packages');
    expect(html).toContain('Book a safari');
    expect(html).toContain('Featured tours');
  });

  it('normalizes destination travel fields, coordinates, and relations', async () => {
    const { normalizeDestinationDocument, destinationForWebsite, monthGuideFromSeasons, destinationJsonLd } = await import(
      '@gm-safaris/safari-ui'
    );
    const doc = normalizeDestinationDocument({
      title: 'Serengeti National Park',
      slug: 'serengeti',
      climate: 'Dry season — June to October\nRainy season — November to May',
      getting_there: 'Fly Arusha to Seronera.',
      tour_slugs: ['5-day-luxury-migration-safari'],
      related_post_slugs: ['serengeti-migration-guide'],
      seasons: 'July–October — Mara River crossings',
    });
    expect(doc.lat).toBe(-2.3333);
    expect(doc.lng).toBe(34.8333);
    expect(doc.tour_slugs).toEqual(['5-day-luxury-migration-safari']);
    expect(doc.getting_there).toContain('Seronera');
    const web = destinationForWebsite(doc, { regionSlug: 'northern-tanzania' });
    expect(web.gettingThere).toContain('Seronera');
    expect(web.monthGuide.some((month) => month.active)).toBe(true);
    expect(monthGuideFromSeasons(doc.seasons).filter((month) => month.active).length).toBeGreaterThan(2);
    const schema = destinationJsonLd(web);
    expect(schema['@type']).toBe('TouristAttraction');
    expect(schema.geo.latitude).toBe(-2.3333);
  });

  it('upgrades a thin group safari into a full safari document', async () => {
    const { normalizeGroupSafariDocument, safariCompletenessErrors } = await import('@gm-safaris/safari-ui');
    const doc = normalizeGroupSafariDocument({
      title: '3-Day Affordable Joining Safari',
      slug: '3-days-affordable-joining-safari',
      dates: 'Open 2026–2027',
      duration: '3 Days / 2 Nights',
      overview: 'Shared safari from Arusha.',
      image: '/images/gallery/tarangire-01.webp',
      price_from: 800,
      highlights: 'Tarangire\nNgorongoro',
      included: ['Park fees'],
      days: [
        { day: 'Day 1', title: 'Tarangire', body: 'Game drive among baobabs.' },
        { day: 'Day 2', title: 'Ngorongoro Crater', description: 'Crater floor.' },
        { day: 'Day 3', title: 'Lake Manyara', body: 'Return to Arusha.' },
      ],
    });
    expect(doc.product_type).toBe('join_safari');
    expect(doc.duration).toBe(3);
    expect(doc.duration_label).toBe('3 Days / 2 Nights');
    expect(doc.hero_image.url).toBe('/images/gallery/tarangire-01.webp');
    expect(doc.itinerary).toHaveLength(3);
    expect(doc.itinerary[0].description).toContain('baobabs');
    expect(doc.inclusions).toEqual(['Park fees']);
    expect(safariCompletenessErrors(doc)).toEqual([]);
  });

  it('keeps destination slugs on blog documents and destination embed blocks', async () => {
    const { normalizeBlogDocument } = await import('@gm-safaris/safari-ui');
    const doc = normalizeBlogDocument({
      title: 'When to visit the Serengeti',
      slug: 'when-to-visit-the-serengeti',
      destination_slugs: ['serengeti'],
      blocks: [{ type: 'destinations', destination_slugs: ['serengeti', 'ngorongoro'] }],
    });
    expect(doc.destination_slugs).toEqual(['serengeti']);
    expect(doc.blocks[0].destination_slugs).toEqual(['serengeti', 'ngorongoro']);
  });
});
