-- Phase 4: transactional customer email notifications.
-- Run AFTER 001, 002 and 003. Back up the production database first.
-- Non-destructive; existing records remain unchanged.
CREATE TABLE IF NOT EXISTS email_notifications (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  booking_id BIGINT REFERENCES bookings(id) ON DELETE RESTRICT,
  enquiry_id BIGINT REFERENCES enquiries(id) ON DELETE RESTRICT,
  event_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  text_body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sending', 'sent', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  claimed_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  provider_id TEXT,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ((booking_id IS NOT NULL) OR (enquiry_id IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS email_notifications_queue_idx
  ON email_notifications (status, created_at);
CREATE INDEX IF NOT EXISTS email_notifications_booking_idx
  ON email_notifications (booking_id, created_at DESC);
CREATE INDEX IF NOT EXISTS email_notifications_enquiry_idx
  ON email_notifications (enquiry_id, created_at DESC);

-- Customer emails are only queued when EMAIL_NOTIFICATIONS_ENABLED=true.
-- Events are inserted in the same transaction as booking/enquiry changes.
-- Never put API keys or credentials in this table.
