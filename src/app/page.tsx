import HeroSection from '@/components/hero-section';

export default function Home() {
  return (
    <div className="bg-background">
      <HeroSection
        ctaLink="/signup"
        imageSrc="/placeholder.svg?height=400&width=600"
        imageAlt="Product showcase"
      />
    </div>
  );
}
