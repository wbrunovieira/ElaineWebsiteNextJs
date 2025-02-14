'use client';

import { RefObject } from 'react';

interface CTAButtonProps {
  text: string;
  ctaRef: RefObject<HTMLDivElement>;
}

export default function CTAButton({
  text,
  ctaRef,
}: CTAButtonProps) {
  const scrollToCTA = () => {
    if (ctaRef.current) {
      ctaRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full flex justify-center items-center px-4 z-50">
      <button
        onClick={scrollToCTA}
        className="tracking-wider text-3xl  px-6 py-3  text-white font-bold rounded shadow-md transition duration-300 hover:opacity-90 hover:scale-105"
        style={{ backgroundColor: '#1D6D45' }}
      >
        {text}
      </button>
    </div>
  );
}
