-- Phase 3: run on Sunidhi Artistry's Neon primary database, AFTER 001 and 002.
-- Safe for existing rows: no existing booking or enquiry is deleted.
-- Take a snapshot/backup before applying to production.
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS start_time TIME WITHOUT TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS end_time TIME WITHOUT TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_amount_paise BIGINT NOT NULL DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS amount_paid_paise BIGINT NOT NULL DEFAULT 0;

-- Existing records with no times remain whole-day appointments.
DO $do$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'booking_valid_times') THEN
    ALTER TABLE bookings ADD CONSTRAINT booking_valid_times CHECK
      ((start_time IS NULL AND end_time IS NULL) OR
       (start_time IS NOT NULL AND end_time IS NOT NULL AND start_time < end_time));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'booking_valid_amounts') THEN
    ALTER TABLE bookings ADD CONSTRAINT booking_valid_amounts CHECK
      (total_amount_paise >= 0 AND amount_paid_paise >= 0 AND amount_paid_paise <= total_amount_paise);
  END IF;
END
$do$;

CREATE TABLE IF NOT EXISTS blocked_dates (
  date DATE PRIMARY KEY,
  reason VARCHAR(200) NOT NULL DEFAULT 'Unavailable',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS bookings_active_idx ON bookings (status) WHERE status IN ('confirmed', 'completed');
CREATE INDEX IF NOT EXISTS enquiries_event_date_idx ON enquiries (event_date);

-- All-day bookings occupy their whole date. Timed bookings occupy [start_time, end_time).
-- Availability is currently for ONE artist/resource, not a team.
-- All new confirmations and blocking operations are serialized by a day-specific
-- PostgreSQL advisory transaction lock in the application.
