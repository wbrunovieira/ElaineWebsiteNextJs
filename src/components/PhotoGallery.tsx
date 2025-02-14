'use client';

import React from 'react';
import Image from 'next/image';
import PhotoAlbum, {
  Photo,
  RenderImageProps,
  RenderImageContext,
} from 'react-photo-album';
import 'react-photo-album/styles.css';

interface CustomPhoto extends Photo {
  blurDataURL?: string;
}

const photos: CustomPhoto[] = [
  {
    src: '/images/photo1.jpg',
    width: 1200,
    height: 800,
    alt: 'Kundalini energy awakening',
    blurDataURL: '/images/photo1-blur.jpg',
  },
  {
    src: '/images/photo2.jpg',
    width: 800,
    height: 1200,
    alt: 'Meditation and inner peace',
    blurDataURL: '/images/photo2-blur.jpg',
  },
  {
    src: '/images/photo3.jpg',
    width: 1000,
    height: 750,
    alt: 'Energy flow in Kundalini practice',
    blurDataURL: '/images/photo3-blur.jpg',
  },
  {
    src: '/images/photo4.jpg',
    width: 750,
    height: 1000,
    alt: 'Spiritual connection through Kundalini',
    blurDataURL: '/images/photo4-blur.jpg',
  },
  {
    src: '/images/photo5.jpg',
    width: 600,
    height: 600,
    alt: 'Chakra activation during meditation',
    blurDataURL: '/images/photo5-blur.jpg',
  },
  {
    src: '/images/photo6.jpg',
    width: 800,
    height: 600,
    alt: 'Harmonizing energy fields',
    blurDataURL: '/images/photo6-blur.jpg',
  },
  {
    src: '/images/photo7.jpg',
    width: 900,
    height: 700,
    alt: 'Kundalini rising energy visualization',
    blurDataURL: '/images/photo7-blur.jpg',
  },
  {
    src: '/images/photo8.jpg',
    width: 700,
    height: 500,
    alt: 'Focused meditation for spiritual growth',
    blurDataURL: '/images/photo8-blur.jpg',
  },
  {
    src: '/images/photo9.jpg',
    width: 1200,
    height: 800,
    alt: 'Kundalini light and energy awakening',
    blurDataURL: '/images/photo9-blur.jpg',
  },
  {
    src: '/images/photo10.jpg',
    width: 600,
    height: 900,
    alt: 'Sacred connection to the universe',
    blurDataURL: '/images/photo10-blur.jpg',
  },
  {
    src: '/images/photo11.jpg',
    width: 1000,
    height: 750,
    alt: 'Inner peace through Kundalini practice',
    blurDataURL: '/images/photo11-blur.jpg',
  },
  {
    src: '/images/photo12.jpg',
    width: 750,
    height: 1000,
    alt: 'Energy alignment and balance',
    blurDataURL: '/images/photo12-blur.jpg',
  },
  {
    src: '/images/photo13.jpg',
    width: 900,
    height: 1200,
    alt: 'Awakening the power of Kundalini energy',
    blurDataURL: '/images/photo13-blur.jpg',
  },
];

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

export default function Gallery() {
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
