import HeroSection from '@/components/hero-section';
import ProblemSolutionSection from '@/components/ProblemSolutionSection';

export default function Home() {
  return (
    <div className="bg-background">
      <HeroSection
        ctaLink="https://www.eventbrite.com/e/1135200829239?aff=oddtdtcreator"
        videoSrc="/kudalini_hero.mp4"
      />
      <ProblemSolutionSection
        problemText="Many people struggle with feelings of disconnection and emotional blocks, preventing them from experiencing true harmony and fulfillment."
        solutionText="Through Kundalini Activation, we awaken the dormant energy within you, bringing balance, healing, and a deeper connection with yourself and the world around you."
      />
    </div>
  );
}
