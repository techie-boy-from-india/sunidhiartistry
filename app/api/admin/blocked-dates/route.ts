import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminFromRequest, isSameOrigin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { BookingProblem, dateValid, lockDay, schedulingResponse } from "@/lib/scheduling";
export const runtime = "nodejs";
const schema = z.object({ date: z.string(), reason: z.string().trim().min(1).max(200).default("Unavailable") });
function reply(error: string, status: number) { return NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } }); }
async function execute(req: NextRequest, method: "POST" | "DELETE") {
  if (!adminFromRequest(req)) return reply("Unauthorized", 401);
  if (!isSameOrigin(req)) return reply("Invalid origin", 403);
  if (Number(req.headers.get("content-length") || 0) > 1024) return reply("Invalid payload", 400);
  let body: unknown;
  try { body = await req.json(); } catch { return reply("Invalid payload", 400); }
  const parsed = schema.safeParse(body);
  if (!parsed.success || !dateValid(parsed.data.date)) return reply("Invalid date or reason", 400);
  try {
    await db().begin(async tx => {
      await lockDay(tx, parsed.data.date);
      if (method === "POST") {
        const confirmed = await tx`SELECT b.id FROM bookings b JOIN enquiries e ON e.id=b.enquiry_id
          WHERE e.event_date=${parsed.data.date}::date AND b.status IN ('confirmed','completed') LIMIT 1`;
        if (confirmed.length) throw new BookingProblem("Cannot block a day with an existing confirmed/completed booking. Reschedule it first.", 409);
        await tx`INSERT INTO blocked_dates (date,reason) VALUES (${parsed.data.date}::date,${parsed.data.reason})
          ON CONFLICT (date) DO UPDATE SET reason=EXCLUDED.reason`;
      } else {
        await tx`DELETE FROM blocked_dates WHERE date=${parsed.data.date}::date`;
      }
    });
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { const { message, status } = schedulingResponse(error); return reply(message, status); }
}
export async function POST(req: NextRequest) { return execute(req, "POST"); }
export async function DELETE(req: NextRequest) { return execute(req, "DELETE"); }
