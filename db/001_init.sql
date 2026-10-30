CREATE TABLE IF NOT EXISTS enquiries (
 id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 name TEXT NOT NULL,
 email TEXT NOT NULL,
 phone TEXT NOT NULL,
 service TEXT NOT NULL,
 event_date DATE,
 message TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'converted', 'lost')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS enquiries_created_idx ON enquiries (created_at DESC);
