import { describe, it, expect } from 'vitest';
import { validateContent } from '@/lib/content-schema';
import type { SiteContent } from '@/lib/content';

function valid(): SiteContent {
  return {
    gallery: [
      {
        id: 'p1',
        src: '/images/photo1.jpg',
        width: 1200,
        height: 800,
        alt: 'x',
        blurDataURL: 'data:image/jpeg;base64,abc',
      },
    ],
    stories: [
      { id: 's1', name: 'Enda', city: 'FL', content: 'great' },
    ],
    locations: [
      {
        id: 'l1',
        name: 'FTL',
        date: 'Coming soon',
        time: '1 PM',
        googleMapsUrl: 'https://maps.google.com/x',
        wazeUrl: 'https://waze.com/x',
        mapEmbedSrc: 'https://www.google.com/maps/embed?x',
      },
    ],
    sessions: [
      {
        id: 'c1',
        iconType: 'map',
        title: 'In-Person',
        description: 'd',
        price: '$80.00',
        link: 'https://eventbrite.com/e/x',
        date: 'Coming soon',
        local: 'FTL',
        horario: '1 PM',
      },
    ],
    videoTestimonials: [
      { id: 'vt1', src: '/videos/depoiment1.mp4' },
      { id: 'vt2', muxPlaybackId: 'abc123', muxAssetId: 'asset1' },
    ],
  };
}

describe('validateContent', () => {
  it('accepts a well-formed payload', () => {
    const r = validateContent(valid());
    expect(r.ok).toBe(true);
  });

  it('accepts empty sections', () => {
    const r = validateContent({
      gallery: [],
      stories: [],
      locations: [],
      sessions: [],
      videoTestimonials: [],
    });
    expect(r.ok).toBe(true);
  });

  it('allows a photo without blurDataURL', () => {
    const c = valid();
    delete c.gallery[0].blurDataURL;
    expect(validateContent(c).ok).toBe(true);
  });

  it('rejects a photo with an empty alt', () => {
    const c = valid();
    c.gallery[0].alt = '   ';
    expect(validateContent(c).ok).toBe(false);
  });

  it('rejects a missing id', () => {
    const c = valid() as unknown as { stories: { id?: string }[] };
    delete c.stories[0].id;
    expect(validateContent(c).ok).toBe(false);
  });

  it('rejects a non-string price', () => {
    const c = valid();
    (c.sessions[0] as unknown as { price: number }).price = 80;
    expect(validateContent(c).ok).toBe(false);
  });

  it('rejects a negative photo width', () => {
    const c = valid();
    c.gallery[0].width = -10;
    expect(validateContent(c).ok).toBe(false);
  });

  it('rejects an invalid session link url', () => {
    const c = valid();
    c.sessions[0].link = 'not a url';
    expect(validateContent(c).ok).toBe(false);
  });

  it('rejects an unknown iconType', () => {
    const c = valid();
    (c.sessions[0] as unknown as { iconType: string }).iconType = 'audio';
    expect(validateContent(c).ok).toBe(false);
  });

  it('rejects duplicate ids within a section', () => {
    const c = valid();
    c.stories.push({ ...c.stories[0] });
    const r = validateContent(c);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/[Dd]uplicate/);
  });

  it('rejects a completely wrong shape', () => {
    expect(validateContent({ foo: 'bar' }).ok).toBe(false);
    expect(validateContent(null).ok).toBe(false);
    expect(validateContent('string').ok).toBe(false);
  });
});
