-- Run once in the Neon SQL Editor AFTER db/001_init.sql.
-- Preserves all existing enquiries; no existing data is deleted.
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS request_type TEXT NOT NULL DEFAULT 'enquiry';
ALTER TABLE enquiries DROP CONSTRAINT IF EXISTS enquiries_request_type_check;
ALTER TABLE enquiries ADD CONSTRAINT enquiries_request_type_check CHECK (request_type IN ('enquiry','booking'));

CREATE TABLE IF NOT EXISTS bookings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  enquiry_id BIGINT NOT NULL UNIQUE REFERENCES enquiries(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS bookings_status_date_idx ON bookings (status, created_at DESC);
CREATE INDEX IF NOT EXISTS enquiries_type_idx ON enquiries (request_type, created_at DESC);

CREATE TABLE IF NOT EXISTS admin_login_attempts (
  key_hash TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS admin_login_attempts_updated_idx ON admin_login_attempts (updated_at);

-- Existing rows are treated as enquiries: we cannot safely infer which
-- historic messages represent booking requests.
