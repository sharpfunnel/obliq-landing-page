# Codename Obliq — Landing Page

Lead-generation landing page for Codename Obliq, a commercial project by Today Group & Jindal Group in Airoli, Navi Mumbai. Built with Next.js (App Router), Tailwind CSS, and Prisma + PostgreSQL (Neon).

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.example` to `.env` and fill in your own values:

- `DATABASE_URL` — PostgreSQL connection string (Neon).
- `NEXT_PUBLIC_CONTACT_NAME` / `NEXT_PUBLIC_CONTACT_PHONE` — shown in the header, footer and sticky CTA.

## Database

Schema lives in `prisma/schema.prisma` (single `Lead` model). To push schema changes to the database:

```bash
npm run db:push
```

## Lead Flow

1. Hero form (`src/components/LeadForm.tsx`) collects Full Name + Mobile Number, validated with `zod` (`src/lib/validation.ts`), and posts to `POST /api/leads`.
2. On success, the visitor is redirected to `/thank-you?leadId=...`.
3. The thank-you page shows a confirmation and an optional secondary form (Configuration, Email, Budget, Message) that updates the same lead via `PATCH /api/leads/[id]`.

## Assets

Source renders/creatives live in `temp/` (not committed — see `.gitignore`). `scripts/optimize-images.mjs` resizes and converts the ones used on the site into `public/images/*.webp`. Re-run it with `npm run optimize-images` if the source assets change.
