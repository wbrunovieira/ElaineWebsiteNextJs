import { put, list } from '@vercel/blob';
import { unstable_cache, revalidateTag } from 'next/cache';
import seed from '@/data/content.json';

export interface GalleryPhoto {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  blurDataURL?: string;
}

export interface Story {
  id: string;
  name: string;
  city: string;
  content: string;
}

export interface LocationItem {
  id: string;
  name: string;
  date: string;
  time: string;
  googleMapsUrl: string;
  wazeUrl: string;
  mapEmbedSrc: string;
}

export interface SessionOption {
  id: string;
  iconType: 'map' | 'video';
  title: string;
  description: string;
  price: string;
  link: string;
  date: string;
  local?: string;
  horario?: string;
}

export interface VideoTestimonial {
  id: string;
  title?: string;
  /** Mux-backed video (preferred). */
  muxPlaybackId?: string;
  muxAssetId?: string;
  /** Legacy local file under /public/videos (kept until migrated to Mux). */
  src?: string;
}

export interface SiteContent {
  gallery: GalleryPhoto[];
  stories: Story[];
  locations: LocationItem[];
  sessions: SessionOption[];
  videoTestimonials: VideoTestimonial[];
}

/** Bundled seed — used until a Blob-backed document exists (or if Blob fails). */
export const seedContent = seed as SiteContent;

const CONTENT_PATH = 'content.json';
export const CONTENT_TAG = 'site-content';

/** Fills any missing top-level sections from the seed (backward compatible). */
function withDefaults(c: Partial<SiteContent> | null): SiteContent {
  return {
    gallery: c?.gallery ?? seedContent.gallery,
    stories: c?.stories ?? seedContent.stories,
    locations: c?.locations ?? seedContent.locations,
    sessions: c?.sessions ?? seedContent.sessions,
    videoTestimonials:
      c?.videoTestimonials ?? seedContent.videoTestimonials,
  };
}

/** Reads the live content.json from Blob, or null when absent/unreadable. */
async function readFromBlob(): Promise<Partial<SiteContent> | null> {
  try {
    const { blobs } = await list({ prefix: CONTENT_PATH, limit: 1 });
    const blob = blobs.find(b => b.pathname === CONTENT_PATH);
    if (!blob) return null;
    // Public Blob URLs are CDN-cached and can serve a stale copy right after an
    // overwrite. Bust the CDN cache so the admin editor always reads the latest.
    const fresh = `${blob.url}?v=${blob.uploadedAt ? new Date(blob.uploadedAt).getTime() : ''}`;
    const res = await fetch(fresh, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as Partial<SiteContent>;
  } catch {
    return null;
  }
}

/**
 * Returns the editable site content (Blob-backed, seed fallback).
 * Memoized and tagged so the public site only refetches after an admin save
 * calls `revalidateTag(CONTENT_TAG)`.
 */
export const getContent = unstable_cache(
  async (): Promise<SiteContent> => {
    return withDefaults(await readFromBlob());
  },
  ['site-content'],
  { tags: [CONTENT_TAG] }
);

/** Reads the current content directly (no cache) — for the admin editor. */
export async function getContentFresh(): Promise<SiteContent> {
  return withDefaults(await readFromBlob());
}

/** Persists content to Blob and invalidates the public-site cache. */
export async function saveContent(
  content: SiteContent
): Promise<void> {
  await put(CONTENT_PATH, JSON.stringify(content, null, 2), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    // Mutable document: disable CDN caching so reads reflect writes immediately.
    cacheControlMaxAge: 0,
  });
  revalidateTag(CONTENT_TAG);
}
