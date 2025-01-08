import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  ctaLink: string;
  videoSrc: string;
}

export default function HeroSection({
  ctaLink,
  videoSrc,
}: HeroSectionProps) {
  return (
    <section className="container mx-auto px-4 py-12 md:py-24">
      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-sm text-primary font-bold tracking-tight -mb-4-">
            Awaken the Power Within –
          </h1>
          <p className="text-6xl whitespace-nowrap mt-0">
            Kundalini Activation
          </p>

          <p className="text-xl text-muted-foreground">
            Step into a{' '}
            <span className="text-primary font-bold">
              transformative journey{' '}
            </span>
            where energy, healing, and connection merge.
            <br /> <br /> This in-person Kundalini
            Activation session is designed to awaken your
            inner power, release emotional blockages, and
            reconnect you with your{' '}
            <span className="text-primary font-bold">
              highest self
            </span>
            .
          </p>
          <p className="inline-block  font-extralight mt-2">
            | Group Session |
          </p>
          <div className="mt-4">
            <Button asChild variant="default" size="lg">
              <a href={ctaLink}>Get Started</a>
            </Button>
          </div>
        </div>
        <div className="flex-1 w-full max-w-md">
          <div className="aspect-w-4 aspect-h-3 relative rounded-lg overflow-hidden shadow-xl">
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
