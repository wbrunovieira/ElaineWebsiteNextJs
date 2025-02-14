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

gsap.registerPlugin(ScrollTrigger);

// Dados dos locais
const locations = [
  {
    id: 'ftlauderdale',
    name: 'Fun&Flow - Fort Lauderdale, FL',
    date: 'March 15th, 2025',
    time: '1:00 PM - 3:00 PM',
    googleMapsUrl:
      'https://www.google.com/maps/place/Fun%26Flow/@26.1504671,-80.1340523,17z/',
    wazeUrl:
      'https://ul.waze.com/ul?ll=26.150467,-80.134052&navigate=yes',
    mapEmbedSrc:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3851.7962910119254!2d-80.1340522720193!3d26.15046716770682!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88d901bd541b449d%3A0xec3f2a005e9a564b!2sFunk%26Flow!5e0!3m2!1sen!2sbr!4v1736451372227!5m2!1sen!2sbr',
  },
  {
    id: 'orlando',
    name: 'Orlando, FL',
    date: 'February 22th, 2025',
    time: '2:00 PM - 4:00 PM',
    googleMapsUrl:
      'https://www.google.com/maps/dir/?api=1&destination=28.501995075736172,-81.35706202450397',
    wazeUrl:
      'https://waze.com/ul?ll=28.501995075736172,-81.35706202450397&navigate=yes',
    mapEmbedSrc:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3506.254323478002!2d-81.35706202450397!3d28.501995075736172!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88e77b5b306e824d%3A0x1df49cecc3f01344!2s2006%20White%20Ave%2C%20Orlando%2C%20FL%2032806%2C%20USA!5e0!3m2!1sen!2sbr!4v1739569186057!5m2!1sen!2sbr',
  },
];

export default function LocationSection() {
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
