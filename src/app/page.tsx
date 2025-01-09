import BenefitsSection from '@/components/BenefitsSection';
import FAQSection from '@/components/FAQSection';
import HeroSection from '@/components/hero-section';
import ProblemSolutionSection from '@/components/ProblemSolutionSection';
import {
  FaLightbulb,
  FaPeace,
  FaStar,
} from 'react-icons/fa';

export default function Home() {
  const benefits = [
    {
      icon: <FaStar className="h-10 w-10" />,
      title: 'Emotional Release',
      description:
        'Let go of old patterns and feel a profound sense of peace and transformation.',
    },
    {
      icon: <FaPeace className="h-10 w-10" />,
      title: 'Inner Balance',
      description:
        'Restore harmony to your chakras and reconnect with your inner self.',
    },
    {
      icon: <FaLightbulb className="h-10 w-10" />,
      title: 'Enhanced Creativity',
      description:
        'Awaken your creative energy and unlock your natural magnetism.',
    },
  ];
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
      <BenefitsSection benefits={benefits} />
      <FAQSection />
    </div>
  );
}
