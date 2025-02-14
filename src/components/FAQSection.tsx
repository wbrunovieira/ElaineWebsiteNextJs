'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import {
  FiTarget,
  FiActivity,
  FiUsers,
  FiSun,
  FiCheckCircle,
  FiSmile,
  FiPackage,
  FiBox,
} from 'react-icons/fi';
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
    icon: <FiActivity className="text-primary h-6 w-6" />,
  },
  {
    question:
      'What is the intention behind this Kundalini Activation session?',
    answer:
      'The intention is to guide participants toward profound self-awareness, healing, and empowerment by awakening the Kundalini energy, which is deeply connected to the divine feminine within us all. This process helps embrace intuition, creativity, and nurturing power, fostering inner balance and profound self-love. It’s a journey of rediscovering your natural flow and magnetism.',
    icon: <FiTarget className="text-primary h-6 w-6" />,
  },
  {
    question: 'What should I expect during a session?',
    answer:
      'Expect sensations like tingling, warmth, or vibration as energy flows through your body. You may also experience emotional releases and chakra alignment.',
    icon: <FiSun className="text-primary h-6 w-6" />,
  },
  {
    question:
      'Why should I join a group Kundalini Activation session?',
    answer:
      'Joining a group session allows you to benefit from the shared energy, which creates a powerful healing environment. Each participant’s activation contributes to the overall energy flow, elevating everyone’s experience. Additionally, you’ll feel a sense of unity, connection, and mutual support as you heal and grow together with others.',
    icon: <FiUsers className="text-primary h-6 w-6" />,
  },
  {
    question:
      'What are the benefits of a Kundalini Activation session?',
    answer:
      'The benefits include emotional and energetic release, balanced chakras, and restored energy flow. You’ll experience inner peace, mental clarity, enhanced creativity, and personal magnetism. The session also helps awaken the divine feminine energy within you and fosters a deep connection to yourself and others.',
    icon: (
      <FiCheckCircle className="text-primary h-6 w-6" />
    ),
  },
  {
    question: 'Is Kundalini Activation safe?',
    answer:
      'Yes, Kundalini Activation is a natural process guided in a safe and supportive environment by experienced practitioners.',
    icon: <FiSmile className="text-primary h-6 w-6" />,
  },
  {
    question: 'Do I need any prior experience?',
    answer:
      'No prior experience is necessary. Kundalini Activation is suitable for beginners and experienced participants alike.',
    icon: <FiPackage className="text-primary h-6 w-6" />,
  },
  {
    question: 'What should I bring to the session?',
    answer:
      'Wear comfortable clothing and bring an open mind. Mats and cushions are typically provided at the venue.',
    icon: <FiBox className="text-primary h-6 w-6" />,
  },
];

export default function FAQSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      '.faq-item',
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
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
  });

  return (
    <section
      ref={sectionRef}
      className="container mx-auto px-6 py-16 md:py-24 lg:py-32 bg-background relative"
    >
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-2xl md:text-4xl font-playfair font-bold text-primary mb-4">
          Frequently Asked Questions
        </h2>
        <hr className="border-t border-muted w-full md:w-3/4 my-4 mx-auto fade-in" />
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
              className="faq-item bg-card shadow-md p-4 w-full md:w-3/4 mx-auto rounded-lg flex items-center space-x-4"
            >
              <div>{faq.icon}</div>
              <div className="flex-1">
                <AccordionTrigger className="text-lg font-bold font-playfair text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-lato leading-relaxed mt-2">
                  {faq.answer}
                </AccordionContent>
              </div>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
