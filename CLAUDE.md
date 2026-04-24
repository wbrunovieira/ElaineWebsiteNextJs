# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start dev server with Turbopack
pnpm build      # Production build
pnpm start      # Run production server
pnpm lint       # ESLint check
```

## Stack

- **Next.js 15** (App Router, `'use client'` on all interactive components)
- **TypeScript** with `@/*` path alias pointing to `./src/*`
- **Tailwind CSS** with a custom theme — use the defined colors/fonts rather than arbitrary values
- **GSAP + ScrollTrigger** for scroll-driven animations; **Framer Motion** is also installed
- **shadcn/ui** (New York style) + **Radix UI** for accessible primitives
- **pnpm** as package manager

## Architecture

`src/app/page.tsx` is the single page that imports all section components in order. Each section is a self-contained `'use client'` component in `src/components/`. There is no routing, no API layer, and no database — all content is hardcoded inside each component.

**Animation pattern:** Every section uses GSAP with `ScrollTrigger`. The canonical pattern is `useGSAP(() => { gsap.from(..., { scrollTrigger: { trigger, start: 'top 80%' } }) }, { scope: ref })`. Stagger animations use 0.2–0.3s delays with `power3.out` easing.

**Scroll-to-CTA:** `page.tsx` holds a `ctaSectionRef` and passes it as a prop to both `CTAButton` (triggers the scroll) and `CTASection` (the target). This is the only cross-component state.

**Styling conventions:**
- Use `cn()` from `src/lib/utils.ts` for conditional class merging (clsx + tailwind-merge)
- Font families are applied via `next/font/google` CSS variables: `font-playfair` (headings) and `font-lato` (body)
- Brand colors: `primary` (#E63946 red), `secondary` (#1D6D45 green), `accent` (#06D6A0 teal), `background` (#F5EDE1 cream)

**Media:** `react-player` is dynamically imported with `ssr: false`. Next.js `<Image>` is used everywhere with blur placeholders. Videos live in `public/videos/`, images in `public/images/`.
