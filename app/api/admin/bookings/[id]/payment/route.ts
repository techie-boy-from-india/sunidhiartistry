import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminFromRequest, isSameOrigin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
export const runtime = "nodejs";
const schema = z.object({ totalRupees: z.number().int().min(0).max(1_000_000_000), receivedRupees: z.number().int().min(0).max(1_000_000_000) }).refine(d => d.receivedRupees <= d.totalRupees);
function reply(error: string, status: number) { return NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } }); }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!adminFromRequest(req)) return reply("Unauthorized", 401);
  if (!isSameOrigin(req)) return reply("Invalid origin", 403);
  const { id } = await params;
  if (!/^\d{1,18}$/.test(id)) return reply("Invalid booking ID", 400);
  if (Number(req.headers.get("content-length") || 0) > 1024) return reply("Invalid payload", 400);
  let body: unknown;
  try { body = await req.json(); } catch { return reply("Invalid payload", 400); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return reply("Enter whole-rupee amounts; received cannot exceed agreed total.", 400);
  try {
    const rows = await db()`
      UPDATE bookings SET total_amount_paise=${parsed.data.totalRupees * 100},
      amount_paid_paise=${parsed.data.receivedRupees * 100}, updated_at=now()
      WHERE id=${id}::bigint RETURNING id
    `;
    if (!rows.length) return reply("Booking not found", 404);
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch { return reply("Payment notes unavailable. Apply db/003_calendar.sql.", 503); }
}
