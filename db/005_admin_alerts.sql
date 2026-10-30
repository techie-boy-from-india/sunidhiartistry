-- Phase 5: throttling for new public enquiries when owner email alerts are enabled.
-- Run AFTER db/004_email_notifications.sql. Backup production database first.
-- Safe, additive migration: does not change/delete bookings or customer records.
CREATE TABLE IF NOT EXISTS public_submission_limits (
  key_hash TEXT PRIMARY KEY,
  hits INTEGER NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS public_submission_limits_updated_idx
  ON public_submission_limits (updated_at);

-- Store only HMAC digests of IP/email (never raw IPs here).
-- Clean up old throttling keys periodically through a trusted admin task if needed.
