'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { FaSeedling } from 'react-icons/fa';
import { FiTarget } from 'react-icons/fi';

import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ProblemSolutionProps {
  problemText: string;
  solutionText: string;
}

export default function ProblemSolutionSection({
  problemText,
  solutionText,
}: ProblemSolutionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        '.fade-up',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.3,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
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
      <div className="max-w-4xl mx-auto text-center fade-up">
        <div className="flex justify-center items-center mb-4 fade-up">
          <FaSeedling className="h-12 w-12 text-primary" />
        </div>

        <h2 className="text-2xl md:text-4xl font-playfair font-bold text-primary tracking-wide fade-up">
          Do You Feel Blocked, Disconnected, or Stuck?
        </h2>

        <hr className="border-t border-muted w-full md:w-3/4 my-4 mx-auto fade-in" />

        <p className="text-lg md:text-xl font-lato text-muted-foreground mt-6 fade-up leading-relaxed">
          {problemText}
        </p>
      </div>

      <div className="relative max-w-4xl mx-auto mt-12 md:mt-16">
        <div className="p-6 md:p-12 shadow-xl bg-gradient-to-r from-destructive via-primary to-destructive text-card fade-up rounded relative">
          <div className="flex flex-col md:flex-row justify-center items-center mb-4 fade-up">
            <FiTarget className="text-card bg-primary p-3 rounded-full h-12 w-12 shadow-lg mb-4 md:mb-0 md:mr-4" />
            <h3 className="text-2xl md:text-3xl font-bold font-playfair text-center">
              Here’s How We Can Help You
            </h3>
          </div>
          <p className="text-lg md:text-xl font-lato leading-relaxed text-center text-muted-foreground">
            <span className="text-card font-bold">
              {solutionText.split(' ')[0]}
            </span>{' '}
            {solutionText.slice(solutionText.indexOf(' '))}
          </p>
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-transparent to-[#ffffff1a] opacity-20 pointer-events-none"></div>
        </div>
      </div>
    </section>
  );
}
