'use client';

import { useRef } from 'react';

import BenefitsSection from '@/components/BenefitsSection';
import CTASection from '@/components/CTASection';
import FAQSection from '@/components/FAQSection';
import { Footer } from '@/components/Footer';
import HeroSection from '@/components/hero-section';
import LocationSection from '@/components/LocationSection';
import PhotoGallery from '@/components/PhotoGallery';
import ProblemSolutionSection from '@/components/ProblemSolutionSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import {
  FaLightbulb,
  FaMapMarkerAlt,
  FaPeace,
  FaStar,
  FaVideo,
} from 'react-icons/fa';
import CTAButton from '@/components/CTAButton';
import type { SiteContent } from '@/lib/content';

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

export default function HomeClient({
  content,
}: {
  content: SiteContent;
}) {
  const ctaSectionRef = useRef<HTMLDivElement>(null);

  const scrollToCTASection = () => {
    if (ctaSectionRef.current) {
      ctaSectionRef.current.scrollIntoView({
        behavior: 'smooth',
      });
    }
  };

  const sessionOptions = content.sessions.map(session => ({
    title: session.title,
    description: session.description,
    price: session.price,
    link: session.link,
    icon:
      session.iconType === 'video' ? (
        <FaVideo />
      ) : (
        <FaMapMarkerAlt />
      ),
    date: session.date,
    local: session.local,
    horario: session.horario,
  }));

  return (
    <div className="bg-background">
      <HeroSection videoSrc="/videos/kundalini_hero_lowbitrate.mp4" />
      <div className="w-full flex justify-center z-10">
        <CTAButton
          text="Book Your Session Now!"
          ctaRef={ctaSectionRef}
        />
      </div>

      <ProblemSolutionSection
        problemText="Many people struggle with feelings of disconnection and emotional blocks, preventing them from experiencing true harmony and fulfillment."
        solutionText="Through Kundalini Activation, we awaken the dormant energy within you, bringing balance, healing, and a deeper connection with yourself and the world around you."
      />
      <CTAButton
        text="Start Your Transformation Now!"
        ctaRef={ctaSectionRef}
      />
      <PhotoGallery photos={content.gallery} />
      <CTAButton
        text="Transform Your Life Now"
        ctaRef={ctaSectionRef}
      />
      <BenefitsSection benefits={benefits} />
      <CTAButton
        text="I’m Ready to Join"
        ctaRef={ctaSectionRef}
      />
      <TestimonialsSection
        stories={content.stories}
        onActionClick={scrollToCTASection}
      />
      <CTAButton
        text="I Want to Experience This Too!"
        ctaRef={ctaSectionRef}
      />
      <FAQSection />
      <CTAButton
        text="I Have All the Answers, Sign Me Up!"
        ctaRef={ctaSectionRef}
      />
      <LocationSection locations={content.locations} />
      <CTASection
        ref={ctaSectionRef}
        ctaText="Choose Your Kundalini Activation Experience"
        description="Whether in-person or online, awaken your inner power with our Kundalini Activation sessions."
        options={sessionOptions}
      />
      <Footer />
    </div>
  );
}
