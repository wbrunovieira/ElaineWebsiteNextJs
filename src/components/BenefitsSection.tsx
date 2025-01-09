'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface BenefitsSectionProps {
  benefits: {
    icon: JSX.Element;
    title: string;
    description: string;
  }[];
}

export default function BenefitsSection({
  benefits,
}: BenefitsSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        '.benefit-card',
        { opacity: 0, x: -100 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.2,
          delay: 0.3,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            toggleActions: 'play none none none',
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="container mx-auto px-6 py-16 md:py-24 lg:py-32 bg-background relative"
    >
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-4xl font-playfair font-bold text-primary mb-6">
          Benefits of Kundalini Activation
        </h2>
        <hr className="border-t border-muted w-full md:w-3/4 my-4 mx-auto fade-in" />
        <p className="text-lg md:text-xl font-lato text-muted-foreground leading-relaxed mb-12">
          Discover the transformative advantages of
          unlocking your energy and reconnecting with your
          true self.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className="benefit-card bg-card shadow-md rounded-lg p-6 text-center"
          >
            <div className="flex justify-center items-center mb-4 text-primary">
              {benefit.icon}
            </div>
            <h3 className="text-xl font-bold font-playfair mb-2">
              {benefit.title}
            </h3>
            <p className="text-muted-foreground text-sm font-lato leading-relaxed">
              {benefit.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
