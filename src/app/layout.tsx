'use client';
import '@/app/globals.css';

import { Playfair_Display, Lato } from 'next/font/google';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
});

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700'],
});

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
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <title>
          Awaken the Power Within: Kundalini Activation
          Group Session in Fort Lauderdale
        </title>

        <meta
          name="description"
          content="Join our Kundalini Activation Group Session in Fort Lauderdale on January 18th. Awaken your feminine energy, release emotional blockages, and experience profound healing and transformation. Limited spaces available!"
        />
        <meta
          name="keywords"
          content="Kundalini Activation, feminine energy, chakra balancing, emotional healing, group session, energy healing, Fort Lauderdale spiritual events, Kundalini awakening, divine feminine, energy flow, inner peace"
        />
        <meta
          property="og:title"
          content="Awaken the Power Within: Kundalini Activation Group Session"
        />
        <meta
          property="og:description"
          content="Step into a transformative journey of Kundalini Activation in Fort Lauderdale. Awaken your feminine energy, balance your chakras, and experience profound healing."
        />
        <meta
          property="og:image"
          content="https://www.elainevieira-us.com/images/elaine-logo-new-nobackground.png"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:url"
          content="https://www.elainevieira-us.com/"
        />
        <meta property="og:type" content="event" />
        <meta property="og:locale" content="en_US" />
        <meta
          name="twitter:card"
          content="summary_large_image"
        />
        <meta
          name="twitter:title"
          content="Awaken the Power Within: Kundalini Activation Group Session"
        />
        <meta
          name="twitter:description"
          content="Join us for a Kundalini Activation Group Session in Fort Lauderdale. Awaken your feminine energy and experience healing and transformation. Limited spots available!"
        />
        <meta
          name="twitter:image"
          content="https://www.elainevieira-us.com/images/elaine-logo-new-nobackground.png"
        />

        <link
          rel="icon"
          href="https://www.elainevieira-us.com/images/elaine-logo-new-nobackground.png"
          sizes="any"
        />

        <link
          rel="apple-touch-icon"
          href="https://www.elainevieira-us.com/images/elaine-logo-new-nobackground.png"
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Event',
              name: 'Awaken the Power Within: Kundalini Activation Group Session',
              description:
                'Join our Kundalini Activation Group Session to awaken your feminine energy and experience profound healing and transformation.',
              startDate: '2025-01-18T12:00:00-05:00',
              endDate: '2025-01-18T14:00:00-05:00',
              eventStatus:
                'https://schema.org/EventScheduled',
              eventAttendanceMode:
                'https://schema.org/OfflineEventAttendanceMode',
              location: {
                '@type': 'Place',
                name: 'Fun&Flow',
                address: {
                  '@type': 'PostalAddress',
                  streetAddress: '',
                  addressLocality: 'Fort Lauderdale',
                  addressRegion: 'FL',
                  postalCode: '33301',
                  addressCountry: 'US',
                },
              },
              image: [
                'https://www.elainevieira-us.com/images/elaine-logo-new-nobackground.png',
              ],
              organizer: {
                '@type': 'Organization',
                name: 'Elaine Kundalini',
                url: 'https:/www.elainevieira-us.com',
              },
              offers: {
                '@type': 'Offer',
                url: 'https://www.elainevieira-us.com/',
                price: '80',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
                validFrom: '2025-01-01T00:00:00-05:00',
              },
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
