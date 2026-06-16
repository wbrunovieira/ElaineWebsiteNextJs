# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start dev server with Turbopack
pnpm build      # Production build
pnpm start      # Run production server
pnpm lint       # ESLint check
pnpm test       # Run Vitest suite (backend/lib unit + route tests)
pnpm test:cov   # Tests with coverage
```

> Don't run `pnpm build` while `pnpm dev` is running — both write `.next` and corrupt the dev server.

## Stack

- **Next.js 15** (App Router, `'use client'` on all interactive components)
- **TypeScript** with `@/*` path alias pointing to `./src/*`
- **Tailwind CSS** with a custom theme — use the defined colors/fonts rather than arbitrary values
- **GSAP + ScrollTrigger** for scroll-driven animations; **Framer Motion** for the admin toast
- **shadcn/ui** (New York style) + **Radix UI** for accessible primitives
- **Vercel Blob** (content JSON + gallery photos) and **Mux** (testimonial videos) for the admin/CMS
- **jose** (auth JWT), **zod** (content validation), **@dnd-kit** (gallery reorder), **browser-image-compression** + **heic2any** (photo upload)
- **Vitest** for tests; **pnpm** as package manager

## Architecture

`src/app/page.tsx` is now an async **server component** that calls `getContent()` and passes the data to `src/components/HomeClient.tsx` (a `'use client'` wrapper holding the CTA scroll state). Each section component lives in `src/components/` and receives its content via props.

**Content is data-driven, not hardcoded.** `src/data/content.json` is the bundled seed; the live content lives in a single `content.json` on **Vercel Blob**. `src/lib/content.ts` exposes `getContent()` (cached via `unstable_cache`, tag `site-content`), `getContentFresh()` (admin), and `saveContent()` (writes Blob + `revalidateTag`). `withDefaults()` backfills missing sections from the seed, so old Blob docs stay compatible. Editable sections: gallery, stories, locations, sessions, videoTestimonials.

**Admin / CMS** (`/admin`, protected): password login (`elaine0301@me.com` + `ADMIN_PASSWORD`) → signed JWT cookie (`jose`), enforced in `src/middleware.ts` for `/admin` and `/api/admin/*`. API routes under `src/app/api/admin/`:
- `login` / `logout`, `content` (GET/PUT, `zod`-validated via `src/lib/content-schema.ts`)
- `upload` (server-side Blob `put`) + `blob/delete` — photos, wrapped in `src/lib/blob.ts`
- `mux/upload` · `mux/status` (polling, no webhook) · `mux/delete` · `mux/metrics` — videos, in `src/lib/mux.ts`

The dashboard is `src/components/admin/AdminDashboard.tsx`: gallery upload (client compress → WebP, HEIC→JPEG, blur, drag-reorder via `@dnd-kit`, **required alt**), text editors, and a Mux video tab (UpChunk upload + processing poll + per-video metrics, 10-video cap).

**Env vars** (in `.env.local` + Vercel): `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `AUTH_SECRET`, `BLOB_READ_WRITE_TOKEN`, `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET`, `NEXT_PUBLIC_MUX_ENV_KEY`.

**Testing:** Vitest in `node` env (`vitest.config.ts`, `vitest.setup.ts`). Lib units + API route tests. Route tests mock the local lib module (e.g. `@/lib/blob`, `@/lib/mux`) — **provide every export** in the `vi.mock` factory and use real `Request` objects, or vitest mis-attributes errors.

**Animation pattern:** Every section uses GSAP with `ScrollTrigger`. The canonical pattern is `useGSAP(() => { gsap.from(..., { scrollTrigger: { trigger, start: 'top 80%' } }) }, { scope: ref })`. Stagger animations use 0.2–0.3s delays with `power3.out` easing.

**Scroll-to-CTA:** `HomeClient` holds a `ctaSectionRef` and passes it as a prop to both `CTAButton` (triggers the scroll) and `CTASection` (the target). It also maps `content.sessions` to session cards (icon by `iconType`). This is the main cross-component state.

**Styling conventions:**
- Use `cn()` from `src/lib/utils.ts` for conditional class merging (clsx + tailwind-merge)
- Font families are applied via `next/font/google` CSS variables: `font-playfair` (headings) and `font-lato` (body)
- Brand colors: `primary` (#E63946 red), `secondary` (#1D6D45 green), `accent` (#06D6A0 teal), `background` (#F5EDE1 cream)

**Media:** Gallery photos are uploaded to Vercel Blob and served via Next.js `<Image>` (the `*.public.blob.vercel-storage.com` domain is allowed in `next.config.ts` `remotePatterns`; `sizes` must describe the album *container* width, not per-photo, or react-photo-album divides twice and serves tiny blurry images). Testimonial videos use **Mux** — `@mux/mux-player-react` (dynamic, `ssr: false`) with adaptive streaming + auto poster; `react-player` remains only as a fallback for any legacy local `src`. The hero video still lives in `public/videos/`. `next.config.ts` CSP must allow Mux (`*.mux.com`, `image.mux.com`, `*.litix.io`) and Blob domains.
