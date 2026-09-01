# Codename Obliq — Landing Page

Lead-generation landing page for Codename Obliq, a commercial project by Today Group & Jindal Group in Juinagar, Navi Mumbai. Built with Next.js (App Router), Tailwind CSS, and Prisma + PostgreSQL (Neon).

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
- `SESSION_SECRET` / `ADMIN_PASSWORD` — required for `/admin` login. Default password is `admin@123` — change it before going live.
- `META_*` — optional, needed only for the Meta Pixel/Conversions API and Ad Account sync features (see below). The site and admin panel work fully without them.

## Database

Schema lives in `prisma/schema.prisma` (`Lead`, visitor/session analytics, Meta Ads sync). To push schema changes to the database:

```bash
npm run db:push
```

To clear all demo/test analytics data (leads, sessions, visitors, campaigns) before going live:

```bash
npm run db:reset-test-data
```

## Lead Flow

1. Hero form (`src/components/LeadForm.tsx`) collects Full Name + Mobile Number, validated with `zod` (`src/lib/validation.ts`), and posts to `POST /api/leads`.
2. On success, the visitor is redirected to `/thank-you?leadId=...`.
3. The thank-you page shows a confirmation and an optional secondary form (Configuration, Email, Budget, Message) that updates the same lead via `PATCH /api/leads/[id]`.
4. A client-side tracking beacon (`src/lib/tracking/`, `src/components/tracking/TrackingProvider.tsx`) records visitors, sessions, page views, scroll depth, CTA/form funnels, Core Web Vitals, JS errors, rage/dead clicks, and a session replay (rrweb) — all feeding the admin panel below.

## Admin Panel

Visit `/admin` (redirects to `/admin/login` if not signed in — password is `ADMIN_PASSWORD`, default `admin@123`).

- **Overview** — traffic/lead stat tiles, 30-day trend chart, conversion funnel, traffic sources, recent leads.
- **Leads** — full leads table, inline status editing, Meta CAPI send status + resend.
- **Sessions** — per-visit device/location/attribution/duration, with a link to session replay where recorded.
- **Heatmap** — click/hover density overlaid on the live page per path.
- **Campaigns** — Meta Ads spend/performance cross-referenced with real on-site sessions/leads (needs `META_APP_ID`/`META_APP_SECRET` — see `.env.example`).
- **Funnels / CTAs / Forms / Performance / Errors** — funnel and engagement breakdowns feeding off the same tracking data.
- **Reports** — CSV/XLSX/PDF exports of overview, leads, and campaign performance for a date range.

The Meta Pixel + Conversions API (browser + server-side conversion tracking) and the full Ad Account OAuth/sync are wired up in code but no-op until `META_PIXEL_ID`, `META_CAPI_ACCESS_TOKEN`, `META_APP_ID`/`META_APP_SECRET` are set.

## Assets

Source renders/creatives live in `temp/` (not committed — see `.gitignore`). `scripts/optimize-images.mjs` resizes and converts the ones used on the site into `public/images/*.webp`. Re-run it with `npm run optimize-images` if the source assets change.
