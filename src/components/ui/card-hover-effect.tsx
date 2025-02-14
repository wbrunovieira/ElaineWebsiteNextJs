'use client';

import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

export const HoverEffect = ({
  items,
  className,
}: {
  items: {
    title: string;
    description: string;
    link: string;
    icon?: JSX.Element;
    price?: string;
    local?: string;
    horario?: string;
  }[];
  className?: string;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<
    number | null
  >(null);

  return (
    <div
      className={cn(
        'flex justify-center items-center min-h-screen p-4 lg:p-10',
        className
      )}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {items.map((item, idx) => (
          <Link
            href={item.link}
            key={item.link}
            className="relative group block p-2 h-full w-full"
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <AnimatePresence>
              {hoveredIndex === idx && (
                <motion.span
                  className="absolute inset-0 h-full w-full bg-neutral-200 dark:bg-slate-800/[0.8] block rounded-3xl"
                  layoutId="hoverBackground"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    transition: { duration: 0.15 },
                  }}
                  exit={{
                    opacity: 0,
                    transition: {
                      duration: 0.15,
                      delay: 0.2,
                    },
                  }}
                />
              )}
            </AnimatePresence>
            <Card>
              {item.icon && (
                <div className="flex items-center justify-center mb-4 text-primary text-4xl">
                  {item.icon}
                </div>
              )}
              <CardTitle>{item.title}</CardTitle>
              {/* Exibe local e horário se disponíveis */}

              <div className="flex flex-col items-center justify-center w-full bg-primary  p-4 rounded">
                {item.local && (
                  <p className="text-center text-sm text-muted-foreground ">
                    Local: {item.local}
                  </p>
                )}
                {item.horario && (
                  <p className="text-center text-sm text-muted-foreground ">
                    Horário: {item.horario}
                  </p>
                )}
              </div>
              <hr className="border-t border-primary w-1/2 mx-auto my-2" />
              <CardDescription>
                {item.description}
              </CardDescription>
              {item.price && (
                <p
                  className={cn(
                    'bg-primary text-background p-4 mt-8 font-extrabold text-4xl rounded',
                    'shadow-[0px_0px_10px_rgba(0,0,0,0.42)]'
                  )}
                >
                  {item.price}
                </p>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export const Card = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        'rounded-2xl h-full w-full p-4 overflow-hidden bg-background border border-transparent dark:border-white/[0.2] group-hover:border-primary relative z-20',
        className
      )}
    >
      <div className="relative z-50">
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export const CardTitle = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <h4
      className={cn(
        'text-primary font-bold tracking-wide mt-4 text-center',
        className
      )}
    >
      {children}
    </h4>
  );
};

export const CardDescription = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <p
      className={cn(
        'mt-8 text-primary tracking-wide leading-relaxed text-sm text-center',
        className
      )}
    >
      {children}
    </p>
  );
};
