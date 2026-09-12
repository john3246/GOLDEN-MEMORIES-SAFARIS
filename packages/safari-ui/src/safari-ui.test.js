import { describe, it, expect } from 'vitest';
import { renderSafariPage, emptySafariDocument } from '@gm-safaris/safari-ui';

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
});
