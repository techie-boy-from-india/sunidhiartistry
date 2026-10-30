# Sunidhi Artistry

A premium, mobile-first makeup artistry website with a booking and enquiry management roadmap.

## Phase 1 — Public website & enquiry intake
- Next.js 16 App Router, React 19 and TypeScript
- Responsive luxury editorial-style interface
- Service catalogue, portfolio placeholders, artist introduction and enquiry form
- Server-side validation with Zod
- Enquiries saved to Neon PostgreSQL (when configured)
- SEO metadata, robots and sitemap

## Getting started

1. Install Node.js 20.9+ and run `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Create a Neon database, set `DATABASE_URL`, and run the SQL in `db/001_init.sql` using the Neon SQL editor.
4. Run `npm run dev`, then visit `http://localhost:3000`.

The enquiry form intentionally returns a service-unavailable message until `DATABASE_URL` and the database schema are configured; it never pretends a booking is confirmed.

## Environment
- `DATABASE_URL`: private Neon connection string, used on the server only
- `NEXT_PUBLIC_SITE_URL`: canonical site URL, without trailing slash

Never commit secrets or customer information. See `.env.example`.

## Status and next stages
**Phase 1:** Landing pages and real enquiry intake. **Phase 2:** secure admin login, enquiries/booking dashboard. **Phase 3:** calendar, deposits, analytics, portfolio CMS and notification integrations.

### Content note
Visuals are temporary stock placeholders, not Sunidhi Artistry's actual work. Replace them with licensed, client-approved portfolio imagery and real business details before launch. Service names and copy require owner approval.

## Scripts
- `npm run dev` — develop locally
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript
