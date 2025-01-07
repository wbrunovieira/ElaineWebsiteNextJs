import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  ctaLink: string;
  imageSrc: string;
  imageAlt: string;
}

export default function HeroSection({
  ctaLink,
  imageSrc,
  imageAlt,
}: HeroSectionProps) {
  return (
    <section className="container mx-auto px-4 py-12 md:py-24">
      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
        <div className="flex-1 space-y-4 text-center md:text-left">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Awaken the Power Within – Kundalini Activation
            Group Session
          </h1>
          <p className="text-xl text-muted-foreground">
            Step into a transformative journey where energy,
            healing, and connection merge. This in-person
            Kundalini Activation session is designed to
            awaken your inner power, release emotional
            blockages, and reconnect you with your highest
            self.
          </p>
          <div>
            <Button asChild variant="default" size="lg">
              <a href={ctaLink}>Get Started</a>
            </Button>
          </div>
        </div>
        <div className="flex-1 w-full max-w-md">
          <div className="aspect-w-4 aspect-h-3 relative rounded-lg overflow-hidden shadow-xl">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
