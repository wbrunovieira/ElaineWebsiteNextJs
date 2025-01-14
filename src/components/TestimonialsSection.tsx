'use client';

import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

interface Testimonial {
  name: string;
  city: string;
  content: string;
}

interface TestimonialsSectionProps {
  onActionClick: () => void;
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
        'I have participated in Kundalini sessions twice, and both experiences were truly transformative...',
    },
    {
      name: 'Maicy',
      city: 'Belo Horizonte, MG - Brazil',
      content:
        'Today, I had a Kundalini session with Elane, and it focused on resolving past traumas...',
    },
    {
      name: 'Samantha',
      city: 'Miami - FL - USA',
      content:
        'My first experience with a Kundalini session guided by Elaine was truly unforgettable...',
    },
  ];

  const videoSources = [
    '/videos/depoiment1_lowbitrate.mp4',
    '/videos/depoiment2_lowbitrate.mp4',
    '/videos/depoiment3_lowbitrate.mp4',
    '/videos/depoiment4_lowbitrate.mp4',
    '/videos/depoiment5_lowbitrate.mp4',
    '/videos/depoiment6_lowbitrate.mp4',
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

  const handleVideoCanPlayThrough = (index: number) => {
    console.log(`Video ${index} can play through`);
    setVideoLoadingStates(prevStates => {
      const newStates = [...prevStates];
      newStates[index] = false; // Remove o spinner para o vídeo atual
      console.log(
        'Updated video loading states:',
        newStates
      );
      return newStates;
    });
  };

  const handleVideoLoaded = (index: number) => {
    console.log('Video loaded for index:', index);
    setVideoLoadingStates(prevStates => {
      const newStates = [...prevStates];
      newStates[index] = false;
      console.log(
        'Updated video loading states:',
        newStates
      );
      return newStates;
    });
  };

  useEffect(() => {
    console.log(
      'Updated video loading states:',
      videoLoadingStates
    );
  }, [videoLoadingStates]);
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
            : testimonial.content.slice(0, 150) +
              (testimonial.content.length > 150
                ? '...'
                : '');

          return (
            <div
              key={index}
              className="testimonial-card bg-card shadow-md rounded p-6"
            >
              <p className="text-lg italic text-muted-foreground mb-4">
                &quot;{contentToShow}&quot;
              </p>
              {testimonial.content.length > 150 && (
                <button
                  className="text-primary text-sm underline"
                  onClick={() =>
                    setExpandedIndex(
                      isExpanded ? null : index
                    )
                  }
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
            className="relative aspect-w-16 aspect-h-9 rounded overflow-hidden shadow-lg cursor-pointer"
            onClick={() => setModalVideoSrc(videoSrc)}
          >
            {/* {videoLoadingStates[index] && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                <div className="w-10 h-10 border-4 border-t-primary border-white rounded-full animate-spin"></div>
              </div>
            )} */}
            <video
              src={videoSrc}
              className="object-cover w-full h-full rounded"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              onLoadStart={() =>
                console.log(
                  `Video ${index} started loading`
                )
              }
              onLoadedData={() => {
                console.log(`Video ${index} loaded data`);
                handleVideoLoaded(index);
              }}
              onCanPlayThrough={() =>
                handleVideoCanPlayThrough(index)
              }
            />
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
              <video
                src={modalVideoSrc}
                className="w-full h-full object-cover"
                controls
                autoPlay
                preload="metadata"
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
