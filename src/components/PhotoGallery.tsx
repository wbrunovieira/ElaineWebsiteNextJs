'use client';

import React from 'react';
import Image from 'next/image';
import PhotoAlbum, {
  Photo,
  RenderImageProps,
  RenderImageContext,
} from 'react-photo-album';
import 'react-photo-album/styles.css';
import type { GalleryPhoto } from '@/lib/content';

interface CustomPhoto extends Photo {
  blurDataURL?: string;
}

function renderNextImage(
  { title, sizes }: RenderImageProps,
  { photo, width, height }: RenderImageContext
) {
  return (
    <div
      style={{
        width: '100%',
        position: 'relative',
        aspectRatio: `${width} / ${height}`,
      }}
    >
      <Image
        fill
        src={photo.src}
        alt={photo.alt || 'kundalini section'}
        title={title}
        sizes={sizes}
        placeholder={
          (photo as CustomPhoto).blurDataURL
            ? 'blur'
            : undefined
        }
        priority={width >= 1200}
        blurDataURL={(photo as CustomPhoto).blurDataURL}
        className="object-cover"
      />
    </div>
  );
}

export default function Gallery({
  photos,
}: {
  photos: GalleryPhoto[];
}) {
  return (
    <section className="container mx-auto px-6 py-16 md:py-24 lg:py-32">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-2xl font-playfair md:text-4xl font-bold text-primary mb-4">
          Our Photo Gallery
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground">
          Discover moments we&apos;ve captured and shared.
          High-resolution photos for your inspiration.
        </p>
        <hr className="border-t border-muted w-full md:w-3/4 my-4 mx-auto" />
      </div>

      <PhotoAlbum
        photos={photos as CustomPhoto[]}
        layout="masonry"
        columns={containerWidth => {
          if (containerWidth < 400) return 2;
          if (containerWidth < 800) return 3;
          return 4;
        }}
        spacing={containerWidth =>
          containerWidth < 600 ? 10 : 20
        }
        render={{ image: renderNextImage }}
        defaultContainerWidth={1200}
        // react-photo-album computes each photo's `sizes` from the ALBUM
        // CONTAINER width by subtracting spacing and dividing by columns
        // (≈ (size - 60px) / 4). Pass the container width here — NOT the
        // per-photo width — otherwise it gets divided twice and the browser
        // downloads a tiny (~48px) image that looks blurry. Smaller-breakpoint
        // values are inflated to offset the lib's fixed 4-column assumption.
        sizes={{
          size: '1200px',
          sizes: [
            { viewport: '(max-width: 400px)', size: '200vw' },
            { viewport: '(max-width: 800px)', size: '133vw' },
            { viewport: '(max-width: 1200px)', size: '100vw' },
          ],
        }}
      />
    </section>
  );
}
