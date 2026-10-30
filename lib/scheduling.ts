import type { TransactionSql } from "postgres";

export class BookingProblem extends Error {
  constructor(message: string, public status: number) { super(message); this.name = "BookingProblem"; }
}
export function dateValid(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const [y, m, d] = date.split("-").map(Number);
  const check = new Date(Date.UTC(y, m-1, d));
  return check.toISOString().slice(0, 10) === date && y >= 2000 && y <= 2100;
}
export function timesValid(start: string | null, end: string | null) {
  if (start === null && end === null) return true;
  if (!start || !end) return false;
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(start) && /^([01]\d|2[0-3]):[0-5]\d$/.test(end) && start < end;
}
export type ScheduleRow = { id: string; eventDate: string | null; startTime: string | null; endTime: string | null; status: string };

type DbTx = TransactionSql<Record<string, never>>;
// The advisory lock serializes confirmation, rescheduling, and blocking for each calendar day.
export async function lockDay(tx: DbTx, date: string) {
  await tx`SELECT pg_advisory_xact_lock(2603, (${date}::date - DATE '2000-01-01')::integer)`;
}
export async function assertFree(tx: DbTx, date: string, start: string | null, end: string | null, exceptId: string) {
  const blocked = await tx`SELECT date FROM blocked_dates WHERE date = ${date}::date LIMIT 1`;
  if (blocked.length) throw new BookingProblem("This date is blocked. Unblock it in the calendar first.", 409);
  const matches = await tx`
    SELECT b.id FROM bookings b JOIN enquiries e ON e.id = b.enquiry_id
    WHERE b.status IN ('confirmed', 'completed') AND e.event_date = ${date}::date
      AND b.id != ${exceptId}::bigint
      AND (b.start_time IS NULL OR ${start}::time IS NULL OR
           (b.start_time < ${end}::time AND b.end_time > ${start}::time))
    LIMIT 1
  `;
  if (matches.length) throw new BookingProblem("Another confirmed or completed appointment occupies this time. Choose another slot.", 409);
}
export async function fetchBookingForUpdate(tx: DbTx, id: string) {
  const records = await tx<ScheduleRow[]>`
    SELECT b.id::text AS id, b.status, e.event_date::text AS "eventDate",
    to_char(b.start_time, 'HH24:MI') AS "startTime",
    to_char(b.end_time, 'HH24:MI') AS "endTime"
    FROM bookings b JOIN enquiries e ON e.id=b.enquiry_id
    WHERE b.id=${id}::bigint FOR UPDATE OF b, e
  `;
  if (!records.length) throw new BookingProblem("Booking not found.", 404);
  return records[0];
}
export function schedulingResponse(error: unknown) {
  if (error instanceof BookingProblem) return { message: error.message, status: error.status };
  return { message: "Scheduling unavailable. Run db/003_calendar.sql in Neon and retry.", status: 503 };
}
