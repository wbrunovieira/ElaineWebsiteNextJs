import { z } from 'zod';
import type { SiteContent } from '@/lib/content';

const galleryPhoto = z.object({
  id: z.string().min(1),
  src: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  // alt is required for accessibility + SEO.
  alt: z.string().trim().min(1),
  blurDataURL: z.string().optional(),
});

const story = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  city: z.string(),
  content: z.string().min(1),
});

const location = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  date: z.string(),
  time: z.string(),
  googleMapsUrl: z.string().url().or(z.literal('')),
  wazeUrl: z.string().url().or(z.literal('')),
  mapEmbedSrc: z.string().url().or(z.literal('')),
});

const session = z.object({
  id: z.string().min(1),
  iconType: z.enum(['map', 'video']),
  title: z.string().min(1),
  description: z.string(),
  price: z.string(),
  link: z.string().url().or(z.literal('')),
  date: z.string(),
  local: z.string().optional(),
  horario: z.string().optional(),
});

const videoTestimonial = z.object({
  id: z.string().min(1),
  title: z.string().optional(),
  muxPlaybackId: z.string().optional(),
  muxAssetId: z.string().optional(),
  src: z.string().optional(),
});

export const siteContentSchema = z.object({
  gallery: z.array(galleryPhoto),
  stories: z.array(story),
  locations: z.array(location),
  sessions: z.array(session),
  videoTestimonials: z.array(videoTestimonial),
});

/** Rejects payloads whose `id`s are not unique within a section. */
function hasUniqueIds(content: SiteContent): boolean {
  return (
    ['gallery', 'stories', 'locations', 'sessions', 'videoTestimonials'] as const
  ).every(
    key => {
      const ids = content[key].map(item => item.id);
      return new Set(ids).size === ids.length;
    }
  );
}

export type ValidationResult =
  | { ok: true; content: SiteContent }
  | { ok: false; error: string };

export function validateContent(input: unknown): ValidationResult {
  const parsed = siteContentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues
        .map(i => `${i.path.join('.')}: ${i.message}`)
        .join('; '),
    };
  }
  const content = parsed.data as SiteContent;
  if (!hasUniqueIds(content)) {
    return { ok: false, error: 'Duplicate ids within a section' };
  }
  return { ok: true, content };
}
