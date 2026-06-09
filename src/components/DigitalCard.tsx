'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  FaPhoneAlt,
  FaSms,
  FaWhatsapp,
  FaGlobe,
  FaInstagram,
  FaEnvelope,
  FaTiktok,
  FaFacebookF,
  FaMapMarkerAlt,
  FaDownload,
} from 'react-icons/fa';

const PHONE_DISPLAY = '+1 (954) 895-2263';
const PHONE_E164 = '+19548952263';
const WHATSAPP = 'https://wa.me/19548952263';
const WEBSITE = 'https://www.elainevieira-us.com';
const INSTAGRAM = 'https://www.instagram.com/elainevieira_us/';
const TIKTOK = 'https://www.tiktok.com/@elainevieira_us';
const FACEBOOK = 'https://www.facebook.com/elaine.vieira.16121';
const EMAIL = 'elaine0301@me.com';

interface Action {
  label: string;
  value: string;
  href: string;
  icon: JSX.Element;
  external?: boolean;
}

const actions: Action[] = [
  {
    label: 'Call',
    value: PHONE_DISPLAY,
    href: `tel:${PHONE_E164}`,
    icon: <FaPhoneAlt />,
  },
  {
    label: 'Text Message',
    value: 'Send an SMS',
    href: `sms:${PHONE_E164}`,
    icon: <FaSms />,
  },
  {
    label: 'WhatsApp',
    value: 'Send a message',
    href: WHATSAPP,
    icon: <FaWhatsapp />,
    external: true,
  },
  {
    label: 'Website',
    value: 'elainevieira-us.com',
    href: WEBSITE,
    icon: <FaGlobe />,
    external: true,
  },
  {
    label: 'Instagram',
    value: '@elainevieira_us',
    href: INSTAGRAM,
    icon: <FaInstagram />,
    external: true,
  },
  {
    label: 'Email',
    value: EMAIL,
    href: `mailto:${EMAIL}`,
    icon: <FaEnvelope />,
  },
];

const socials = [
  { label: 'TikTok', href: TIKTOK, icon: <FaTiktok /> },
  { label: 'Facebook', href: FACEBOOK, icon: <FaFacebookF /> },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { ease: 'easeOut', duration: 0.5 } },
};

export default function DigitalCard({ year }: { year: number }) {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-background flex items-center justify-center px-4 py-10">
      {/* Snake watermark background */}
      <div className="pointer-events-none absolute inset-0 bg-snake-watermark bg-cover bg-center opacity-[0.08] scale-150" />
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="relative isolate w-full max-w-md overflow-hidden rounded-[2rem] border border-primary/10 bg-background shadow-2xl"
      >
        {/* Kundalini mandala watermark behind the whole card */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[url('/images/elaine-logo-new-nobackground.webp')] bg-[length:75%] bg-center bg-no-repeat opacity-[0.05]" />

        {/* Header band with the snake symbol */}
        <div className="relative h-28 overflow-hidden bg-gradient-to-r from-primary via-primary to-destructive">
          <div className="absolute inset-0 bg-snake-watermark bg-cover bg-center bg-no-repeat opacity-60" />
        </div>

        {/* Avatar */}
        <motion.div
          variants={item}
          className="relative z-10 flex justify-center"
        >
          <div className="-mt-16 h-28 w-28 overflow-hidden rounded-full border-4 border-background bg-background shadow-lg">
            <Image
              src="/images/elaine-photo.jpg"
              alt="Elaine Vieira"
              width={112}
              height={112}
              priority
              className="h-full w-full object-cover"
            />
          </div>
        </motion.div>

        {/* Identity */}
        <div className="px-6 pt-4 text-center">
          <motion.h1
            variants={item}
            className="font-playfair text-3xl font-bold text-foreground"
          >
            Elaine Vieira
          </motion.h1>
          <motion.p
            variants={item}
            className="mt-1 font-lato font-semibold uppercase tracking-wide text-primary"
          >
            Kundalini Activation & Energy Healing
          </motion.p>
          <motion.div
            variants={item}
            className="mt-2 flex items-center justify-center gap-2 text-sm text-muted"
          >
            <FaMapMarkerAlt className="text-primary" />
            <span>Fort Lauderdale & Orlando · Florida, USA</span>
          </motion.div>
          <motion.p
            variants={item}
            className="mt-3 font-playfair italic text-muted"
          >
            Awaken the power within.
          </motion.p>
        </div>

        {/* Save contact */}
        <motion.div variants={item} className="px-6 pt-6">
          <a
            href="/elaine.vcf"
            download="elaine-vieira.vcf"
            className="group flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-primary to-destructive py-3.5 font-lato font-bold text-background shadow-md shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40 hover:brightness-105 active:translate-y-0 active:scale-[0.98]"
          >
            <FaDownload className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110" />
            Save Contact
          </a>
          <p className="mt-2.5 text-center text-xs text-muted">
            Tap to save Elaine&apos;s contact to your phone
          </p>
        </motion.div>

        {/* Actions */}
        <div className="space-y-3 px-6 pt-5">
          {actions.map((action) => (
            <motion.a
              key={action.label}
              variants={item}
              href={action.href}
              {...(action.external
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
              className="group flex items-center gap-4 rounded-2xl border border-border bg-background p-3 shadow-sm transition-colors hover:border-primary hover:bg-primary/5"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg text-primary transition-colors group-hover:bg-primary group-hover:text-background">
                {action.icon}
              </span>
              <span className="flex flex-col">
                <span className="font-lato font-semibold text-foreground">
                  {action.label}
                </span>
                <span className="text-sm text-muted">{action.value}</span>
              </span>
            </motion.a>
          ))}
        </div>

        {/* Secondary socials */}
        <motion.div
          variants={item}
          className="flex justify-center gap-4 px-6 pt-6"
        >
          {socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-lg text-muted transition-colors hover:border-primary hover:bg-primary hover:text-background"
            >
              {social.icon}
            </a>
          ))}
        </motion.div>

        {/* QR code to this card */}
        <motion.div
          variants={item}
          className="mt-8 flex flex-col items-center px-6"
        >
          <div className="rounded-2xl border border-border bg-background p-3 shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/card-qr.svg"
              alt="QR code to open Elaine Vieira's digital card"
              width={132}
              height={132}
              className="h-[132px] w-[132px]"
            />
          </div>
          <p className="mt-3 text-xs uppercase tracking-wide text-muted">
            Scan to open & share this card
          </p>
        </motion.div>

        {/* Footer */}
        <div className="mt-8 border-t border-border px-6 py-5 text-center">
          <p className="text-xs text-muted">
            © {year} Elaine Vieira · All rights reserved
          </p>
          <p className="mt-1 text-xs text-muted">
            Developed by{' '}
            <a
              href="https://www.wbdigitalsolutions.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline"
            >
              WB Digital Solutions
            </a>
          </p>
        </div>
      </motion.section>
    </main>
  );
}
