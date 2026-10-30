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

**Status:** calendar and double-booking prevention are implemented in Phase 3, and transactional notifications are available in Phase 4 after configuration. Payment gateway, staff roles and file CMS are not yet implemented. Never promise a customer a confirmed slot solely from an online form submission.

## Phase 3 — Calendar and manual payment tracking (migration required)
- New **Calendar** tab: view monthly pending/confirmed/completed appointments and block/unblock individual dates.
- Date/time editor for each booking. Leave times blank for a whole-day reservation.
- Prevent conflicting booking confirmations, reschedules, and blocked dates for a **single artist** via per-day PostgreSQL transaction locks.
- WhatsApp shortcut in each booking. Uses a pre-filled message; does not auto-send.
- Manually record agreed quote, received amount and outstanding balance. **No Razorpay integration or payment verification yet.** Do not mark an advance received unless independently verified.
- General Enquiry inbox now excludes Booking Requests; customer directory includes both.

**Migration:** In Sunidhi Artistry's Neon SQL Editor, run the entire **SQL contents** of `db/003_calendar.sql` after 001 and 002. Entering the filename alone is not valid SQL. Back up customer data before migrations. The public booking form and existing admin sections continue working before the migration, but new calendar controls and confirmation safety checks require it.

**Business logic:** A booking without a start and end time occupies the entire calendar day. Timed bookings conflict only when their ranges overlap. Both confirmed and completed bookings count as occupied. The Calendar displays pending requests, but these do not reserve a slot. A manually blocked day cannot contain a confirmed/completed appointment. Date comparisons are made against stored event dates in the artist's local calendar (Asia/Kolkata). Multi-artist resource capacity is not yet supported.

# Phase 4 — Transactional customer emails (Gmail SMTP)

Customer updates use **Nodemailer + Gmail SMTP** with an app-specific password. No Resend account, email API provider, or paid custom sending domain is required. Existing booking and enquiry features remain unchanged until emails are explicitly enabled.

## Setup

1. In Neon, back up Sunidhi Artistry's production database. Run the **contents** of `db/004_email_notifications.sql` (after 001–003). It creates a persistent email outbox. If you already ran it for Phase 4, do not rerun needlessly.
2. Use a Gmail account you control for testing (you do **not** need the client's Gmail login). Enable **2-Step Verification** on that Google account.
3. Go to https://myaccount.google.com/apppasswords and create an App Password named **Sunidhi Artistry SMTP**. Google will show a **16-character password**. Do not use the Gmail login password. App Passwords can be unavailable for work/school accounts, security-key-only 2FA, or Advanced Protection.
4. Vercel → Project Settings → Environment Variables → Production:
   - `SMTP_USER=your-sending-address@gmail.com`
   - `SMTP_APP_PASSWORD=<16-character Google App Password>` (server-side secret; can be pasted with or without spaces)
   - `EMAIL_FROM_NAME=Sunidhi Artistry`
   - `EMAIL_REPLY_TO=` optional; for initial testing you may omit it, so replies go back to the SMTP_USER mailbox.
   - `EMAIL_NOTIFICATIONS_ENABLED=true` **only after the Neon outbox and SMTP credentials are configured**.
5. Save and redeploy the Production deployment. The `/admin?tab=notifications` screen is the Email activity tracker.

### Customer triggers

- Booking status changed by admin: Pending, Confirmed, Completed, Cancelled.
- Event date/time changed: rescheduling notice.
- Quote/paid amount changed: a **manual record summary**, not an official payment receipt.
- General enquiry stage changed to Contacted, Quoted or Converted. Internal New/Lost changes do not email customers.

Only actual changes trigger an email; saving the same status again will not create a new event.

### Delivery and retry logic

- The status/enquiry update and its email notification record are committed in the same DB transaction. After commit, the server awaits Gmail SMTP.
- If SMTP is unavailable, the pending/failed record remains in the outbox; an authenticated owner can use the Emails dashboard to retry up to ten at a time.
- `sent` means **Gmail SMTP accepted the message**; it is not proof of inbox delivery. Review Gmail's Sent folder, security alerts, and bounce reports.
- SMTP doesn't offer Resend-style API idempotency: if Gmail accepts a message but the database acknowledgement fails, a manual retry could send a duplicate. Check the Gmail Sent folder before retrying an ambiguous attempt.
- Gmail is suitable for light transactional use/testing, not bulk newsletters. Google applies account sending limits and can block cloud SMTP logins.
- Customer-supplied email addresses may be wrong; verify with test addresses first. New public requests do **not** send immediate acknowledgement emails to avoid spam abuse.
- Gmail may rewrite the From address to the authenticated SMTP_USER mailbox. When the client is ready, replace the temporary developer Gmail/app password with credentials they control, and revoke the old App Password.
- Never send passwords/app passwords in issues, chats or screenshots and never commit `.env.local`.

### Smoke test

1. `npm run lint && npm run typecheck && npm run build`.
2. Confirm 004 table exists; SMTP env vars are saved and `EMAIL_NOTIFICATIONS_ENABLED=true`.
3. Create a test booking using an inbox you control, change Pending → Confirmed, and check Admin → Emails and the recipient inbox.
4. Change Confirmed → Cancelled, check the cancellation mail.
5. Reschedule a test appointment and update the payment notes; verify the expected emails.
6. Save a booking without changing its status; confirm no duplicate event.
7. Test a general enquiry status → Contacted and confirm its message. Test retry behavior on a staging or test record only.

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
