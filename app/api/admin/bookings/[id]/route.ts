import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminFromRequest, isSameOrigin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { enqueueBooking, sendQueuedEmail, emailEnabled } from "@/lib/notifications";
import { BookingProblem, lockDay, assertFree, fetchBookingForUpdate, schedulingResponse } from "@/lib/scheduling";
export const runtime = "nodejs";
const schema = z.object({ status: z.enum(["pending", "confirmed", "completed", "cancelled"]) });
function reply(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!adminFromRequest(req)) return reply("Unauthorized", 401);
  if (!isSameOrigin(req)) return reply("Invalid origin", 403);
  const { id } = await params;
  if (!/^\d{1,18}$/.test(id)) return reply("Invalid record", 400);
  if (Number(req.headers.get("content-length") || 0) > 1024) return reply("Invalid payload", 400);
  let body: unknown;
  try { body = await req.json(); } catch { return reply("Invalid payload", 400); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return reply("Invalid status", 400);
  try {
    const sql = db();
    const noticeId=await sql.begin(async tx => {
      const record = await fetchBookingForUpdate(tx, id);
      if (record.status === parsed.data.status) return null;
      if (parsed.data.status === "confirmed" || parsed.data.status === "completed") {
        if (!record.eventDate) throw new BookingProblem("Set the event date before confirmation.", 400);
        await lockDay(tx, record.eventDate);
        await assertFree(tx, record.eventDate, record.startTime, record.endTime, id);
      }
      await tx`UPDATE bookings SET status=${parsed.data.status}, updated_at=now()
        WHERE id=${id}::bigint`;
      return enqueueBooking(tx,id,parsed.data.status);
    });
    const email = noticeId ? await sendQueuedEmail(noticeId) : (emailEnabled() ? "unchanged" : "disabled");
    return NextResponse.json({ ok: true, email }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { const { message, status } = schedulingResponse(error); return reply(message, status); }
}
