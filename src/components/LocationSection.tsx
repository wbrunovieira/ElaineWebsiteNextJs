'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaGoogle,
  FaWaze,
} from 'react-icons/fa';
import type { LocationItem } from '@/lib/content';

gsap.registerPlugin(ScrollTrigger);

export default function LocationSection({
  locations,
}: {
  locations: LocationItem[];
}) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      '.location-item',
      { opacity: 0, x: -30 },
      {
        opacity: 1,
        x: 0,
        duration: 1,
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
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-2xl md:text-4xl font-playfair font-bold text-primary mb-4">
          Event Locations: On-Site Details
        </h2>
        <hr className="border-t border-muted w-full md:w-3/4 my-4 mx-auto" />
        <p className="text-lg md:text-xl font-lato text-muted-foreground leading-relaxed">
          Choose the location that suits you best for this
          transformative experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 ">
        {locations.map(loc => (
          <div
            key={loc.id}
            className="space-y-6 location-item border-[0.1px] p-2 rounded border-primary"
          >
            <div className="flex items-center space-x-4">
              <FaMapMarkerAlt className="text-primary h-8 w-8" />
              <div>
                <h3 className="text-xl font-playfair font-bold text-primary">
                  Location
                </h3>
                <p className="text-muted-foreground font-lato text-lg">
                  {loc.name}
                </p>
              </div>
            </div>

            {/* Mapa e botões de navegação */}
            <div className="w-full rounded-lg overflow-hidden shadow-lg">
              <div className="flex justify-center space-x-6 mb-4">
                <a
                  href={loc.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#4285F4] text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
                  title="Open in Google Maps"
                >
                  <FaGoogle className="h-6 w-6" />
                </a>
                <a
                  href={loc.wazeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#2C94F4] text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
                  title="Open in Waze"
                >
                  <FaWaze className="h-6 w-6" />
                </a>
              </div>

              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  title={`Location Map - ${loc.name}`}
                  src={loc.mapEmbedSrc}
                  className="w-full h-full"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>

            {/* Detalhes do local */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <FaCalendarAlt className="text-primary h-8 w-8" />
                <div>
                  <h3 className="text-xl font-playfair font-bold text-primary">
                    Date
                  </h3>
                  <p className="text-muted-foreground font-lato">
                    {loc.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <FaClock className="text-primary h-8 w-8" />
                <div>
                  <h3 className="text-xl font-playfair font-bold text-primary">
                    Time
                  </h3>
                  <p className="text-muted-foreground font-lato">
                    {loc.time}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
