'use client';
import gsap from 'gsap';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  ctaLink: string;
  videoSrc: string;
}

export default function HeroSection({
  ctaLink,
  videoSrc,
}: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        '.fade-in',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.2,
          ease: 'power3.out',
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="container mx-auto px-4 py-12 md:py-24 lg:py-16 xl:py-6 relative min-h-screen flex items-center"
    >
      <div className="absolute inset-0 bg-background z-0"></div>
      <div className="relative grid grid-cols-1 md:grid-cols-2 items-center gap-8 md:gap-16 z-10">
        <div className="flex flex-col items-center md:items-start text-center md:text-left bg-background p-4 rounded-lg shadow-md">
          <h1 className="text-sm text-primary font-lato tracking-tight fade-in -mb-1">
            Awaken the Power Within –
          </h1>

          <p className="font-playfair uppercase font-bold tracking-wider text-3xl md:text-5xl whitespace-pre-wrap leading-tight fade-in">
            Kundalini Activation
          </p>
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
            <span className="text-primary font-bold font-lato">
              highest self
            </span>
            .
          </p>
          <p className="text-base font-lato font-extralight mt-2 fade-in">
            | Group Session |
          </p>

          <hr className="border-t border-muted w-1/2 md:w-1/3 my-4 fade-in" />
          <div className="mt-2 fade-in">
            <Button asChild variant="default" size="lg">
              <a href={ctaLink}>Get Started</a>
            </Button>
          </div>
        </div>

        <div className="w-full max-w-lg mx-auto md:mx-0">
          <div className="relative aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-xl">
            <video
              src={videoSrc}
              className="object-cover w-full h-full rounded"
              autoPlay
              loop
              muted
              playsInline
            />
          </div>
        </div>
      </div>
    </section>
  );
}
