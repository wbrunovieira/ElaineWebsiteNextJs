import HeroSection from '@/components/hero-section';

export default function Home() {
  return (
    <div className="bg-background">
      <HeroSection
        ctaLink="/signup"
        videoSrc="/kudalini_hero.mp4"
      />
    </div>
  );
}
