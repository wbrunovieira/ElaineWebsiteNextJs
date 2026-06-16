'use client';

import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import dynamic from 'next/dynamic';
import type { Story, VideoTestimonial } from '@/lib/content';

const DynamicReactPlayer = dynamic(
  () => import('react-player'),
  {
    ssr: false,
  }
);

const MuxPlayer = dynamic(
  () => import('@mux/mux-player-react'),
  { ssr: false }
);

interface TestimonialsSectionProps {
  stories: Story[];
  videoTestimonials: VideoTestimonial[];
  onActionClick?: () => void;
}

export default function TestimonialsSection({
  stories,
  videoTestimonials,
}: TestimonialsSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  const [modalVideo, setModalVideo] =
    useState<VideoTestimonial | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<
    number | null
  >(null);

  // Only show videos that are actually playable (local file or ready Mux asset).
  const videos = videoTestimonials.filter(
    v => v.muxPlaybackId || v.src
  );

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
        {stories.map((story, index) => {
          const isExpanded = expandedIndex === index;
          const contentToShow = isExpanded
            ? story.content
            : story.content.slice(0, 150);

          return (
            <div
              key={story.id}
              className="testimonial-card bg-card shadow-md rounded p-6 flex flex-col justify-between"
            >
              <p className="text-lg italic text-muted-foreground mb-4">
                &quot;{contentToShow}&quot;
                {story.content.length > 150 &&
                  !isExpanded &&
                  '...'}
              </p>
              {story.content.length > 150 && (
                <button
                  className="text-primary text-sm underline mt-2"
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
                  {story.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {story.city}
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
        {videos.map(video => (
          <div
            key={video.id}
            className="bg-gradient-to-r from-primary/40 via-background to-background relative aspect-w-16 aspect-h-9 rounded overflow-hidden shadow-lg cursor-pointer"
            onClick={() => setModalVideo(video)}
          >
            <div className="rounded shadow-xl hover:scale-110 transition-transform duration-300 hover:shadow-2xl hover:border-primary">
              {video.muxPlaybackId ? (
                <MuxPlayer
                  playbackId={video.muxPlaybackId}
                  streamType="on-demand"
                  envKey={process.env.NEXT_PUBLIC_MUX_ENV_KEY}
                  metadata={{
                    video_id: video.muxPlaybackId,
                    video_title: video.title || video.muxPlaybackId,
                  }}
                  autoPlay="muted"
                  loop
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    '--controls': 'none',
                  }}
                />
              ) : (
                <DynamicReactPlayer
                  url={video.src}
                  playing
                  loop
                  muted
                  width="100%"
                  height="100%"
                />
              )}
              <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/20 to-muted/10 blur-xl"></div>
            </div>
          </div>
        ))}
      </div>

      {modalVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="relative w-full max-w-md mx-auto p-4">
            <div
              className="relative w-full rounded overflow-hidden"
              style={{ aspectRatio: '16 / 9' }}
            >
              {modalVideo.muxPlaybackId ? (
                <MuxPlayer
                  playbackId={modalVideo.muxPlaybackId}
                  streamType="on-demand"
                  envKey={process.env.NEXT_PUBLIC_MUX_ENV_KEY}
                  metadata={{
                    video_id: modalVideo.muxPlaybackId,
                    video_title:
                      modalVideo.title || modalVideo.muxPlaybackId,
                  }}
                  autoPlay
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <DynamicReactPlayer
                  url={modalVideo.src}
                  controls
                  playing
                  width="100%"
                  height="100%"
                />
              )}
            </div>
            <button
              className="absolute top-1 right-2 text-white bg-red-600 p-2 rounded-full"
              onClick={() => setModalVideo(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
