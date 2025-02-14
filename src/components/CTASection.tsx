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
    local?: string;
    horario?: string;
  }[];
}

export const options = [
  {
    title: 'In-Person Session',
    description:
      'Join us in a transformative in-person Kundalini Activation session.',
    price: '$80.00',
    link: 'https://www.eventbrite.com/e/kundalini-activation-fort-lauderdale-tickets-1249460673509',
    icon: <FaMapMarkerAlt />,
    date: '15/Mar',
    local: 'Fort Lauderdale',
    horario: '1:00 PM',
  },
  {
    title: 'In-Person Session',
    description:
      'Join us in a transformative in-person Kundalini Activation session.',
    price: '$80.00',
    link: 'https://www.eventbrite.com/e/kundalini-activation-orlando-tickets-1232399583329',
    icon: <FaMapMarkerAlt />,
    date: '22/Mar',
    local: 'Orlando',
    horario: '2:00 PM',
  },
  {
    title: 'Online Session',
    description:
      'Experience Kundalini Activation from the comfort of your home.',
    price: '$65.00',
    link: 'https://www.eventbrite.com/e/kundalini-activation-on-line-tickets-1249527633789',
    icon: <FaVideo />,
    date: '06/Mar',
    horario: '7:00 PM',
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
    local: option.local,
    horario: option.horario,
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
        <h4 className="text-xl md:text-xl font-lato leading-relaxed text-muted-foreground">
          Choose Below group online or in-person:
        </h4>
        <div className="relative">
          <HoverEffect
            items={hoverItems.map(item => ({
              ...item,
              title: `${item.title} - ${item.date}`,
            }))}
          />
        </div>
      </div>
    </section>
  );
});

CTASection.displayName = 'CTASection';

export default CTASection;
