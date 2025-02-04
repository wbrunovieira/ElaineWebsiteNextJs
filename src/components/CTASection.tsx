'use client';

import { forwardRef, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

import { cn } from '@/lib/utils';
import { HoverEffect } from './ui/card-hover-effect';
import { FaMapMarkerAlt, FaVideo } from 'react-icons/fa';

gsap.registerPlugin(ScrollTrigger);

interface CTASectionProps {
  ctaText: string;
  description: string;
  options: {
    title: string;
    description: string;
    price: string;
    link: string;
    icon: JSX.Element;
    date: string;
  }[];
}

export const options = [
  {
    title: 'In-Person Session',
    description:
      'Join us in a transformative in-person Kundalini Activation session.',
    price: '$80.00',
    link: 'https://www.eventbrite.com/e/1203759419829?aff=oddtdtcreator',
    icon: <FaMapMarkerAlt />,
    date: '15/Feb',
  },
  {
    title: 'Online Session',
    description:
      'Experience Kundalini Activation from the comfort of your home.',
    price: '$80.00',
    link: 'https://www.eventbrite.com/e/1203627294639?aff=oddtdtcreator',
    icon: <FaVideo />,
    date: '05/Feb',
  },
];

const CTASection = forwardRef<
  HTMLDivElement,
  CTASectionProps
>(({ ctaText, description, options }, ref) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;
    gsap.fromTo(
      sectionRef.current,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  const hoverItems = options.map(option => ({
    title: option.title,
    description: option.description,
    link: option.link,
    icon: option.icon,
    price: option.price,
    date: option.date,
  }));

  return (
    <section
      ref={ref || sectionRef}
      className={cn(
        'container mx-auto px-6 py-8 rounded md:py-4 bg-gradient-to-r from-primary/80 via-primary to-destructive text-card text-center shadow-xl relative'
      )}
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-2">
          <h2 className="text-5xl md:text-6xl font-bold font-playfair mb-4 tracking-wide text-background p-4">
            {ctaText}
          </h2>
          <hr className="border-t border-card w-1/2 mx-auto my-2" />
          <p className="text-xl md:text-2xl font-lato leading-relaxed mb-2 text-muted-foreground">
            {description}
          </p>
        </div>
        <h4 className="text-xl md:text-xl font-lato leading-relaxed text-muted-foreground md:-mb-48">
          Choose Below group online or in-person:
        </h4>

        <HoverEffect
          items={hoverItems.map(item => ({
            ...item,
            title: `${item.title} - ${item.date}`,
          }))}
        />
      </div>
    </section>
  );
});

CTASection.displayName = 'CTASection';

export default CTASection;
