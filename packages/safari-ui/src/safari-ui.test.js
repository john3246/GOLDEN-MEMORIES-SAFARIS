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

  it('names safari packages with Day, not Days', async () => {
    const { safariPackageTitle } = await import('@gm-safaris/safari-ui');
    expect(safariPackageTitle('4 Days Mt Meru Trekking Via Momella Gate')).toBe('4-Day Mt Meru Trekking Via Momella Gate');
    expect(safariPackageTitle('6 Day Family Tour Tanzania')).toBe('6-Day Family Tour Tanzania');
    expect(safariPackageTitle('8-Day Luxury Tanzania Safari')).toBe('8-Day Luxury Tanzania Safari');
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
});
