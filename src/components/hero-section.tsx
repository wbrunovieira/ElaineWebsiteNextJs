'use client';

import { useState } from 'react';

import { GiMeditation } from 'react-icons/gi';

import dynamic from 'next/dynamic';
import Image from 'next/image';

const DynamicReactPlayer = dynamic(
  () => import('react-player'),
  {
    ssr: false,
  }
);

interface HeroSectionProps {
  videoSrc: string;
}

export default function HeroSection({
  videoSrc,
}: HeroSectionProps) {
  const [isLoading, setIsLoading] = useState(true);

  const handleVideoReady = () => {
    setIsLoading(false);
  };

  return (
    <section className="container mx-auto px-4 py-12 md:py-24 lg:py-16 xl:py-6 relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-background z-0"></div>
      <div className="absolute inset-0 bg-snake-watermark bg-cover bg-center opacity-50 scale-150 z-0"></div>
      <div></div>
      <div className="relative grid grid-cols-1 md:grid-cols-2 items-center gap-8 md:gap-16 z-10 w-full">
        <div className="flex flex-col items-center md:items-start text-center md:text-left bg-background p-4 rounded-lg shadow-md w-full">
          <div className="flex justify-center md:justify-start items-center mb-4 fade-in">
            <Image
              src="/images/elaine-logo-new-nobackground.png"
              width={160}
              height={160}
              alt="Hero Background"
              objectFit="cover"
              objectPosition="center"
            />
          </div>
          <p className="text-lg text-primary font-lato tracking-tight fade-in -mb-1 -mt-4">
            Awaken the Power Within –
          </p>

          <h1 className="font-playfair uppercase font-bold tracking-wider text-3xl md:text-5xl whitespace-pre-wrap leading-tight fade-in">
            Kundalini Activation
          </h1>
          <p className="font-playfair text-primary italic font-thin mt-1 fade-in">
            by Elaine Vieira
          </p>

          <hr className="border-t border-muted w-full md:w-3/4 my-4 fade-in" />
          <p className="text-lg md:text-xl font-lato text-muted-foreground mt-2 leading-relaxed fade-in">
            Step into a{' '}
            <span className="text-primary font-bold font-lato">
              transformative journey{' '}
            </span>
            where energy, healing, and connection merge.
            <br />
            This in-person Kundalini Activation session is
            designed to awaken your inner power, release
            emotional blockages, and reconnect you with your{' '}
            <span className="text-primary font-bold font-lato no-whitespace">
              highest self.
              <GiMeditation className="text-primary h-10 w-10 mr-4" />
            </span>
          </p>
          <hr className="border-t border-muted w-1/2 md:w-1/3 my-4 fade-in" />
          <p className="text-base font-lato font-extralight mt-2 fade-in">
            | Group Session |
          </p>
        </div>

        <div className="w-full max-w-lg mx-auto md:mx-0 relative">
          <div className="relative aspect-w-16 aspect-h-9 rounded overflow-hidden shadow-xl z-10">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                <div className="w-10 h-10 border-4 border-t-primary border-white rounded-full animate-spin"></div>
              </div>
            )}

            <DynamicReactPlayer
              url={videoSrc}
              playing
              loop
              muted
              width="100%"
              height="100%"
              onReady={handleVideoReady}
              className="object-cover w-full h-full rounded"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
