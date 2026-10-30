import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminFromRequest, isSameOrigin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { BookingProblem, dateValid, timesValid, lockDay, assertFree, fetchBookingForUpdate, schedulingResponse } from "@/lib/scheduling";
export const runtime = "nodejs";
const schema = z.object({
  eventDate: z.string(),
  startTime: z.string().nullable(),
  endTime: z.string().nullable()
}).strict();
function reply(message: string, status: number) { return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } }); }

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!adminFromRequest(req)) return reply("Unauthorized", 401);
  if (!isSameOrigin(req)) return reply("Invalid origin", 403);
  const { id } = await params;
  if (!/^\d{1,18}$/.test(id)) return reply("Invalid booking ID", 400);
  if (Number(req.headers.get("content-length") || 0) > 1024) return reply("Invalid payload", 400);
  let body: unknown;
  try { body = await req.json(); } catch { return reply("Invalid payload", 400); }
  const parsed = schema.safeParse(body);
  if (!parsed.success || !dateValid(parsed.data.eventDate) || !timesValid(parsed.data.startTime, parsed.data.endTime)) {
    return reply("Choose a valid date and either both start/end times or neither. End must be after start.", 400);
  }
  try {
    await db().begin(async tx => {
      const row = await fetchBookingForUpdate(tx, id);
      if (row.status === "confirmed" || row.status === "completed") {
        await lockDay(tx, parsed.data.eventDate);
        await assertFree(tx, parsed.data.eventDate, parsed.data.startTime, parsed.data.endTime, id);
      }
      await tx`UPDATE enquiries SET event_date=${parsed.data.eventDate}::date
        WHERE id=(SELECT enquiry_id FROM bookings WHERE id=${id}::bigint)`;
      await tx`UPDATE bookings SET start_time=${parsed.data.startTime}::time,
        end_time=${parsed.data.endTime}::time, updated_at=now() WHERE id=${id}::bigint`;
    });
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { const { message, status } = schedulingResponse(error); return reply(message, status); }
}
