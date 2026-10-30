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

# Phase 4 — Transactional customer emails (Resend)

Sunidhi Artistry sends **transactional** customer updates for actual admin changes. Notifications are **off by default** so the existing booking and enquiry workflow continues unchanged until you finish setup.

## Before enabling
1. Back up the **Sunidhi Artistry production** Neon database. In Neon SQL Editor, run the entire contents of `db/004_email_notifications.sql` (after migrations 001–003). This creates the `email_notifications` outbox.
2. Create a Resend account at https://resend.com. Add a sending domain that **you or the client owns**, then configure/verify the DNS records it requests (SPF/DKIM, DMARC recommended). You generally cannot use someone else's `.vercel.app` subdomain as your sender domain.
3. In Vercel → **Project Settings → Environment Variables (Production)**, set:
   - `RESEND_API_KEY`: a Resend sending API key (server-only, never prefix NEXT_PUBLIC_).
   - `EMAIL_FROM`: e.g. `Sunidhi Artistry <bookings@sunidhiartistry.com>` **after the domain is verified**. The address does not need to be an independently logged-in mailbox for sending.
   - `EMAIL_REPLY_TO`: optional, e.g. the studio's existing email inbox (only if your client wants responses there).
   - `EMAIL_NOTIFICATIONS_ENABLED=true`: only after the table & provider configuration are ready.
4. Save settings and **redeploy** Vercel so the environment variables take effect.

**Important for testing:** Resend's starter/test sender can be restricted to your own verified account recipient. To send to arbitrary customers in production, use a verified sender domain. Test with your own inbox before switching on real customer updates. Do not send credentials or API keys in chats/screenshots.

## What triggers a customer email?
- Admin changes a booking from its previous status to Pending, Confirmed, Completed, or Cancelled.
- Admin changes the event date or time (reschedule).
- Admin changes the agreed total or manually recorded advance/received amount.
- Admin updates a **general enquiry** to Contacted, Quoted, or Converted. The internal `new` and `lost` labels do **not** send customer mail.

Changing a status to the value it already has won't send a duplicate. Changes are saved to the database **first**; the email event is queued in the **same transaction**. Sending is attempted immediately after the transaction commits. When the provider is unavailable, the event remains queued/failed.

The admin can review **Admin → Emails** and click **Retry pending emails** (up to 10 per click). The Resend request uses a provider idempotency key per notification event to reduce duplicate sends on retries. The admin UI explicitly says **Accepted**, not delivered: verify delivery in Resend's Emails dashboard.

## Behavior and limitations
- Customer emails use the `email` field the customer entered on their enquiry or booking form. Mistyped addresses can bounce.
- New anonymous public requests **do not automatically trigger** an acknowledgement email yet: public forms need stronger anti-bot/rate limits to avoid email abuse.
- Emails never disclose admin URLs, passwords, private notes, or the API key.
- Payment updates are **manual record summaries, not receipts**, payment gateway events or automated verification.
- Existing bookings and enquiries are not backfilled. Older state changes that occurred while notifications were disabled won't trigger emails retroactively.
- If you turn `EMAIL_NOTIFICATIONS_ENABLED=true` before running 004, the affected admin save will fail rather than silently drop a customer notification. Keep the flag false until setup is complete.
- If Vercel execution is interrupted after the database commit, email may remain queued. Use Admin → Emails to retry it.
- Provider idempotency guarantees are time-limited. Monitor statuses and avoid retrying arbitrarily very old uncertain requests without checking Resend activity.
- Message content is a snapshot of the update at the time it was saved, not live data.
- Email status shows provider **acceptance**, not final inbox delivery; delivery/bounce webhooks can be added later.

## Smoke tests
1. Run `npm install && npm run lint && npm run typecheck && npm run build`.
2. With EMAIL_NOTIFICATIONS_ENABLED **false**, test a booking status change: existing workflow still works with no email.
3. After migration, verification and flag=true, create a **test booking addressed to your own inbox** and change it to Confirmed: email accepted, recorded under Emails and received in the inbox.
4. Update the same booking again to Confirmed without changing it: no duplicate.
5. Change test booking to Cancelled: cancellation email.
6. Change a pending test booking's event date: reschedule email clarifies that the booking isn't confirmed.
7. Record test payment/advance amounts: summary email clearly states it's a manually recorded amount.
8. Simulate provider config temporarily unset on a test deployment; update one test record to create a pending email. Restore config, open Emails and click retry.
9. Verify unauthorized requests cannot call admin notifications or read the queue.
10. Review inbox formatting on phone and desktop.

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
