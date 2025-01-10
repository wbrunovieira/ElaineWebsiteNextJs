'use client';

import React from 'react';
import Image from 'next/image';
import PhotoAlbum, {
  Photo,
  RenderImageProps,
  RenderImageContext,
} from 'react-photo-album';
import 'react-photo-album/styles.css';

const photos: Photo[] = [
  {
    src: '/images/photo1.jpg',
    width: 1200,
    height: 800,
    alt: 'Photo 1',
  },
  {
    src: '/images/photo2.jpg',
    width: 600,
    height: 600,
    alt: 'Photo 2',
  },
  {
    src: '/images/photo3.jpg',
    width: 600,
    height: 600,
    alt: 'Photo 3',
  },
  {
    src: '/images/photo5.jpg',
    width: 600,
    height: 600,
    alt: 'Photo 4',
  },
  {
    src: '/images/photo6.jpg',
    width: 600,
    height: 600,
    alt: 'Photo 4',
  },
  {
    src: '/images/photo7.jpg',
    width: 600,
    height: 600,
    alt: 'Photo 4',
  },
  {
    src: '/images/photo8.jpg',
    width: 600,
    height: 600,
    alt: 'Photo 4',
  },
  {
    src: '/images/photo4.jpg',
    width: 600,
    height: 600,
    alt: 'Photo 4',
  },
];

function renderNextImage(
  { alt = '', title, sizes }: RenderImageProps,
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
        alt={alt}
        title={title}
        sizes={sizes}
        placeholder={
          'blurDataURL' in photo ? 'blur' : undefined
        }
        className="object-cover"
      />
    </div>
  );
}

export default function Gallery() {
  return (
    <section className="container mx-auto px-6 py-16 md:py-24 lg:py-32">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-2xl md:text-4xl font-bold text-primary mb-4">
          Our Photo Gallery
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground">
          Discover moments we&apos;ve captured and shared.
          High-resolution photos for your inspiration.
        </p>
        <hr className="border-t border-muted w-full md:w-3/4 my-4 mx-auto" />
      </div>

      {/* Photo Album */}
      <PhotoAlbum
        photos={photos}
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
        sizes={{
          size: '1168px',
          sizes: [
            {
              viewport: '(max-width: 1200px)',
              size: 'calc(100vw - 32px)',
            },
          ],
        }}
      />
    </section>
  );
}
