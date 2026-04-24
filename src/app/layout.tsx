import '@/app/globals.css';
import type { Metadata } from 'next';
import { Playfair_Display, Lato } from 'next/font/google';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
});

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.elainevieira-us.com'),
  title: 'Kundalini Activation by Elaine Vieira | Fort Lauderdale & Orlando',
  description:
    'Awaken your inner power with Kundalini Activation group sessions by Elaine Vieira. In-person sessions in Fort Lauderdale and Orlando, FL, plus online. Limited spaces available.',
  keywords: [
    'Kundalini Activation',
    'Elaine Vieira',
    'chakra balancing',
    'emotional healing',
    'energy healing',
    'Fort Lauderdale spiritual events',
    'Orlando spiritual events',
    'Kundalini awakening',
    'divine feminine',
    'inner peace',
  ],
  alternates: {
    canonical: 'https://www.elainevieira-us.com/',
  },
  openGraph: {
    title: 'Kundalini Activation by Elaine Vieira',
    description:
      'Step into a transformative journey of Kundalini Activation. Awaken your energy, balance your chakras, and experience profound healing. In-person in Fort Lauderdale & Orlando, and online.',
    url: 'https://www.elainevieira-us.com/',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/kundalini-icon-rectangular-1200x630.jpg',
        width: 1200,
        height: 630,
        alt: 'Kundalini Activation by Elaine Vieira',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kundalini Activation by Elaine Vieira',
    description:
      'Join a Kundalini Activation group session with Elaine Vieira. In-person in Fort Lauderdale & Orlando, plus online. Awaken your energy and experience healing.',
    images: ['/kundalini-icon-rectangular-1200x630.jpg'],
  },
  icons: {
    icon: '/kundalini-icon.ico',
    apple: '/kundalini-icon.png',
  },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'Kundalini Activation – Fort Lauderdale',
    description:
      'Join Elaine Vieira for a transformative in-person Kundalini Activation group session in Fort Lauderdale, FL.',
    startDate: '2026-05-15T13:00:00-05:00',
    endDate: '2026-05-15T15:00:00-05:00',
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: 'Fun&Flow',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Fort Lauderdale',
        addressRegion: 'FL',
        postalCode: '33301',
        addressCountry: 'US',
      },
    },
    image: [
      'https://www.elainevieira-us.com/kundalini-icon-rectangular-1200x630.jpg',
    ],
    organizer: {
      '@type': 'Person',
      name: 'Elaine Vieira',
      url: 'https://www.elainevieira-us.com',
    },
    offers: {
      '@type': 'Offer',
      url: 'https://www.eventbrite.com/e/kundalini-activation-fort-lauderdale-tickets-1249460673509',
      price: '80',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'Kundalini Activation – Orlando',
    description:
      'Join Elaine Vieira for a transformative in-person Kundalini Activation group session in Orlando, FL.',
    startDate: '2026-05-22T14:00:00-05:00',
    endDate: '2026-05-22T16:00:00-05:00',
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: 'Orlando Venue',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Orlando',
        addressRegion: 'FL',
        addressCountry: 'US',
      },
    },
    image: [
      'https://www.elainevieira-us.com/kundalini-icon-rectangular-1200x630.jpg',
    ],
    organizer: {
      '@type': 'Person',
      name: 'Elaine Vieira',
      url: 'https://www.elainevieira-us.com',
    },
    offers: {
      '@type': 'Offer',
      url: 'https://www.eventbrite.com/e/kundalini-activation-orlando-tickets-1232399583329',
      price: '80',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'Kundalini Activation – Online Session',
    description:
      'Experience Kundalini Activation from the comfort of your home with Elaine Vieira.',
    startDate: '2026-05-06T19:00:00-05:00',
    endDate: '2026-05-06T21:00:00-05:00',
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    location: {
      '@type': 'VirtualLocation',
      url: 'https://www.eventbrite.com/e/kundalini-activation-on-line-tickets-1249527633789',
    },
    image: [
      'https://www.elainevieira-us.com/kundalini-icon-rectangular-1200x630.jpg',
    ],
    organizer: {
      '@type': 'Person',
      name: 'Elaine Vieira',
      url: 'https://www.elainevieira-us.com',
    },
    offers: {
      '@type': 'Offer',
      url: 'https://www.eventbrite.com/e/kundalini-activation-on-line-tickets-1249527633789',
      price: '65',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.className} ${lato.className}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
