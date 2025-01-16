'use client';

import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import dynamic from 'next/dynamic';

const DynamicReactPlayer = dynamic(
  () => import('react-player'),
  {
    ssr: false,
  }
);

interface Testimonial {
  name: string;
  city: string;
  content: string;
}

interface TestimonialsSectionProps {
  onActionClick?: () => void;
}

export default function TestimonialsSection({}: TestimonialsSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  const [modalVideoSrc, setModalVideoSrc] = useState<
    string | null
  >(null);
  const [expandedIndex, setExpandedIndex] = useState<
    number | null
  >(null);
  const [videoLoadingStates, setVideoLoadingStates] =
    useState<boolean[]>(Array(6).fill(true));

  const testimonials: Testimonial[] = [
    {
      name: 'Enda',
      city: 'Dally Pembroke Pines - Fort Lauderdale - FL - USA',
      content:
        'I have participated in Kundalini sessions twice, and both experiences were truly transformative. I have been working with Elaine for over a year, during which she has provided me with a variety of treatments and therapies. However, I must say that the Kundalini sessions have been the most impactful for me. Having faced significant trauma a year and a half ago, Elaine has been instrumental in supporting my healing journey. Despite only having two Kundalini sessions, the experience has been life-changing. Each session brought about a profound sense of release, as though a heavy burden I&apos;ve been carrying was lifted. While I acknowledge that my healing process is ongoing, I wholeheartedly recommend a Kundalini session with Elaine. Her expertise and care make it an experience you won&apos;t regret.',
    },
    {
      name: 'Maicy',
      city: 'Belo Horizonte, MG - Brazil',
      content:
        'Today, I had a Kundalini session with Elane, and it focused on resolving past traumas. During the session, a past life came to me, one that I had already experienced through regression. My body became immobilized, and strong emotions surfaced. I was able to understand why I struggle to pursue my gifts and help others, due to traumas I experienced in other lives. I am deeply grateful—thank you, Elane. This technique was wonderful for me and helped me immensely.',
    },
    {
      name: 'Samantha',
      city: 'Miami - FL - USA',
      content:
        'My first experience with a Kundalini session guided by Elaine was truly unforgettable. The energy that flowed through me during the session felt like a gentle yet powerful wave, washing away the emotional blocks I wasn’t even aware I had. I felt a deep connection with myself and a renewed sense of purpose. Elaine’s guidance was compassionate and intuitive, making me feel safe throughout the entire process. After the session, I felt lighter, more centered, and incredibly grateful for this profound healing journey. I am excited to continue exploring this powerful technique.',
    },
  ];

  const videoSources = [
    '/videos/depoiment1_lowbitrate.mp4',
    '/videos/depoiment3_lowbitrate.mp4',
    '/videos/depoiment4_lowbitrate.mp4',
  ];

  useGSAP(() => {
    gsap.fromTo(
      '.testimonial-card',
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.3,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  const handleVideoReady = (index: number) => {
    setVideoLoadingStates(prevStates => {
      const newStates = [...prevStates];
      newStates[index] = false;
      return newStates;
    });
  };

  return (
    <section
      ref={sectionRef}
      className="container mx-auto px-6 py-16 md:py-24 lg:py-32 bg-background relative"
    >
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-2xl md:text-4xl font-playfair font-bold text-primary">
          Transformative Stories
        </h2>
        <p className="text-lg md:text-xl font-lato text-muted-foreground leading-relaxed">
          Real experiences from people who have unlocked
          their potential and transformed their lives.
        </p>
        <hr className="border-t border-muted w-full md:w-3/4 mx-auto my-6" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {testimonials.map((testimonial, index) => {
          const isExpanded = expandedIndex === index;
          const contentToShow = isExpanded
            ? testimonial.content
            : testimonial.content.slice(0, 150);

          console.log({
            index,
            isExpanded,
            contentToShow,
            contentLength: testimonial.content.length,
          });

          return (
            <div
              key={index}
              className="testimonial-card bg-card shadow-md rounded p-6 flex flex-col justify-between"
            >
              <p className="text-lg italic text-muted-foreground mb-4">
                &quot;{contentToShow}&quot;
                {testimonial.content.length > 150 &&
                  !isExpanded &&
                  '...'}
              </p>
              {testimonial.content.length > 150 && (
                <button
                  className="text-primary text-sm underline mt-2"
                  onClick={() => {
                    console.log('Button clicked:', {
                      index,
                      isExpanded,
                    });
                    setExpandedIndex(
                      isExpanded ? null : index
                    );
                  }}
                >
                  {isExpanded ? 'Read Less' : 'Read More'}
                </button>
              )}
              <div className="text-right mt-4">
                <p className="font-bold text-primary">
                  {testimonial.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {testimonial.city}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center max-w-3xl mx-auto mb-12">
        <h3 className="text-xl md:text-2xl font-playfair font-bold text-primary">
          Video Testimonials
        </h3>
        <p className="text-lg font-lato text-muted-foreground">
          Witness the journey of transformation in their own
          words.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {videoSources.map((videoSrc, index) => (
          <div
            key={index}
            className="bg-gradient-to-r from-primary/40 via-background to-background relative aspect-w-16 aspect-h-9 rounded overflow-hidden shadow-lg cursor-pointer"
            onClick={() => setModalVideoSrc(videoSrc)}
          >
            {videoLoadingStates[index] && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                <div className="w-10 h-10 border-4 border-t-primary border-white rounded-full animate-spin"></div>
              </div>
            )}
            <div className="rounded shadow-xl hover:scale-110 transition-transform duration-300 hover:shadow-2xl hover:border-primary">
              <DynamicReactPlayer
                url={videoSrc}
                playing
                loop
                muted
                width="100%"
                height="100%"
                onReady={() => handleVideoReady(index)}
              />
              <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/20 to-muted/10 blur-xl"></div>
            </div>
          </div>
        ))}
      </div>

      {modalVideoSrc && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="relative w-full max-w-md mx-auto p-4">
            <div
              className="relative w-full rounded overflow-hidden"
              style={{ aspectRatio: '16 / 9' }}
            >
              <DynamicReactPlayer
                url={modalVideoSrc}
                controls
                playing
                width="100%"
                height="100%"
              />
            </div>
            <button
              className="absolute top-1 right-2 text-white bg-red-600 p-2 rounded-full"
              onClick={() => setModalVideoSrc(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
