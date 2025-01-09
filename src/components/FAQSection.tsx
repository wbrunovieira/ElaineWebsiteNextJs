'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

gsap.registerPlugin(ScrollTrigger);

const faqData = [
  {
    question: 'What is Kundalini Activation?',
    answer:
      'Kundalini Activation is a powerful process that awakens your dormant life force energy, allowing it to flow freely through your body. This natural energy release not only brings profound healing and emotional breakthroughs but also helps to balance and align all seven chakras, promoting harmony within your entire being.',
  },
  {
    question:
      'What is the intention behind this Kundalini Activation session?',
    answer:
      'The intention is to guide participants toward profound self-awareness, healing, and empowerment by awakening the Kundalini energy, which is deeply connected to the divine feminine within us all. This process helps embrace intuition, creativity, and nurturing power, fostering inner balance and profound self-love. It’s a journey of rediscovering your natural flow and magnetism.',
  },
  {
    question: 'What should I expect during a session?',
    answer:
      'Expect sensations like tingling, warmth, or vibration as energy flows through your body. You may also experience emotional releases and chakra alignment.',
  },
  {
    question:
      'Why should I join a group Kundalini Activation session?',
    answer:
      'Joining a group session allows you to benefit from the shared energy, which creates a powerful healing environment. Each participant’s activation contributes to the overall energy flow, elevating everyone’s experience. Additionally, you’ll feel a sense of unity, connection, and mutual support as you heal and grow together with others.',
  },
  {
    question:
      'What are the benefits of a Kundalini Activation session?',
    answer:
      'The benefits include emotional and energetic release, balanced chakras, and restored energy flow. You’ll experience inner peace, mental clarity, enhanced creativity, and personal magnetism. The session also helps awaken the divine feminine energy within you and fosters a deep connection to yourself and others.',
  },
  {
    question:
      'What can I expect during a Kundalini Activation session?',
    answer:
      'In a safe and supportive group setting, you can expect to feel energy awakening and moving through your body, creating sensations like tingling, warmth, or vibration. The session helps release emotions and old patterns, making space for peace and transformation. You’ll experience chakra balancing, clearing energy blockages, and restoring equilibrium. Additionally, connecting with the collective energy of the group amplifies the healing experience as everyone journeys together.',
  },
  {
    question: 'Is Kundalini Activation safe?',
    answer:
      'Yes, Kundalini Activation is a natural process guided in a safe and supportive environment by experienced practitioners.',
  },
  {
    question: 'Do I need any prior experience?',
    answer:
      'No prior experience is necessary. Kundalini Activation is suitable for beginners and experienced participants alike.',
  },
  {
    question: 'What should I bring to the session?',
    answer:
      'Wear comfortable clothing and bring an open mind. Mats and cushions are typically provided at the venue.',
  },
];

export default function FAQSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        '.faq-item',
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.2,
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
      <div className="text-center max-w-3xl  mb-12">
        <h2 className="text-2xl md:text-4xl font-playfair font-bold text-primary mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-lg md:text-xl font-lato text-muted-foreground leading-relaxed">
          Find answers to common questions about Kundalini
          Activation and how to prepare for the session.
        </p>
      </div>

      <div className="mx-auto">
        <Accordion
          type="single"
          collapsible
          className="space-y-6"
        >
          {faqData.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="faq-item bg-card shadow-md p-4 w-3/4 rounded items-center"
            >
              <AccordionTrigger className="text-lg font-bold font-playfair text-primary">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground font-lato leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
