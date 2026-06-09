import type { Metadata } from 'next';
import DigitalCard from '@/components/DigitalCard';

export const metadata: Metadata = {
  title: 'Elaine Vieira · Digital Card',
  description:
    'Connect with Elaine Vieira — Kundalini Activation & Energy Healing in Fort Lauderdale, Orlando and online. Call, WhatsApp, Instagram and more.',
  alternates: {
    canonical: 'https://card.elainevieira-us.com/',
  },
  openGraph: {
    title: 'Elaine Vieira · Digital Card',
    description:
      'Connect with Elaine Vieira — Kundalini Activation & Energy Healing. Save the contact, call, WhatsApp or follow on Instagram.',
    url: 'https://card.elainevieira-us.com/',
    type: 'profile',
    images: [
      {
        url: '/kundalini-icon-rectangular-1200x630.jpg',
        width: 1200,
        height: 630,
        alt: 'Elaine Vieira · Digital Card',
      },
    ],
  },
};

export default function CardPage() {
  return <DigitalCard year={new Date().getFullYear()} />;
}
