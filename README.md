# Sunidhi Artistry

Premium mobile-first artist website and private booking-management dashboard. Built with Next.js 16 / React 19, TypeScript, Neon Postgres, and Lucide icons.

## Phase 1 — Public Website (complete)
- Home, Services, Portfolio, About, Contact
- Eight client-supplied makeup photographs and studio logo in `public/images`
- Verified contact information and published pricing (confirm with owner before launch)
- Booking and enquiry request form with server-side validation and honeypot
- SEO metadata, sitemap, responsive design

## Phase 2 — Owner Dashboard (code ready; activation required)
- Private owner sign-in at `/admin/login`
- Dashboard at `/admin` with booking/enquiry summary
- Booking requests are inserted into the `bookings` table with status `pending` (not auto-confirmed)
- Manually change booking status (pending, confirmed, completed, cancelled)
- Enquiry follow-up statuses (new, contacted, quoted, converted, lost)
- Customer directory based on submitted enquiry email; search, filters, pagination
- Password stored as scrypt hash, httpOnly signed cookie, 8-hour session, same-origin writes, database-backed login attempt throttling

**Not yet implemented:** live calendar availability and double-booking prevention, payment gateway, automated notifications, staff roles, file CMS. Never promise a customer a confirmed slot solely from an online form submission.

## Phase 3 — Calendar and manual payment tracking (migration required)
- New **Calendar** tab: view monthly pending/confirmed/completed appointments and block/unblock individual dates.
- Date/time editor for each booking. Leave times blank for a whole-day reservation.
- Prevent conflicting booking confirmations, reschedules, and blocked dates for a **single artist** via per-day PostgreSQL transaction locks.
- WhatsApp shortcut in each booking. Uses a pre-filled message; does not auto-send.
- Manually record agreed quote, received amount and outstanding balance. **No Razorpay integration or payment verification yet.** Do not mark an advance received unless independently verified.
- General Enquiry inbox now excludes Booking Requests; customer directory includes both.

**Migration:** In Sunidhi Artistry's Neon SQL Editor, run the entire **SQL contents** of `db/003_calendar.sql` after 001 and 002. Entering the filename alone is not valid SQL. Back up customer data before migrations. The public booking form and existing admin sections continue working before the migration, but new calendar controls and confirmation safety checks require it.

**Business logic:** A booking without a start and end time occupies the entire calendar day. Timed bookings conflict only when their ranges overlap. Both confirmed and completed bookings count as occupied. The Calendar displays pending requests, but these do not reserve a slot. A manually blocked day cannot contain a confirmed/completed appointment. Date comparisons are made against stored event dates in the artist's local calendar (Asia/Kolkata). Multi-artist resource capacity is not yet supported.

## Setup (local and Vercel)

1. Install Node.js 20.9+ (Node 22 LTS recommended).
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` for local development.
4. Create a Neon PostgreSQL database and set `DATABASE_URL` (server-only).
5. In the Neon SQL Editor run `db/001_init.sql` and then `db/002_admin_booking.sql` **in this order**. The second file is a non-destructive migration. Back up production customer data before schema changes.
6. Decide an owner email address and set `ADMIN_EMAIL`. Use an inbox the client controls.
7. Run `node scripts/hash-password.mjs` in a real interactive terminal; enter a strong 14+ character password twice. The script prints a hash. Set `ADMIN_PASSWORD_HASH` to that **hash**, never the plaintext password.
8. Generate a random signing secret, e.g. with `node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"`, and set `ADMIN_SESSION_SECRET`. Do not share the output with anyone.
9. Set `NEXT_PUBLIC_SITE_URL` to your canonical domain with `https://` and no trailing slash.
10. For Vercel, add these four server-side/private settings and public site URL in **Project Settings → Environment Variables → Production**, then redeploy the project.
11. Run `npm run dev` locally and visit `http://localhost:3000/admin/login` or `https://your-domain/admin/login` once deployed.

The dashboard is deliberately inaccessible until credentials and DB have been configured. Do not commit `.env.local` or disclose customer data. Never paste credentials or database URLs into issues or ChatGPT.

## Smoke tests after deployment

1. `npm run lint`, `npm run typecheck`, `npm run build` should all succeed.
2. Run `db/003_calendar.sql` in Neon if not yet applied, then open Calendar and verify no migration warning.
3. Create two pending bookings on the same day. Confirm one; attempting to confirm the other as a whole-day booking must return 409 and leave it pending.
4. Create two timed bookings with adjacent non-overlapping time ranges; both can be confirmed. Overlapping ranges must fail.
5. Block an empty day, then attempt to confirm a request there; it must fail. Unblock and confirm.
6. Record a test quote/advance; refresh the page to ensure it persisted. This records notes only, not real payments.
2. Visiting `/admin` while logged out should redirect to `/admin/login`.
3. Invalid password should fail without showing data.
4. Valid credentials should reveal only your business data.
5. Submit a **General Enquiry** from `/contact` and confirm a new enquiry appears.
6. Submit a **Booking Request** with an event date and confirm a new pending booking appears.
7. Change a status, refresh, and verify it persisted.
8. Sign out and confirm `/admin` is protected again.
9. Check mobile viewport and run production build/deployment logs.

## Current Limitations and Security

Booking confirmation is a **manual administrative state**, not a payment receipt or capacity guarantee. Confirm availability and payment separately. Owner login is intended for one account; staff permissions, MFA, session revocation, stronger distributed rate limiting and activity audit logs are future work. Deploy behind HTTPS; keep database credentials and signing secrets private; apply DB migrations only from trusted admin access.

## Scripts
- `npm run dev` — local development
- `npm run build` — Next.js production build
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript
- `node scripts/hash-password.mjs` — safely create owner password hash
